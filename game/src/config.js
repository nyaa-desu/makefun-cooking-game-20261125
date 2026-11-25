// Sizzle & Serve — configuration: the menu, the ingredients, the tuning.
// Every recipe is a list of items a plate must hold, in any order.
export const TILE = 64;
export const COLS = 15;
export const ROWS = 8;
export const HUD_H = 104;
export const CANVAS_W = COLS * TILE;
export const CANVAS_H = HUD_H + ROWS * TILE + 16;

export const DAY_SECONDS = 150;
export const START_LIVES = 3;

export const INGREDIENTS = {
  tomato: { name: 'Tomato', color: '#e5484d', chop: 'choppedTomato', chopSecs: 1.4 },
  lettuce: { name: 'Lettuce', color: '#46a758', chop: 'choppedLettuce', chopSecs: 1.2 },
  cheese: { name: 'Cheese', color: '#f5d90a', chop: null, chopSecs: 0 },
  patty: { name: 'Patty', color: '#8b5a2b', chop: null, chopSecs: 0 },
  bun: { name: 'Bun', color: '#e8b25a', chop: null, chopSecs: 0 },
};

export const ITEM_NAMES = {
  tomato: 'Tomato',
  lettuce: 'Lettuce',
  cheese: 'Cheese',
  patty: 'Raw Patty',
  bun: 'Bun',
  choppedTomato: 'Chopped Tomato',
  choppedLettuce: 'Chopped Lettuce',
  grilledPatty: 'Grilled Patty',
  burntPatty: 'Burnt Patty',
};

export const RECIPES = [
  { id: 'salad', name: 'Garden Salad', items: ['choppedLettuce', 'choppedTomato'], price: 12 },
  { id: 'burger', name: 'Classic Burger', items: ['bun', 'grilledPatty', 'choppedLettuce'], price: 18 },
  { id: 'cheeseburger', name: 'Cheese Burger', items: ['bun', 'grilledPatty', 'cheese'], price: 20 },
  { id: 'gardenplate', name: 'Garden Plate', items: ['choppedLettuce', 'choppedTomato', 'cheese'], price: 15 },
  { id: 'doublestack', name: 'Double Stack', items: ['bun', 'grilledPatty', 'grilledPatty', 'cheese', 'choppedTomato'], price: 28 },
];

export const GRILL_COOK_SECS = 6;
export const GRILL_BURN_SECS = 5;
export const GRILL_SLOTS = 2;

export const PLAYER_SPEED = 230; // px per second

export function spawnInterval(dayElapsed) {
  return Math.max(7, 14 - dayElapsed * 0.05);
}

export function orderPatience(dayElapsed) {
  return Math.max(35, 62 - dayElapsed * 0.14);
}

// Points for serving an order: base price plus a bonus for time left.
export function serveScore(recipe, timeLeft, patience, combo) {
  const timeBonus = Math.round((timeLeft / patience) * 50);
  return (recipe.price * 10 + timeBonus) * combo;
}
