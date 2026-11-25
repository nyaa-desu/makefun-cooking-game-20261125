// Sizzle & Serve — the chef: walking the kitchen, carrying one thing,
// and working every station (crates, board, grill, plates, serve, trash).
import { INGREDIENTS, PLAYER_SPEED, TILE } from './config.js';
import { isSolid, stationAt, stationBeside, findPath } from './kitchen.js';

export function createChef() {
  return {
    x: 7 * TILE + TILE / 2,
    y: 4 * TILE + TILE / 2,
    facing: { dx: 0, dy: -1 },
    carrying: null, // { kind: 'item', item } or { kind: 'plate', contents: [] }
    busy: null, // { type: 'chop', t, total, result }
    path: null, // click-to-move waypoints, tile centers
    pendingInteract: null, // station to work when the walk ends
    walkPhase: 0,
    moving: false,
  };
}

function tileOf(px) {
  return Math.floor(px / TILE);
}

function collides(x, y) {
  const r = 20;
  const corners = [
    [x - r, y - r], [x + r, y - r], [x - r, y + r], [x + r, y + r],
  ];
  for (const [cx, cy] of corners) {
    if (isSolid(tileOf(cx), tileOf(cy))) return true;
  }
  return false;
}

export function chefTile(chef) {
  return { col: tileOf(chef.x), row: tileOf(chef.y) };
}

export function updateChef(chef, input, dt, game) {
  if (chef.busy) {
    chef.busy.t += dt;
    if (chef.busy.type === 'chop') {
      if (chef.busy.t >= chef.busy.total) {
        chef.carrying = { kind: 'item', item: chef.busy.result };
        chef.busy = null;
        game.sfx.chopDone();
      } else if (Math.floor(chef.busy.t / 0.35) !== Math.floor((chef.busy.t - dt) / 0.35)) {
        game.sfx.chop();
        game.spawnBits(chef.x, chef.y - 20, '#ffffff', 4);
      }
    }
    return;
  }

  let dx = 0, dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;

  if (dx || dy) {
    chef.path = null;
    chef.pendingInteract = null;
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    chef.facing = { dx: Math.round(dx), dy: Math.round(dy) };
    moveChef(chef, dx, dy, dt);
  } else if (chef.path && chef.path.length) {
    const [tx, ty] = chef.path[0];
    const ddx = tx - chef.x, ddy = ty - chef.y;
    const dist = Math.hypot(ddx, ddy);
    if (dist < 6) {
      chef.path.shift();
      if (!chef.path.length) {
        chef.path = null;
        if (chef.pendingInteract) {
          const station = chef.pendingInteract;
          chef.pendingInteract = null;
          chef.facing = faceToward(chef, station);
          tryInteract(chef, game);
        }
      }
    } else {
      const nx = ddx / dist, ny = ddy / dist;
      chef.facing = { dx: Math.abs(nx) > Math.abs(ny) ? Math.sign(nx) : 0, dy: Math.abs(nx) > Math.abs(ny) ? 0 : Math.sign(ny) };
      moveChef(chef, nx, ny, dt);
    }
  }
  chef.moving = dx !== 0 || dy !== 0 || !!chef.path;
  if (chef.moving) chef.walkPhase += dt * 10;
}

function moveChef(chef, dx, dy, dt) {
  const step = PLAYER_SPEED * dt;
  const nx = chef.x + dx * step;
  if (!collides(nx, chef.y)) chef.x = nx;
  const ny = chef.y + dy * step;
  if (!collides(chef.x, ny)) chef.y = ny;
}

function faceToward(chef, station) {
  const sx = station.col * TILE + TILE / 2 - chef.x;
  const sy = station.row * TILE + TILE / 2 - chef.y;
  if (Math.abs(sx) > Math.abs(sy)) return { dx: Math.sign(sx), dy: 0 };
  return { dx: 0, dy: Math.sign(sy) };
}

// Walk to the floor tile beside a station, then work it. The route is a
// breadth-first path over floor tiles: a straight line to the nearest
// tile can run through a solid counter (for example, reaching the plating
// counter from the east means walking around the row below it), and the
// chef would push against the counter forever instead of arriving.
export function walkToStation(chef, station) {
  const { col, row } = chefTile(chef);
  const spots = [];
  for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const c = station.col + dc, r = station.row + dr;
    if (!isSolid(c, r)) spots.push([c, r]);
  }
  if (!spots.length) return;
  // Shortest walkable route to any neighbouring floor tile.
  let best = null;
  for (const [c, r] of spots) {
    const path = findPath(col, row, c, r);
    if (path && (!best || path.length < best.length)) best = path;
  }
  if (!best) return;
  let waypoints = best.slice(1).map(([c, r]) => [c * TILE + TILE / 2, r * TILE + TILE / 2]);
  if (!waypoints.length) waypoints = [[chef.x, chef.y]]; // already beside it
  chef.path = waypoints;
  chef.pendingInteract = station;
}

export function tryInteract(chef, game) {
  if (chef.busy) return;
  const { col, row } = chefTile(chef);
  const station = stationBeside(col, row, chef.facing.dx, chef.facing.dy)
    || stationAt(col, row);
  if (!station) return;
  workStation(chef, game, station);
}

export function workStation(chef, game, station) {
  const hands = chef.carrying;
  switch (station.kind) {
    case 'crate': {
      if (!hands) {
        chef.carrying = { kind: 'item', item: station.item };
        game.sfx.pickup();
      }
      break;
    }
    case 'board': {
      if (hands && hands.kind === 'item') {
        const def = INGREDIENTS[hands.item];
        if (def && def.chop) {
          chef.busy = { type: 'chop', t: 0, total: def.chopSecs, result: def.chop };
          game.sfx.chop();
        }
      }
      break;
    }
    case 'grill': {
      const slot = game.grill[station.slot];
      if (hands && hands.kind === 'item' && hands.item === 'patty' && !slot.item) {
        slot.item = { state: 'cooking', t: 0 };
        chef.carrying = null;
        game.sfx.sizzle();
      } else if (!hands && slot.item && slot.item.state !== 'cooking') {
        chef.carrying = { kind: 'item', item: slot.item.state === 'done' ? 'grilledPatty' : 'burntPatty' };
        slot.item = null;
        game.sfx.pickup();
      }
      break;
    }
    case 'plate': {
      if (hands && hands.kind === 'plate') {
        if (!game.plateOnCounter) {
          game.plateOnCounter = hands;
          chef.carrying = null;
          game.sfx.putDown();
        }
      } else if (game.plateOnCounter && hands && hands.kind === 'item') {
        game.plateOnCounter.contents.push(hands.item);
        chef.carrying = null;
        game.sfx.putDown();
      } else if (game.plateOnCounter && !hands) {
        chef.carrying = game.plateOnCounter;
        game.plateOnCounter = null;
        game.sfx.pickup();
      } else if (!hands) {
        // Empty hands: take a clean plate from the stack.
        chef.carrying = { kind: 'plate', contents: [] };
        game.sfx.pickup();
      } else if (hands && hands.kind === 'item') {
        // Holding an ingredient and no plate is down: start a new plate
        // with this ingredient already on it.
        game.plateOnCounter = { kind: 'plate', contents: [hands.item] };
        chef.carrying = null;
        game.sfx.putDown();
      }
      break;
    }
    case 'serve': {
      if (hands && hands.kind === 'plate' && hands.contents.length) {
        const result = game.board.serve(hands.contents, game.combo);
        if (result) {
          game.score += result.points;
          game.combo = Math.min(game.combo + 1, 5);
          game.comboTimer = 8;
          chef.carrying = null;
          game.sfx.serve();
          game.spawnHearts(station.col * TILE + TILE / 2, station.row * TILE);
          game.addFloater('+' + result.points, chef.x, chef.y - 30, '#ffd166');
        } else {
          game.sfx.wrong();
          game.addFloater('WRONG DISH!', chef.x, chef.y - 30, '#ff6b6b');
          game.combo = 1;
        }
      }
      break;
    }
    case 'trash': {
      if (hands) {
        chef.carrying = null;
        game.sfx.trash();
      }
      break;
    }
    default:
      break;
  }
}
