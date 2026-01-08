export type Player = 'X' | 'O';
export type CellValue = Player | null;

export interface Move {
  player: Player;
  row: number;
  col: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface WinResult {
  winner: Player | null;
  line: Position[]; // клетки победной линии (например 3 клетки)
}
