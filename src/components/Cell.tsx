import React from 'react';
import './Cell.scss';
import { CellValue } from '../types';

interface CellProps {
  value: CellValue;
  onClick: () => void;
  disabled: boolean;
  isWinning: boolean;
}

export function Cell({ value, onClick, disabled, isWinning }: CellProps) {
  return (
    <button
      className={`cell ${isWinning ? 'cell--win' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {value === 'X' && <div className="cross" />}
      {value === 'O' && <div className="circle" />}
    </button>
  );
}
