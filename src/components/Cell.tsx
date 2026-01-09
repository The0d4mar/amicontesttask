import React from 'react';
import './Cell.scss';
import { CellValue } from '../types';

interface CellProps {
  value: CellValue;
  isWinning: boolean;
  style?: React.CSSProperties;
}

export function Cell({ value, isWinning, style }: CellProps) {
  return (
    <div
      className={['cell', value ? 'cell--filled' : '', isWinning ? 'cell--win' : ''].join(' ')}
      style={style}
      aria-label="cell"
    >
      {value === 'X' && <div className="cross" />}
      {value === 'O' && <div className="circle" />}
    </div>
  );
}
