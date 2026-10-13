import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { GAME_EVENT_BUS, GameEventBus } from '../messaging/game-event-bus';
import { PrismaService } from '../prisma/prisma.service';
import { parseDeskSize } from './desk-size';
import { applyMove, emptyBoard, Mark } from './game-rules';
import { matchInclude } from './match-record';
import { MatchState } from './match-state';
import { boardJson, toMatchState } from './match-state.builder';
import { resolveRound, RoundOutcome } from './series';

const MATCHMAKING_LOCK = 8142026;

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);
  private readonly deskSize: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(GAME_EVENT_BUS) private readonly bus: GameEventBus,
  ) {
    this.deskSize = parseDeskSize(this.config.get<string>('DESK_SIZE'));
  }

  async currentState(userId: string): Promise<MatchState | null> {
    const live = await this.prisma.match.findFirst({
      where: {
        status: { in: ['waiting', 'active'] },
        OR: [{ playerXId: userId }, { playerOId: userId }],
      },
      include: matchInclude,
      orderBy: { createdAt: 'desc' },
    });
    if (live) {
      return toMatchState(live);
    }
    const last = await this.prisma.match.findFirst({
      where: {
        OR: [{ playerXId: userId }, { playerOId: userId }],
      },
      include: matchInclude,
      orderBy: { createdAt: 'desc' },
    });
    return last ? toMatchState(last) : null;
  }

  async joinQueue(userId: string): Promise<MatchState> {
    await this.ensureUser(userId);
    const state = await this.prisma.$transaction((tx) => this.pairOrWait(tx, userId));
    await this.publish(state);
    return state;
  }

  async makeMove(userId: string, cell: number): Promise<MatchState> {
    const state = await this.prisma.$transaction((tx) => this.applyPlayerMove(tx, userId, cell));
    await this.publish(state);
    return state;
  }

  private async pairOrWait(tx: Prisma.TransactionClient, userId: string): Promise<MatchState> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(CAST(${MATCHMAKING_LOCK} AS bigint))`;

    const current = await tx.match.findFirst({
      where: {
        status: { in: ['waiting', 'active'] },
        OR: [{ playerXId: userId }, { playerOId: userId }],
      },
      include: matchInclude,
    });
    if (current) {
      return toMatchState(current);
    }

    const waiting = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Match"
      WHERE status = 'waiting' AND "playerXId" <> ${userId}
      ORDER BY "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `;

    if (waiting.length > 0) {
      await tx.match.update({
        where: { id: waiting[0].id },
        data: { playerOId: userId, status: 'active' },
      });
      const paired = await tx.match.findUniqueOrThrow({
        where: { id: waiting[0].id },
        include: matchInclude,
      });
      await tx.game.create({
        data: {
          matchId: paired.id,
          index: 1,
          status: 'active',
          board: boardJson(emptyBoard(paired.boardSize)),
          nextMark: 'X',
        },
      });
      const started = await tx.match.findUniqueOrThrow({
        where: { id: paired.id },
        include: matchInclude,
      });
      return toMatchState(started);
    }

    const created = await tx.match.create({
      data: {
        playerXId: userId,
        status: 'waiting',
        boardSize: this.deskSize,
      },
      include: matchInclude,
    });
    return toMatchState(created);
  }

  private async applyPlayerMove(
    tx: Prisma.TransactionClient,
    userId: string,
    cell: number,
  ): Promise<MatchState> {
    const found = await tx.match.findFirst({
      where: {
        status: 'active',
        OR: [{ playerXId: userId }, { playerOId: userId }],
      },
    });
    if (!found) {
      throw new BadRequestException('Нет активной партии');
    }

    await tx.$queryRaw`SELECT id FROM "Match" WHERE id = ${found.id} FOR UPDATE`;
    const match = await tx.match.findUniqueOrThrow({
      where: { id: found.id },
      include: matchInclude,
    });
    if (!match.playerOId) {
      throw new BadRequestException('В партии нет второго игрока');
    }

    const mark: Mark = match.playerXId === userId ? 'X' : 'O';
    const game = match.games[0];
    if (!game || game.status !== 'active') {
      throw new BadRequestException('Партия уже завершена');
    }
    if (game.nextMark !== mark) {
      throw new BadRequestException('Сейчас ход соперника');
    }

    const board = toMatchState(match).game?.board;
    if (!board) {
      throw new BadRequestException('Поле недоступно');
    }
    const applied = applyMove(board, match.boardSize, cell, mark);
    if (!applied.ok) {
      throw new BadRequestException(applied.reason);
    }

    const moveIndex = board.filter((value) => value !== null).length;
    try {
      await tx.move.create({
        data: { gameId: game.id, index: moveIndex, cell, mark },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Ход уже принят');
      }
      throw error;
    }

    if (!applied.winner && !applied.draw) {
      await tx.game.update({
        where: { id: game.id },
        data: {
          board: boardJson(applied.board),
          nextMark: mark === 'X' ? 'O' : 'X',
        },
      });
      if (match.lastOutcome) {
        await tx.match.update({
          where: { id: match.id },
          data: { lastOutcome: null },
        });
      }
    } else {
      await this.finishRound(
        tx,
        match,
        game.id,
        game.index,
        applied.board,
        applied.winner,
        applied.draw,
      );
    }

    const fresh = await tx.match.findUniqueOrThrow({
      where: { id: match.id },
      include: matchInclude,
    });
    return toMatchState(fresh);
  }

  private async finishRound(
    tx: Prisma.TransactionClient,
    match: {
      id: string;
      winsX: number;
      winsO: number;
      playerXId: string;
      playerOId: string | null;
      boardSize: number;
    },
    gameId: string,
    gameIndex: number,
    board: Array<Mark | null>,
    winner: Mark | null,
    draw: boolean,
  ): Promise<void> {
    const outcome: RoundOutcome = winner === 'X' ? 'x_win' : winner === 'O' ? 'o_win' : 'draw';
    if (!draw && !winner) {
      throw new BadRequestException('Партия не завершена');
    }
    const series = resolveRound(match.winsX, match.winsO, outcome);
    await tx.game.update({
      where: { id: gameId },
      data: {
        board: boardJson(board),
        status: outcome,
      },
    });

    if (series.matchOver && series.matchWinner) {
      const winnerId = series.matchWinner === 'X' ? match.playerXId : match.playerOId;
      if (!winnerId) {
        throw new BadRequestException('Некого записать победителем');
      }
      await tx.match.update({
        where: { id: match.id },
        data: {
          status: 'finished',
          winsX: series.winsX,
          winsO: series.winsO,
          winnerId,
          lastOutcome: outcome,
        },
      });
      await tx.user.update({
        where: { id: winnerId },
        data: { wins: { increment: 1 } },
      });
      return;
    }

    await tx.match.update({
      where: { id: match.id },
      data: {
        winsX: series.winsX,
        winsO: series.winsO,
        lastOutcome: outcome,
      },
    });
    await tx.game.create({
      data: {
        matchId: match.id,
        index: gameIndex + 1,
        status: 'active',
        board: boardJson(emptyBoard(match.boardSize)),
        nextMark: 'X',
      },
    });
  }

  private async ensureUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Игрок не найден');
    }
  }

  private async publish(state: MatchState): Promise<void> {
    try {
      await this.bus.publish(state);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'неизвестная ошибка';
      this.logger.error(`Событие матча ${state.matchId} не опубликовано: ${message}`);
    }
  }
}
