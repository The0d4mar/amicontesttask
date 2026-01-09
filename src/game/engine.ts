import { Player, Position, WinResult } from '../types';

export type BoardMap = Map<string, Player>;

export const keyOf = (x: number, y: number) => `${x},${y}`;

const directions = [
  { dx: 1, dy: 0 }, // право
  { dx: 0, dy: 1 }, // вниз
  { dx: 1, dy: 1 }, // право-низ
  { dx: 1, dy: -1 }, // право-верх
];

export function checkWinMap(board: BoardMap, lastMove: Position, winLength: number): WinResult {
  const player = board.get(keyOf(lastMove.x, lastMove.y)) ?? null;
  if (!player) return { winner: null, line: [] };

  for (const { dx, dy } of directions) {
    const line: Position[] = [{ ...lastMove }];

    line.push(...collect(board, player, lastMove, dx, dy, winLength));
    line.unshift(...collect(board, player, lastMove, -dx, -dy, winLength));

    if (line.length >= winLength) {
      const trimmed = trimToLength(line, winLength);
      return { winner: player, line: trimmed };
    }
  }

  return { winner: null, line: [] };
}

function collect(
  board: BoardMap,
  player: Player,
  start: Position,
  dx: number,
  dy: number,
  winLength: number,
): Position[] {
  const res: Position[] = [];
  let x = start.x + dx;
  let y = start.y + dy;

  while (board.get(keyOf(x, y)) === player && res.length < winLength - 1) {
    res.push({ x, y });
    x += dx;
    y += dy;
  }
  return res;
}

function trimToLength(line: Position[], winLength: number): Position[] {
  if (line.length === winLength) return line;
  const start = Math.floor((line.length - winLength) / 2);
  return line.slice(start, start + winLength);
}
