import { Prisma } from '@prisma/client';
import { Mark, parseBoard } from './game-rules';
import { GameStatus, MatchState, MatchStatus, Outcome } from './match-state';
import { MatchRecord } from './match-record';

export function toMatchState(match: MatchRecord): MatchState {
  const game = match.games[0] ?? null;
  const status = match.status as MatchStatus;
  const gameStatus = (game?.status ?? 'active') as GameStatus;
  const board = game ? parseBoard(game.board, match.boardSize) : null;
  const turn = game && gameStatus === 'active' ? (game.nextMark as Mark) : null;

  return {
    matchId: match.id,
    status,
    boardSize: match.boardSize,
    players: {
      X: { id: match.playerX.id, name: match.playerX.name },
      O: match.playerO ? { id: match.playerO.id, name: match.playerO.name } : null,
    },
    series: { X: match.winsX, O: match.winsO },
    game:
      game && board
        ? {
            id: game.id,
            index: game.index,
            board,
            turn,
            status: gameStatus,
          }
        : null,
    matchWinner: matchWinnerOf(match),
    lastOutcome: (match.lastOutcome as Outcome | null) ?? null,
  };
}

function matchWinnerOf(match: MatchRecord): Mark | null {
  if (!match.winnerId) {
    return null;
  }
  return match.winnerId === match.playerXId ? 'X' : 'O';
}

export function boardJson(board: Array<Mark | null>): Prisma.InputJsonValue {
  return board as unknown as Prisma.InputJsonValue;
}
