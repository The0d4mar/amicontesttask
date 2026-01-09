import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import './MatchViewer.scss';
import { Board } from './Board';
import { FinishedMatch, Move, Player, Position } from '../types';
import { checkWinMap, keyOf, type BoardMap } from '../game/engine';

const cellSize = 64;

interface MatchViewerProps {
  match: FinishedMatch;
  onClose: () => void;
}

function buildBoardFromMoves(moves: Move[], count: number): BoardMap {
  const map: BoardMap = new Map();
  for (let i = 0; i < count; i++) {
    const mv = moves[i];
    map.set(keyOf(mv.x, mv.y), mv.player);
  }
  return map;
}

function findWinInfo(
  moves: Move[],
  winLength: number,
): {
  winAtIndex: number;
  winLine: Position[];
  winner: Player;
} {
  const map: BoardMap = new Map();

  for (let i = 0; i < moves.length; i++) {
    const mv = moves[i];
    map.set(keyOf(mv.x, mv.y), mv.player);

    const res = checkWinMap(map, { x: mv.x, y: mv.y }, winLength);
    if (res.winner) {
      return { winAtIndex: i, winLine: res.line, winner: res.winner };
    }
  }

  return {
    winAtIndex: moves.length - 1,
    winLine: [],
    winner: moves[moves.length - 1]?.player ?? 'X',
  };
}

function centerCameraOnCells(
  cells: Position[],
  viewportW: number,
  viewportH: number,
): { x: number; y: number } {
  if (cells.length === 0) {
    return {
      x: Math.floor(viewportW / 2 - cellSize / 2),
      y: Math.floor(viewportH / 2 - cellSize / 2),
    };
  }

  const avgX = cells.reduce((s, p) => s + p.x, 0) / cells.length;
  const avgY = cells.reduce((s, p) => s + p.y, 0) / cells.length;

  return {
    x: Math.floor(viewportW / 2 - (avgX * cellSize + cellSize / 2)),
    y: Math.floor(viewportH / 2 - (avgY * cellSize + cellSize / 2)),
  };
}

const MatchViewer: FC<MatchViewerProps> = ({ match, onClose }: MatchViewerProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  const { winAtIndex, winLine, winner } = useMemo(
    () => findWinInfo(match.moves, match.winLength),
    [match.moves, match.winLength],
  );

  const [step, setStep] = useState<number>(winAtIndex + 1);

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    update();

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!viewport.w || !viewport.h) return;
    setCamera(centerCameraOnCells(winLine, viewport.w, viewport.h));
  }, [viewport.w, viewport.h]);

  const board = useMemo(() => buildBoardFromMoves(match.moves, step), [match.moves, step]);

  const visibleCells = useMemo(() => {
    const w = viewport.w;
    const h = viewport.h;
    if (!w || !h) return [];

    const buffer = 2;

    let cols = Math.ceil(w / cellSize) + buffer * 2;
    let rows = Math.ceil(h / cellSize) + buffer * 2;

    const maxCells = 8000;
    if (cols * rows > maxCells) {
      const scale = Math.sqrt(maxCells / (cols * rows));
      cols = Math.max(10, Math.floor(cols * scale));
      rows = Math.max(10, Math.floor(rows * scale));
    }

    const centerX = Math.floor((-camera.x + w / 2) / cellSize);
    const centerY = Math.floor((-camera.y + h / 2) / cellSize);

    const halfCols = Math.floor(cols / 2);
    const halfRows = Math.floor(rows / 2);

    const minX = centerX - halfCols;
    const maxX = centerX + halfCols;
    const minY = centerY - halfRows;
    const maxY = centerY + halfRows;

    const shouldHighlightWin = step >= winAtIndex + 1;
    const winSet = new Set(shouldHighlightWin ? winLine.map((p) => keyOf(p.x, p.y)) : []);

    const cells: Array<{
      x: number;
      y: number;
      left: number;
      top: number;
      value: Player | null;
      isWinning: boolean;
    }> = [];

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const k = keyOf(x, y);
        const value = board.get(k) ?? null;

        cells.push({
          x,
          y,
          left: x * cellSize + camera.x,
          top: y * cellSize + camera.y,
          value,
          isWinning: winSet.has(k),
        });
      }
    }

    return cells;
  }, [board, camera.x, camera.y, viewport.w, viewport.h, step, winAtIndex, winLine]);

  const panRef = useRef({
    down: false,
    startX: 0,
    startY: 0,
    camX: 0,
    camY: 0,
    moved: false,
  });

  function releaseCaptureSafely(el: HTMLDivElement | null, pointerId: number) {
    if (!el) return;
    try {
      if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
    } catch {}
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const el = wrapRef.current;
    if (!el) return;

    el.setPointerCapture(e.pointerId);

    panRef.current.down = true;
    panRef.current.startX = e.clientX;
    panRef.current.startY = e.clientY;
    panRef.current.camX = camera.x;
    panRef.current.camY = camera.y;
    panRef.current.moved = false;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!panRef.current.down) return;

    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;

    if (Math.abs(dx) + Math.abs(dy) > 5) panRef.current.moved = true;

    setCamera({
      x: panRef.current.camX + dx,
      y: panRef.current.camY + dy,
    });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    releaseCaptureSafely(wrapRef.current, e.pointerId);
    panRef.current.down = false;
    panRef.current.moved = false;
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    releaseCaptureSafely(wrapRef.current, e.pointerId);
    panRef.current.down = false;
    panRef.current.moved = false;
  }

  const totalMoves = match.moves.length;

  function stepBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function stepForward() {
    setStep((s) => Math.min(totalMoves, s + 1));
  }

  function toWin() {
    setStep(winAtIndex + 1);
  }

  function toStart() {
    setStep(0);
  }

  function recenter() {
    if (!viewport.w || !viewport.h) return;
    setCamera(centerCameraOnCells(winLine, viewport.w, viewport.h));
  }

  return (
    <div className="matchViewer__overlay" role="dialog" aria-modal="true">
      <div className="matchViewer">
        <div className="matchViewer__header">
          <button
            className="matchViewer__button matchViewer__button--ghost"
            onClick={onClose}
            type="button"
          >
            Назад к списку
          </button>

          <div className="matchViewer__info">
            <div className="matchViewer__title">
              Победитель: <b>{winner}</b>
            </div>
            <div className="matchViewer__meta">
              {new Date(match.finishedAt).toLocaleString()} · В ряд: {match.winLength}
            </div>
          </div>
        </div>

        <div
          ref={wrapRef}
          className="matchViewer__boardPlain"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <Board infiniteCells={visibleCells} cellSize={cellSize} disabled={true} />
        </div>

        <div className="matchViewer__footer">
          <button className="matchViewer__button" onClick={toStart} type="button">
            В начало
          </button>

          <button className="matchViewer__button" onClick={stepBack} type="button">
            ← Ход
          </button>

          <div className="matchViewer__stepInfo">
            Ход: <b>{step}</b> / {totalMoves}
          </div>

          <button className="matchViewer__button" onClick={stepForward} type="button">
            Ход →
          </button>

          <button className="matchViewer__button" onClick={toWin} type="button">
            До победы
          </button>

          <button className="matchViewer__button" onClick={recenter} type="button">
            Центр
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchViewer;
