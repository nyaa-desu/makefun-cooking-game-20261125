// Sizzle & Serve — keyboard and mouse: WASD/arrows to walk, E or Space to
// work a station, click a floor tile to walk there, click a station to walk
// over and work it. M mutes, P pauses, R restarts, Enter starts.
import { TILE, HUD_H, COLS, ROWS } from './config.js';
import { isSolid, stationAt } from './kitchen.js';
import { findPath } from './kitchen.js';
import { walkToStation } from './player.js';

export function createInput(canvas) {
  const input = {
    up: false, down: false, left: false, right: false,
    interactPressed: false, // consumed once by the game loop
    startPressed: false,
    restartPressed: false,
    pausePressed: false,
    mutePressed: false,
    click: null, // { col, row } in kitchen tiles, consumed once
  };

  const keyMap = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };

  window.addEventListener('keydown', (e) => {
    if (keyMap[e.code] !== undefined) {
      input[keyMap[e.code]] = true;
      e.preventDefault();
    } else if (e.code === 'KeyE' || e.code === 'Space') {
      if (!e.repeat) input.interactPressed = true;
      e.preventDefault();
    } else if (e.code === 'Enter') {
      if (!e.repeat) input.startPressed = true;
    } else if (e.code === 'KeyR') {
      if (!e.repeat) input.restartPressed = true;
    } else if (e.code === 'KeyP') {
      if (!e.repeat) input.pausePressed = true;
    } else if (e.code === 'KeyM') {
      if (!e.repeat) input.mutePressed = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (keyMap[e.code] !== undefined) input[keyMap[e.code]] = false;
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    input.click = { x: px, y: py };
  });

  return input;
}

// Turn a mouse click into a walk order or a station visit.
export function handleClick(input, chef, game) {
  if (!input.click) return;
  const { x, y } = input.click;
  input.click = null;
  const col = Math.floor(x / TILE);
  const row = Math.floor((y - HUD_H) / TILE); // kitchen starts below the HUD
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
  const station = stationAt(col, row);
  if (station) {
    // Clicked a station: walk beside it and work it on arrival.
    walkToStation(chef, station);
  } else if (!isSolid(col, row)) {
    const from = { col: Math.floor(chef.x / TILE), row: Math.floor(chef.y / TILE) };
    const path = findPath(from.col, from.row, col, row);
    if (path && path.length > 1) {
      chef.pendingInteract = null;
      chef.path = path.slice(1).map(([c, r]) => [c * TILE + TILE / 2, r * TILE + TILE / 2]);
    }
  }
}
