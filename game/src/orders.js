// Sizzle & Serve — the order board: tickets come in, their patience runs
// down, and a served plate is matched against them for points.
import { RECIPES, orderPatience, serveScore, spawnInterval } from './config.js';

let nextTicket = 1;

export class Order {
  constructor(recipe, patience) {
    this.id = nextTicket++;
    this.recipe = recipe;
    this.patience = patience;
    this.timeLeft = patience;
    this.flash = 0; // seconds of red flashing when nearly out of time
  }
  get urgent() {
    return this.timeLeft <= 12;
  }
  get fraction() {
    return Math.max(0, this.timeLeft / this.patience);
  }
}

export class OrderBoard {
  constructor() {
    this.orders = [];
    this.spawnTimer = 4; // first ticket arrives quickly
    this.served = 0;
    this.failed = 0;
    this.coins = 0;
  }

  reset() {
    this.orders = [];
    this.spawnTimer = 4;
    this.served = 0;
    this.failed = 0;
    this.coins = 0;
  }

  pickRecipe(dayElapsed) {
    // Early on only the simple recipes appear; the Double Stack joins later.
    const pool = dayElapsed < 45
      ? RECIPES.filter((r) => r.items.length <= 3)
      : RECIPES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  update(dt, dayElapsed, onExpired) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.orders.length < 4) {
      this.orders.push(new Order(this.pickRecipe(dayElapsed), orderPatience(dayElapsed)));
      this.spawnTimer = spawnInterval(dayElapsed);
    }
    for (const order of this.orders) {
      order.timeLeft -= dt;
      if (order.urgent) order.flash += dt;
    }
    const expired = this.orders.filter((o) => o.timeLeft <= 0);
    if (expired.length) {
      this.orders = this.orders.filter((o) => o.timeLeft > 0);
      this.failed += expired.length;
      onExpired(expired.length);
    }
  }

  // A plate matches when its contents are exactly the recipe's items.
  static plateMatches(plateContents, recipe) {
    if (plateContents.length !== recipe.items.length) return false;
    const have = [...plateContents].sort();
    const want = [...recipe.items].sort();
    return have.every((item, i) => item === want[i]);
  }

  // Serve a plate: returns the order served, or null when no ticket fits.
  serve(plateContents, combo) {
    for (const order of this.orders) {
      if (OrderBoard.plateMatches(plateContents, order.recipe)) {
        this.orders.splice(this.orders.indexOf(order), 1);
        const points = serveScore(order.recipe, order.timeLeft, order.patience, combo);
        this.coins += order.recipe.price;
        this.served++;
        return { order, points };
      }
    }
    return null;
  }
}
