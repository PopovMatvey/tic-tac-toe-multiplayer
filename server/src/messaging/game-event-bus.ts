import { MatchState } from '../matches/match-state';

export const GAME_EVENT_BUS = Symbol('GAME_EVENT_BUS');

export interface GameEventBus {
  publish(state: MatchState): Promise<void>;
  subscribe(listener: (state: MatchState) => void): void;
}
