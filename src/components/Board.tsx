import React from 'react';
import './Board.scss';
import { Cell } from './Cell';
import { InfiniteCell } from '../types';

interface BoardProps {
  infiniteCells: InfiniteCell[];
  cellSize: number;
  disabled: boolean;
}

export function Board({ infiniteCells, cellSize }: BoardProps) {
  return (
    <div className="boardWrap">
      <div className="boardInfinite">
        {infiniteCells.map((c) => (
          <Cell
            key={`${c.x},${c.y}`}
            value={c.value}
            isWinning={c.isWinning}
            style={{
              width: cellSize,
              height: cellSize,
              left: c.left,
              top: c.top,
            }}
          />
        ))}
      </div>
    </div>
  );
}
