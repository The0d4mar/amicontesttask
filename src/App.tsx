import React, { useState } from 'react';
import './App.scss';
import { Board } from './components/Board';
import { CellValue, Move, Player, Position } from './types';
import { checkWin } from './gameEngine';

const SIZE = 5;
const WIN_LENGTH = 4;

const createEmptyBoard = (size: number): CellValue[][] =>
  Array.from({ length: size }, () => Array<CellValue>(size).fill(null));

export default function App() {
  const [board, setBoard] = useState<CellValue[][]>(() => createEmptyBoard(SIZE));
  const [moves, setMoves] = useState<Move[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winLine, setWinLine] = useState<Position[]>([]);

  const currentPlayer: Player = moves.length % 2 === 0 ? 'X' : 'O';
  const isDraw = !winner && moves.length === SIZE * SIZE;

  function handleCellClick(row: number, col: number) {
    if (winner) return;
    if (board[row][col]) return;

    const next = board.map((r) => [...r]);
    next[row][col] = currentPlayer;

    setBoard(next);
    setMoves((prev) => [...prev, { player: currentPlayer, row, col }]);

    const res = checkWin(next, { row, col }, WIN_LENGTH);
    if (res.winner) {
      setWinner(res.winner);
      setWinLine(res.line);
    }
  }

  function reset() {
    setBoard(createEmptyBoard(SIZE));
    setMoves([]);
    setWinner(null);
    setWinLine([]);
  }

  return (
    <div className="app">
      <h1>Крестики-нолики</h1>

      <Board
        board={board}
        onCellClick={handleCellClick}
        disabled={Boolean(winner)}
        winLine={winLine}
      />

      <div className="info">
        {winner && <p className="status">Победитель: <strong>{winner}</strong></p>}
        {!winner && !isDraw && <p className="status">Ход: <strong>{currentPlayer}</strong></p>}
        {isDraw && <p className="status">Ничья</p>}

        <button className="reset" onClick={reset}>Сбросить</button>
      </div>

      <div className="history">
        <h3>История ходов</h3>
        <ol>
          {moves.map((m, i) => (
            <li key={i}>
              {m.player} → ({m.row}, {m.col})
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
