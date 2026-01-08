import React, { useMemo } from 'react';
import './Board.scss';
import { Cell } from './Cell';
import { CellValue, Position } from '../types';

interface BoardProps {
  board: CellValue[][];
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
  winLine: Position[];
}

export function Board({ board, onCellClick, disabled, winLine }: BoardProps) {
  const size = board.length;

  const winSet = useMemo(() => {
    return new Set(winLine.map((p) => `${p.row}-${p.col}`));
  }, [winLine]);

  return (
    <div className="boardWrap">
      <div className="board" style={{ gridTemplateColumns: `repeat(${size}, 90px)` }}>
        {board.map((row, r) =>
          row.map((value, c) => (
            <Cell
              key={`${r}-${c}`}
              value={value}
              disabled={disabled || Boolean(value)}
              isWinning={winSet.has(`${r}-${c}`)}
              onClick={() => onCellClick(r, c)}
            />
          ))
        )}
      </div>
    </div>
  );
}
