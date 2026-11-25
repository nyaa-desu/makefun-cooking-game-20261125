// Sizzle & Serve — deterministic demo states for the screenshots: each one
// sets the game up mid-shift and freezes the clock, so a capture shows the
// kitchen, the orders and a dish exactly as the game itself renders them.
import { RECIPES } from './config.js';
import { Order } from './orders.js';

function findRecipe(id) {
  return RECIPES.find((r) => r.id === id);
}

function makeOrder(id, patience, timeLeft) {
  const order = new Order(findRecipe(id), patience);
  order.timeLeft = timeLeft;
  return order;
}

// Kitchen + order board + ingredients on the counter, early in a busy day.
export function shotKitchen(game) {
  game.mode = 'play';
  game.timeLeft = 138;
  game.score = 240;
  game.lives = 3;
  game.combo = 1;
  game.board.orders = [
    makeOrder('burger', 60, 48),
    makeOrder('salad', 55, 36),
    makeOrder('cheeseburger', 60, 52),
  ];
  game.board.served = 2;
  game.board.coins = 30;
  game.chef.x = 7 * 64 + 32;
  game.chef.y = 4 * 64 + 32;
  game.chef.facing = { dx: -1, dy: 0 };
  game.chef.carrying = { kind: 'item', item: 'tomato' };
  game.grill[0].item = { state: 'cooking', t: 3.5 };
  game.grill[1].item = null;
  game.plateOnCounter = null;
}

// A dish mid-assembly: a plate on the counter already holds a bun and a
// grilled patty, and the chef is chopping the lettuce to finish the burger.
export function shotAssembly(game) {
  game.mode = 'play';
  game.timeLeft = 96;
  game.score = 610;
  game.lives = 3;
  game.combo = 2;
  game.board.orders = [
    makeOrder('burger', 60, 22),
    makeOrder('gardenplate', 55, 41),
    makeOrder('doublestack', 62, 55),
  ];
  game.board.served = 4;
  game.board.coins = 66;
  game.plateOnCounter = { contents: ['bun', 'grilledPatty'] };
  game.chef.x = 13 * 64 + 32;
  game.chef.y = 1 * 64 + 32;
  game.chef.facing = { dx: 1, dy: 0 };
  game.chef.carrying = { kind: 'item', item: 'lettuce' };
  game.chef.busy = { type: 'chop', t: 0.7, total: 1.2, result: 'choppedLettuce' };
  game.grill[0].item = { state: 'done', t: 0 };
  game.grill[1].item = { state: 'cooking', t: 4.2 };
  game.spawnBits(13 * 64 + 32, 1 * 64 + 12, '#ffffff', 5);
}

// The rush: a finished plate waits at the window, tickets nearly out of
// time, and the grill is full.
export function shotServe(game) {
  game.mode = 'play';
  game.timeLeft = 41;
  game.score = 1240;
  game.lives = 2;
  game.combo = 3;
  game.board.orders = [
    makeOrder('cheeseburger', 55, 9),
    makeOrder('doublestack', 62, 18),
    makeOrder('salad', 50, 14),
  ];
  game.board.served = 8;
  game.board.coins = 148;
  game.chef.x = 7 * 64 + 32;
  game.chef.y = 1 * 64 + 32;
  game.chef.facing = { dx: 0, dy: -1 };
  game.chef.carrying = { kind: 'plate', contents: ['bun', 'grilledPatty', 'cheese'] };
  game.grill[0].item = { state: 'done', t: 0 };
  game.grill[1].item = { state: 'cooking', t: 5.1 };
  game.plateOnCounter = null;
  game.spawnHearts(7 * 64 + 32, 0 * 64);
}

export function applyShot(game, name) {
  if (name === 'kitchen') shotKitchen(game);
  else if (name === 'assembly') shotAssembly(game);
  else if (name === 'serve') shotServe(game);
  else return false;
  game.frozen = true; // the clock stops so the capture is stable
  return true;
}
