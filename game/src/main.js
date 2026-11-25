// Sizzle & Serve — the game itself: state, the loop, the grill timers,
// the day timer, and the title / play / pause / game-over flow.
import { CANVAS_W, CANVAS_H, DAY_SECONDS, START_LIVES, GRILL_COOK_SECS, GRILL_BURN_SECS, GRILL_SLOTS, TILE } from './config.js';
import { OrderBoard } from './orders.js';
import { createChef, updateChef, tryInteract } from './player.js';
import { createInput, handleClick } from './input.js';
import { render } from './render.js';
import { Sfx } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const game = {
  mode: 'title',
  timeLeft: DAY_SECONDS,
  score: 0,
  lives: START_LIVES,
  combo: 1,
  comboTimer: 0,
  chef: createChef(),
  board: new OrderBoard(),
  grill: Array.from({ length: GRILL_SLOTS }, () => ({ item: null })),
  plateOnCounter: null,
  particles: [],
  floaters: [],
  animT: 0,
  frozen: false,
  sfx: new Sfx(),
  dayElapsed: 0,
  lastTickSecond: -1,
};

game.spawnBits = (x, y, color, n) => {
  for (let i = 0; i < n; i++) {
    game.particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 60,
      vy: -Math.random() * 60 - 10,
      life: 0.5, maxLife: 0.5, size: 2 + Math.random() * 3, color,
    });
  }
};

game.spawnHearts = (x, y) => {
  for (let i = 0; i < 8; i++) {
    game.particles.push({
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 30,
      vy: -40 - Math.random() * 40,
      life: 0.9, maxLife: 0.9, size: 3 + Math.random() * 3, color: '#ffd166',
    });
  }
};

game.addFloater = (text, x, y, color) => {
  game.floaters.push({ text, x, y, color, life: 1.2, maxLife: 1.2 });
};

function resetDay() {
  game.mode = 'play';
  game.timeLeft = DAY_SECONDS;
  game.dayElapsed = 0;
  game.score = 0;
  game.lives = START_LIVES;
  game.combo = 1;
  game.comboTimer = 0;
  game.chef = createChef();
  game.board.reset();
  game.grill = Array.from({ length: GRILL_SLOTS }, () => ({ item: null }));
  game.plateOnCounter = null;
  game.particles = [];
  game.floaters = [];
  game.frozen = false;
  game.sfx.ensure();
  game.sfx.startMusic();
}

function updateGrill(dt) {
  for (const slot of game.grill) {
    if (!slot.item) continue;
    slot.item.t += dt;
    if (slot.item.state === 'cooking' && slot.item.t >= GRILL_COOK_SECS) {
      slot.item = { state: 'done', t: 0 };
      game.sfx.ding();
    } else if (slot.item.state === 'done' && slot.item.t >= GRILL_BURN_SECS) {
      slot.item = { state: 'burnt', t: 0 };
      game.sfx.wrong();
    }
  }
}

function updateParticles(dt) {
  for (const p of game.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 120 * dt;
    p.life -= dt;
  }
  game.particles = game.particles.filter((p) => p.life > 0);
  for (const f of game.floaters) {
    f.y -= 30 * dt;
    f.life -= dt;
  }
  game.floaters = game.floaters.filter((f) => f.life > 0);
}

const input = createInput(canvas);

function update(dt) {
  game.animT += dt;
  if (game.mode !== 'play' || game.frozen) {
    updateParticles(dt);
    return;
  }

  game.dayElapsed += dt;
  game.timeLeft -= dt;
  const wholeSecond = Math.ceil(game.timeLeft);
  if (wholeSecond !== game.lastTickSecond) {
    game.lastTickSecond = wholeSecond;
    if (wholeSecond <= 10 && wholeSecond > 0) game.sfx.tick();
  }

  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 1;
  }

  handleClick(input, game.chef, game);
  if (input.interactPressed) {
    input.interactPressed = false;
    game.sfx.ensure();
    tryInteract(game.chef, game);
  }
  updateChef(game.chef, input, dt, game);
  updateGrill(dt);
  game.board.update(dt, game.dayElapsed, (missed) => {
    game.lives -= missed;
    game.combo = 1;
    game.sfx.wrong();
    game.addFloater('ORDER MISSED!', CANVAS_W / 2, 200, '#ff6b6b');
  });
  updateParticles(dt);

  if (game.lives <= 0 || game.timeLeft <= 0) {
    game.mode = 'over';
    game.sfx.stopMusic();
    game.sfx.gameOver();
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (input.mutePressed) {
    input.mutePressed = false;
    game.sfx.ensure();
    game.sfx.toggleMute();
  }
  if (input.startPressed) {
    input.startPressed = false;
    if (game.mode === 'title') {
      game.sfx.ensure();
      resetDay();
    }
  }
  if (input.restartPressed) {
    input.restartPressed = false;
    if (game.mode === 'over' || game.mode === 'play' || game.mode === 'pause') resetDay();
  }
  if (input.pausePressed) {
    input.pausePressed = false;
    if (game.mode === 'play') game.mode = 'pause';
    else if (game.mode === 'pause') game.mode = 'play';
  }

  update(dt);
  render(ctx, game);
  requestAnimationFrame(frame);
}

// A screenshot state (?shot=kitchen|assembly|serve) sets the kitchen up
// mid-shift and freezes the clock; anything else opens the title screen.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  resetDay();
  applyShot(game, shot);
} else {
  // The title screen shows the empty kitchen behind it.
  game.board.reset();
}

render(ctx, game);
requestAnimationFrame(frame);

// Expose a tiny handle for automated play-testing.
window.__game = game;
