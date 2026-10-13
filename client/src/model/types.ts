export type Mark = 'X' | 'O';
export type Outcome = 'x_win' | 'o_win' | 'draw';

export interface PublicUser {
  id: string;
  name: string;
  wins: number;
}

export interface ClientMatchState {
  matchId: string;
  status: 'waiting' | 'active' | 'finished';
  boardSize: number;
  you: Mark | null;
  players: {
    X: { id: string; name: string };
    O: { id: string; name: string } | null;
  };
  series: { X: number; O: number };
  game: {
    id: string;
    index: number;
    board: Array<Mark | null>;
    turn: Mark | null;
    status: 'active' | Outcome;
  } | null;
  matchWinner: Mark | null;
  lastOutcome: Outcome | null;
}
