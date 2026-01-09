import React, { useEffect, useMemo, useRef, useState } from 'react';
import './GamePage.scss';
import { Board } from '../components/Board';
import FooterMenu from '../components/FooterMenu';
import ModalAlert from '../components/ModalAlert';
import ResetGame from '../components/ResetGame';
import { useNavigate } from 'react-router-dom';

import { Move, Player, Position } from '../types';
import { checkWinMap, keyOf, type BoardMap } from '../game/engine';
import { saveFinishedMatch } from '../game/storage';

const winLength = 5;
const cellSize = 64;

function newMatchId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function GamePage() {
  const [board, setBoard] = useState<BoardMap>(() => new Map());
  const [moves, setMoves] = useState<Move[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winLine, setWinLine] = useState<Position[]>([]);

  const boardPlainRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const navigate = useNavigate();

  const currentPlayer: Player = moves.length % 2 === 0 ? 'X' : 'O';
  const isGameFinished = Boolean(winner);
  const isGameStarted = moves.length > 0;

  useEffect(() => {
    const el = boardPlainRef.current;
    if (!el) return;

    const update = () => {
      setViewport({ w: el.clientWidth, h: el.clientHeight });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const visibleCells = useMemo(() => {
    const { w, h } = viewport;
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

    const winSet = new Set(winLine.map((p) => keyOf(p.x, p.y)));

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
  }, [board, camera.x, camera.y, viewport.w, viewport.h, winLine]);

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

  function toCellFromPointer(clientX: number, clientY: number): Position | null {
    const el = boardPlainRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;

    const x = Math.floor((sx - camera.x) / cellSize);
    const y = Math.floor((sy - camera.y) / cellSize);

    return { x, y };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;

    const el = boardPlainRef.current;
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
    const el = boardPlainRef.current;
    releaseCaptureSafely(el, e.pointerId);

    if (!panRef.current.down) return;

    const moved = panRef.current.moved;
    panRef.current.down = false;

    if (moved) return;
    if (isGameFinished) return;

    const pos = toCellFromPointer(e.clientX, e.clientY);
    if (!pos) return;

    const k = keyOf(pos.x, pos.y);
    if (board.has(k)) return;

    const nextBoard = new Map(board);
    nextBoard.set(k, currentPlayer);

    const move: Move = { player: currentPlayer, x: pos.x, y: pos.y, t: Date.now() };

    setBoard(nextBoard);
    setMoves((prev) => [...prev, move]);

    const res = checkWinMap(nextBoard, pos, winLength);
    if (res.winner) {
      setWinner(res.winner);
      setWinLine(res.line);

      saveFinishedMatch({
        id: newMatchId(),
        finishedAt: Date.now(),
        winLength,
        winner: res.winner,
        moves: [...moves, move],
      });
    }
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    releaseCaptureSafely(boardPlainRef.current, e.pointerId);
    panRef.current.down = false;
    panRef.current.moved = false;
  }

  function handleLostPointerCapture() {
    panRef.current.down = false;
    panRef.current.moved = false;
  }

  function reset() {
    setBoard(new Map());
    setMoves([]);
    setWinner(null);
    setWinLine([]);
  }

  function requestReset() {
    setIsResetModalOpen(true);
  }

  function cancelReset() {
    setIsResetModalOpen(false);
  }

  function confirmReset() {
    reset();
    setIsResetModalOpen(false);
  }

  function requestExit() {
    if (isGameStarted && !isGameFinished) {
      setIsExitModalOpen(true);
      return;
    }
    navigate('/');
  }

  function cancelExit() {
    setIsExitModalOpen(false);
  }


  return (
    <div className="gamePage">
      <div
        className="boardPlain"
        ref={boardPlainRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
      >
        <Board infiniteCells={visibleCells} cellSize={cellSize} disabled={isGameFinished} />
      </div>

      <FooterMenu
        winner={winner}
        currentPlayer={currentPlayer}
        isDraw={false}
        resetFunc={requestReset}
        onExit={requestExit}
      />

      {isExitModalOpen && <ModalAlert onCancel={cancelExit} />}

      {isResetModalOpen && <ResetGame onCancel={cancelReset} onConfirm={confirmReset} />}
    </div>
  );
}
