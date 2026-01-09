export type Player = 'X' | 'O';
export type CellValue = Player | null;

export interface Move {
  player: Player;
  x: number;
  y: number;
  t: number; // timestamp
}

export interface Position {
  x: number;
  y: number;
}

export interface WinResult {
  winner: Player | null;
  line: Position[]; // выигрышная последовательность
}

export interface FinishedMatch {
  id: string;
  finishedAt: number;
  winLength: number;
  winner: Player;
  moves: Move[];
}

export interface InfiniteCell {
  x: number;
  y: number;
  left: number;
  top: number;
  value: Player | null;
  isWinning: boolean;
}
