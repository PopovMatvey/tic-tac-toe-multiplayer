import { Mark } from './game-rules';

export type MatchStatus = 'waiting' | 'active' | 'finished';
export type GameStatus = 'active' | 'x_win' | 'o_win' | 'draw';
export type Outcome = 'x_win' | 'o_win' | 'draw';

export interface PlayerSlot {
  id: string;
  name: string;
}

export interface MatchState {
  matchId: string;
  status: MatchStatus;
  boardSize: number;
  players: {
    X: PlayerSlot;
    O: PlayerSlot | null;
  };
  series: {
    X: number;
    O: number;
  };
  game: {
    id: string;
    index: number;
    board: Array<Mark | null>;
    turn: Mark | null;
    status: GameStatus;
  } | null;
  matchWinner: Mark | null;
  lastOutcome: Outcome | null;
}

export interface ClientMatchState extends MatchState {
  you: Mark | null;
}

export function withYou(state: MatchState, userId: string): ClientMatchState {
  let you: Mark | null = null;
  if (state.players.X.id === userId) {
    you = 'X';
  } else if (state.players.O?.id === userId) {
    you = 'O';
  }
  return { ...state, you };
}
