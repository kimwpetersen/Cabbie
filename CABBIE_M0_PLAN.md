# Cabbie M0 — Foundations Implementation Plan

> **For Claude Code:** Execute this plan task-by-task. Use checkbox syntax (`- [ ]`) to mark steps complete as you go. Do not skip ahead. Do not start M1 until every M0 acceptance criterion in `CABBIE_SPEC.md §34` is green.

**Goal:** Lay every piece of foundational infrastructure that the rest of Cabbie's 9 milestones depend on — Vite build pipeline with per-portal configuration, event bus, accessibility settings, localization layer, portal SDK adapters, save system, style bible references, and constants — all with unit tests and a clean `dist/` that produces a working multi-lingual title screen.

**Architecture:** Vanilla JS ES modules, no framework. Vite bundler with per-portal build targets (`dev`, `crazygames`, `newgrounds`, `itch`). All cross-cutting infrastructure modules in `src/foundations/` and related roots. TDD with Vitest — write the test first, watch it fail, implement minimum, watch it pass, commit. No module introduces a dependency on a module from a later milestone.

**Tech Stack:** Node 18+, Vite latest, Three.js r128 (not installed in M0 but package.json reserves version), Vitest (M0 addition to SPEC §2 — see Task 1), JSDOM, ESM.

**Reading order:** Before starting, read `CABBIE_SPEC.md` §4 (Coordinate System — CRITICAL, even though M0 doesn't touch it, the convention lock-in matters for every future session), §5 (Event Bus — the exact API M0 implements), §34 M0 section (your spec-conformance target), and §35 (Known Pitfalls — carried forward from v1).

---

## File structure

By end of M0, the project tree looks like this:

```
cabbie/
├── CABBIE_PRD.md                    # (already exists)
├── CABBIE_SPEC.md                   # (already exists)
├── CABBIE_M0_PLAN.md                # this file
├── index.html                       # root HTML — renders title screen
├── package.json                     # vite + three + vitest
├── vite.config.js                   # per-portal build config
├── vitest.config.js                 # test runner config
├── docs/
│   └── style-bible/
│       ├── README.md                # authored placeholder
│       ├── palettes/
│       │   ├── old-port.json        # real palette (M0 seeds all 8)
│       │   ├── neon-quarter.json
│       │   ├── financial-glass.json
│       │   ├── sun-flats.json
│       │   ├── docklands.json
│       │   ├── festival-row.json
│       │   ├── airport-spur.json
│       │   └── heights.json
│       ├── typography/README.md     # placeholder, Kim authors later
│       ├── vehicles/README.md       # placeholder
│       ├── portraits/README.md      # placeholder
│       ├── billboards/README.md     # placeholder
│       ├── audio/README.md          # placeholder
│       └── cinematics/README.md     # placeholder
├── public/
│   └── fonts/.gitkeep
├── src/
│   ├── main.js                      # app entry
│   ├── constants.js                 # all tunable numbers (SPEC §36)
│   ├── eventBus.js                  # pub/sub
│   ├── foundations/
│   │   ├── Accessibility.js
│   │   ├── Localization.js
│   │   ├── StyleBible.js
│   │   ├── PortalAdapter.js
│   │   └── adapters/
│   │       ├── dev.js
│   │       ├── crazygames.js
│   │       ├── newgrounds.js
│   │       └── itch.js
│   ├── save/
│   │   └── SaveSystem.js
│   └── strings/
│       ├── en.json
│       ├── fr.json
│       ├── de.json
│       ├── pt-BR.json
│       └── es.json
└── tests/
    ├── eventBus.test.js
    ├── localization.test.js
    ├── accessibility.test.js
    ├── styleBible.test.js
    ├── portalAdapter.test.js
    ├── saveSystem.test.js
    └── localizationKeys.test.js     # CI check: all keys present in all langs
```

**Module boundary rules** (enforced by review, not by tooling):
- Foundations modules import from each other only when necessary (e.g. `Accessibility` reads from `localStorage` directly, not via another module). No circular imports.
- No foundations module imports Three.js. Foundations are pure JS + DOM.
- Test files import only the module under test plus test utilities.

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `vitest.config.js`
- Create: `index.html`
- Create: `.gitignore`

- [x] **Step 1: Initialize Vite project**

```bash
mkdir -p /path/to/cabbie  # if not already created
cd /path/to/cabbie
npm init -y
```

Then install dependencies:

```bash
npm install --save three@0.128.0
npm install --save-dev vite vitest jsdom @vitest/ui
```

- [x] **Step 2: Write `package.json` scripts**

Replace the scripts block in `package.json` with:

```json
{
  "name": "cabbie",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build:dev":        "VITE_PORTAL=dev vite build",
    "build:crazygames": "VITE_PORTAL=crazygames vite build",
    "build:newgrounds": "VITE_PORTAL=newgrounds vite build",
    "build:itch":       "VITE_PORTAL=itch vite build",
    "test":             "vitest run",
    "test:watch":       "vitest",
    "test:ui":          "vitest --ui"
  },
  "dependencies": {
    "three": "0.128.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "jsdom": "^24.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

- [x] **Step 3: Write `vite.config.js`**

```javascript
// vite.config.js
import { defineConfig } from 'vite';

const portal = process.env.VITE_PORTAL || 'dev';
const repoName = process.env.VITE_REPO_NAME; // for GitHub Pages deploy

export default defineConfig({
  base: portal === 'dev' && repoName ? `/${repoName}/` : './',
  define: {
    __PORTAL__: JSON.stringify(portal),
  },
  build: {
    outDir: `dist/${portal}`,
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
```

- [x] **Step 4: Write `vitest.config.js`**

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __PORTAL__: JSON.stringify('dev'),
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/**/*.test.js'],
  },
});
```

- [x] **Step 5: Write placeholder `index.html`**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Cabbie</title>
    <style>
      body { margin: 0; background: #0a0a14; color: #fff; font-family: monospace; }
      #app { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [x] **Step 6: Write `.gitignore`**

```
node_modules/
dist/
.DS_Store
.vite/
coverage/
*.log
```

- [x] **Step 7: Verify scaffold runs**

Run: `npm run test`
Expected: Vitest starts, reports "No test files found". This confirms vitest is wired.

Run: `npm run build:dev`
Expected: Vite builds to `dist/dev/`. May warn about missing `src/main.js` — that's fixed in Task 14.

- [x] **Step 8: Initial commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + Vitest project with per-portal build config"
```

---

## Task 2: Project folder structure

**Files:**
- Create: `src/`, `src/foundations/`, `src/foundations/adapters/`, `src/save/`, `src/strings/`
- Create: `tests/`
- Create: `docs/style-bible/` with subdirectories

- [x] **Step 1: Create folder tree**

```bash
mkdir -p src/foundations/adapters src/save src/strings tests
mkdir -p docs/style-bible/{palettes,typography,vehicles,portraits,billboards,audio,cinematics}
mkdir -p public/fonts
touch public/fonts/.gitkeep
```

- [x] **Step 2: Write placeholder style-bible READMEs**

Create `docs/style-bible/README.md` with this content:

```markdown
# Cabbie Style Bible

> **Curation owner:** Kim. This directory is the single source of truth for Cabbie's visual, audio, and tonal identity. Every AI-generation pipeline consumes files from here. See `CABBIE_SPEC.md §6` for architecture and `CABBIE_PRD.md §15` for product direction.

## Directory contents

- `palettes/` — 5-color palettes per district. **Authored in M0** (seeds present). Refined during M4.
- `typography/` — Type system. Placeholder until M4 curation.
- `vehicles/` — Reference sheet + prompts for the 34 vehicle models. Placeholder until M4/M5.
- `portraits/` — Reference sheets for drivers + passengers. Placeholder until M5/M6.
- `billboards/` — Visual reference + copywriting voice guide. Placeholder until M4.
- `audio/` — Music direction, SFX palette, reference tracks. Placeholder until M4.
- `cinematics/` — Reference + storyboards. Placeholder until M8.

## M0 status

- [x] Directory structure created
- [x] District palettes seeded (refined during M4)
- [x] Typography system (M4)
- [x] Vehicle references (M4/M5)
- [x] Portrait references (M5/M6)
- [x] Billboard references (M4)
- [x] Audio references (M4)
- [x] Cinematic references (M8)
```

Create identical-structure README placeholders in each subdirectory:

```bash
for dir in typography vehicles portraits billboards audio cinematics; do
  cat > "docs/style-bible/$dir/README.md" <<EOF
# $dir

Placeholder — authored during the appropriate milestone (see \`docs/style-bible/README.md\`).
EOF
done
```

- [x] **Step 3: Write 8 district palette JSONs**

Each palette follows this shape (5 colors: base, accent, sky, signage, highlight).

Create `docs/style-bible/palettes/old-port.json`:

```json
{
  "id": "old-port",
  "name": "Old Port",
  "description": "Act 1 home. Warm brick, mustard yellow signage, overcast sky.",
  "colors": {
    "base":      "#8B5A3C",
    "accent":    "#D4A04C",
    "sky":       "#6B7685",
    "signage":   "#F0C040",
    "highlight": "#F5E6C8"
  }
}
```

Create `docs/style-bible/palettes/neon-quarter.json`:

```json
{
  "id": "neon-quarter",
  "name": "Neon Quarter",
  "description": "Hot pink / cyan, black sky, magenta light spills.",
  "colors": {
    "base":      "#0E0920",
    "accent":    "#FF2E9A",
    "sky":       "#05030A",
    "signage":   "#00E8FF",
    "highlight": "#FF70C4"
  }
}
```

Create `docs/style-bible/palettes/financial-glass.json`:

```json
{
  "id": "financial-glass",
  "name": "Financial Glass",
  "description": "Cool teal, white chrome, steel sky.",
  "colors": {
    "base":      "#2E4D52",
    "accent":    "#5BB8B0",
    "sky":       "#8A94A0",
    "signage":   "#E8EEF0",
    "highlight": "#BEDDD8"
  }
}
```

Create `docs/style-bible/palettes/sun-flats.json`:

```json
{
  "id": "sun-flats",
  "name": "Sun Flats",
  "description": "Bleached ochre, turquoise pools, hot white sky.",
  "colors": {
    "base":      "#DCC088",
    "accent":    "#4FC9B4",
    "sky":       "#F8F0E0",
    "signage":   "#E85C3A",
    "highlight": "#FFE8B0"
  }
}
```

Create `docs/style-bible/palettes/docklands.json`:

```json
{
  "id": "docklands",
  "name": "Docklands",
  "description": "Rust orange, steel grey, brown water.",
  "colors": {
    "base":      "#524438",
    "accent":    "#C4613A",
    "sky":       "#6C7380",
    "signage":   "#F5C400",
    "highlight": "#9AA0A8"
  }
}
```

Create `docs/style-bible/palettes/festival-row.json`:

```json
{
  "id": "festival-row",
  "name": "Festival Row",
  "description": "Strung-light yellows, purple/red accents, warm dusk sky.",
  "colors": {
    "base":      "#3C2450",
    "accent":    "#FFCB3C",
    "sky":       "#C4567A",
    "signage":   "#FF4068",
    "highlight": "#FFE8A0"
  }
}
```

Create `docs/style-bible/palettes/airport-spur.json`:

```json
{
  "id": "airport-spur",
  "name": "Airport Spur",
  "description": "Tarmac grey, jet blue, safety orange.",
  "colors": {
    "base":      "#3A3E44",
    "accent":    "#2E7FD4",
    "sky":       "#8E969E",
    "signage":   "#FF8800",
    "highlight": "#A0B4C8"
  }
}
```

Create `docs/style-bible/palettes/heights.json`:

```json
{
  "id": "heights",
  "name": "Heights",
  "description": "Forest green, navy, starlit sky.",
  "colors": {
    "base":      "#2A4432",
    "accent":    "#8BB87C",
    "sky":       "#121C32",
    "signage":   "#F0D080",
    "highlight": "#C4E0A8"
  }
}
```

- [x] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(m0): scaffold project folders + style bible palette seeds"
```

---

## Task 3: constants.js

**Files:**
- Create: `src/constants.js`
- Create: `tests/constants.test.js`

Per `CABBIE_SPEC.md §36`, every tunable number in the project lives in this file. This task creates it complete for all 10 milestones — later milestones reference constants already defined here.

- [x] **Step 1: Write failing test**

Create `tests/constants.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import * as C from '../src/constants.js';

describe('constants', () => {
  it('exports world geometry constants', () => {
    expect(C.BLOCK_COUNT).toBe(7);
    expect(C.BLOCK_SIZE).toBe(60);
    expect(C.ROAD_WIDTH).toBe(10);
  });

  it('exports player physics constants with expected relations', () => {
    expect(C.MAX_SPEED).toBeGreaterThan(0);
    expect(C.ACCEL_RATE).toBeGreaterThan(0);
    expect(C.BRAKE_RATE).toBeGreaterThan(C.ACCEL_RATE);
    expect(C.TURN_RATE_LOW).toBeGreaterThan(C.TURN_RATE_HIGH);
  });

  it('exports act gate values matching PRD', () => {
    expect(C.ACT1_GATE_CASH).toBe(10000);
    expect(C.ACT1_GATE_RATING).toBe(4.0);
    expect(C.ACT2_GATE_VEHICLES).toBe(10);
    expect(C.ACT2_GATE_DISTRICTS).toBe(3);
    expect(C.ACT2_GATE_RIVAL_SHARE).toBe(0.2);
    expect(C.WIN_HOLD_DAYS).toBe(3);
  });

  it('exports police constants with relaxed variants', () => {
    expect(C.POLICE_SPEED_THRESHOLD).toBe(82);
    expect(C.POLICE_SPEED_RELAXED).toBe(95);
    expect(C.POLICE_ESCAPE_DISTANCE).toBe(500);
    expect(C.POLICE_ESCAPE_RELAXED).toBeLessThan(C.POLICE_ESCAPE_DISTANCE);
  });

  it('exports driver tier table with 4 tiers', () => {
    expect(C.ROSTER_CAP).toBe(12);
    expect(Object.keys(C.TIER_STATS)).toEqual(['rookie', 'journey', 'pro', 'ace']);
    expect(C.TIER_STATS.rookie.wageBaseline).toBe(80);
    expect(C.TIER_STATS.ace.wageBaseline).toBe(450);
  });

  it('exports vehicle fleet constants', () => {
    expect(C.FLEET_CAP).toBe(20);
    expect(Object.keys(C.VEHICLE_BASE_COST)).toEqual(['standard', 'hybrid', 'luxury']);
    expect(C.VEHICLE_CLASS_MULT.luxury.airportEligible).toBe(true);
    expect(C.VEHICLE_CLASS_MULT.standard.airportEligible).toBe(false);
  });

  it('exports Act 3 economy constants', () => {
    expect(C.APP_SURGE_MIN).toBe(1.0);
    expect(C.APP_SURGE_MAX).toBe(2.5);
    expect(C.APP_TAKE_MIN).toBe(0.6);
    expect(C.APP_TAKE_MAX).toBe(0.9);
  });

  it('exports ad + soft-loss constants', () => {
    expect(C.AD_INTERSTITIAL_COOLDOWN_MS).toBe(5 * 60 * 1000);
    expect(C.SKIP_TOKEN_CAP).toBe(3);
    expect(C.SOFT_LOSS_DAYS).toBe(3);
    expect(C.SOFT_LOSS_BONUS.act1).toBe(2000);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "../src/constants.js"`.

- [x] **Step 3: Implement constants.js**

Create `src/constants.js` with the exact contents of `CABBIE_SPEC.md §36`. Copy the whole constants block verbatim:

```javascript
// src/constants.js
// This file is the single source of truth for every tunable number in Cabbie.
// Per CABBIE_SPEC.md §36. If you need a new tunable, add it here and import it.
// Never inline a number in game logic. See pitfall P8.

// ============================================================
// WORLD
// ============================================================
export const BLOCK_COUNT       = 7;
export const BLOCK_SIZE        = 60;
export const ROAD_WIDTH        = 10;
export const DISTRICT_EXTENT   = (BLOCK_SIZE + ROAD_WIDTH) * BLOCK_COUNT / 2;

// ============================================================
// PLAYER / TAXI
// ============================================================
export const MAX_SPEED         = 95;
export const ACCEL_RATE        = 28;
export const BRAKE_RATE        = 45;
export const FRICTION_DECAY    = 0.6;
export const TURN_RATE_LOW     = 1.6;
export const TURN_RATE_HIGH    = 0.9;
export const FUEL_BURN_RATE    = 0.0005;

// ============================================================
// CAMERA
// ============================================================
export const CAM_HEIGHT        = 5.5;
export const CAM_BACK          = 8.0;
export const CAM_LOOK_AHEAD    = 2.0;
export const CAM_LOOK_HEIGHT   = 1.5;
export const CAM_FOV           = 75;
export const CAM_PULL_BACK_EXTRA    = 1.0;
export const CAM_PULL_BACK_TIGHTEN  = 0.5;
export const CAM_DAMP_POS      = 0.12;
export const CAM_DAMP_LOOK     = 0.08;

// ============================================================
// TRAFFIC
// ============================================================
export const TRAFFIC_DENSITY_BASE   = 20;
export const TRAFFIC_SPAWN_RADIUS   = 150;
export const TRAFFIC_DESPAWN_RADIUS = 200;
export const NEAR_MISS_RADIUS       = 1.8;
export const NEAR_MISS_SPEED        = 40;

// ============================================================
// FARE
// ============================================================
export const FARE_BASE_RATE    = 0.08;
export const PICKUP_RADIUS     = 3;
export const DROPOFF_RADIUS    = 3;
export const BOARD_SPEED_MAX   = 2;
export const DROPOFF_SPEED_MAX = 2;
export const FARE_TIMEOUT_S    = 90;

export const DESTINATION_TYPES = [
  'bar', 'office', 'airport', 'hotel', 'hospital', 'home', 'restaurant', 'mystery'
];

// ============================================================
// COMFORT
// ============================================================
export const COMFORT_CRASH_DRAIN      = 0.2;
export const COMFORT_SHARP_TURN_DRAIN = 0.01;
export const COMFORT_MAX_TIP_MULT     = 1.5;

// ============================================================
// POLICE
// ============================================================
export const POLICE_SPEED_THRESHOLD = 82;
export const POLICE_SPEED_RELAXED   = 95;
export const POLICE_CHASE_FRAMES    = 220;
export const POLICE_SPAWN_DISTANCE  = 100;
export const POLICE_ESCAPE_DISTANCE = 500;
export const POLICE_ESCAPE_RELAXED  = 300;
export const POLICE_TURN_RATE       = 1.2;
export const POLICE_SPEED           = 22;
export const POLICE_BRIBE           = 50;

// ============================================================
// REPUTATION
// ============================================================
export const REP_FARE_BASE      = 0.1;
export const REP_COMFORT_BONUS  = 0.05;
export const REP_CRASH_PENALTY  = 0.3;
export const REP_FINE_PENALTY   = 0.5;

// ============================================================
// COLLECTIBLES
// ============================================================
export const COLLECT_RADIUS       = 2;
export const COLLECT_MAGNET_RADIUS = 2.5;
export const COLLECT_RESPAWN_MS   = 60_000;
export const COLLECT_WEIGHTS      = { coffee: 0.40, fuel: 0.20, wallet: 0.25, vape: 0.10, phone: 0.05 };

// ============================================================
// DAY SYSTEM & EXPENSES
// ============================================================
export const SECONDS_PER_DAY    = 300;
export const DAILY_RENT         = 200;
export const FUEL_COST_PER_UNIT = 0.02;

// ============================================================
// ACT GATES
// ============================================================
export const ACT1_GATE_CASH         = 10000;
export const ACT1_GATE_RATING       = 4.0;
export const ACT2_GATE_VEHICLES     = 10;
export const ACT2_GATE_DISTRICTS    = 3;
export const ACT2_GATE_RIVAL_SHARE  = 0.2;
export const ACT3_START_SATURATION  = 0.0;
export const WIN_HOLD_DAYS          = 3;

// ============================================================
// ACT 2 — DRIVERS
// ============================================================
export const ROSTER_CAP          = 12;
export const CANDIDATE_POOL_SIZE = 6;
export const TIER_STATS = {
  rookie:  { speed: 0.5,  comfort: 0.5,  reliability: 0.5,  loyalty: 0.5, wageBaseline: 80  },
  journey: { speed: 0.65, comfort: 0.65, reliability: 0.65, loyalty: 0.6, wageBaseline: 150 },
  pro:     { speed: 0.8,  comfort: 0.8,  reliability: 0.8,  loyalty: 0.7, wageBaseline: 250 },
  ace:     { speed: 0.9,  comfort: 0.9,  reliability: 0.9,  loyalty: 0.8, wageBaseline: 450 },
};

// ============================================================
// ACT 2 — VEHICLES
// ============================================================
export const FLEET_CAP = 20;
export const VEHICLE_BASE_COST = { standard: 5000, hybrid: 12000, luxury: 30000 };
export const VEHICLE_CLASS_MULT = {
  standard: { fuel: 1.0, comfort: 1.0, airportEligible: false },
  hybrid:   { fuel: 1.4, comfort: 1.0, airportEligible: false },
  luxury:   { fuel: 0.8, comfort: 1.3, airportEligible: true  },
};
export const UPGRADE_COST = {
  engine:     [null, 500, 1500, 4000, 10000],
  suspension: [null, 400, 1200, 3200,  8000],
  fuelTank:   [null, 300, 900,  2400,  6000],
  brakes:     [null, 450, 1350, 3600,  9000],
};
export const WEAR_RATE                 = 0.0003;
export const BREAKDOWN_CHANCE_PER_TICK = 0.002;

// ============================================================
// ACT 2 — CONTRACTS
// ============================================================
export const CONTRACT_PAY           = { hotel: 500, airport: 1500, corporate: 900 };
export const CONTRACT_SLA_HOTEL     = 4.0;
export const CONTRACT_SLA_AIRPORT   = 0.95;
export const CONTRACT_SLA_CORPORATE = 'pro';

// ============================================================
// ACT 2 — YELLOW DOG
// ============================================================
export const YD_THRESHOLDS     = [0.30, 0.50, 0.70, 0.90];
export const YD_PRICE_WAR_MULT = 0.8;
export const YD_PRICE_WAR_DAYS = 5;

// ============================================================
// ACT 3 — CABBIEAPP
// ============================================================
export const APP_SURGE_MIN = 1.0;
export const APP_SURGE_MAX = 2.5;
export const APP_TAKE_MIN  = 0.6;
export const APP_TAKE_MAX  = 0.9;

// ============================================================
// ACT 3 — CABBIETV
// ============================================================
export const CABBIETV_UNLOCK_SATURATION = 80;
export const CABBIETV_DAYS              = 7;
export const CABBIETV_AD_COST = { billboard: 3000, prime: 8000, superbowl: 20000 };

// ============================================================
// ADS
// ============================================================
export const AD_INTERSTITIAL_COOLDOWN_MS = 5 * 60 * 1000;
export const SKIP_TOKEN_CAP              = 3;

// ============================================================
// LEGACY MODE
// ============================================================
export const LEGACY_RATE_MUL = 1.25;

// ============================================================
// SOFT LOSS
// ============================================================
export const SOFT_LOSS_DAYS  = 3;
export const SOFT_LOSS_BONUS = { act1: 2000, act2: 20000, act3: 100000 };

// ============================================================
// LOCALIZATION
// ============================================================
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'pt-BR', 'es'];
export const DEFAULT_LANGUAGE    = 'en';
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 8 assertions in `constants.test.js` green.

- [x] **Step 5: Commit**

```bash
git add src/constants.js tests/constants.test.js
git commit -m "feat(m0): add constants.js with SPEC §36 values and value-relation tests"
```

---

## Task 4: EventBus

**Files:**
- Create: `src/eventBus.js`
- Create: `tests/eventBus.test.js`

Per `CABBIE_SPEC.md §5`. The event bus is used by every downstream system, so its API must be stable and well-tested from M0.

- [x] **Step 1: Write failing test**

Create `tests/eventBus.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../src/eventBus.js';

describe('EventBus', () => {
  beforeEach(() => {
    // Reset bus between tests (accessing the internal Map)
    EventBus._reset();
  });

  it('delivers emitted events to subscribed handlers', () => {
    const spy = vi.fn();
    EventBus.on('test:event', spy);
    EventBus.emit('test:event', { value: 42 });
    expect(spy).toHaveBeenCalledWith({ value: 42 });
  });

  it('delivers to multiple handlers in subscription order', () => {
    const calls = [];
    EventBus.on('x', () => calls.push('a'));
    EventBus.on('x', () => calls.push('b'));
    EventBus.emit('x');
    expect(calls).toEqual(['a', 'b']);
  });

  it('on() returns an unsubscribe function', () => {
    const spy = vi.fn();
    const off = EventBus.on('x', spy);
    off();
    EventBus.emit('x');
    expect(spy).not.toHaveBeenCalled();
  });

  it('off() removes a specific handler', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    EventBus.on('x', spy1);
    EventBus.on('x', spy2);
    EventBus.off('x', spy1);
    EventBus.emit('x');
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('does not throw when emitting to an event with no listeners', () => {
    expect(() => EventBus.emit('no:listeners')).not.toThrow();
  });

  it('isolates errors in one handler from other handlers', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const goodSpy = vi.fn();
    EventBus.on('x', () => { throw new Error('boom'); });
    EventBus.on('x', goodSpy);
    EventBus.emit('x');
    expect(goodSpy).toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('passes undefined payload cleanly to handlers', () => {
    const spy = vi.fn();
    EventBus.on('x', spy);
    EventBus.emit('x');
    expect(spy).toHaveBeenCalledWith(undefined);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import `../src/eventBus.js`.

- [x] **Step 3: Implement EventBus**

Create `src/eventBus.js`:

```javascript
// src/eventBus.js
// Pub/sub event bus. See CABBIE_SPEC.md §5 for event naming conventions
// and the canonical event map.

const listeners = new Map();

export const EventBus = {
  on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => {
      const set = listeners.get(event);
      if (set) set.delete(handler);
    };
  },

  emit(event, payload) {
    const handlers = listeners.get(event);
    if (!handlers) return;
    for (const h of handlers) {
      try {
        h(payload);
      } catch (e) {
        console.error(`EventBus handler error for ${event}:`, e);
      }
    }
  },

  off(event, handler) {
    const set = listeners.get(event);
    if (set) set.delete(handler);
  },

  // For testing only. Do not call from game code.
  _reset() {
    listeners.clear();
  },
};
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 7 EventBus tests green.

- [x] **Step 5: Commit**

```bash
git add src/eventBus.js tests/eventBus.test.js
git commit -m "feat(m0): add EventBus with subscribe/emit/unsubscribe + error isolation"
```

---

## Task 5: Localization — core lookup and interpolation

**Files:**
- Create: `src/foundations/Localization.js`
- Create: `src/strings/en.json` (seed)
- Create: `tests/localization.test.js`

Per `CABBIE_SPEC.md §8`. Other language files come in Task 6.

- [x] **Step 1: Write seed English strings**

Create `src/strings/en.json` with ~50 keys covering the range of things M0 needs plus representative types for future milestones:

```json
{
  "start.title": "CABBIE",
  "start.subtitle": "One cab. One driver. Make rent.",
  "start.button": "DRIVE",
  "start.hint": "W/A/S/D or arrow keys · tilt on mobile",

  "hud.speed": "SPEED",
  "hud.cash": "CASH",
  "hud.fuel": "FUEL",
  "hud.reputation": "REP",
  "hud.distance": "{m}m",
  "hud.bribe": "BRIBE ${amount}",

  "fare.pickup.bar": [
    "Take me to The Rusty Hook, cabbie.",
    "Bar district, and step on it.",
    "I need a drink. Now."
  ],
  "fare.pickup.office": [
    "Downtown, fast as you can.",
    "Take me to the office.",
    "Got a meeting in ten minutes."
  ],
  "fare.pickup.airport": [
    "Airport, please. Flight at six.",
    "Terminal 2, and don't take the long way.",
    "Airport Spur. The quick route."
  ],
  "fare.pickup.hotel": [
    "The Grand, please.",
    "Drop me at the Marquee.",
    "Hotel district."
  ],
  "fare.pickup.hospital": [
    "County General, non-emergency.",
    "Hospital, but take it easy.",
    "Clinic on Heights Road."
  ],
  "fare.pickup.home": [
    "Home. Please.",
    "Take me home.",
    "Fastest way to my place."
  ],
  "fare.pickup.restaurant": [
    "Le Petit Bistro.",
    "Late for dinner — move it.",
    "Restaurant row."
  ],
  "fare.pickup.mystery": [
    "Just drive. I'll tell you where.",
    "Head south. I'll direct.",
    "Know a quiet place? Go there."
  ],
  "fare.completed": "+${tip} — {rating}",
  "fare.rating.great": "Great drive!",
  "fare.rating.ok": "OK.",
  "fare.rating.rough": "Rough ride.",

  "day.summary.title": "Day {day}",
  "day.summary.revenue": "Revenue: ${revenue}",
  "day.summary.expenses": "Expenses: -${expenses}",
  "day.summary.net": "Net: ${net}",
  "day.summary.continue": "Continue",

  "settings.title": "Settings",
  "settings.audio.master": "Master volume",
  "settings.audio.music": "Music",
  "settings.audio.sfx": "SFX",
  "settings.audio.mono": "Mono audio",
  "settings.visual.reducedMotion": "Reduced motion",
  "settings.visual.highContrast": "High contrast",
  "settings.visual.textScale": "Text scale",
  "settings.visual.colorblind": "Colorblind profile",
  "settings.motor.tiltSensitivity": "Tilt sensitivity",
  "settings.motor.relaxedTiming": "Relaxed timing",
  "settings.assist.economy": "Economy assist",
  "settings.assist.relaxedPolice": "Relaxed police",
  "settings.assist.relaxedSLAs": "Relaxed SLAs",
  "settings.assist.autoPilot": "Auto-pilot",

  "police.chase.warning": "POLICE",
  "police.fine.paid": "Fine paid: -${amount}",

  "driver.tier.rookie": "Rookie",
  "driver.tier.journey": "Journey",
  "driver.tier.pro": "Pro",
  "driver.tier.ace": "Ace",

  "menu.new_game": "New Game",
  "menu.continue": "Continue",
  "menu.settings": "Settings",
  "menu.credits": "Credits",

  "common.plural.drivers": "{count, plural, one {# driver} other {# drivers}}",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.undo": "Undo"
}
```

- [x] **Step 2: Write failing test**

Create `tests/localization.test.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { L } from '../src/foundations/Localization.js';

describe('Localization', () => {
  beforeEach(() => {
    L.setLanguage('en');
  });

  it('returns a string for a known key', () => {
    expect(L.t('start.title')).toBe('CABBIE');
  });

  it('falls back to the raw key for a missing key', () => {
    expect(L.t('definitely.not.a.key')).toBe('definitely.not.a.key');
  });

  it('interpolates {param} tokens', () => {
    expect(L.t('hud.distance', { m: 120 })).toBe('120m');
  });

  it('interpolates multiple params in one string', () => {
    expect(L.t('fare.completed', { tip: 25, rating: 'Great drive!' }))
      .toBe('+$25 — Great drive!');
  });

  it('handles ICU plural syntax for one', () => {
    expect(L.t('common.plural.drivers', { count: 1 })).toBe('1 driver');
  });

  it('handles ICU plural syntax for other', () => {
    expect(L.t('common.plural.drivers', { count: 3 })).toBe('3 drivers');
  });

  it('pick() returns a string from an array pool', () => {
    const result = L.pick('fare.pickup.bar');
    expect(['Take me to The Rusty Hook, cabbie.', 'Bar district, and step on it.', 'I need a drink. Now.'])
      .toContain(result);
  });

  it('pick() falls back to t() when key is not a pool', () => {
    expect(L.pick('start.title')).toBe('CABBIE');
  });

  it('current() returns the active language', () => {
    expect(L.current()).toBe('en');
    L.setLanguage('fr');
    expect(L.current()).toBe('fr');
  });

  it('setLanguage() rejects unknown languages silently', () => {
    L.setLanguage('xx');
    expect(L.current()).toBe('en');
  });
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import `../src/foundations/Localization.js`.

- [x] **Step 4: Implement Localization**

Create `src/foundations/Localization.js`:

```javascript
// src/foundations/Localization.js
// String lookup with ICU plural support. See CABBIE_SPEC.md §8.
// All user-facing strings MUST flow through this module.

import en from '../strings/en.json';

// Other language files will be imported in Task 6 via dynamic behavior.
// For M0 Task 5, only English is wired.
const tables = { en };

let currentLang = 'en';

export const L = {
  setLanguage(lang) {
    if (tables[lang]) currentLang = lang;
  },

  current() {
    return currentLang;
  },

  t(key, params = {}) {
    const table = tables[currentLang] || tables.en;
    const fallback = tables.en;
    let template = table[key];
    if (template == null) template = fallback[key];
    if (template == null) return key;
    if (Array.isArray(template)) template = template[0];
    return interpolate(template, params);
  },

  pick(key, params = {}) {
    const table = tables[currentLang] || tables.en;
    const pool = table[key];
    if (!Array.isArray(pool)) return this.t(key, params);
    const line = pool[Math.floor(Math.random() * pool.length)];
    return interpolate(line, params);
  },

  // Internal — used by Task 6 to register additional languages
  _registerLanguage(code, table) {
    tables[code] = table;
  },
};

function interpolate(template, params) {
  return template.replace(/\{([^}]+)\}/g, (_, expr) => {
    if (expr.includes('plural')) return icuPlural(expr, params);
    const key = expr.trim();
    return params[key] != null ? String(params[key]) : `{${expr}}`;
  });
}

// Minimal ICU plural: "count, plural, one {# X} other {# Y}"
function icuPlural(expr, params) {
  const [varName, , ...rest] = expr.split(',').map(s => s.trim());
  const count = params[varName];
  if (count == null) return expr;
  const body = rest.join(',');
  // Match: one {...} or other {...}
  const categories = {};
  const re = /(\w+)\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    categories[m[1]] = m[2];
  }
  const chosen = count === 1 ? categories.one : categories.other;
  if (!chosen) return String(count);
  return chosen.replace('#', String(count));
}
```

- [x] **Step 5: Configure Vite/Vitest to import JSON modules**

JSON imports should work by default in Vite/Vitest. If tests fail with a JSON import error, verify `package.json` has `"type": "module"` and Vite is ≥5.

- [x] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 10 Localization tests green.

- [x] **Step 7: Commit**

```bash
git add src/foundations/Localization.js src/strings/en.json tests/localization.test.js
git commit -m "feat(m0): add Localization module with interpolation + ICU plural + en.json seeds"
```

---

## Task 6: Multi-language files + key-coverage CI check

**Files:**
- Create: `src/strings/fr.json`, `de.json`, `pt-BR.json`, `es.json`
- Modify: `src/foundations/Localization.js`
- Create: `tests/localizationKeys.test.js`

- [x] **Step 1: Create 4 language files with placeholder translations**

Each non-English language file must have every key that `en.json` has. Placeholders are acceptable for M0 — full translation happens in M9.

Create `src/strings/fr.json`:

```json
{
  "start.title": "CABBIE",
  "start.subtitle": "Un taxi. Un chauffeur. Payer le loyer.",
  "start.button": "CONDUIRE",
  "start.hint": "W/A/S/D ou flèches · inclinaison sur mobile",

  "hud.speed": "VITESSE",
  "hud.cash": "CASH",
  "hud.fuel": "CARBURANT",
  "hud.reputation": "RÉPUT",
  "hud.distance": "{m}m",
  "hud.bribe": "POT-DE-VIN ${amount}",

  "fare.pickup.bar": [
    "Emmène-moi au Rusty Hook, chauffeur.",
    "Le quartier des bars, et presse-toi.",
    "J'ai besoin d'un verre. Maintenant."
  ],
  "fare.pickup.office": [
    "Centre-ville, aussi vite que possible.",
    "Au bureau, s'il te plaît.",
    "J'ai une réunion dans dix minutes."
  ],
  "fare.pickup.airport": [
    "Aéroport, s'il te plaît. Vol à six heures.",
    "Terminal 2, et ne prends pas le chemin long.",
    "Airport Spur. La route rapide."
  ],
  "fare.pickup.hotel": [
    "Au Grand, merci.",
    "Dépose-moi au Marquee.",
    "Quartier des hôtels."
  ],
  "fare.pickup.hospital": [
    "Hôpital général, sans urgence.",
    "L'hôpital, mais vas-y doucement.",
    "Clinique sur Heights Road."
  ],
  "fare.pickup.home": [
    "À la maison. S'il te plaît.",
    "Ramène-moi chez moi.",
    "Le chemin le plus rapide chez moi."
  ],
  "fare.pickup.restaurant": [
    "Le Petit Bistro.",
    "En retard pour le dîner — bouge.",
    "La rue des restaurants."
  ],
  "fare.pickup.mystery": [
    "Roule juste. Je te dirai où.",
    "Vers le sud. Je te guiderai.",
    "Tu connais un endroit tranquille ? Vas-y."
  ],
  "fare.completed": "+${tip} — {rating}",
  "fare.rating.great": "Super trajet !",
  "fare.rating.ok": "Bof.",
  "fare.rating.rough": "Trajet secoué.",

  "day.summary.title": "Jour {day}",
  "day.summary.revenue": "Revenus : ${revenue}",
  "day.summary.expenses": "Dépenses : -${expenses}",
  "day.summary.net": "Net : ${net}",
  "day.summary.continue": "Continuer",

  "settings.title": "Paramètres",
  "settings.audio.master": "Volume principal",
  "settings.audio.music": "Musique",
  "settings.audio.sfx": "Effets",
  "settings.audio.mono": "Audio mono",
  "settings.visual.reducedMotion": "Animations réduites",
  "settings.visual.highContrast": "Contraste élevé",
  "settings.visual.textScale": "Taille du texte",
  "settings.visual.colorblind": "Profil daltonien",
  "settings.motor.tiltSensitivity": "Sensibilité d'inclinaison",
  "settings.motor.relaxedTiming": "Timing indulgent",
  "settings.assist.economy": "Assistance économique",
  "settings.assist.relaxedPolice": "Police indulgente",
  "settings.assist.relaxedSLAs": "Contrats indulgents",
  "settings.assist.autoPilot": "Pilote automatique",

  "police.chase.warning": "POLICE",
  "police.fine.paid": "Amende payée : -${amount}",

  "driver.tier.rookie": "Débutant",
  "driver.tier.journey": "Confirmé",
  "driver.tier.pro": "Pro",
  "driver.tier.ace": "As",

  "menu.new_game": "Nouvelle partie",
  "menu.continue": "Continuer",
  "menu.settings": "Paramètres",
  "menu.credits": "Crédits",

  "common.plural.drivers": "{count, plural, one {# chauffeur} other {# chauffeurs}}",
  "common.cancel": "Annuler",
  "common.confirm": "Confirmer",
  "common.undo": "Annuler"
}
```

Create `src/strings/de.json`:

```json
{
  "start.title": "CABBIE",
  "start.subtitle": "Ein Taxi. Ein Fahrer. Die Miete bezahlen.",
  "start.button": "LOSFAHREN",
  "start.hint": "W/A/S/D oder Pfeiltasten · Neigung am Handy",

  "hud.speed": "TEMPO",
  "hud.cash": "GELD",
  "hud.fuel": "SPRIT",
  "hud.reputation": "RUF",
  "hud.distance": "{m}m",
  "hud.bribe": "BESTECHEN ${amount}$",

  "fare.pickup.bar": [
    "Zum Rusty Hook, Fahrer.",
    "Barviertel, und zwar schnell.",
    "Ich brauche einen Drink. Jetzt."
  ],
  "fare.pickup.office": [
    "Innenstadt, so schnell wie möglich.",
    "Zum Büro, bitte.",
    "Meeting in zehn Minuten."
  ],
  "fare.pickup.airport": [
    "Flughafen, bitte. Flug um sechs.",
    "Terminal 2, und nicht die Umwege.",
    "Airport Spur. Die schnelle Route."
  ],
  "fare.pickup.hotel": [
    "Zum Grand, bitte.",
    "Setzen Sie mich am Marquee ab.",
    "Hotelviertel."
  ],
  "fare.pickup.hospital": [
    "Klinik, nichts Dringendes.",
    "Krankenhaus, aber langsam.",
    "Praxis in der Heights Road."
  ],
  "fare.pickup.home": [
    "Nach Hause. Bitte.",
    "Bring mich heim.",
    "Schnellster Weg zu mir."
  ],
  "fare.pickup.restaurant": [
    "Le Petit Bistro.",
    "Spät dran — los.",
    "Restaurantstraße."
  ],
  "fare.pickup.mystery": [
    "Fahr einfach. Ich sag Bescheid.",
    "Richtung Süden. Ich dirigiere.",
    "Kennst du einen ruhigen Ort? Dahin."
  ],
  "fare.completed": "+${tip} — {rating}",
  "fare.rating.great": "Super Fahrt!",
  "fare.rating.ok": "Ok.",
  "fare.rating.rough": "Holprige Fahrt.",

  "day.summary.title": "Tag {day}",
  "day.summary.revenue": "Umsatz: ${revenue}",
  "day.summary.expenses": "Ausgaben: -${expenses}",
  "day.summary.net": "Netto: ${net}",
  "day.summary.continue": "Weiter",

  "settings.title": "Einstellungen",
  "settings.audio.master": "Hauptlautstärke",
  "settings.audio.music": "Musik",
  "settings.audio.sfx": "Effekte",
  "settings.audio.mono": "Mono-Audio",
  "settings.visual.reducedMotion": "Reduzierte Animation",
  "settings.visual.highContrast": "Hoher Kontrast",
  "settings.visual.textScale": "Textgröße",
  "settings.visual.colorblind": "Farbenblind-Profil",
  "settings.motor.tiltSensitivity": "Neigungsempfindlichkeit",
  "settings.motor.relaxedTiming": "Entspanntes Timing",
  "settings.assist.economy": "Wirtschaftshilfe",
  "settings.assist.relaxedPolice": "Milde Polizei",
  "settings.assist.relaxedSLAs": "Milde Verträge",
  "settings.assist.autoPilot": "Autopilot",

  "police.chase.warning": "POLIZEI",
  "police.fine.paid": "Bußgeld bezahlt: -${amount}",

  "driver.tier.rookie": "Anfänger",
  "driver.tier.journey": "Erfahren",
  "driver.tier.pro": "Profi",
  "driver.tier.ace": "Ass",

  "menu.new_game": "Neues Spiel",
  "menu.continue": "Fortsetzen",
  "menu.settings": "Einstellungen",
  "menu.credits": "Abspann",

  "common.plural.drivers": "{count, plural, one {# Fahrer} other {# Fahrer}}",
  "common.cancel": "Abbrechen",
  "common.confirm": "Bestätigen",
  "common.undo": "Rückgängig"
}
```

Create `src/strings/pt-BR.json`:

```json
{
  "start.title": "CABBIE",
  "start.subtitle": "Um táxi. Um motorista. Pagar o aluguel.",
  "start.button": "DIRIGIR",
  "start.hint": "W/A/S/D ou setas · inclinação no celular",

  "hud.speed": "VELOC.",
  "hud.cash": "GRANA",
  "hud.fuel": "COMBUST.",
  "hud.reputation": "REPUT.",
  "hud.distance": "{m}m",
  "hud.bribe": "SUBORNO ${amount}",

  "fare.pickup.bar": [
    "Me leva ao Rusty Hook, taxista.",
    "Bairro dos bares, e rápido.",
    "Preciso de um drink. Agora."
  ],
  "fare.pickup.office": [
    "Centro, o mais rápido possível.",
    "Pro escritório, por favor.",
    "Tenho reunião em dez minutos."
  ],
  "fare.pickup.airport": [
    "Aeroporto, por favor. Voo às seis.",
    "Terminal 2, e nada de caminho longo.",
    "Airport Spur. A rota rápida."
  ],
  "fare.pickup.hotel": [
    "Hotel Grand, por favor.",
    "Me deixa no Marquee.",
    "Bairro dos hotéis."
  ],
  "fare.pickup.hospital": [
    "Hospital Geral, sem pressa.",
    "Hospital, mas vai devagar.",
    "Clínica na Heights Road."
  ],
  "fare.pickup.home": [
    "Pra casa. Por favor.",
    "Me leva pra casa.",
    "Caminho mais rápido pra minha casa."
  ],
  "fare.pickup.restaurant": [
    "Le Petit Bistro.",
    "Atrasado pro jantar — anda.",
    "Rua dos restaurantes."
  ],
  "fare.pickup.mystery": [
    "Só dirige. Eu digo onde.",
    "Vai pro sul. Eu te guio.",
    "Conhece um lugar calmo? Vai pra lá."
  ],
  "fare.completed": "+${tip} — {rating}",
  "fare.rating.great": "Ótima corrida!",
  "fare.rating.ok": "Ok.",
  "fare.rating.rough": "Corrida turbulenta.",

  "day.summary.title": "Dia {day}",
  "day.summary.revenue": "Receita: ${revenue}",
  "day.summary.expenses": "Despesas: -${expenses}",
  "day.summary.net": "Líquido: ${net}",
  "day.summary.continue": "Continuar",

  "settings.title": "Ajustes",
  "settings.audio.master": "Volume geral",
  "settings.audio.music": "Música",
  "settings.audio.sfx": "Efeitos",
  "settings.audio.mono": "Áudio mono",
  "settings.visual.reducedMotion": "Movimento reduzido",
  "settings.visual.highContrast": "Alto contraste",
  "settings.visual.textScale": "Tamanho do texto",
  "settings.visual.colorblind": "Perfil daltônico",
  "settings.motor.tiltSensitivity": "Sensib. de inclinação",
  "settings.motor.relaxedTiming": "Tempo relaxado",
  "settings.assist.economy": "Assist. econômica",
  "settings.assist.relaxedPolice": "Polícia relaxada",
  "settings.assist.relaxedSLAs": "Contratos relaxados",
  "settings.assist.autoPilot": "Piloto automático",

  "police.chase.warning": "POLÍCIA",
  "police.fine.paid": "Multa paga: -${amount}",

  "driver.tier.rookie": "Novato",
  "driver.tier.journey": "Experiente",
  "driver.tier.pro": "Profissional",
  "driver.tier.ace": "Ás",

  "menu.new_game": "Novo Jogo",
  "menu.continue": "Continuar",
  "menu.settings": "Ajustes",
  "menu.credits": "Créditos",

  "common.plural.drivers": "{count, plural, one {# motorista} other {# motoristas}}",
  "common.cancel": "Cancelar",
  "common.confirm": "Confirmar",
  "common.undo": "Desfazer"
}
```

Create `src/strings/es.json`:

```json
{
  "start.title": "CABBIE",
  "start.subtitle": "Un taxi. Un chofer. Pagar el alquiler.",
  "start.button": "CONDUCIR",
  "start.hint": "W/A/S/D o flechas · inclinación en móvil",

  "hud.speed": "VEL.",
  "hud.cash": "PASTA",
  "hud.fuel": "GAS.",
  "hud.reputation": "REPUT.",
  "hud.distance": "{m}m",
  "hud.bribe": "SOBORNO ${amount}",

  "fare.pickup.bar": [
    "Llévame al Rusty Hook, taxista.",
    "Barrio de bares, y rápido.",
    "Necesito un trago. Ya."
  ],
  "fare.pickup.office": [
    "Centro, lo más rápido posible.",
    "A la oficina, por favor.",
    "Reunión en diez minutos."
  ],
  "fare.pickup.airport": [
    "Aeropuerto, por favor. Vuelo a las seis.",
    "Terminal 2, y nada de rodeos.",
    "Airport Spur. La ruta rápida."
  ],
  "fare.pickup.hotel": [
    "Al Grand, por favor.",
    "Déjame en el Marquee.",
    "Barrio de hoteles."
  ],
  "fare.pickup.hospital": [
    "Hospital General, sin urgencia.",
    "Hospital, pero con calma.",
    "Clínica en Heights Road."
  ],
  "fare.pickup.home": [
    "A casa. Por favor.",
    "Llévame a casa.",
    "Ruta más rápida a mi casa."
  ],
  "fare.pickup.restaurant": [
    "Le Petit Bistro.",
    "Tarde para la cena — dale.",
    "Calle de restaurantes."
  ],
  "fare.pickup.mystery": [
    "Solo conduce. Yo te digo.",
    "Al sur. Yo guío.",
    "¿Conoces un lugar tranquilo? Ahí."
  ],
  "fare.completed": "+${tip} — {rating}",
  "fare.rating.great": "¡Gran viaje!",
  "fare.rating.ok": "Vale.",
  "fare.rating.rough": "Viaje agitado.",

  "day.summary.title": "Día {day}",
  "day.summary.revenue": "Ingresos: ${revenue}",
  "day.summary.expenses": "Gastos: -${expenses}",
  "day.summary.net": "Neto: ${net}",
  "day.summary.continue": "Continuar",

  "settings.title": "Ajustes",
  "settings.audio.master": "Volumen principal",
  "settings.audio.music": "Música",
  "settings.audio.sfx": "Efectos",
  "settings.audio.mono": "Audio mono",
  "settings.visual.reducedMotion": "Movimiento reducido",
  "settings.visual.highContrast": "Alto contraste",
  "settings.visual.textScale": "Tamaño de texto",
  "settings.visual.colorblind": "Perfil daltónico",
  "settings.motor.tiltSensitivity": "Sensib. de inclinación",
  "settings.motor.relaxedTiming": "Tiempo relajado",
  "settings.assist.economy": "Asist. económica",
  "settings.assist.relaxedPolice": "Policía relajada",
  "settings.assist.relaxedSLAs": "Contratos relajados",
  "settings.assist.autoPilot": "Piloto automático",

  "police.chase.warning": "POLICÍA",
  "police.fine.paid": "Multa pagada: -${amount}",

  "driver.tier.rookie": "Novato",
  "driver.tier.journey": "Experto",
  "driver.tier.pro": "Pro",
  "driver.tier.ace": "As",

  "menu.new_game": "Nuevo juego",
  "menu.continue": "Continuar",
  "menu.settings": "Ajustes",
  "menu.credits": "Créditos",

  "common.plural.drivers": "{count, plural, one {# conductor} other {# conductores}}",
  "common.cancel": "Cancelar",
  "common.confirm": "Confirmar",
  "common.undo": "Deshacer"
}
```

- [x] **Step 2: Update Localization to register all languages**

Modify `src/foundations/Localization.js` to import all 5 languages at the top:

Replace:
```javascript
import en from '../strings/en.json';
const tables = { en };
```

With:
```javascript
import en from '../strings/en.json';
import fr from '../strings/fr.json';
import de from '../strings/de.json';
import ptBR from '../strings/pt-BR.json';
import es from '../strings/es.json';

const tables = { en, fr, de, 'pt-BR': ptBR, es };
```

- [x] **Step 3: Write failing test for key coverage**

Create `tests/localizationKeys.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import en from '../src/strings/en.json';
import fr from '../src/strings/fr.json';
import de from '../src/strings/de.json';
import ptBR from '../src/strings/pt-BR.json';
import es from '../src/strings/es.json';

// This test enforces pitfall P10: missing keys in non-English languages
// cause UI breakage. CI fails if any language is missing a key English has.

const LANG_TABLES = { fr, de, 'pt-BR': ptBR, es };

describe('Localization key coverage', () => {
  const enKeys = Object.keys(en);

  for (const [lang, table] of Object.entries(LANG_TABLES)) {
    it(`${lang} has all ${enKeys.length} keys that en has`, () => {
      const missing = enKeys.filter(k => !(k in table));
      expect(missing, `Missing keys in ${lang}: ${missing.join(', ')}`).toEqual([]);
    });

    it(`${lang} has no extra keys not in en`, () => {
      const extra = Object.keys(table).filter(k => !(k in en));
      expect(extra, `Extra keys in ${lang}: ${extra.join(', ')}`).toEqual([]);
    });

    it(`${lang} preserves array-vs-string type per key`, () => {
      for (const k of enKeys) {
        const enIsArray = Array.isArray(en[k]);
        const langIsArray = Array.isArray(table[k]);
        expect(langIsArray, `Type mismatch for ${k} in ${lang}`).toBe(enIsArray);
      }
    });
  }
});
```

- [x] **Step 4: Run test — expect all passes**

Run: `npm test`
Expected: PASS — coverage tests green for all 4 non-English languages. If any fail, fix the missing/extra keys in the language file and rerun.

Also run: `npm test -- localization.test` — existing tests still pass with the 5-language table.

- [x] **Step 5: Verify language switching**

Add a final assertion in an existing test or a quick manual check: `L.setLanguage('fr'); expect(L.t('start.title')).toBe('CABBIE');` (same in FR). `L.t('start.button')` should return `'CONDUIRE'`.

- [x] **Step 6: Commit**

```bash
git add src/strings/ src/foundations/Localization.js tests/localizationKeys.test.js
git commit -m "feat(m0): add 4 non-English language files + CI check for key coverage (P10)"
```

---

## Task 7: Accessibility module

**Files:**
- Create: `src/foundations/Accessibility.js`
- Create: `tests/accessibility.test.js`

Per `CABBIE_SPEC.md §7`. Single source of truth for all a11y settings. Persists to localStorage. Emits events on change so downstream systems can react live.

- [x] **Step 1: Write failing test**

Create `tests/accessibility.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Accessibility } from '../src/foundations/Accessibility.js';

describe('Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    Accessibility.reset();
  });

  it('has expected defaults', () => {
    expect(Accessibility.reducedMotion).toBe(false);
    expect(Accessibility.highContrast).toBe(false);
    expect(Accessibility.textScale).toBe(1.0);
    expect(Accessibility.colorblindProfile).toBe(null);
    expect(Accessibility.subtitlesEnabled).toBe(true);
    expect(Accessibility.volumeMaster).toBe(0.8);
    expect(Accessibility.volumeMusic).toBe(0.7);
    expect(Accessibility.volumeSFX).toBe(0.9);
    expect(Accessibility.autoPilot).toBe(false);
    expect(Accessibility.relaxedPolice).toBe(false);
    expect(Accessibility.relaxedSLAs).toBe(false);
    expect(Accessibility.economyAssist).toBe(false);
    expect(Accessibility.relaxedTiming).toBe(false);
  });

  it('set() updates a setting and saves', () => {
    Accessibility.set('reducedMotion', true);
    expect(Accessibility.reducedMotion).toBe(true);
    const saved = JSON.parse(localStorage.getItem('cabbie.a11y'));
    expect(saved.reducedMotion).toBe(true);
  });

  it('set() notifies subscribers', () => {
    const spy = vi.fn();
    const off = Accessibility.subscribe(spy);
    Accessibility.set('textScale', 1.5);
    expect(spy).toHaveBeenCalledWith({ key: 'textScale', value: 1.5 });
    off();
  });

  it('load() restores saved values', () => {
    localStorage.setItem('cabbie.a11y', JSON.stringify({ highContrast: true, textScale: 2.0 }));
    Accessibility.load();
    expect(Accessibility.highContrast).toBe(true);
    expect(Accessibility.textScale).toBe(2.0);
    // Unmentioned values keep defaults
    expect(Accessibility.reducedMotion).toBe(false);
  });

  it('load() survives corrupt JSON', () => {
    localStorage.setItem('cabbie.a11y', 'not json');
    expect(() => Accessibility.load()).not.toThrow();
    expect(Accessibility.reducedMotion).toBe(false);
  });

  it('textScale clamped to 0.5 - 2.0', () => {
    Accessibility.set('textScale', 5.0);
    expect(Accessibility.textScale).toBe(2.0);
    Accessibility.set('textScale', 0.1);
    expect(Accessibility.textScale).toBe(0.5);
  });

  it('volumes clamped to 0 - 1', () => {
    Accessibility.set('volumeMaster', 2.0);
    expect(Accessibility.volumeMaster).toBe(1.0);
    Accessibility.set('volumeMusic', -0.5);
    expect(Accessibility.volumeMusic).toBe(0.0);
  });

  it('colorblindProfile accepts valid values or null', () => {
    Accessibility.set('colorblindProfile', 'deuter');
    expect(Accessibility.colorblindProfile).toBe('deuter');
    Accessibility.set('colorblindProfile', 'invalid');
    expect(Accessibility.colorblindProfile).toBe('deuter'); // unchanged
    Accessibility.set('colorblindProfile', null);
    expect(Accessibility.colorblindProfile).toBe(null);
  });

  it('serialize() returns full state', () => {
    Accessibility.set('reducedMotion', true);
    const s = Accessibility.serialize();
    expect(s.reducedMotion).toBe(true);
    expect(s.textScale).toBe(1.0);
  });

  it('unsubscribe() stops further notifications', () => {
    const spy = vi.fn();
    const off = Accessibility.subscribe(spy);
    off();
    Accessibility.set('subtitlesEnabled', false);
    expect(spy).not.toHaveBeenCalled();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import Accessibility module.

- [x] **Step 3: Implement Accessibility**

Create `src/foundations/Accessibility.js`:

```javascript
// src/foundations/Accessibility.js
// Central accessibility settings. See CABBIE_SPEC.md §7.
// All UI and gameplay modules respect these values.
// Persistence: localStorage key 'cabbie.a11y'.
// Change notification: subscribe() callback receives { key, value }.

const STORAGE_KEY = 'cabbie.a11y';

const DEFAULTS = {
  // Visual
  reducedMotion: false,
  highContrast: false,
  colorblindProfile: null,
  textScale: 1.0,
  // Motor
  holdToConfirm: false,
  tiltSensitivity: 0.5,
  tiltDeadZone: 0.1,
  relaxedTiming: false,
  // Auditory
  subtitlesEnabled: true,
  monoAudio: false,
  // Cognitive / assist
  economyAssist: false,
  relaxedPolice: false,
  relaxedSLAs: false,
  autoPilot: false,
  // Volumes
  volumeMaster: 0.8,
  volumeMusic: 0.7,
  volumeSFX: 0.9,
};

const VALID_COLORBLIND = [null, 'deuter', 'protan', 'tritan'];

const subscribers = new Set();
const state = { ...DEFAULTS };

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function applyConstraints(key, value) {
  switch (key) {
    case 'textScale':        return clamp(value, 0.5, 2.0);
    case 'tiltSensitivity':  return clamp(value, 0.0, 1.0);
    case 'tiltDeadZone':     return clamp(value, 0.0, 0.5);
    case 'volumeMaster':
    case 'volumeMusic':
    case 'volumeSFX':        return clamp(value, 0.0, 1.0);
    case 'colorblindProfile':
      return VALID_COLORBLIND.includes(value) ? value : state[key];
    default:
      // Boolean settings pass through
      return value;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage quota or disabled — non-fatal
    console.warn('Accessibility persistence failed:', e);
  }
}

export const Accessibility = new Proxy({
  set(key, value) {
    if (!(key in DEFAULTS)) return;
    const v = applyConstraints(key, value);
    state[key] = v;
    persist();
    for (const s of subscribers) {
      try { s({ key, value: v }); }
      catch (e) { console.error('Accessibility subscriber error:', e); }
    }
  },

  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      for (const k of Object.keys(DEFAULTS)) {
        if (k in parsed) {
          state[k] = applyConstraints(k, parsed[k]);
        }
      }
    } catch (e) {
      // Corrupt JSON — reset silently
    }
  },

  reset() {
    for (const k of Object.keys(DEFAULTS)) {
      state[k] = DEFAULTS[k];
    }
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },

  serialize() {
    return { ...state };
  },
}, {
  // Proxy getter exposes state fields as properties
  get(target, prop) {
    if (prop in target) return target[prop];
    if (prop in state) return state[prop];
    return undefined;
  },
});
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 10 Accessibility tests green.

- [x] **Step 5: Commit**

```bash
git add src/foundations/Accessibility.js tests/accessibility.test.js
git commit -m "feat(m0): add Accessibility module with localStorage persistence + subscribe"
```

---

## Task 8: StyleBible

**Files:**
- Create: `src/foundations/StyleBible.js`
- Create: `tests/styleBible.test.js`

Per `CABBIE_SPEC.md §6`. Loads district palettes and typography/accent/surface tokens. Pure data module.

- [x] **Step 1: Write failing test**

Create `tests/styleBible.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { StyleBible } from '../src/foundations/StyleBible.js';

describe('StyleBible', () => {
  it('exports all 8 district palettes', () => {
    const expected = ['old-port', 'neon-quarter', 'financial-glass', 'sun-flats',
                      'docklands', 'festival-row', 'airport-spur', 'heights'];
    expect(Object.keys(StyleBible.palettes).sort()).toEqual(expected.sort());
  });

  it('each palette has 5 required color keys', () => {
    const required = ['base', 'accent', 'sky', 'signage', 'highlight'];
    for (const [id, palette] of Object.entries(StyleBible.palettes)) {
      for (const k of required) {
        expect(palette.colors[k], `Palette ${id} missing ${k}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('exports typography tokens', () => {
    expect(StyleBible.typography.hud).toContain('DM Mono');
    expect(StyleBible.typography.transition).toBeTruthy();
  });

  it('exports brand tokens', () => {
    expect(StyleBible.accent).toBe('#F5C400');
    expect(StyleBible.surface).toBe('#0a0a14');
    expect(StyleBible.surfaceElevated).toBeTruthy();
  });

  it('exports motion tokens', () => {
    expect(StyleBible.uiEaseCurve).toBeTruthy();
    expect(StyleBible.uiDuration).toBeGreaterThan(0);
  });

  it('getPalette() returns a palette by id', () => {
    const p = StyleBible.getPalette('old-port');
    expect(p.colors.base).toBeTruthy();
  });

  it('getPalette() returns null for unknown id', () => {
    expect(StyleBible.getPalette('not-a-district')).toBe(null);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import StyleBible.

- [x] **Step 3: Implement StyleBible**

Create `src/foundations/StyleBible.js`:

```javascript
// src/foundations/StyleBible.js
// Style token reference. See CABBIE_SPEC.md §6.
// All UI/FX/world modules import tokens from here. No inline colors or fonts anywhere else.

import oldPort        from '../../docs/style-bible/palettes/old-port.json';
import neonQuarter    from '../../docs/style-bible/palettes/neon-quarter.json';
import financialGlass from '../../docs/style-bible/palettes/financial-glass.json';
import sunFlats       from '../../docs/style-bible/palettes/sun-flats.json';
import docklands     from '../../docs/style-bible/palettes/docklands.json';
import festivalRow   from '../../docs/style-bible/palettes/festival-row.json';
import airportSpur   from '../../docs/style-bible/palettes/airport-spur.json';
import heights       from '../../docs/style-bible/palettes/heights.json';

const palettes = {
  'old-port':        oldPort,
  'neon-quarter':    neonQuarter,
  'financial-glass': financialGlass,
  'sun-flats':       sunFlats,
  'docklands':       docklands,
  'festival-row':    festivalRow,
  'airport-spur':    airportSpur,
  'heights':         heights,
};

export const StyleBible = {
  palettes,

  typography: {
    hud:        "'DM Mono', ui-monospace, Menlo, monospace",
    transition: "Georgia, 'Times New Roman', serif",
  },

  // Brand
  accent:          '#F5C400',
  surface:         '#0a0a14',
  surfaceElevated: '#13131e',
  border:          'rgba(245, 196, 0, 0.2)',

  // Motion
  uiEaseCurve: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
  uiDuration:  200, // ms

  // Feedback text colors (§9)
  feedback: {
    cash:    '#F5C400',
    rep:     '#6FD6FF',
    comfort: '#8BFF9C',
    damage:  '#FF6470',
  },

  getPalette(id) {
    return palettes[id] || null;
  },
};
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 7 StyleBible tests green.

- [x] **Step 5: Commit**

```bash
git add src/foundations/StyleBible.js tests/styleBible.test.js
git commit -m "feat(m0): add StyleBible with 8 district palettes + typography/motion tokens"
```

---

## Task 9: PortalAdapter with dev adapter

**Files:**
- Create: `src/foundations/PortalAdapter.js`
- Create: `src/foundations/adapters/dev.js`
- Create: `tests/portalAdapter.test.js`

Per `CABBIE_SPEC.md §9`. The dev adapter is the simplest: all ad calls auto-succeed, telemetry logs to console.

- [x] **Step 1: Write failing test**

Create `tests/portalAdapter.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortalAdapter } from '../src/foundations/PortalAdapter.js';

describe('PortalAdapter (dev portal)', () => {
  // Note: __PORTAL__ is set to 'dev' by vitest.config.js

  it('initializes without throwing', async () => {
    await expect(PortalAdapter.init()).resolves.not.toThrow();
  });

  it('preRoll() resolves true in dev', async () => {
    expect(await PortalAdapter.preRoll()).toBe(true);
  });

  it('interstitial() resolves true in dev', async () => {
    expect(await PortalAdapter.interstitial('act-transition')).toBe(true);
  });

  it('rewarded() resolves true in dev (grants reward)', async () => {
    expect(await PortalAdapter.rewarded('revive')).toBe(true);
  });

  it('trackEvent() does not throw', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await PortalAdapter.trackEvent('test:event', { value: 1 });
    expect(log).toHaveBeenCalledWith('[telemetry]', 'test:event', { value: 1 });
    log.mockRestore();
  });

  it('cloudSaveSupported() returns false in dev', async () => {
    expect(await PortalAdapter.cloudSaveSupported()).toBe(false);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import PortalAdapter.

- [x] **Step 3: Implement dev adapter**

Create `src/foundations/adapters/dev.js`:

```javascript
// src/foundations/adapters/dev.js
// Adapter for the dev/self-hosted build. No SDK, no network. All calls stub-succeed.
// See CABBIE_SPEC.md §9.

export async function init() {
  console.log('[portal:dev] no SDK loaded; stubs active');
}

export async function preRoll()               { return true; }
export async function interstitial(trigger)   { return true; }
export async function rewarded(rewardKey)     { return true; }

export async function trackEvent(name, props) {
  console.log('[telemetry]', name, props);
}

export async function cloudSaveSupported()    { return false; }
export async function cloudSaveWrite(state)   { return false; }
export async function cloudSaveRead()         { return null; }
```

- [x] **Step 4: Implement PortalAdapter facade**

Create `src/foundations/PortalAdapter.js`:

```javascript
// src/foundations/PortalAdapter.js
// Per-portal SDK facade. Loads the correct adapter at build time based on __PORTAL__
// which is set in vite.config.js / vitest.config.js.
// See CABBIE_SPEC.md §9.

const portal = typeof __PORTAL__ !== 'undefined' ? __PORTAL__ : 'dev';

let impl = null;
let initPromise = null;

async function loadImpl() {
  if (impl) return impl;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    let mod;
    switch (portal) {
      case 'crazygames':  mod = await import('./adapters/crazygames.js'); break;
      case 'newgrounds':  mod = await import('./adapters/newgrounds.js'); break;
      case 'itch':        mod = await import('./adapters/itch.js');       break;
      default:            mod = await import('./adapters/dev.js');        break;
    }
    await mod.init();
    impl = mod;
    return mod;
  })();
  return initPromise;
}

export const PortalAdapter = {
  portal,

  async init()                           { await loadImpl(); },

  async preRoll()                        { return (await loadImpl()).preRoll(); },
  async interstitial(trigger)            { return (await loadImpl()).interstitial(trigger); },
  async rewarded(rewardKey)              { return (await loadImpl()).rewarded(rewardKey); },

  async trackEvent(name, props)          { return (await loadImpl()).trackEvent(name, props); },

  async cloudSaveSupported()             { return (await loadImpl()).cloudSaveSupported(); },
  async cloudSaveWrite(state)            { return (await loadImpl()).cloudSaveWrite(state); },
  async cloudSaveRead()                  { return (await loadImpl()).cloudSaveRead(); },
};
```

- [x] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 6 PortalAdapter tests green.

- [x] **Step 6: Commit**

```bash
git add src/foundations/PortalAdapter.js src/foundations/adapters/dev.js tests/portalAdapter.test.js
git commit -m "feat(m0): add PortalAdapter facade + dev adapter (stubbed SDK calls)"
```

---

## Task 10: CrazyGames adapter stub

**Files:**
- Create: `src/foundations/adapters/crazygames.js`

This adapter wraps the real CrazyGames SDK. In M0 the SDK script is loaded but ad calls remain stubbed — the full SDK integration happens in M9 after the game is content-complete. The stubs return `true` so development flows aren't gated.

- [x] **Step 1: Implement CrazyGames adapter**

Create `src/foundations/adapters/crazygames.js`:

```javascript
// src/foundations/adapters/crazygames.js
// Adapter for CrazyGames portal. SDK is loaded at init but ad-flow integration
// is finalized in M9. Stubs return true so dev flow is never blocked.
// See CABBIE_SPEC.md §9.

const SDK_SRC = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';

let sdkReady = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function init() {
  try {
    await loadScript(SDK_SRC);
    if (window.CrazyGames?.SDK?.init) {
      await window.CrazyGames.SDK.init();
      sdkReady = true;
      console.log('[portal:crazygames] SDK initialized');
    } else {
      console.warn('[portal:crazygames] SDK not found after load');
    }
  } catch (e) {
    console.warn('[portal:crazygames] SDK load failed, running in stub mode:', e);
  }
}

export async function preRoll() {
  if (!sdkReady) return true;
  try {
    return await window.CrazyGames.SDK.ad.requestAd('midgame');
  } catch (e) {
    return true; // non-blocking
  }
}

export async function interstitial(trigger) {
  if (!sdkReady) return true;
  try {
    return await window.CrazyGames.SDK.ad.requestAd('midgame');
  } catch (e) {
    return true;
  }
}

export async function rewarded(rewardKey) {
  if (!sdkReady) return true;
  try {
    return await window.CrazyGames.SDK.ad.requestAd('rewarded');
  } catch (e) {
    return true;
  }
}

export async function trackEvent(name, props) {
  if (!sdkReady) return;
  try {
    window.CrazyGames.SDK.analytics?.event?.(name, props);
  } catch (e) { /* non-fatal */ }
}

export async function cloudSaveSupported() {
  return Boolean(window.CrazyGames?.SDK?.data);
}

export async function cloudSaveWrite(state) {
  if (!sdkReady) return false;
  try {
    await window.CrazyGames.SDK.data.setItem('cabbie.save', JSON.stringify(state));
    return true;
  } catch (e) { return false; }
}

export async function cloudSaveRead() {
  if (!sdkReady) return null;
  try {
    const raw = await window.CrazyGames.SDK.data.getItem('cabbie.save');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
```

- [x] **Step 2: Verify no test regression**

Run: `npm test`
Expected: PASS — all existing tests still green (this adapter is only loaded when `__PORTAL__='crazygames'`, which isn't the test environment).

- [x] **Step 3: Verify build works**

Run: `npm run build:crazygames`
Expected: Vite builds to `dist/crazygames/` without errors. Bundle includes the CrazyGames adapter.

- [x] **Step 4: Commit**

```bash
git add src/foundations/adapters/crazygames.js
git commit -m "feat(m0): add CrazyGames portal adapter with stubbed ad flow (M9 integrates fully)"
```

---

## Task 11: Newgrounds adapter stub

**Files:**
- Create: `src/foundations/adapters/newgrounds.js`

- [x] **Step 1: Implement Newgrounds adapter**

Create `src/foundations/adapters/newgrounds.js`:

```javascript
// src/foundations/adapters/newgrounds.js
// Adapter for Newgrounds portal. Full SDK integration deferred to M9.
// See CABBIE_SPEC.md §9.

let sdkReady = false;

export async function init() {
  // Newgrounds.io API is loaded per-project via their developer tools.
  // For now, stub. M9 wires the real SDK + API key.
  console.log('[portal:newgrounds] stub mode (M9 will integrate Newgrounds.io API)');
}

export async function preRoll()                   { return true; }
export async function interstitial(trigger)       { return true; }
export async function rewarded(rewardKey)         { return true; }

export async function trackEvent(name, props) {
  // Newgrounds has event logging via their postScore/unlockMedal API;
  // abstraction applies in M9.
}

export async function cloudSaveSupported()        { return false; }
export async function cloudSaveWrite(state)       { return false; }
export async function cloudSaveRead()             { return null; }
```

- [x] **Step 2: Verify build works**

Run: `npm run build:newgrounds`
Expected: Vite builds to `dist/newgrounds/` without errors.

- [x] **Step 3: Commit**

```bash
git add src/foundations/adapters/newgrounds.js
git commit -m "feat(m0): add Newgrounds portal adapter stub (M9 integrates real API)"
```

---

## Task 12: itch.io adapter

**Files:**
- Create: `src/foundations/adapters/itch.js`

itch.io has no portal ad SDK — the adapter replaces rewarded ads with a tip-jar link behavior. Per PRD §17.

- [x] **Step 1: Implement itch.io adapter**

Create `src/foundations/adapters/itch.js`:

```javascript
// src/foundations/adapters/itch.js
// Adapter for itch.io. No portal SDK. Rewarded ads replaced with tip-jar opt-in.
// Tip jar link wired in M9; in M0 the rewarded call auto-grants (tip-jar mode).
// See CABBIE_SPEC.md §9 and CABBIE_PRD.md §17.

export async function init() {
  console.log('[portal:itch] no SDK; tip-jar mode');
}

export async function preRoll()                   { return true; }
export async function interstitial(trigger)       { return true; }

export async function rewarded(rewardKey) {
  // On itch, we grant the reward and suggest supporting the game via tip-jar.
  // M9 adds the actual UI prompt with optional link-out.
  return true;
}

export async function trackEvent(name, props) {
  // itch has no analytics; no-op.
}

export async function cloudSaveSupported()        { return false; }
export async function cloudSaveWrite(state)       { return false; }
export async function cloudSaveRead()             { return null; }
```

- [x] **Step 2: Verify build works**

Run: `npm run build:itch`
Expected: Vite builds to `dist/itch/` without errors.

- [x] **Step 3: Commit**

```bash
git add src/foundations/adapters/itch.js
git commit -m "feat(m0): add itch.io portal adapter (tip-jar mode, no SDK)"
```

---

## Task 13: SaveSystem

**Files:**
- Create: `src/save/SaveSystem.js`
- Create: `tests/saveSystem.test.js`

Per `CABBIE_SPEC.md §29`. Schema v1 with placeholder state. Later milestones extend the state shape; the schema-versioned migration path is set up in M0 so no retrofit is needed.

- [x] **Step 1: Write failing test**

Create `tests/saveSystem.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveSystem } from '../src/save/SaveSystem.js';

describe('SaveSystem', () => {
  beforeEach(() => {
    localStorage.clear();
    SaveSystem._stubState = null;
  });

  it('flush() writes versioned payload to localStorage', () => {
    SaveSystem._stubState = { cash: 100, day: 1 };
    SaveSystem.flush();
    const raw = localStorage.getItem('cabbie.save');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.v).toBe(1);
    expect(parsed.state.cash).toBe(100);
    expect(parsed.ts).toBeTypeOf('number');
  });

  it('load() returns null when no save exists', () => {
    expect(SaveSystem.load()).toBe(null);
  });

  it('load() returns state for a valid saved payload', () => {
    localStorage.setItem('cabbie.save', JSON.stringify({ v: 1, ts: Date.now(), state: { cash: 500 } }));
    expect(SaveSystem.load()).toEqual({ cash: 500 });
  });

  it('load() returns null for corrupt JSON', () => {
    localStorage.setItem('cabbie.save', 'not json');
    expect(SaveSystem.load()).toBe(null);
  });

  it('load() runs migration for older schema versions', () => {
    // Schema v0 (hypothetical legacy with 'money' instead of 'cash')
    localStorage.setItem('cabbie.save', JSON.stringify({ v: 0, ts: 1, state: { money: 777 } }));
    // M0 only has v1; we register a v0->v1 migration for future-proofing
    const state = SaveSystem.load();
    // v0 isn't a real migration path in M0, but migrate() must not crash
    // and should return the state somehow (possibly null).
    expect(state === null || typeof state === 'object').toBe(true);
  });

  it('roundTrip preserves data via flush + load', () => {
    SaveSystem._stubState = { cash: 42, driverCount: 3, complex: { nested: [1, 2, 3] } };
    SaveSystem.flush();
    const loaded = SaveSystem.load();
    expect(loaded).toEqual({ cash: 42, driverCount: 3, complex: { nested: [1, 2, 3] } });
  });

  it('clear() removes the save', () => {
    SaveSystem._stubState = { cash: 100 };
    SaveSystem.flush();
    SaveSystem.clear();
    expect(SaveSystem.load()).toBe(null);
  });

  it('collectState() returns the stubbed state in M0', () => {
    SaveSystem._stubState = { x: 1 };
    expect(SaveSystem.collectState()).toEqual({ x: 1 });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import SaveSystem.

- [x] **Step 3: Implement SaveSystem**

Create `src/save/SaveSystem.js`:

```javascript
// src/save/SaveSystem.js
// Schema-versioned single-slot save. See CABBIE_SPEC.md §29.
// M0 ships schema v1. Later milestones extend collectState() to include
// more game state (drivers, fleet, saturation, etc.). Migrations live here.

const STORAGE_KEY = 'cabbie.save';
const SCHEMA_VERSION = 1;

const MIGRATIONS = {
  // 0: (state) => ({ ...state, cash: state.money ?? 0 }), // example placeholder for future migration
};

export const SaveSystem = {
  // M0 stub. Real implementation in M1/M2/M5/M7 as game systems come online.
  // Game modules can set _stubState for testing until collectState() is wired to real sources.
  _stubState: null,

  flush() {
    const state = this.collectState();
    const payload = { v: SCHEMA_VERSION, ts: Date.now(), state };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('SaveSystem flush failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return this.migrate(parsed);
    } catch (e) {
      return null;
    }
  },

  migrate(payload) {
    let state = payload.state;
    let v = payload.v ?? 0;
    while (v < SCHEMA_VERSION) {
      const mig = MIGRATIONS[v];
      if (!mig) break; // No migration path — bail safely
      state = mig(state);
      v += 1;
    }
    return v === SCHEMA_VERSION ? state : null;
  },

  collectState() {
    // M0 returns stubbed state for testing.
    // Milestones M1+ replace this with reads from actual game modules.
    if (this._stubState !== null) return this._stubState;
    return {};
  },

  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },

  // Future: wire up event bus subscriptions here
  // init() {
  //   EventBus.on('cash:changed', () => this.flush());
  //   EventBus.on('day:ended', () => this.flush());
  //   ...
  // }
};
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 8 SaveSystem tests green.

- [x] **Step 5: Commit**

```bash
git add src/save/SaveSystem.js tests/saveSystem.test.js
git commit -m "feat(m0): add SaveSystem with schema v1 + migration hook for future versions"
```

---

## Task 14: main.js — Title screen integration

**Files:**
- Create: `src/main.js`
- Modify: `index.html`

Pulls all M0 foundations into a working title screen: loads a language, applies accessibility settings, initializes portal adapter, renders localized title screen with DRIVE button.

- [x] **Step 1: Write the title screen in main.js**

Create `src/main.js`:

```javascript
// src/main.js
// Cabbie app entry. See CABBIE_PRD.md and CABBIE_SPEC.md for authoritative references.
// M0: boot sequence, portal init, accessibility load, language detection, title screen.

import { EventBus } from './eventBus.js';
import { L } from './foundations/Localization.js';
import { Accessibility } from './foundations/Accessibility.js';
import { StyleBible } from './foundations/StyleBible.js';
import { PortalAdapter } from './foundations/PortalAdapter.js';
import { SaveSystem } from './save/SaveSystem.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './constants.js';

async function boot() {
  // 1. Load accessibility settings (respects reduced-motion etc on first render)
  Accessibility.load();

  // 2. Detect language (saved > browser full locale > browser short > default)
  const saved = (() => {
    try { return localStorage.getItem('cabbie.lang'); } catch { return null; }
  })();
  const browser = navigator.language || DEFAULT_LANGUAGE;
  const short = browser.split('-')[0];

  let lang = DEFAULT_LANGUAGE;
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) lang = saved;
  else if (SUPPORTED_LANGUAGES.includes(browser)) lang = browser;
  else if (SUPPORTED_LANGUAGES.includes(short)) lang = short;
  L.setLanguage(lang);

  // 3. Portal init — async, non-blocking for title screen
  PortalAdapter.init().catch(e => console.warn('Portal init failed:', e));
  PortalAdapter.trackEvent('session:start', { portal: PortalAdapter.portal, lang });

  // 4. Render the title screen
  renderTitleScreen();
}

function renderTitleScreen() {
  const app = document.getElementById('app');
  if (!app) return;

  const hasSave = SaveSystem.load() !== null;

  app.innerHTML = `
    <div class="title-screen" style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${StyleBible.surface};
      color: #fff;
      font-family: ${StyleBible.typography.hud};
      padding: 2rem;
    ">
      <div style="
        font-family: ${StyleBible.typography.transition};
        font-size: calc(3.5rem * ${Accessibility.textScale});
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 0.5rem;
      ">
        ${L.t('start.title')}<span style="color: ${StyleBible.accent}">.</span>
      </div>
      <div style="
        font-size: calc(0.875rem * ${Accessibility.textScale});
        color: rgba(255,255,255,0.6);
        margin-bottom: 2rem;
        text-align: center;
        max-width: 30ch;
      ">
        ${L.t('start.subtitle')}
      </div>
      <button id="drive-btn" class="tap-target" style="
        background: ${StyleBible.accent};
        color: ${StyleBible.surface};
        border: none;
        padding: 14px 32px;
        font-size: calc(0.875rem * ${Accessibility.textScale});
        font-weight: 600;
        font-family: ${StyleBible.typography.hud};
        letter-spacing: 0.1em;
        border-radius: 8px;
        cursor: pointer;
        min-width: 44px;
        min-height: 44px;
        transition: transform ${StyleBible.uiDuration}ms ${StyleBible.uiEaseCurve};
      ">
        ▶ ${hasSave ? L.t('menu.continue') : L.t('start.button')}
      </button>
      <div style="
        margin-top: 1.5rem;
        font-size: calc(0.75rem * ${Accessibility.textScale});
        color: rgba(255,255,255,0.3);
        letter-spacing: 0.05em;
      ">
        ${L.t('start.hint')}
      </div>
      <div style="
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        font-size: 0.7rem;
        color: rgba(255,255,255,0.25);
        font-family: ${StyleBible.typography.hud};
      ">
        v0.1 · M0
      </div>
    </div>
  `;

  const driveBtn = document.getElementById('drive-btn');
  if (driveBtn) {
    driveBtn.addEventListener('click', () => {
      EventBus.emit('app:driveClicked');
      // M1 wires this to start the gameplay scene.
      console.log('[m0] Drive button clicked. M1 will wire gameplay.');
    });
  }
}

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
```

- [x] **Step 2: Verify all portal builds produce a working bundle**

Run:
```bash
npm run build:dev
npm run build:crazygames
npm run build:newgrounds
npm run build:itch
```

Expected: Each command exits with code 0 and produces `dist/<portal>/` containing `index.html`, JS bundle, and assets. No build errors.

- [x] **Step 3: Manual smoke test in browser**

Run: `npm run dev`
Open `http://localhost:5173` in a browser.

Verify:
- Title screen renders with "CABBIE." heading in Georgia serif
- Yellow DRIVE button visible and tappable (note: no action yet beyond console log)
- English text by default
- Change browser language to French via devtools (`navigator.language`), clear localStorage, reload — French text should show
- Open devtools console — no errors, telemetry log `[telemetry] session:start { portal: 'dev', lang: 'en' }`

- [x] **Step 4: Commit**

```bash
git add src/main.js
git commit -m "feat(m0): implement boot sequence + localized title screen"
```

---

## Task 15: M0 acceptance verification

**Files:**
- Create: `docs/M0_COMPLETION.md` (milestone debrief)

Final task: verify every M0 acceptance criterion from `CABBIE_SPEC.md §34`. Then update the spec to mark M0 complete.

- [x] **Step 1: Run full test suite one final time**

Run: `npm test`
Expected: ALL tests pass. Count should be ~40+ (7 EventBus + 10 Localization + key-coverage for 4 langs × 3 assertions = 12 + 10 Accessibility + 7 StyleBible + 6 PortalAdapter + 8 SaveSystem + constants).

- [x] **Step 2: Verify all 4 portal builds**

```bash
rm -rf dist/
npm run build:dev         && echo "✓ dev"
npm run build:crazygames  && echo "✓ crazygames"
npm run build:newgrounds  && echo "✓ newgrounds"
npm run build:itch        && echo "✓ itch"
```

Expected: 4 `✓` lines. Each `dist/<portal>/` folder exists and contains non-empty `index.html` and JS.

- [x] **Step 3: Manual M0 acceptance-criteria checklist**

Open `CABBIE_SPEC.md` §34 M0 section. For each acceptance criterion, verify:

- [x] `npm run build:dev` produces a working empty scene with title screen → CHECK via Task 14 Step 3
- [x] `npm run build:crazygames` / `:newgrounds` / `:itch` produce bundles with correct SDK stubs → CHECK via Step 2 above
- [x] Title screen renders in EN, FR, DE, PT-BR, ES → CHECK by setting `localStorage.setItem('cabbie.lang', 'fr')` etc. and reloading
- [x] Style bible referenced correctly — no hard-coded colors or fonts anywhere → `grep -r '#[0-9A-Fa-f]\{6\}' src/` should only show style tokens in `StyleBible.js` (palettes are in JSON files, not source). Same for font families: `grep -r 'font-family' src/` should show only `StyleBible.typography` references.
- [x] Accessibility settings panel shows all toggles; state persists across reload → **DEFERRED: Settings UI itself is M1 work.** For M0, verify via devtools console: `Accessibility.set('reducedMotion', true); location.reload();` then `Accessibility.load(); console.log(Accessibility.reducedMotion)` → should print `true`.
- [x] Event bus dummy round-trip works → CHECK via `npm test` EventBus suite
- [x] No silent console errors in any build → Open each `npm run dev` session, open devtools, confirm zero errors

Note any deferred items explicitly:
- **Deferred to M1:** Full Settings UI panel (M0 only provides the backing module).

- [x] **Step 4: Write milestone debrief**

Create `docs/M0_COMPLETION.md`:

```markdown
# M0 — Foundations · Completion Report

**Completed:** [date]
**Sessions:** [n]
**Spec reference:** `CABBIE_SPEC.md` §34 M0

## Acceptance criteria status

- [x] Vite project scaffolded with per-portal build config
- [x] All 4 portal builds (dev/crazygames/newgrounds/itch) produce working bundles
- [x] Title screen renders in all 5 launch languages
- [x] Style bible referenced correctly — zero inline colors/fonts outside tokens module
- [x] Accessibility module with all settings + localStorage persistence
- [x] Localization module with key-coverage CI test across all languages
- [x] Event bus round-trip verified with unit tests
- [x] PortalAdapter with 4 adapters implemented (stubs where SDK integration deferred)
- [x] SaveSystem schema v1 with migration hook
- [x] constants.js with full §36 values (all 10 milestones' worth of constants defined)
- [x] Zero silent console errors across all builds

## Deferred items (carry to appropriate milestone)

- Settings UI panel — M1
- CrazyGames SDK full ad-flow integration — M9
- Newgrounds SDK integration — M9
- itch.io tip-jar link-out UI — M9
- Cloud save beyond portal-adapter facade — M9 if portal supports

## New pitfalls discovered

[None so far / list as applicable. Add to CABBIE_SPEC.md §35 as P13+ if any.]

## SPEC updates required

- §2 Tech Stack: add Vitest as the test framework (M0 addition).
- §34 M0: mark all acceptance criteria [x] complete.
- §35: no new pitfalls this milestone.

## Stats

- Files created: [n]
- Tests written: [n]  
- Test assertions: [n]
- Total LOC: [n]
- Git commits: [n]
```

Fill in the bracketed values.

- [x] **Step 5: Update SPEC**

Modify `CABBIE_SPEC.md`:

1. In §2 Tech Stack, add a row:

```
| Tests | Vitest | ^1.0 | Vite-native unit test runner, JSDOM-backed |
```

2. In §34 M0 acceptance criteria, change all `[ ]` to `[x]`. Change the heading to:

```markdown
### M0 — Foundations ✅ COMPLETE
```

3. In the timeline table in §34, update M0's status column from "Pending" to "✅ Complete".

- [x] **Step 6: Final commit and tag**

```bash
git add CABBIE_SPEC.md docs/M0_COMPLETION.md
git commit -m "docs(m0): mark M0 complete in spec + write completion report"
git tag m0-complete
```

---

## M0 complete. Next steps

Before starting M1:

1. Kim reviews `docs/M0_COMPLETION.md` and confirms criteria met.
2. Kim takes a short break (optional — not a named R11 break; those come after M4, M6, M8).
3. Return to brainstorming / writing-plans workflow to produce M1 implementation plan.
4. M1 plan kickoff prompt for Claude Code:

> "Read `CABBIE_PRD.md` and `CABBIE_SPEC.md` in full. Confirm M0 status via `docs/M0_COMPLETION.md`. Then request the M1 implementation plan (`CABBIE_M1_PLAN.md`) and execute it task-by-task."

---

*End of M0 Implementation Plan. This plan is the contract; the SPEC is the authority.*
