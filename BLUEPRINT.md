# Barter Hollow — Game Blueprint
*Repo: cloudstifa1-cpu/traders (keep PRIVATE)*

A small, old-school trading board game. No money — players buy, rent and build with **goods**. Humble properties: mud huts, shanties, an old mill, a crossroads inn.

---

## 1. Core decisions
| Item | Decision |
|---|---|
| Players | 2–4. Each seat is **Human** (pass-and-play on one phone) or **Computer** |
| Platform | Android **APK** (private code, no public web link) |
| Tech | Plain HTML/CSS/JavaScript, wrapped with **Capacitor**; APK built automatically by **GitHub Actions** (no computer needed) |
| Why this tech | Very light — runs well on a 2 GB phone; no game engine download |
| Look | Dark wood-and-parchment theme, hand-drawn style icons, **bright high-contrast text only** (no gray on dark) |
| Game length | 30–45 minutes; round limit 30 by default (20 / 30 / 40 / none) |
| Save | Auto-saves after every turn; "Continue" on the title screen |

---

## 2. The goods
| Good | Icon | Trade value |
|---|---|---|
| Grain | 🌾 | 1 |
| Wood | 🪵 | 1 |
| Wool | 🧶 | 2 |
| Salt | 🧂 | 2 |
| Iron | ⛏️ | 3 |

**Starting goods (each player):** 3 Grain, 3 Wood, 2 Wool, 2 Salt, 1 Iron.

The value chart is printed on the board so trades are easy to judge.

---

## 3. The board (20 spaces, loop)
| # | Space | Type |
|---|---|---|
| 0 | **Harvest** | Start. Passing it = your properties produce goods |
| 1 | Mud Hut | Property — Poor Row |
| 2 | Fortune | Card |
| 3 | Hermit's Shack | Property — Poor Row |
| 4 | Toll Bridge | Pay 1 Grain or 1 Wood |
| 5 | Trading Post | Swap 2 of any goods for 1 of your choice (can repeat) |
| 6 | Shanty Lane | Property — Shanty Row |
| 7 | Hardship | Card |
| 8 | Fishing Hut | Property — Shanty Row |
| 9 | Campfire | Rest — nothing happens |
| 10 | The Stocks | Just visiting / locked in (skip 1 turn) |
| 11 | Old Mill | Property — Village Row |
| 12 | Village Well | Property — Village Row |
| 13 | Fortune | Card |
| 14 | Tanner's Shed | Property — Village Row |
| 15 | Trading Post | Same as 5 |
| 16 | Crossroads Inn | Property — High Row |
| 17 | Hardship | Card |
| 18 | Old Chapel | Property — High Row |
| 19 | Bandit Road | Lose 1 random good |

## 4. Properties
| Property | Row | Produces | Cost |
|---|---|---|---|
| Mud Hut | Poor | Grain | 2 Grain, 1 Wood |
| Hermit's Shack | Poor | Wood | 1 Grain, 2 Wood |
| Shanty Lane | Shanty | Wool | 2 Wood, 1 Grain, 1 Wool |
| Fishing Hut | Shanty | Salt | 2 Wood, 1 Salt, 1 Grain |
| Old Mill | Village | Grain | 2 Wood, 1 Iron, 1 Grain |
| Village Well | Village | Salt | 2 Wood, 1 Salt, 1 Iron |
| Tanner's Shed | Village | Wool | 2 Wood, 1 Wool, 1 Iron |
| Crossroads Inn | High | Iron | 2 Wood, 2 Salt, 1 Iron |
| Old Chapel | High | Iron | 2 Wood, 2 Wool, 1 Iron |

---

## 5. Rules
**Turn:** roll 1 die (1–6) → move → resolve the space → optional trade with a player → end turn.

**Buying:** land on an unowned property and pay its cost in goods to buy it.

**Rent:** land on someone else's property and pay its good to the owner:
- Shanty level: 1 · Cottage: 2 · Homestead: 3 · owning the full row adds +1
- If you lack that good, pay **2 of your cheapest other goods** for each one owed (picked automatically)

**Harvest:** each time you pass or land on Harvest, each property you own gives you its good: Shanty 1 · Cottage 2 · Homestead 3.

**Upgrades** (only when you own the whole row, on your turn):
- Shanty → **Cottage**: 2 Wood + 1 Iron
- Cottage → **Homestead**: 2 Wood + 2 Iron + 1 Salt

**Trading between players:** on your turn, offer goods and/or properties for theirs. A human taps Accept or Decline; the computer accepts if it gets more value than it gives.

**Out of the game:** if you can't pay what you owe, you're out. Your properties go back to unowned.

**Winning:**
1. Own **2 complete rows**, or
2. Be the last player standing, or
3. Round limit (optional): highest total value (goods + properties at cost value) wins.

## 6. Cards (8 each, shuffled)
**Fortune:** Good harvest (+2 Grain) · Traveling merchant (+1 Iron) · Found timber (+2 Wood) · Wool fair (+2 Wool) · Salt cart (+2 Salt) · Neighbors' help (each player gives you 1 Grain) · Shortcut (move to Harvest) · Lucky find (+1 of each good)

**Hardship:** Famine (−2 Grain) · Spoiled cellar (−1 Salt) · Storm (−2 Wood) · Moths (−1 Wool) · Caught poaching (go to The Stocks) · Broken plow (−1 Iron) · Tithe (give 1 good to each player) · Bandits (lose 2 random goods)

Missing goods are simply not lost (cards never knock you out).

---

## 7. Computer players
- Buys a property if, after paying, it still holds at least 1 Grain, 1 Wood and 2 other goods
- Prefers completing rows; upgrades whenever it can afford it
- Trading Post: swaps its most plentiful good for its scarcest
- Accepts trades only when it gains value (needs extra if it would break its own full row)
- When it's missing just 1 property in a row, it offers goods worth more than that property to its owner

## 8. Screens
1. **Title** — New Game · Continue · Rules
2. **Setup** — 2–4 seats, each Human/Computer, name, color; round limit on/off
3. **Board** — square loop of 20 tiles, player tokens, center panel with dice, current player and goods
4. **Space pop-ups** — Buy / Pay rent / Card / Trading Post
5. **Trade screen** — two columns, steppers for each good, property chips
6. **Pass-the-phone screen** between human players (hides goods)
7. **Winner screen**

## 9. Build phases
1. ✅ **Full game** — setup, board, dice, buying, rent, Harvest, all spaces & cards, computer players, building, trading, winning, auto-save
2. ✅ **APK build** — Capacitor + GitHub Actions; each push makes a downloadable APK under Releases
3. **Polish** — hand-drawn tile art to replace emoji, sounds, title-screen art, app icon
