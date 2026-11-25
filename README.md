# Sizzle & Serve

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/nyaa-desu/makefun-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/nyaa-desu/makefun-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A tiny kitchen game for the make.fun **best-cooking-game-20261125-0137** bounty.
One chef, one rush hour: tickets come in on the order board, and you run
the kitchen — grab ingredients from the crates, chop them on the board,
grill patties on the stove, build each dish on a plate, and serve it at the
window before the ticket runs out.

## How to play

- **Move:** WASD or arrow keys (or click a floor tile to walk there).
- **Work a station:** E or Space while facing it (or click the station).
- **Crates** give you tomato, lettuce, cheese, raw patty or bun.
- **Chopping board** chops tomato and lettuce.
- **Grill** cooks a raw patty — pick it up in time or it burns.
- **Plating counter** hands you a clean plate, holds your plate while you
  load it, and gives it back when you are done.
- **Serving window** takes a finished plate: the right dish scores points
  and coins, the wrong one breaks your combo.
- **Trash** throws away whatever you are holding.
- **M** mutes, **P** pauses, **R** starts a new day, **Enter** opens the kitchen.

Miss 3 tickets or run out the day timer and the kitchen closes. Orders get
faster and less patient as the day goes on, and serving dishes in a row
builds a combo up to x5.

## Menu

| Dish | Needs | Price |
| --- | --- | --- |
| Garden Salad | chopped lettuce, chopped tomato | $12 |
| Classic Burger | bun, grilled patty, chopped lettuce | $18 |
| Cheese Burger | bun, grilled patty, cheese | $20 |
| Garden Plate | chopped lettuce, chopped tomato, cheese | $15 |
| Double Stack | bun, grilled patty x2, cheese, chopped tomato | $28 |

## Run it

Serve `game/` with any static HTTP server and open `game/index.html` in
desktop Chrome. Everything is plain Canvas 2D and WebAudio oscillators —
no libraries, no network requests, no files outside `game/`.

## Files

- `game/index.html` — the page; `game/src/main.js` starts the game.
- `game/src/config.js` — menu, ingredients, tuning.
- `game/src/kitchen.js` — the floor plan and pathfinding.
- `game/src/orders.js` — the order board, tickets and scoring.
- `game/src/player.js` — the chef: walking, carrying, working stations.
- `game/src/input.js` — keyboard and mouse.
- `game/src/render.js` — all canvas drawing.
- `game/src/audio.js` — synthesized sounds and music.
- `game/src/shots.js` — deterministic demo states for the screenshots.
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`.
