// Sizzle & Serve — every pixel the player sees: the order board, the
// kitchen, the food, the chef, and the title / pause / game-over screens.
import { COLS, ROWS, TILE, HUD_H, CANVAS_W, CANVAS_H, INGREDIENTS, ITEM_NAMES, DAY_SECONDS } from './config.js';
import { STATIONS } from './kitchen.js';

const FLOOR_A = '#c98f5f';
const FLOOR_B = '#bd8252';
const COUNTER_TOP = '#8a5a33';
const COUNTER_SIDE = '#6e4525';
const STEEL = '#c7ccd4';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawItem(ctx, item, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  switch (item) {
    case 'tomato':
      ctx.fillStyle = '#e5484d';
      ctx.beginPath(); ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#46a758';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        ctx.moveTo(0, -s * 0.3);
        ctx.lineTo(Math.cos(a - 0.25) * s * 0.22, -s * 0.3 + Math.sin(a - 0.25) * s * 0.22);
        ctx.lineTo(Math.cos(a + 0.25) * s * 0.22, -s * 0.3 + Math.sin(a + 0.25) * s * 0.22);
      }
      ctx.fill();
      break;
    case 'lettuce':
      ctx.fillStyle = '#46a758';
      ctx.beginPath(); ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#2f7d3d'; ctx.lineWidth = s * 0.06;
      ctx.beginPath(); ctx.arc(0, 0, s * 0.26, 0.4, 2.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s * 0.14, 3.4, 5.6); ctx.stroke();
      break;
    case 'cheese':
      ctx.fillStyle = '#f5d90a';
      ctx.beginPath(); ctx.moveTo(-s * 0.42, s * 0.3); ctx.lineTo(s * 0.42, s * 0.3); ctx.lineTo(0, -s * 0.38); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9a400';
      ctx.beginPath(); ctx.arc(-s * 0.12, s * 0.08, s * 0.07, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s * 0.14, -s * 0.1, s * 0.06, 0, Math.PI * 2); ctx.fill();
      break;
    case 'patty':
      ctx.fillStyle = '#8b5a2b';
      rr(ctx, -s * 0.42, -s * 0.28, s * 0.84, s * 0.56, s * 0.2); ctx.fill();
      break;
    case 'grilledPatty':
      ctx.fillStyle = '#6b4423';
      rr(ctx, -s * 0.42, -s * 0.28, s * 0.84, s * 0.56, s * 0.2); ctx.fill();
      ctx.strokeStyle = '#3d2712'; ctx.lineWidth = s * 0.07;
      for (const off of [-0.18, 0, 0.18]) {
        ctx.beginPath(); ctx.moveTo(-s * 0.3, off * s); ctx.lineTo(s * 0.3, off * s); ctx.stroke();
      }
      break;
    case 'burntPatty':
      ctx.fillStyle = '#1d1d1d';
      rr(ctx, -s * 0.42, -s * 0.28, s * 0.84, s * 0.56, s * 0.2); ctx.fill();
      break;
    case 'bun':
      ctx.fillStyle = '#e8b25a';
      ctx.beginPath(); ctx.arc(0, s * 0.1, s * 0.42, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d99a3d';
      rr(ctx, -s * 0.42, s * 0.08, s * 0.84, s * 0.16, s * 0.06); ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (const [sx, sy] of [[-0.18, -0.18], [0.05, -0.28], [0.2, -0.12]]) {
        ctx.beginPath(); ctx.arc(sx * s, sy * s, s * 0.045, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'choppedTomato':
      ctx.fillStyle = '#e5484d';
      for (const [ox, oy, r] of [[-0.16, -0.1, 0.2], [0.16, 0.08, 0.18], [0, 0.2, 0.15]]) {
        ctx.beginPath(); ctx.arc(ox * s, oy * s, r * s, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'choppedLettuce':
      ctx.fillStyle = '#46a758';
      for (const [ox, oy, r] of [[-0.18, 0, 0.16], [0.05, -0.16, 0.17], [0.18, 0.12, 0.15]]) {
        ctx.beginPath(); ctx.arc(ox * s, oy * s, r * s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#7cc78a';
      ctx.beginPath(); ctx.arc(0.05 * s, -0.16 * s, 0.08 * s, 0, Math.PI * 2); ctx.fill();
      break;
    default:
      ctx.fillStyle = '#cccccc';
      ctx.beginPath(); ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawPlate(ctx, contents, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f2f2f2';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.52, s * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b9bec7'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.52, s * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
  const n = contents.length;
  contents.forEach((item, i) => {
    const ox = n === 1 ? 0 : (i - (n - 1) / 2) * s * 0.3;
    drawItem(ctx, item, ox, -s * 0.05, s * 0.62);
  });
  ctx.restore();
}

function drawStation(ctx, station, game) {
  const x = station.col * TILE, y = station.row * TILE;
  ctx.fillStyle = COUNTER_SIDE;
  ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
  ctx.fillStyle = station.kind === 'grill' ? '#3a3f47' : COUNTER_TOP;
  rr(ctx, x + 4, y + 4, TILE - 8, TILE - 8, 8); ctx.fill();
  if (station.kind === 'crate') {
    ctx.fillStyle = '#7a4a21';
    rr(ctx, x + 10, y + 14, TILE - 20, TILE - 26, 6); ctx.fill();
    drawItem(ctx, station.item, x + TILE / 2, y + TILE / 2 - 2, 44);
  } else if (station.kind === 'board') {
    ctx.fillStyle = '#e8d9b0';
    rr(ctx, x + 10, y + 12, TILE - 20, TILE - 24, 6); ctx.fill();
    ctx.strokeStyle = '#b49b62'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 16, y + TILE / 2); ctx.lineTo(x + TILE - 16, y + TILE / 2); ctx.stroke();
  } else if (station.kind === 'grill') {
    const slot = game.grill[station.slot];
    ctx.fillStyle = '#22252b';
    rr(ctx, x + 8, y + 10, TILE - 16, TILE - 20, 6); ctx.fill();
    if (slot.item) {
      if (slot.item.state === 'cooking') {
        ctx.fillStyle = '#ff9f1c';
        ctx.beginPath(); ctx.arc(x + TILE / 2, y + TILE / 2, 12 + Math.sin(game.animT * 9) * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffbf69';
        ctx.beginPath(); ctx.arc(x + TILE / 2, y + TILE / 2, 6, 0, Math.PI * 2); ctx.fill();
      }
      drawItem(ctx, slot.item.state === 'done' ? 'grilledPatty' : slot.item.state === 'burnt' ? 'burntPatty' : 'patty', x + TILE / 2, y + TILE / 2 - 4, 40);
      const total = slot.item.state === 'cooking' ? 6 : 5;
      const frac = Math.min(1, slot.item.t / total);
      ctx.fillStyle = '#222';
      ctx.fillRect(x + 10, y + TILE - 14, TILE - 20, 6);
      ctx.fillStyle = slot.item.state === 'burnt' ? '#ff3b30' : slot.item.state === 'done' ? '#46a758' : '#ff9f1c';
      ctx.fillRect(x + 10, y + TILE - 14, (TILE - 20) * frac, 6);
    } else {
      ctx.strokeStyle = '#555b66'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 14, y + 18); ctx.lineTo(x + TILE - 14, y + 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 14, y + 30); ctx.lineTo(x + TILE - 14, y + 30); ctx.stroke();
    }
  } else if (station.kind === 'plate') {
    if (game.plateOnCounter) {
      drawPlate(ctx, game.plateOnCounter.contents, x + TILE / 2, y + TILE / 2, 56);
    } else {
      ctx.fillStyle = '#e8e8e8';
      ctx.beginPath(); ctx.ellipse(x + TILE / 2, y + TILE / 2 + 4, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + TILE / 2, y + TILE / 2 - 4, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b9bec7'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x + TILE / 2, y + TILE / 2 - 4, 20, 13, 0, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (station.kind === 'serve') {
    ctx.fillStyle = '#7ec8e3';
    rr(ctx, x + 6, y + 6, TILE - 12, TILE - 12, 8); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SERVE', x + TILE / 2, y + TILE / 2 + 5);
  } else if (station.kind === 'trash') {
    ctx.fillStyle = '#4a4f58';
    rr(ctx, x + 14, y + 10, TILE - 28, TILE - 22, 6); ctx.fill();
    ctx.fillStyle = '#2c2f36';
    rr(ctx, x + 10, y + 6, TILE - 20, 8, 4); ctx.fill();
  }
  if (station.label && station.kind !== 'serve') {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(station.label, x + TILE / 2, y + TILE - 8);
  }
}

function drawChef(ctx, chef) {
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 2 : 0;
  const x = chef.x, y = chef.y + bob;
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 20, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  // body
  ctx.fillStyle = '#ffffff';
  rr(ctx, -14, -6, 28, 28, 8); ctx.fill();
  ctx.fillStyle = '#e5484d';
  ctx.fillRect(-14, 8, 28, 5);
  // head
  ctx.fillStyle = '#ffd9b3';
  ctx.beginPath(); ctx.arc(0, -16, 13, 0, Math.PI * 2); ctx.fill();
  // toque
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-7, -28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -31, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-11, -30, 22, 8);
  // eyes look where the chef faces
  ctx.fillStyle = '#222';
  const ex = chef.facing.dx * 3, ey = chef.facing.dy * 2;
  ctx.beginPath(); ctx.arc(-5 + ex, -16 + ey, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5 + ex, -16 + ey, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // carried item above the head
  if (chef.carrying) {
    const cy = y - 46;
    if (chef.carrying.kind === 'plate') {
      drawPlate(ctx, chef.carrying.contents, x, cy, 44);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(x, cy, 20, 0, Math.PI * 2); ctx.fill();
      drawItem(ctx, chef.carrying.item, x, cy, 34);
    }
  }
  // chopping progress
  if (chef.busy && chef.busy.type === 'chop') {
    const frac = chef.busy.t / chef.busy.total;
    ctx.fillStyle = '#222';
    ctx.fillRect(x - 22, y - 58, 44, 7);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x - 22, y - 58, 44 * frac, 7);
  }
}

function drawOrders(ctx, board) {
  const cardW = 200, cardH = 88, gap = 12;
  const startX = 14;
  board.orders.forEach((order, i) => {
    const x = startX + i * (cardW + gap), y = 8;
    const urgent = order.urgent;
    ctx.fillStyle = urgent && Math.floor(order.flash * 3) % 2 === 0 ? '#ff6b6b' : '#fff8e7';
    rr(ctx, x, y, cardW, cardH, 10); ctx.fill();
    ctx.strokeStyle = urgent ? '#e5484d' : '#d9c9a3';
    ctx.lineWidth = 2;
    rr(ctx, x, y, cardW, cardH, 10); ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(order.recipe.name, x + 10, y + 20);
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.fillText('$' + order.recipe.price, x + 10, y + 36);
    order.recipe.items.forEach((item, j) => {
      drawItem(ctx, item, x + 26 + j * 34, y + 56, 30);
    });
    // patience bar
    ctx.fillStyle = '#e5ddd0';
    ctx.fillRect(x + 10, y + cardH - 12, cardW - 20, 6);
    ctx.fillStyle = order.fraction > 0.5 ? '#46a758' : order.fraction > 0.25 ? '#f5a623' : '#e5484d';
    ctx.fillRect(x + 10, y + cardH - 12, (cardW - 20) * order.fraction, 6);
  });
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  drawOrders(ctx, game.board);
  const rightX = CANVAS_W - 14;
  ctx.textAlign = 'right';
  ctx.font = 'bold 26px sans-serif';
  const mins = Math.floor(Math.max(0, game.timeLeft) / 60);
  const secs = Math.floor(Math.max(0, game.timeLeft) % 60);
  const timeText = mins + ':' + String(secs).padStart(2, '0');
  ctx.fillStyle = game.timeLeft <= 30 ? '#ff6b6b' : '#ffd166';
  ctx.fillText(timeText, rightX, 34);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('SCORE ' + game.score, rightX, 58);
  ctx.fillStyle = '#ffd166';
  ctx.fillText('COINS $' + game.board.coins, rightX, 80);
  // lives as hearts
  for (let i = 0; i < 3; i++) {
    const hx = rightX - 170 + i * 24;
    ctx.fillStyle = i < game.lives ? '#e5484d' : '#5a4636';
    ctx.beginPath();
    ctx.arc(hx - 5, 26, 6, 0, Math.PI * 2);
    ctx.arc(hx + 5, 26, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 10, 28); ctx.lineTo(hx + 10, 28); ctx.lineTo(hx, 40); ctx.closePath(); ctx.fill();
  }
  if (game.combo > 1) {
    ctx.fillStyle = '#ff9f1c';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('COMBO x' + game.combo, rightX - 170, 80);
  }
  ctx.textAlign = 'left';
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  for (const f of game.floaters) {
    ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

export function render(ctx, game) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawHud(ctx, game);

  ctx.save();
  ctx.translate(0, HUD_H);
  // floor
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = (c + r) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
  // stations
  for (const station of STATIONS.values()) drawStation(ctx, station, game);
  // chef
  drawChef(ctx, game.chef);
  drawParticles(ctx, game);
  ctx.restore();

  // hint line
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('WASD / arrows move  •  E interact  •  click a station to walk there  •  M mute  •  P pause', 12, CANVAS_H - 4);

  if (game.mode === 'title') drawTitle(ctx, game);
  else if (game.mode === 'pause') drawPause(ctx);
  else if (game.mode === 'over') drawGameOver(ctx, game);
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function drawTitle(ctx, game) {
  overlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText('SIZZLE & SERVE', CANVAS_W / 2, 190);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.fillText('A tiny kitchen, a hungry crowd, one very busy chef.', CANVAS_W / 2, 232);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#ffe9b3';
  ctx.fillText('Grab ingredients, chop and grill them, build each dish on a plate,', CANVAS_W / 2, 300);
  ctx.fillText('and serve it at the window before the ticket runs out.', CANVAS_W / 2, 326);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Press ENTER to open the kitchen', CANVAS_W / 2, 400);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#cfc4b0';
  ctx.fillText('WASD / arrows move  •  E or click to work a station  •  3 missed tickets ends the day', CANVAS_W / 2, 440);
  ctx.fillText('Menu: Garden Salad $12  •  Classic Burger $18  •  Cheese Burger $20  •  Garden Plate $15  •  Double Stack $28', CANVAS_W / 2, 468);
}

function drawPause(ctx) {
  overlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2 - 10);
  ctx.font = '16px sans-serif';
  ctx.fillText('Press P to keep cooking', CANVAS_W / 2, CANVAS_H / 2 + 26);
}

function drawGameOver(ctx, game) {
  overlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(game.lives > 0 ? 'DAY COMPLETE!' : 'KITCHEN CLOSED', CANVAS_W / 2, 210);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px sans-serif';
  ctx.fillText('Dishes served: ' + game.board.served + '    Missed: ' + game.board.failed, CANVAS_W / 2, 268);
  ctx.fillText('Coins earned: $' + game.board.coins + '    Score: ' + game.score, CANVAS_W / 2, 304);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#ffe9b3';
  ctx.fillText(game.score >= 1500 ? 'The crowd wants you back tomorrow, chef!' : game.score >= 800 ? 'A solid shift. The rush will be back.' : 'Rough shift — the tickets got away from you.', CANVAS_W / 2, 348);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Press R to cook another day', CANVAS_W / 2, 410);
}
