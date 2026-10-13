import { Mark } from './game-rules';

export const WINS_TO_TAKE_MATCH = 3;

export type RoundOutcome = 'x_win' | 'o_win' | 'draw';

export interface SeriesSnapshot {
  winsX: number;
  winsO: number;
  matchOver: boolean;
  matchWinner: Mark | null;
  startNextGame: boolean;
}

export function resolveRound(winsX: number, winsO: number, outcome: RoundOutcome): SeriesSnapshot {
  if (outcome === 'draw') {
    return {
      winsX,
      winsO,
      matchOver: false,
      matchWinner: null,
      startNextGame: true,
    };
  }

  const nextX = winsX + (outcome === 'x_win' ? 1 : 0);
  const nextO = winsO + (outcome === 'o_win' ? 1 : 0);
  const matchWinner: Mark | null =
    nextX >= WINS_TO_TAKE_MATCH ? 'X' : nextO >= WINS_TO_TAKE_MATCH ? 'O' : null;

  return {
    winsX: nextX,
    winsO: nextO,
    matchOver: matchWinner !== null,
    matchWinner,
    startNextGame: matchWinner === null,
  };
}
