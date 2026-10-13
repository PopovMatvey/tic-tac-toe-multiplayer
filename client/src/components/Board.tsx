import { Mark } from '../model/types';

interface BoardProps {
  size: number;
  board: Array<Mark | null>;
  canPlay: boolean;
  onMove: (cell: number) => void;
}

export function Board({ size, board, canPlay, onMove }: BoardProps) {
  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {board.map((cell, index) => {
        const filled = cell !== null;
        return (
          <button
            key={index}
            type="button"
            className={`cell ${cell === 'X' ? 'mark-x' : ''} ${cell === 'O' ? 'mark-o' : ''}`}
            disabled={!canPlay || filled}
            onClick={() => onMove(index)}
          >
            {cell ?? ''}
          </button>
        );
      })}
    </div>
  );
}
