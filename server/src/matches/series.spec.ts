import { resolveRound } from './series';

describe('series', () => {
  it('не прибавляет очко за ничью и открывает следующую партию', () => {
    expect(resolveRound(1, 2, 'draw')).toEqual({
      winsX: 1,
      winsO: 2,
      matchOver: false,
      matchWinner: null,
      startNextGame: true,
    });
  });

  it('продолжает матч, пока у стороны меньше трёх побед', () => {
    expect(resolveRound(1, 0, 'x_win')).toEqual({
      winsX: 2,
      winsO: 0,
      matchOver: false,
      matchWinner: null,
      startNextGame: true,
    });
  });

  it('заканчивает матч на третьей победе крестиков', () => {
    expect(resolveRound(2, 2, 'x_win')).toEqual({
      winsX: 3,
      winsO: 2,
      matchOver: true,
      matchWinner: 'X',
      startNextGame: false,
    });
  });

  it('заканчивает матч на третьей победе ноликов', () => {
    expect(resolveRound(1, 2, 'o_win')).toEqual({
      winsX: 1,
      winsO: 3,
      matchOver: true,
      matchWinner: 'O',
      startNextGame: false,
    });
  });
});
