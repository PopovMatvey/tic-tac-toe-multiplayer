import { HttpException, Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GAME_EVENT_BUS, GameEventBus } from '../messaging/game-event-bus';
import { MatchState, withYou } from './match-state';
import { MatchesService } from './matches.service';

@WebSocketGateway({
  cors: { origin: true },
  transports: ['websocket'],
})
export class MatchesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MatchesGateway.name);
  private readonly sockets = new Map<string, Socket>();

  constructor(
    private readonly matches: MatchesService,
    @Inject(GAME_EVENT_BUS) private readonly bus: GameEventBus,
  ) {}

  afterInit(): void {
    this.bus.subscribe((state) => this.push(state));
  }

  handleConnection(socket: Socket): void {
    const userId = this.readUserId(socket);
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    socket.data.userId = userId;
    const previous = this.sockets.get(userId);
    if (previous && previous.id !== socket.id) {
      previous.disconnect(true);
    }
    this.sockets.set(userId, socket);
    void this.matches
      .currentState(userId)
      .then((state) => {
        if (state && this.sockets.get(userId)?.id === socket.id) {
          socket.emit('match.state', withYou(state, userId));
        }
      })
      .catch((error: unknown) => {
        this.logger.warn(`Не удалось отдать состояние ${userId}: ${errorText(error)}`);
      });
  }

  handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId as string | undefined;
    if (userId && this.sockets.get(userId)?.id === socket.id) {
      this.sockets.delete(userId);
    }
  }

  @SubscribeMessage('queue.join')
  async join(@ConnectedSocket() socket: Socket): Promise<void> {
    const userId = this.requiredUserId(socket);
    await this.emitResult(socket, userId, () => this.matches.joinQueue(userId));
  }

  @SubscribeMessage('game.move')
  async move(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { cell?: unknown },
  ): Promise<void> {
    const userId = this.requiredUserId(socket);
    const cell = body?.cell;
    if (typeof cell !== 'number' || !Number.isInteger(cell)) {
      socket.emit('game.error', { message: 'Некорректная клетка' });
      return;
    }
    await this.emitResult(socket, userId, () => this.matches.makeMove(userId, cell));
  }

  private push(state: MatchState): void {
    const ids = [state.players.X.id, state.players.O?.id].filter((id): id is string => Boolean(id));
    for (const userId of ids) {
      const socket = this.sockets.get(userId);
      if (socket) {
        socket.emit('match.state', withYou(state, userId));
      }
    }
  }

  private async emitResult(
    socket: Socket,
    userId: string,
    action: () => Promise<MatchState>,
  ): Promise<void> {
    try {
      const state = await action();
      socket.emit('match.state', withYou(state, userId));
    } catch (error) {
      socket.emit('game.error', { message: errorText(error) });
    }
  }

  private requiredUserId(socket: Socket): string {
    const userId = socket.data.userId as string | undefined;
    if (!userId) {
      throw new HttpException('Нет игрока в сокете', 401);
    }
    return userId;
  }

  private readUserId(socket: Socket): string | null {
    const auth = socket.handshake.auth as { userId?: unknown };
    return typeof auth.userId === 'string' && auth.userId.length > 0 ? auth.userId : null;
  }
}

function errorText(error: unknown): string {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    if (typeof response === 'object' && response && 'message' in response) {
      const message = (response as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join(', ') : message;
    }
  }
  return 'Ошибка игры';
}
