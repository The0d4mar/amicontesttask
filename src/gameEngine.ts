import { CellValue, Player, Position, WinResult } from './types';

const inBounds = (size: number, r: number, c: number) =>
  r >= 0 && r < size && c >= 0 && c < size;

export function checkWin(
  board: CellValue[][],
  lastMove: Position,
  winLength: number
): WinResult {
  const { row, col } = lastMove;
  const player = board[row]?.[col] as Player | null;
  if (!player) return { winner: null, line: [] };

  const size = board.length;

  // 4 направления (достаточно, потому что проверяем и вперед и назад)
  const directions = [
    { dr: 0, dc: 1 },   // →
    { dr: 1, dc: 0 },   // ↓
    { dr: 1, dc: 1 },   // ↘
    { dr: 1, dc: -1 },  // ↙
  ];

  for (const { dr, dc } of directions) {
    const line: Position[] = [{ row, col }];

    // вперед
    line.push(...collect(board, player, { row, col }, { dr, dc }, winLength, size));
    // назад
    line.unshift(...collect(board, player, { row, col }, { dr: -dr, dc: -dc }, winLength, size));

    if (line.length >= winLength) {
      // берём ровно winLength клеток, чтобы линия была “как в классике”
      // и шла по центрам крайних клеток
      const trimmed = trimToLength(line, winLength);
      return { winner: player, line: trimmed };
    }
  }

  return { winner: null, line: [] };
}

function collect(
  board: CellValue[][],
  player: Player,
  start: Position,
  dir: { dr: number; dc: number },
  winLength: number,
  size: number
): Position[] {
  const res: Position[] = [];
  let r = start.row + dir.dr;
  let c = start.col + dir.dc;

  while (inBounds(size, r, c) && board[r][c] === player && res.length < winLength - 1) {
    res.push({ row: r, col: c });
    r += dir.dr;
    c += dir.dc;
  }
  return res;
}

function trimToLength(line: Position[], winLength: number): Position[] {
  if (line.length === winLength) return line;

  // оставляем центральный участок, чтобы линия выглядела логично
  // (для 3×3 это обычно совпадает с полной линией)
  const start = Math.floor((line.length - winLength) / 2);
  return line.slice(start, start + winLength);
}
