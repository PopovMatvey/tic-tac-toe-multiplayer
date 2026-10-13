import { applyMove, Cell, emptyBoard, winnerOf } from './game-rules';

describe('game-rules', () => {
  it('отдаёт победу за полную строку, столбец и обе диагонали на 3x3', () => {
    const row: Cell[] = ['X', 'X', 'X', null, null, null, null, null, null];
    const column: Cell[] = ['O', null, null, 'O', null, null, 'O', null, null];
    const main: Cell[] = ['X', null, null, null, 'X', null, null, null, 'X'];
    const anti: Cell[] = [null, null, 'O', null, 'O', null, 'O', null, null];

    expect(winnerOf(row, 3)).toBe('X');
    expect(winnerOf(column, 3)).toBe('O');
    expect(winnerOf(main, 3)).toBe('X');
    expect(winnerOf(anti, 3)).toBe('O');
  });

  it('на поле 4x4 считает линию только длины 4', () => {
    const threeInRow = emptyBoard(4);
    threeInRow[0] = 'X';
    threeInRow[1] = 'X';
    threeInRow[2] = 'X';
    expect(winnerOf(threeInRow, 4)).toBeNull();

    const fullRow = emptyBoard(4);
    fullRow[4] = 'O';
    fullRow[5] = 'O';
    fullRow[6] = 'O';
    fullRow[7] = 'O';
    expect(winnerOf(fullRow, 4)).toBe('O');

    const main = emptyBoard(4);
    main[0] = 'X';
    main[5] = 'X';
    main[10] = 'X';
    main[15] = 'X';
    expect(winnerOf(main, 4)).toBe('X');

    const anti = emptyBoard(4);
    anti[3] = 'O';
    anti[6] = 'O';
    anti[9] = 'O';
    anti[12] = 'O';
    expect(winnerOf(anti, 4)).toBe('O');
  });

  it('помечает ничью, когда поле заполнено без линии', () => {
    const board: Cell[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    const result = applyMove(board, 3, 0, 'X');
    expect(result.ok).toBe(false);

    const open: Cell[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
    const draw = applyMove(open, 3, 8, 'X');
    expect(draw).toEqual({
      ok: true,
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
      winner: null,
      draw: true,
    });
  });

  it('отклоняет занятую клетку и клетку вне поля', () => {
    const board = emptyBoard(3);
    board[0] = 'X';
    expect(applyMove(board, 3, 0, 'O')).toEqual({ ok: false, reason: 'Клетка занята' });
    expect(applyMove(board, 3, 9, 'O')).toEqual({ ok: false, reason: 'Клетка вне поля' });
    expect(applyMove(board, 3, 1.5, 'O')).toEqual({ ok: false, reason: 'Клетка вне поля' });
  });

  it('ставит знак и не объявляет победу раньше линии', () => {
    const result = applyMove(emptyBoard(3), 3, 4, 'X');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.board[4]).toBe('X');
      expect(result.winner).toBeNull();
      expect(result.draw).toBe(false);
    }
  });
});
