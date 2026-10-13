export type Mark = 'X' | 'O';
export type Cell = Mark | null;

export function emptyBoard(size: number): Cell[] {
  return Array.from({ length: size * size }, () => null);
}

export function lineIndexes(size: number): number[][] {
  const lines: number[][] = [];

  for (let row = 0; row < size; row += 1) {
    const line: number[] = [];
    for (let col = 0; col < size; col += 1) {
      line.push(row * size + col);
    }
    lines.push(line);
  }

  for (let col = 0; col < size; col += 1) {
    const line: number[] = [];
    for (let row = 0; row < size; row += 1) {
      line.push(row * size + col);
    }
    lines.push(line);
  }

  const main: number[] = [];
  const anti: number[] = [];
  for (let index = 0; index < size; index += 1) {
    main.push(index * size + index);
    anti.push(index * size + (size - 1 - index));
  }
  lines.push(main, anti);
  return lines;
}

export function winnerOf(board: Cell[], size: number): Mark | null {
  for (const line of lineIndexes(size)) {
    const first = board[line[0]];
    if (first && line.every((index) => board[index] === first)) {
      return first;
    }
  }
  return null;
}

export function parseBoard(value: unknown, size: number): Cell[] {
  if (!Array.isArray(value) || value.length !== size * size) {
    throw new Error('Некорректное поле');
  }
  return value.map((cell) => {
    if (cell === null) {
      return null;
    }
    if (cell === 'X' || cell === 'O') {
      return cell;
    }
    throw new Error('Некорректная клетка');
  });
}

export type MoveResult =
  | { ok: true; board: Cell[]; winner: Mark | null; draw: boolean }
  | { ok: false; reason: string };

export function applyMove(board: Cell[], size: number, cell: number, mark: Mark): MoveResult {
  if (!Number.isInteger(cell) || cell < 0 || cell >= size * size) {
    return { ok: false, reason: 'Клетка вне поля' };
  }
  if (board[cell] !== null) {
    return { ok: false, reason: 'Клетка занята' };
  }

  const next = board.slice();
  next[cell] = mark;
  const winner = winnerOf(next, size);
  const draw = winner === null && next.every((value) => value !== null);
  return { ok: true, board: next, winner, draw };
}
