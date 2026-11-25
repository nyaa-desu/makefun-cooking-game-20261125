// Sizzle & Serve — the kitchen floor plan: where every station stands,
// which tiles block movement, and how to find the station next to the chef.
import { COLS, ROWS } from './config.js';

// Station kinds: crate, board, grill, plate, serve, trash, counter.
function buildStations() {
  const stations = new Map();
  const put = (col, row, kind, data = {}) => stations.set(col + ',' + row, { col, row, kind, ...data });

  // Top wall: the serving window and the plating counter.
  put(6, 0, 'serve', { label: 'SERVE' });
  put(7, 0, 'serve', { label: 'SERVE' });
  put(8, 0, 'serve', { label: 'SERVE' });
  put(11, 0, 'plate', { label: 'PLATES' });
  put(12, 0, 'plate', { label: 'PLATES' });
  put(14, 0, 'trash', { label: 'TRASH' });

  // Left wall: the ingredient crates, top to bottom.
  put(0, 1, 'crate', { item: 'tomato', label: 'TOMATO' });
  put(0, 2, 'crate', { item: 'lettuce', label: 'LETTUCE' });
  put(0, 3, 'crate', { item: 'cheese', label: 'CHEESE' });
  put(0, 4, 'crate', { item: 'patty', label: 'PATTY' });
  put(0, 5, 'crate', { item: 'bun', label: 'BUN' });

  // Right wall: the chopping board and the grill.
  put(14, 1, 'board', { label: 'CHOP' });
  put(14, 2, 'board', { label: 'CHOP' });
  put(14, 4, 'grill', { label: 'GRILL', slot: 0 });
  put(14, 5, 'grill', { label: 'GRILL', slot: 1 });
  put(14, 3, 'counter', { label: '' });
  put(14, 6, 'counter', { label: '' });

  // Bottom wall and the remaining top corners are plain counters.
  for (let c = 0; c < COLS; c++) put(c, 7, 'counter', { label: '' });
  put(0, 0, 'counter', { label: '' });
  put(0, 6, 'counter', { label: '' });
  return stations;
}

export const STATIONS = buildStations();

export function stationAt(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
  return STATIONS.get(col + ',' + row) || null;
}

export function isSolid(col, row) {
  return stationAt(col, row) !== null;
}

export function inBounds(col, row) {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

// Breadth-first walkable path between floor tiles (for click-to-move).
export function findPath(fromCol, fromRow, toCol, toRow) {
  if (!inBounds(toCol, toRow) || isSolid(toCol, toRow)) return null;
  const key = (c, r) => c + ',' + r;
  const prev = new Map();
  const queue = [[fromCol, fromRow]];
  prev.set(key(fromCol, fromRow), null);
  while (queue.length) {
    const [c, r] = queue.shift();
    if (c === toCol && r === toRow) {
      const path = [];
      let cur = key(c, r);
      while (cur) {
        const [pc, pr] = cur.split(',').map(Number);
        path.unshift([pc, pr]);
        cur = prev.get(cur);
      }
      return path;
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr;
      if (!inBounds(nc, nr) || isSolid(nc, nr) || prev.has(key(nc, nr))) continue;
      prev.set(key(nc, nr), key(c, r));
      queue.push([nc, nr]);
    }
  }
  return null;
}

// The station tile next to a floor tile in a direction, if any.
export function stationBeside(col, row, dx, dy) {
  return stationAt(col + dx, row + dy);
}

// Every floor tile beside a station of the given kind (used by the demo shots).
export function floorBeside(kind) {
  const spots = [];
  for (const s of STATIONS.values()) {
    if (s.kind !== kind) continue;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = s.col + dc, r = s.row + dr;
      if (inBounds(c, r) && !isSolid(c, r)) spots.push({ col: c, row: r, station: s });
    }
  }
  return spots;
}
