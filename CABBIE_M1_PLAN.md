# Cabbie M1 — Act 1 Core Driving Implementation Plan

> **For Claude Code:** Execute this plan task-by-task. Mark each step `[x]` as you complete it. Use TDD strictly: write failing test → verify it fails → implement → verify it passes → commit. Do not skip tasks. Do not batch commits. If a test doesn't fail where expected, STOP and diagnose. Two gates in this plan REQUIRE Kim's input before continuing — do not proceed past them without confirmation.

**Goal:** Ship a playable driving loop in Old Port — title-screen DRIVE button starts gameplay, taxi drives in third-person 3D, fares spawn and complete for cash, HUD shows speed/cash/direction arrow. All 10 `CABBIE_SPEC.md §34 M1` acceptance criteria green, tagged `m1-complete`, deployed to Pages.

**Architecture:** Dependency-driven build order: math utilities first (SPEC §4 conventions as pure functions), then scene boot, then city geometry, then player (with forced reasoning gate + playtest gate), then camera, then traffic, then fares, then HUD. Every heading/direction calculation imports from `src/math/geometry.js` — no inline coordinate math anywhere else. Structural tests for math + state machines only; skip tests for tuning-heavy physics values.

**Tech stack:** Inherits from M0. Adds Three.js r128 scene/renderer (already in package.json), DOM overlay for HUD. No new dependencies.

**Reading order before starting:**
1. `CABBIE_SPEC.md §4` — Coordinate System. Most important section. Every coordinate decision in this plan derives from it.
2. `CABBIE_SPEC.md §35` — Pitfall catalog. Read P1-P12 in full. You will be guarded against P1, P2, P3, P4, P5, P6, P7, P8, P10 in this milestone.
3. `CABBIE_SPEC.md §34 M1` — acceptance criteria. This is your ship target.
4. `CABBIE_PRD.md §9` — Driving Feel. The tuning direction for physics values in constants.js.

**Scope boundaries (explicitly NOT in M1):**
- Weather variety, day cycle, expenses (M2)
- Save system integration beyond existing M0 stubs (M2)
- Comfort meter (M2)
- Police, rival taxis, collectibles, reputation (M3)
- Final vehicle/building textures, audio (M4)
- Anything Act 2 or Act 3

If mid-milestone you catch yourself implementing any of the above, STOP. Flag it in your next commit message and defer.

---

## File structure

By end of M1, these files are added or modified:

```
cabbie/
├── src/
│   ├── main.js                        # MODIFIED — wires DRIVE button to gameplay boot
│   ├── math/
│   │   └── geometry.js                # NEW — §4 coordinate conventions as pure functions
│   ├── world/
│   │   ├── City.js                    # NEW — 7×7 grid road + building geometry
│   │   ├── District.js                # NEW — Old Port palette + minimal sky/ambient setup
│   │   └── Traffic.js                 # NEW — 10 NPC cars, basic straight-road AI
│   ├── player/
│   │   ├── Taxi.js                    # NEW — player vehicle mesh + state
│   │   ├── Controls.js                # NEW — WASD + arrows + tilt + touchpad input
│   │   ├── Physics.js                 # NEW — arcade driving stepper
│   │   └── Damage.js                  # NEW — health field stub (M3 expands)
│   ├── camera/
│   │   └── FollowCamera.js            # NEW — damped third-person rig
│   ├── game/
│   │   ├── FareSystem.js              # NEW — pickup/dropoff state machine
│   │   └── GameLoop.js                # NEW — scene tick + system orchestration
│   ├── hud/
│   │   ├── HUD.js                     # NEW — root DOM overlay container
│   │   ├── SpeedReadout.js            # NEW — km/h readout
│   │   ├── CashReadout.js             # NEW — $ readout
│   │   └── DirectionArrow.js          # NEW — fare direction indicator
│   └── strings/
│       ├── en.json                    # MODIFIED — add M1 HUD + fare keys
│       ├── fr.json                    # MODIFIED — parity with en
│       ├── de.json                    # MODIFIED
│       ├── pt-BR.json                 # MODIFIED
│       └── es.json                    # MODIFIED
└── tests/
    ├── geometry.test.js               # NEW — exhaustive §4 convention tests
    ├── city.test.js                   # NEW — spawn-on-road assertions (P2)
    ├── fareSystem.test.js             # NEW — state machine transitions
    └── directionArrow.test.js         # NEW — arrow-rotation math
```

**Estimated LOC:** ~1,500 source + ~400 tests.
**Estimated tasks:** 18.

---

## Task 1: Math utilities with §4 convention tests

**Files:**
- Create: `src/math/geometry.js`
- Create: `tests/geometry.test.js`

This is the single most important task in M1. Every coordinate decision downstream imports from here. Tests here are the regression shield for the entire project — if these tests break, a P1/P2/P3/P4/P5 bug is about to ship. SPEC §4 is authoritative; implement it exactly.

- [ ] **Step 1: Write failing tests**

Create `tests/geometry.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import {
  forwardVector,
  blockCenter,
  roadIntersection,
  isOnRoad,
  distance,
  angleDiff,
  relativeAngleToTarget,
  clamp,
  lerp,
} from '../src/math/geometry.js';

describe('geometry — SPEC §4 conventions', () => {
  // §4: hdg=0 faces +Z. forward = (sin(hdg), 0, cos(hdg))
  it('forwardVector at hdg=0 faces +Z', () => {
    const f = forwardVector(0);
    expect(f.x).toBeCloseTo(0, 5);
    expect(f.y).toBe(0);
    expect(f.z).toBeCloseTo(1, 5);
  });

  it('forwardVector at hdg=π/2 faces +X', () => {
    const f = forwardVector(Math.PI / 2);
    expect(f.x).toBeCloseTo(1, 5);
    expect(f.y).toBe(0);
    expect(f.z).toBeCloseTo(0, 5);
  });

  it('forwardVector at hdg=π faces -Z', () => {
    const f = forwardVector(Math.PI);
    expect(f.x).toBeCloseTo(0, 5);
    expect(f.z).toBeCloseTo(-1, 5);
  });

  it('forwardVector at hdg=-π/2 faces -X', () => {
    const f = forwardVector(-Math.PI / 2);
    expect(f.x).toBeCloseTo(-1, 5);
    expect(f.z).toBeCloseTo(0, 5);
  });

  it('forwardVector returns unit magnitude', () => {
    for (const hdg of [0, 0.3, 1.7, -2.1, Math.PI]) {
      const f = forwardVector(hdg);
      const mag = Math.sqrt(f.x * f.x + f.z * f.z);
      expect(mag).toBeCloseTo(1, 5);
    }
  });
});

describe('geometry — city grid (P2 guard)', () => {
  it('blockCenter is symmetric around origin for center block (3,3) in 7x7', () => {
    // With BLOCK_COUNT=7, the middle block is (3,3). It should sit at origin.
    const c = blockCenter(3, 3);
    expect(c.x).toBe(0);
    expect(c.z).toBe(0);
  });

  it('blockCenter (0,0) sits in the negative corner', () => {
    const c = blockCenter(0, 0);
    expect(c.x).toBeLessThan(0);
    expect(c.z).toBeLessThan(0);
  });

  it('blockCenter (6,6) sits in the positive corner', () => {
    const c = blockCenter(6, 6);
    expect(c.x).toBeGreaterThan(0);
    expect(c.z).toBeGreaterThan(0);
  });

  it('roadIntersection is offset from blockCenter by half the stride', () => {
    const bc = blockCenter(3, 3);
    const ri = roadIntersection(3, 3);
    expect(ri.x).toBeGreaterThan(bc.x);
    expect(ri.z).toBeGreaterThan(bc.z);
  });

  it('isOnRoad returns false for block centers (P2 guard)', () => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const c = blockCenter(i, j);
        // A point slightly inside the block should not be on road
        expect(isOnRoad(c.x, c.z), `block (${i},${j}) center should not be on road`).toBe(false);
      }
    }
  });

  it('isOnRoad returns true for road intersections', () => {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const r = roadIntersection(i, j);
        expect(isOnRoad(r.x, r.z), `intersection (${i},${j}) should be on road`).toBe(true);
      }
    }
  });
});

describe('geometry — direction arrow (P3 guard)', () => {
  // §4: atan2(dx, dz) — NOT atan2(dz, dx)
  it('relativeAngleToTarget points forward (0 rad) when target is ahead of taxi', () => {
    // Taxi at origin, facing +Z (hdg=0). Target directly in +Z.
    const angle = relativeAngleToTarget({ x: 0, z: 0 }, 0, { x: 0, z: 10 });
    expect(angle).toBeCloseTo(0, 5);
  });

  it('relativeAngleToTarget points right (+π/2) when target is to taxi right', () => {
    // Taxi at origin, facing +Z. Target at +X (right side).
    const angle = relativeAngleToTarget({ x: 0, z: 0 }, 0, { x: 10, z: 0 });
    expect(angle).toBeCloseTo(Math.PI / 2, 5);
  });

  it('relativeAngleToTarget points left (-π/2) when target is to taxi left', () => {
    // Taxi at origin, facing +Z. Target at -X (left side).
    const angle = relativeAngleToTarget({ x: 0, z: 0 }, 0, { x: -10, z: 0 });
    expect(angle).toBeCloseTo(-Math.PI / 2, 5);
  });

  it('relativeAngleToTarget accounts for taxi hdg rotation', () => {
    // Taxi facing +X (hdg=π/2). Target at +Z (world forward).
    // Relative to the taxi, +Z world is to the taxi's LEFT → negative angle.
    const angle = relativeAngleToTarget({ x: 0, z: 0 }, Math.PI / 2, { x: 0, z: 10 });
    expect(angle).toBeCloseTo(-Math.PI / 2, 5);
  });
});

describe('geometry — helpers', () => {
  it('distance returns Euclidean distance on XZ plane', () => {
    expect(distance({ x: 0, z: 0 }, { x: 3, z: 4 })).toBeCloseTo(5, 5);
    expect(distance({ x: -1, z: -1 }, { x: 2, z: 3 })).toBeCloseTo(5, 5);
  });

  it('angleDiff returns shortest signed angle difference', () => {
    expect(angleDiff(0.1, 0)).toBeCloseTo(0.1, 5);
    expect(angleDiff(0, 0.1)).toBeCloseTo(-0.1, 5);
    // Crossing the π boundary
    expect(angleDiff(-Math.PI + 0.1, Math.PI - 0.1)).toBeCloseTo(0.2, 3);
  });

  it('clamp restricts value to min/max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('lerp interpolates linearly', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test
```

Expected: FAIL — cannot import `../src/math/geometry.js`.

- [ ] **Step 3: Implement geometry.js**

Create `src/math/geometry.js`:

```javascript
// src/math/geometry.js
// Coordinate and grid math utilities. See CABBIE_SPEC.md §4 for conventions.
// Every heading/direction calculation in the game MUST flow through this module.
// No inline atan2, forward-vector, or isOnRoad logic anywhere else.
//
// Guards pitfalls P1, P2, P3, P4, P5.

import { BLOCK_COUNT, BLOCK_SIZE, ROAD_WIDTH } from '../constants.js';

// §4: hdg=0 faces +Z. forward = (sin(hdg), 0, cos(hdg)).
// Do NOT change the sin/cos ordering. Do NOT negate either term.
export function forwardVector(hdg) {
  return { x: Math.sin(hdg), y: 0, z: Math.cos(hdg) };
}

// Block center: where buildings sit. NEVER spawn entities here (P2).
export function blockCenter(i, j) {
  const stride = BLOCK_SIZE + ROAD_WIDTH;
  return {
    x: (i - (BLOCK_COUNT - 1) / 2) * stride,
    z: (j - (BLOCK_COUNT - 1) / 2) * stride,
  };
}

// Road intersection: valid spawn point for entities.
export function roadIntersection(i, j) {
  const stride = BLOCK_SIZE + ROAD_WIDTH;
  const bc = blockCenter(i, j);
  return {
    x: bc.x + stride / 2,
    z: bc.z + stride / 2,
  };
}

// Is this world position on a drivable road?
// Returns true if within ROAD_WIDTH of a road grid line; false if inside a block.
export function isOnRoad(x, z) {
  const stride = BLOCK_SIZE + ROAD_WIDTH;
  // Align origin so roads fall between blocks: blocks at blockCenter use half-stride offsets,
  // roads at roadIntersection + surrounding strip.
  const offsetX = positiveMod(x + BLOCK_SIZE / 2 + ROAD_WIDTH / 2, stride);
  const offsetZ = positiveMod(z + BLOCK_SIZE / 2 + ROAD_WIDTH / 2, stride);
  return offsetX < ROAD_WIDTH || offsetZ < ROAD_WIDTH;
}

// §4: atan2(dx, dz) — NOT atan2(dz, dx). Matches our hdg convention.
// Returns the absolute-world angle pointing from `from` to `to`.
export function atan2Heading(dx, dz) {
  return Math.atan2(dx, dz);
}

// Returns the angle a HUD arrow should rotate to, in radians,
// such that 0 = "forward from taxi POV".
// Guards P3.
export function relativeAngleToTarget(taxiPos, taxiHdg, targetPos) {
  const dx = targetPos.x - taxiPos.x;
  const dz = targetPos.z - taxiPos.z;
  const absAngle = atan2Heading(dx, dz);
  return wrapAngle(absAngle - taxiHdg);
}

// Shortest signed angle difference, result in [-π, π].
export function angleDiff(target, current) {
  return wrapAngle(target - current);
}

export function wrapAngle(a) {
  while (a > Math.PI)  a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Internal — positive modulo for negative values.
function positiveMod(a, n) {
  return ((a % n) + n) % n;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test
```

Expected: PASS — all ~22 geometry tests green. Existing 68 M0 tests also still pass.

- [ ] **Step 5: Commit**

```powershell
git add src/math/geometry.js tests/geometry.test.js
git commit -m "feat(m1): add geometry module with SPEC §4 coordinate conventions + tests"
```

---

## Task 2: Scene boot — Three.js renderer and canvas

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`

Sets up the 3D rendering context. No game logic yet — just a canvas showing a sky-colored background.

- [ ] **Step 1: Modify index.html**

Replace the entire contents of `index.html` with:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
    <title>Cabbie</title>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0a0a14; color: #fff; font-family: ui-monospace, Menlo, monospace; }
      #app { position: relative; width: 100vw; height: 100vh; }
      #game-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; }
      #hud-root { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
      #hud-root * { pointer-events: auto; }
      .tap-target { min-width: 44px; min-height: 44px; }
    </style>
  </head>
  <body>
    <div id="app">
      <canvas id="game-canvas"></canvas>
      <div id="hud-root"></div>
    </div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Modify main.js boot sequence**

Replace the contents of `src/main.js` with:

```javascript
// src/main.js
// Cabbie app entry. M1 extends M0's boot sequence with a DRIVE button that
// starts a 3D gameplay scene.

import * as THREE from 'three';
import { EventBus } from './eventBus.js';
import { L } from './foundations/Localization.js';
import { Accessibility } from './foundations/Accessibility.js';
import { StyleBible } from './foundations/StyleBible.js';
import { PortalAdapter } from './foundations/PortalAdapter.js';
import { SaveSystem } from './save/SaveSystem.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './constants.js';

let renderer, scene, camera;
let gameLoop = null; // dynamically imported when DRIVE is clicked

async function boot() {
  Accessibility.load();

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

  PortalAdapter.init().catch(e => console.warn('Portal init failed:', e));
  PortalAdapter.trackEvent('session:start', { portal: PortalAdapter.portal, lang });

  setupRenderer();
  renderTitleScreen();
  window.addEventListener('resize', onResize);
}

function setupRenderer() {
  const canvas = document.getElementById('game-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0a14, 1);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);
}

function onResize() {
  if (!renderer || !camera) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function renderTitleScreen() {
  const hud = document.getElementById('hud-root');
  const hasSave = SaveSystem.load() !== null;

  hud.innerHTML = `
    <div id="title-screen" style="
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: ${StyleBible.surface}; color: #fff;
      font-family: ${StyleBible.typography.hud};
      padding: 2rem;
    ">
      <div style="
        font-family: ${StyleBible.typography.transition};
        font-size: calc(3.5rem * ${Accessibility.textScale});
        font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem;
      ">
        ${L.t('start.title')}<span style="color: ${StyleBible.accent}">.</span>
      </div>
      <div style="
        font-size: calc(0.875rem * ${Accessibility.textScale});
        color: rgba(255,255,255,0.6); margin-bottom: 2rem;
        text-align: center; max-width: 30ch;
      ">${L.t('start.subtitle')}</div>
      <button id="drive-btn" class="tap-target" style="
        background: ${StyleBible.accent}; color: ${StyleBible.surface};
        border: none; padding: 14px 32px;
        font-size: calc(0.875rem * ${Accessibility.textScale});
        font-weight: 600; font-family: ${StyleBible.typography.hud};
        letter-spacing: 0.1em; border-radius: 8px; cursor: pointer;
        transition: transform ${StyleBible.uiDuration}ms ${StyleBible.uiEaseCurve};
      ">▶ ${hasSave ? L.t('menu.continue') : L.t('start.button')}</button>
      <div style="
        margin-top: 1.5rem;
        font-size: calc(0.75rem * ${Accessibility.textScale});
        color: rgba(255,255,255,0.3); letter-spacing: 0.05em;
      ">${L.t('start.hint')}</div>
      <div style="
        position: fixed; bottom: 1rem; right: 1rem;
        font-size: 0.7rem; color: rgba(255,255,255,0.25);
        font-family: ${StyleBible.typography.hud};
      ">v0.2 · M1</div>
    </div>
  `;

  const driveBtn = document.getElementById('drive-btn');
  if (driveBtn) {
    driveBtn.addEventListener('click', () => {
      EventBus.emit('app:driveClicked');
      startGameplay();
    });
  }
}

async function startGameplay() {
  // Dismiss title
  const title = document.getElementById('title-screen');
  if (title) title.remove();

  // Lazy-import the game loop so the title screen boots fast
  const { GameLoop } = await import('./game/GameLoop.js');
  gameLoop = new GameLoop({ scene, camera, renderer });
  gameLoop.start();
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
```

Note: `GameLoop` doesn't exist yet — it's created in Task 10. Vite won't crash because the import is lazy (inside a function). Clicking DRIVE will throw until Task 10, which is fine.

- [ ] **Step 3: Verify dev server boots**

```powershell
npm run dev
```

Open `http://localhost:5173`. Expected:
- Title screen renders over a dark canvas
- No console errors (until you click DRIVE)
- Title screen HTML doesn't break on resize

Kill the dev server (Ctrl+C).

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: all M0 + geometry tests still pass. No regressions.

- [ ] **Step 5: Commit**

```powershell
git add index.html src/main.js
git commit -m "feat(m1): scene boot with Three.js renderer + restructured HUD mount"
```

---

## Task 3: City geometry

**Files:**
- Create: `src/world/City.js`
- Create: `tests/city.test.js`

Procedural 7×7 grid of blocks and roads. Uses `geometry.js` for all spatial math. Tests assert P2 guard: nothing spawns inside blocks.

- [ ] **Step 1: Write failing tests**

Create `tests/city.test.js`:

```javascript
import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { City } from '../src/world/City.js';
import { BLOCK_COUNT } from '../src/constants.js';
import { isOnRoad } from '../src/math/geometry.js';

describe('City', () => {
  it('builds BLOCK_COUNT × BLOCK_COUNT blocks', () => {
    const scene = new THREE.Scene();
    const city = new City(scene, 'old-port');
    expect(city.blocks.length).toBe(BLOCK_COUNT * BLOCK_COUNT);
  });

  it('every building is centered at a blockCenter (P2 guard)', () => {
    const scene = new THREE.Scene();
    const city = new City(scene, 'old-port');
    for (const block of city.blocks) {
      // Block centers should NOT be on road
      expect(isOnRoad(block.centerX, block.centerZ)).toBe(false);
    }
  });

  it('pickRandomRoadPoint returns a point on road', () => {
    const scene = new THREE.Scene();
    const city = new City(scene, 'old-port');
    for (let k = 0; k < 50; k++) {
      const p = city.pickRandomRoadPoint();
      expect(isOnRoad(p.x, p.z)).toBe(true);
    }
  });

  it('adds geometry to scene', () => {
    const scene = new THREE.Scene();
    const before = scene.children.length;
    new City(scene, 'old-port');
    expect(scene.children.length).toBeGreaterThan(before);
  });

  it('accepts palette id; does not crash on unknown palette', () => {
    const scene = new THREE.Scene();
    expect(() => new City(scene, 'unknown-district')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test
```

Expected: FAIL — cannot import `../src/world/City.js`.

- [ ] **Step 3: Implement City.js**

Create `src/world/City.js`:

```javascript
// src/world/City.js
// Procedural city grid. 7×7 blocks with roads between.
// Uses geometry.js for all spatial math — no inline coordinate calculations.
// Guards P2: buildings only at blockCenter, never at roadIntersection.

import * as THREE from 'three';
import { BLOCK_COUNT, BLOCK_SIZE, ROAD_WIDTH, DISTRICT_EXTENT } from '../constants.js';
import { blockCenter, roadIntersection, isOnRoad } from '../math/geometry.js';
import { StyleBible } from '../foundations/StyleBible.js';

export class City {
  constructor(scene, paletteId = 'old-port') {
    this.scene = scene;
    this.paletteId = paletteId;
    this.palette = StyleBible.getPalette(paletteId) || StyleBible.getPalette('old-port');
    this.blocks = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.#buildGround();
    this.#buildRoads();
    this.#buildBlocks();
  }

  pickRandomRoadPoint() {
    // Pick a random intersection or mid-road point
    for (let attempts = 0; attempts < 50; attempts++) {
      const i = Math.floor(Math.random() * (BLOCK_COUNT - 1));
      const j = Math.floor(Math.random() * (BLOCK_COUNT - 1));
      const ri = roadIntersection(i, j);
      if (isOnRoad(ri.x, ri.z)) return { x: ri.x, y: 0, z: ri.z };
    }
    // Fallback: center intersection
    const c = roadIntersection(3, 3);
    return { x: c.x, y: 0, z: c.z };
  }

  #buildGround() {
    // Large ground plane beneath everything
    const size = DISTRICT_EXTENT * 2.5;
    const g = new THREE.PlaneGeometry(size, size);
    const m = new THREE.MeshLambertMaterial({ color: 0x2a2a32 });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.05;
    this.group.add(mesh);
  }

  #buildRoads() {
    // Grid of roads: horizontal + vertical strips at every intersection line
    const color = new THREE.Color(0x1a1a22);
    const mat = new THREE.MeshLambertMaterial({ color });
    const stride = BLOCK_SIZE + ROAD_WIDTH;

    // Horizontal roads (running along X) — one per row between blocks
    for (let j = 0; j <= BLOCK_COUNT; j++) {
      const z = (j - BLOCK_COUNT / 2) * stride;
      const geo = new THREE.BoxGeometry(DISTRICT_EXTENT * 2, 0.05, ROAD_WIDTH);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, z);
      this.group.add(mesh);
    }

    // Vertical roads (running along Z) — one per column between blocks
    for (let i = 0; i <= BLOCK_COUNT; i++) {
      const x = (i - BLOCK_COUNT / 2) * stride;
      const geo = new THREE.BoxGeometry(ROAD_WIDTH, 0.05, DISTRICT_EXTENT * 2);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0, 0);
      this.group.add(mesh);
    }
  }

  #buildBlocks() {
    const baseColor = new THREE.Color(this.palette.colors.base);
    const accentColor = new THREE.Color(this.palette.colors.accent);

    for (let i = 0; i < BLOCK_COUNT; i++) {
      for (let j = 0; j < BLOCK_COUNT; j++) {
        const center = blockCenter(i, j);
        this.#buildBlockAt(i, j, center, baseColor, accentColor);
      }
    }
  }

  #buildBlockAt(i, j, center, baseColor, accentColor) {
    // Simple procedural block: 1-3 buildings of varying height
    // Seed by (i,j) for deterministic layout
    const seed = (i * 131 + j * 977) & 0xfffff;
    const rng = seeded(seed);

    const count = 1 + Math.floor(rng() * 3);
    const buildings = [];

    for (let k = 0; k < count; k++) {
      const h = 6 + rng() * 24;
      const w = 12 + rng() * 18;
      const d = 12 + rng() * 18;
      const offsetX = (rng() - 0.5) * (BLOCK_SIZE - w - 4);
      const offsetZ = (rng() - 0.5) * (BLOCK_SIZE - d - 4);

      const color = rng() > 0.3 ? baseColor : accentColor;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshLambertMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(center.x + offsetX, h / 2, center.z + offsetZ);
      this.group.add(mesh);
      buildings.push({ w, h, d, offsetX, offsetZ });
    }

    this.blocks.push({ i, j, centerX: center.x, centerZ: center.z, buildings });
  }
}

// Simple seeded PRNG
function seeded(seed) {
  let s = seed || 1;
  return function () {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) & 0xffffff) / 0x1000000;
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test
```

Expected: PASS — all 5 City tests green.

- [ ] **Step 5: Commit**

```powershell
git add src/world/City.js tests/city.test.js
git commit -m "feat(m1): procedural city geometry with P2-guarded block/road placement"
```

---

## Task 4: District setup (sky, lights, ambient)

**Files:**
- Create: `src/world/District.js`

Minimal scene dressing for M1 — sky dome color, ambient + directional lights tuned to clear-noon. Full weather variety comes in M2.

- [ ] **Step 1: Implement District.js**

Create `src/world/District.js`:

```javascript
// src/world/District.js
// Scene dressing for a single district. M1: sky color, ambient + sun lights.
// M2 extends with weather variations. M4 adds signage and billboards.

import * as THREE from 'three';
import { StyleBible } from '../foundations/StyleBible.js';

export class District {
  constructor(scene, paletteId = 'old-port') {
    this.scene = scene;
    this.paletteId = paletteId;
    this.palette = StyleBible.getPalette(paletteId) || StyleBible.getPalette('old-port');

    this.#applySky();
    this.#addLights();
    this.#addFog();
  }

  #applySky() {
    const skyColor = new THREE.Color(this.palette.colors.sky);
    this.scene.background = skyColor;
  }

  #addLights() {
    // Ambient — soft overall illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Directional — fakes sunlight, no shadows (performance + aesthetic)
    const sun = new THREE.DirectionalLight(0xffe9c4, 0.8);
    sun.position.set(50, 100, 30);
    this.scene.add(sun);

    this.ambient = ambient;
    this.sun = sun;
  }

  #addFog() {
    const skyColor = new THREE.Color(this.palette.colors.sky);
    this.scene.fog = new THREE.Fog(skyColor, 120, 400);
  }
}
```

- [ ] **Step 2: No explicit test required**

District is thin enough that GameLoop integration test (Task 16) covers it. Skip the unit test.

- [ ] **Step 3: Verify tests still pass**

```powershell
npm test
```

Expected: all existing tests still green.

- [ ] **Step 4: Commit**

```powershell
git add src/world/District.js
git commit -m "feat(m1): add District scene dressing with sky + lights + fog"
```

---

## 🛑 GATE 1 — Pre-Taxi reasoning gate

**STOP. Before writing any code in Task 5, Claude Code must produce the following reasoning output as a comment block that will be placed at the top of `src/player/Taxi.js`.**

This is the v1 M3 pattern applied to M1. Articulating the conventions in your own words, writing them down as a code comment, and only THEN implementing is what prevents P1-P5 class bugs from ever being written.

- [ ] **Step 1: Produce the convention statement**

Before writing Task 5's test or implementation, emit the following as a comment block intended for the top of `Taxi.js`. Do not proceed to Task 5 until you've articulated this explicitly in your session:

```javascript
// src/player/Taxi.js
// =============================================================================
// SPEC §4 CONVENTION REMINDER — REVIEWED BEFORE EVERY CODE CHANGE BELOW THIS LINE
// =============================================================================
//
// Heading (hdg) is a scalar angle in radians.
//   - hdg = 0          → facing +Z
//   - hdg = π/2        → facing +X (east / right-of-default)
//   - hdg = π          → facing -Z
//   - hdg = -π/2       → facing -X
//   - hdg increases clockwise when viewed from above
//
// Forward vector:
//   const fwd = { x: Math.sin(hdg), y: 0, z: Math.cos(hdg) };
//   NEVER negate sin or cos. NEVER swap them.
//
// Mesh rotation:
//   mesh.rotation.y = hdg;     // ✅ CORRECT
//   mesh.rotation.y = -hdg;    // ❌ WRONG — causes inverted steering (P1)
//
// Steering:
//   Right-turn input → hdg += turnRate * dt;      // ✅ CORRECT
//   Left-turn input  → hdg -= turnRate * dt;      // ✅ CORRECT
//   Never use the opposite sign for either direction (P4).
//
// Direction math uses geometry.js — do NOT reimplement forwardVector or atan2 here.
// All spawn positions MUST come from roadIntersection() (P2). Never blockCenter().
// =============================================================================
```

**Once this reasoning block is articulated and embedded as the opening of Taxi.js, proceed to Task 5.**

---

## Task 5: Taxi mesh + state

**Files:**
- Create: `src/player/Taxi.js`

Builds the player's taxi: low-poly geometry, position/hdg/speed/fuel/health state, and the `syncMeshToState` method that applies SPEC §4 rotation correctly.

- [ ] **Step 1: Implement Taxi.js with the convention reminder at the top**

Create `src/player/Taxi.js`:

```javascript
// src/player/Taxi.js
// =============================================================================
// SPEC §4 CONVENTION REMINDER — REVIEWED BEFORE EVERY CODE CHANGE BELOW THIS LINE
// =============================================================================
//
// Heading (hdg) is a scalar angle in radians.
//   - hdg = 0          → facing +Z
//   - hdg = π/2        → facing +X (east / right-of-default)
//   - hdg = π          → facing -Z
//   - hdg = -π/2       → facing -X
//   - hdg increases clockwise when viewed from above
//
// Forward vector:
//   const fwd = { x: Math.sin(hdg), y: 0, z: Math.cos(hdg) };
//   NEVER negate sin or cos. NEVER swap them.
//
// Mesh rotation:
//   mesh.rotation.y = hdg;     // ✅ CORRECT
//   mesh.rotation.y = -hdg;    // ❌ WRONG — causes inverted steering (P1)
//
// Steering:
//   Right-turn input → hdg += turnRate * dt;      // ✅ CORRECT
//   Left-turn input  → hdg -= turnRate * dt;      // ✅ CORRECT
//
// Direction math uses geometry.js — do NOT reimplement forwardVector or atan2 here.
// All spawn positions MUST come from roadIntersection() (P2). Never blockCenter().
// =============================================================================

import * as THREE from 'three';
import { forwardVector, roadIntersection } from '../math/geometry.js';

export class Taxi {
  constructor(scene) {
    this.pos = { x: 0, y: 0, z: 0 };
    this.hdg = 0;        // §4: 0 = facing +Z
    this.speed = 0;      // world units / second
    this.fuel = 1.0;     // 0.0 - 1.0
    this.health = 1.0;   // 0.0 - 1.0 (M3 expands damage visuals)

    this.mesh = this.#buildMesh();
    scene.add(this.mesh);

    this.spawnAtRoadIntersection(3, 3);
  }

  forward() {
    return forwardVector(this.hdg);
  }

  syncMeshToState() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.y = this.hdg;   // §4: NO negation
  }

  spawnAtRoadIntersection(i, j) {
    // P2 guard: spawn on a road intersection, not a block center
    const p = roadIntersection(i, j);
    this.pos.x = p.x;
    this.pos.y = 0;
    this.pos.z = p.z;
    this.hdg = 0;
    this.speed = 0;
    this.syncMeshToState();
  }

  #buildMesh() {
    const g = new THREE.Group();

    // Body — yellow, low-poly box
    const bodyGeo = new THREE.BoxGeometry(2.2, 1.2, 4.0);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF5C400 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8;
    g.add(body);

    // Roof sign — slightly darker
    const roofGeo = new THREE.BoxGeometry(0.6, 0.3, 0.9);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xD4A012 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.6, 0.3);
    g.add(roof);

    // Cabin — darker windshield
    const cabinGeo = new THREE.BoxGeometry(2.0, 0.9, 1.8);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x2a2a32 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.3, -0.2);
    g.add(cabin);

    // Four wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 8);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const wheelPositions = [
      { x:  1.0, z:  1.4 },
      { x: -1.0, z:  1.4 },
      { x:  1.0, z: -1.4 },
      { x: -1.0, z: -1.4 },
    ];
    for (const wp of wheelPositions) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;  // Cylinder default is Y-axis; rotate to X-axis
      w.position.set(wp.x, 0.35, wp.z);
      g.add(w);
    }

    return g;
  }
}
```

- [ ] **Step 2: Verify build + test**

```powershell
npm test
```

Expected: all existing tests pass. No new tests for Taxi — it's structural glue that the mini-verify gate will exercise.

- [ ] **Step 3: Commit**

```powershell
git add src/player/Taxi.js
git commit -m "feat(m1): add Taxi class with SPEC §4 convention block + low-poly mesh"
```

---

## Task 6: Controls

**Files:**
- Create: `src/player/Controls.js`

WASD + arrows from M1. Tilt + touchpad scaffolds exist but the thorough mobile testing happens at the verify phase. Input is captured as three normalized values: `throttle` (0..1), `brake` (0..1), `steer` (-1..1).

- [ ] **Step 1: Implement Controls.js**

Create `src/player/Controls.js`:

```javascript
// src/player/Controls.js
// Unified input facade for keyboard, arrow keys, tilt, and touchpad.
// Emits a single { throttle, brake, steer } object per tick.
// Mode persists across sessions via localStorage.

import { Accessibility } from '../foundations/Accessibility.js';
import { clamp } from '../math/geometry.js';

const MODE_KEY = 'cabbie.controlMode';
const VALID_MODES = ['keyboard', 'tilt', 'touchpad'];

export class Controls {
  constructor() {
    this.mode = this.#loadMode();
    this.keys = { w: false, a: false, s: false, d: false, up: false, down: false, left: false, right: false };
    this.tilt = { beta: 0, gamma: 0 };
    this.touchpad = { steer: 0, throttle: 0, brake: 0 };
    this.#bindKeyboard();
    if (this.mode === 'tilt') this.#enableTilt();
    if (this.mode === 'touchpad') this.#bindTouchpad();
  }

  read() {
    switch (this.mode) {
      case 'tilt':     return this.#readTilt();
      case 'touchpad': return { throttle: this.touchpad.throttle, brake: this.touchpad.brake, steer: this.touchpad.steer };
      default:         return this.#readKeyboard();
    }
  }

  setMode(mode) {
    if (!VALID_MODES.includes(mode)) return;
    this.mode = mode;
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
    if (mode === 'tilt') this.#enableTilt();
  }

  #loadMode() {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved && VALID_MODES.includes(saved)) return saved;
    } catch (e) {}
    // Default: keyboard on desktop, touchpad on touch-only
    return ('ontouchstart' in window) ? 'touchpad' : 'keyboard';
  }

  #bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': this.keys.w = true; break;
        case 'a': this.keys.a = true; break;
        case 's': this.keys.s = true; break;
        case 'd': this.keys.d = true; break;
        case 'arrowup':    this.keys.up = true; break;
        case 'arrowdown':  this.keys.down = true; break;
        case 'arrowleft':  this.keys.left = true; break;
        case 'arrowright': this.keys.right = true; break;
      }
    });
    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': this.keys.w = false; break;
        case 'a': this.keys.a = false; break;
        case 's': this.keys.s = false; break;
        case 'd': this.keys.d = false; break;
        case 'arrowup':    this.keys.up = false; break;
        case 'arrowdown':  this.keys.down = false; break;
        case 'arrowleft':  this.keys.left = false; break;
        case 'arrowright': this.keys.right = false; break;
      }
    });
  }

  #readKeyboard() {
    const forward = (this.keys.w || this.keys.up) ? 1 : 0;
    const back    = (this.keys.s || this.keys.down) ? 1 : 0;
    const left    = (this.keys.a || this.keys.left) ? 1 : 0;
    const right   = (this.keys.d || this.keys.right) ? 1 : 0;
    return {
      throttle: forward,
      brake: back,
      steer: right - left,   // §4: right = +1 increases hdg
    };
  }

  #enableTilt() {
    if (typeof DeviceOrientationEvent === 'undefined') return;
    const attach = () => {
      window.addEventListener('deviceorientation', (e) => {
        this.tilt.beta = e.beta || 0;
        this.tilt.gamma = e.gamma || 0;
      });
    };
    // iOS 13+ requires permission request
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then((perm) => {
        if (perm === 'granted') attach();
      }).catch(() => {});
    } else {
      attach();
    }
  }

  #readTilt() {
    // Gamma: left-right tilt, -90 to 90
    const sens = Accessibility.tiltSensitivity;
    const deadZone = Accessibility.tiltDeadZone * 45;  // in degrees
    let raw = this.tilt.gamma;
    if (Math.abs(raw) < deadZone) raw = 0;
    else raw = raw - Math.sign(raw) * deadZone;
    const steer = clamp((raw / 30) * sens, -1, 1);
    // Beta: forward-back tilt — throttle when tilted away (beta > 30°)
    const beta = this.tilt.beta;
    const throttle = beta > 30 ? clamp((beta - 30) / 30, 0, 1) : 0;
    const brake = beta < 15 ? clamp((15 - beta) / 30, 0, 1) : 0;
    return { throttle, brake, steer };
  }

  #bindTouchpad() {
    // Simple: two touch zones — left half steers, right half throttles
    // M1 minimum. Full touch UI comes later.
    const app = document.getElementById('app');
    if (!app) return;
    let activeTouches = new Map();

    const handleTouch = (e) => {
      e.preventDefault();
      this.touchpad.steer = 0;
      this.touchpad.throttle = 0;
      this.touchpad.brake = 0;
      for (const t of e.touches) {
        const isLeft = t.clientX < window.innerWidth / 2;
        if (isLeft) {
          const centerX = window.innerWidth / 4;
          const dx = (t.clientX - centerX) / centerX;
          this.touchpad.steer = clamp(dx, -1, 1);
        } else {
          const centerY = window.innerHeight / 2;
          const dy = (centerY - t.clientY) / (window.innerHeight / 4);
          if (dy > 0) this.touchpad.throttle = clamp(dy, 0, 1);
          else this.touchpad.brake = clamp(-dy, 0, 1);
        }
      }
    };

    app.addEventListener('touchstart', handleTouch, { passive: false });
    app.addEventListener('touchmove', handleTouch, { passive: false });
    app.addEventListener('touchend', handleTouch, { passive: false });
  }
}
```

- [ ] **Step 2: Verify tests still pass**

```powershell
npm test
```

Expected: all existing tests still green.

- [ ] **Step 3: Commit**

```powershell
git add src/player/Controls.js
git commit -m "feat(m1): unified Controls for keyboard/tilt/touchpad with mode persistence"
```

---

## Task 7: Physics

**Files:**
- Create: `src/player/Physics.js`

Arcade-forgiving driving. Uses `forwardVector` from geometry.js — no inline coordinate math. Steering uses `hdg += steer * rate * dt` per §4. Collisions are AABB against block geometry (simplified: push back outside the block if intersecting).

- [ ] **Step 1: Implement Physics.js**

Create `src/player/Physics.js`:

```javascript
// src/player/Physics.js
// Arcade-forgiving driving model. Per SPEC §11 and constants §36.
// Uses geometry.js for all coordinate math. NEVER inlines sin/cos/atan2 here.
// §4 compliance: right-turn → hdg += rate * dt (not -=).

import { forwardVector, clamp, lerp } from '../math/geometry.js';
import {
  MAX_SPEED, ACCEL_RATE, BRAKE_RATE, FRICTION_DECAY,
  TURN_RATE_LOW, TURN_RATE_HIGH, FUEL_BURN_RATE,
  BLOCK_COUNT, BLOCK_SIZE, ROAD_WIDTH,
} from '../constants.js';
import { EventBus } from '../eventBus.js';

// km/h display conversion: 1 world-unit/s ≈ 3.6 km/h (same scale as real meters/second)
const WU_TO_KMH = 3.6;

let lastEmitTime = 0;

export function stepPhysics(taxi, input, dt) {
  // Accelerate / brake
  let accel = 0;
  if (input.throttle > 0) accel += input.throttle * ACCEL_RATE;
  if (input.brake > 0)    accel -= input.brake * BRAKE_RATE;
  // Friction decay
  accel -= FRICTION_DECAY * (taxi.speed / Math.max(1, MAX_SPEED)) * ACCEL_RATE;

  taxi.speed = clamp(taxi.speed + accel * dt, 0, MAX_SPEED);

  // Speed-weighted turn rate (tighter at low speed, looser at high)
  const tNorm = clamp(taxi.speed / MAX_SPEED, 0, 1);
  const turnRate = lerp(TURN_RATE_LOW, TURN_RATE_HIGH, tNorm);

  // §4: steer positive = right = hdg+
  taxi.hdg += input.steer * turnRate * dt;

  // Advance position
  const fwd = forwardVector(taxi.hdg);
  const newX = taxi.pos.x + fwd.x * taxi.speed * dt;
  const newZ = taxi.pos.z + fwd.z * taxi.speed * dt;

  // Simple collision with block AABBs: if inside a block bounding box, push back
  const resolved = resolveBlockCollision(newX, newZ, taxi.pos.x, taxi.pos.z);
  taxi.pos.x = resolved.x;
  taxi.pos.z = resolved.z;
  if (resolved.hit) {
    // Soft bump: halve speed, emit crash event
    const severity = Math.min(0.3, taxi.speed / MAX_SPEED);
    taxi.speed *= 0.4;
    if (severity > 0.05) {
      EventBus.emit('taxi:crashed', { severity, position: { ...taxi.pos } });
    }
  }

  // Fuel burn
  taxi.fuel = Math.max(0, taxi.fuel - FUEL_BURN_RATE * taxi.speed * dt);

  taxi.syncMeshToState();

  // Throttle moved-event emission to ~10Hz
  const now = performance.now();
  if (now - lastEmitTime >= 100) {
    EventBus.emit('taxi:moved', {
      pos: { ...taxi.pos },
      hdg: taxi.hdg,
      speed: taxi.speed,
    });
    lastEmitTime = now;
  }
}

export function speedKmh(taxi) {
  return Math.round(taxi.speed * WU_TO_KMH);
}

// Compute which block (if any) the point is inside, and return a pushed-back position.
function resolveBlockCollision(newX, newZ, oldX, oldZ) {
  const stride = BLOCK_SIZE + ROAD_WIDTH;
  // For each block, check AABB
  for (let i = 0; i < BLOCK_COUNT; i++) {
    for (let j = 0; j < BLOCK_COUNT; j++) {
      const cx = (i - (BLOCK_COUNT - 1) / 2) * stride;
      const cz = (j - (BLOCK_COUNT - 1) / 2) * stride;
      const half = BLOCK_SIZE / 2;
      if (newX > cx - half && newX < cx + half && newZ > cz - half && newZ < cz + half) {
        // Inside block — return previous position
        return { x: oldX, z: oldZ, hit: true };
      }
    }
  }
  return { x: newX, z: newZ, hit: false };
}
```

- [ ] **Step 2: Verify tests still pass**

```powershell
npm test
```

Expected: all existing tests still green.

- [ ] **Step 3: Commit**

```powershell
git add src/player/Physics.js
git commit -m "feat(m1): arcade Physics stepper with speed-weighted turn + block AABB collision"
```

---

## Task 8: Damage stub

**Files:**
- Create: `src/player/Damage.js`

M1 minimum: subscribe to `taxi:crashed`, decrement health, emit `taxi:healthChanged`. Visual damage tiers land in M3.

- [ ] **Step 1: Implement Damage.js**

Create `src/player/Damage.js`:

```javascript
// src/player/Damage.js
// M1 stub: health field tracking and crash event handler.
// M3 will extend with visual damage tiers (dents, smoke, broken headlights) and the revive-ad flow.

import { EventBus } from '../eventBus.js';

export class Damage {
  constructor(taxi) {
    this.taxi = taxi;
    this.unsubscribe = EventBus.on('taxi:crashed', (e) => this.apply(e.severity));
  }

  apply(severity) {
    const before = this.taxi.health;
    this.taxi.health = Math.max(0, this.taxi.health - severity);
    EventBus.emit('taxi:healthChanged', { value: this.taxi.health, delta: this.taxi.health - before });
  }

  dispose() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/player/Damage.js
git commit -m "feat(m1): Damage stub with health tracking (M3 extends visuals)"
```

---

## Task 9: FollowCamera

**Files:**
- Create: `src/camera/FollowCamera.js`

Third-person rig. Damped lerp to target position and lookAt. Uses `forwardVector` from geometry.js. No shake yet. Respects `Accessibility.reducedMotion` — though M1 doesn't exercise shake, the hook is in place.

- [ ] **Step 1: Implement FollowCamera.js**

Create `src/camera/FollowCamera.js`:

```javascript
// src/camera/FollowCamera.js
// Third-person behind-cab camera. See SPEC §12.
// Camera points the direction the taxi is FACING (hdg), not the direction it's MOVING (P5 guard).
// Uses forwardVector from geometry.js.

import * as THREE from 'three';
import { forwardVector, lerp } from '../math/geometry.js';
import { Accessibility } from '../foundations/Accessibility.js';
import {
  CAM_HEIGHT, CAM_BACK, CAM_LOOK_AHEAD, CAM_LOOK_HEIGHT,
  CAM_FOV, CAM_PULL_BACK_EXTRA, CAM_PULL_BACK_TIGHTEN,
  CAM_DAMP_POS, CAM_DAMP_LOOK, MAX_SPEED,
} from '../constants.js';

export class FollowCamera {
  constructor(threeCamera, taxi) {
    this.cam = threeCamera;
    this.taxi = taxi;

    // Internal state for damped interpolation
    this.currentPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    this.cam.fov = CAM_FOV;
    this.cam.updateProjectionMatrix();

    // Initialize to taxi's position instantly
    this.resetFollowState();
  }

  resetFollowState() {
    // P9 guard: on spawn/teleport, reset dampened state
    const fwd = forwardVector(this.taxi.hdg);
    this.currentPos.set(
      this.taxi.pos.x - fwd.x * CAM_BACK,
      this.taxi.pos.y + CAM_HEIGHT,
      this.taxi.pos.z - fwd.z * CAM_BACK,
    );
    this.currentLookAt.set(
      this.taxi.pos.x + fwd.x * CAM_LOOK_AHEAD,
      this.taxi.pos.y + CAM_LOOK_HEIGHT,
      this.taxi.pos.z + fwd.z * CAM_LOOK_AHEAD,
    );
    this.cam.position.copy(this.currentPos);
    this.cam.lookAt(this.currentLookAt);
  }

  update(dt) {
    // Dynamic pull-back at high speed, tighten at low speed
    const tNorm = Math.min(1, this.taxi.speed / MAX_SPEED);
    let extraBack = 0;
    if (tNorm > 0.63) extraBack = CAM_PULL_BACK_EXTRA;
    else if (tNorm < 0.05) extraBack = -CAM_PULL_BACK_TIGHTEN;

    const fwd = forwardVector(this.taxi.hdg);
    const tx = this.taxi.pos.x - fwd.x * (CAM_BACK + extraBack);
    const ty = this.taxi.pos.y + CAM_HEIGHT;
    const tz = this.taxi.pos.z - fwd.z * (CAM_BACK + extraBack);

    const lookX = this.taxi.pos.x + fwd.x * CAM_LOOK_AHEAD;
    const lookY = this.taxi.pos.y + CAM_LOOK_HEIGHT;
    const lookZ = this.taxi.pos.z + fwd.z * CAM_LOOK_AHEAD;

    // Damped lerp
    this.currentPos.x = lerp(this.currentPos.x, tx, CAM_DAMP_POS);
    this.currentPos.y = lerp(this.currentPos.y, ty, CAM_DAMP_POS);
    this.currentPos.z = lerp(this.currentPos.z, tz, CAM_DAMP_POS);

    this.currentLookAt.x = lerp(this.currentLookAt.x, lookX, CAM_DAMP_LOOK);
    this.currentLookAt.y = lerp(this.currentLookAt.y, lookY, CAM_DAMP_LOOK);
    this.currentLookAt.z = lerp(this.currentLookAt.z, lookZ, CAM_DAMP_LOOK);

    this.cam.position.copy(this.currentPos);
    this.cam.lookAt(this.currentLookAt);
  }

  shake(intensity, duration) {
    // Stub — M3 implements.
    if (Accessibility.reducedMotion) return;
    // TODO M3: controlled offset decay
  }
}
```

- [ ] **Step 2: Verify tests still pass**

```powershell
npm test
```

Expected: all existing tests still green.

- [ ] **Step 3: Commit**

```powershell
git add src/camera/FollowCamera.js
git commit -m "feat(m1): FollowCamera with damped lerp + §4-compliant forward tracking"
```

---

## Task 10: GameLoop — minimum playable boot

**Files:**
- Create: `src/game/GameLoop.js`

Orchestrates the game scene for the first time. Creates District + City + Taxi + Controls + Physics + Damage + FollowCamera, spins up a requestAnimationFrame loop, renders. No fares, no HUD, no traffic yet — those land in tasks 12-16. This task's goal is a drivable taxi.

- [ ] **Step 1: Implement GameLoop.js**

Create `src/game/GameLoop.js`:

```javascript
// src/game/GameLoop.js
// Orchestrates the gameplay scene. Owns the requestAnimationFrame tick
// and the per-frame update fan-out to every system.

import { District } from '../world/District.js';
import { City } from '../world/City.js';
import { Taxi } from '../player/Taxi.js';
import { Controls } from '../player/Controls.js';
import { Damage } from '../player/Damage.js';
import { FollowCamera } from '../camera/FollowCamera.js';
import { stepPhysics } from '../player/Physics.js';
import { EventBus } from '../eventBus.js';

export class GameLoop {
  constructor({ scene, camera, renderer }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Set up world
    this.district = new District(scene, 'old-port');
    this.city = new City(scene, 'old-port');

    // Player
    this.taxi = new Taxi(scene);
    this.controls = new Controls();
    this.damage = new Damage(this.taxi);
    this.followCamera = new FollowCamera(camera, this.taxi);

    this.lastTime = performance.now();
    this.running = false;

    // Will be populated by later tasks
    this.traffic = null;
    this.fareSystem = null;
    this.hud = null;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    EventBus.emit('game:started');
    this.#tick();
  }

  stop() {
    this.running = false;
  }

  #tick = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);  // clamp at 100ms
    this.lastTime = now;

    // Read input
    const input = this.controls.read();

    // Step systems
    stepPhysics(this.taxi, input, dt);
    if (this.traffic) this.traffic.update(dt, this.taxi);
    if (this.fareSystem) this.fareSystem.tick(dt, this.taxi);
    this.followCamera.update(dt);
    if (this.hud) this.hud.update(this.taxi, this.fareSystem);

    // Render
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.#tick);
  };
}
```

- [ ] **Step 2: Sanity check — dev server**

```powershell
npm run dev
```

Open `http://localhost:5173`. Click **DRIVE**.

**What should happen:**
- Title screen disappears
- You see a procedural city: roads, blocks with random buildings, a sky
- A yellow taxi sits at the center intersection
- Pressing **W** or **↑** → taxi moves forward
- Pressing **A**/**←** → turns left
- Pressing **D**/**→** → turns right
- Pressing **S**/**↓** → brakes / reverses
- Camera follows smoothly from behind the taxi
- No console errors

**What is NOT expected yet (these come later):**
- No HUD (speed readout, cash, etc. — Task 14)
- No traffic — Task 11
- No fare pins — Task 12

Kill the dev server (Ctrl+C).

- [ ] **Step 3: Run tests**

```powershell
npm test
```

Expected: all existing tests still green.

- [ ] **Step 4: Commit**

```powershell
git add src/game/GameLoop.js
git commit -m "feat(m1): GameLoop orchestrates district/city/taxi/camera — drivable taxi"
```

---

## 🛑 GATE 2 — Mini-verify playtest

**STOP. Claude Code does NOT proceed to Task 11 until Kim confirms the mini-verify passes.**

This is the single most important playtest checkpoint of M1. Running it catches P1/P2/P3/P4/P5 bugs in isolation before Traffic introduces a second moving-entity system. A regression caught here costs one task to fix; a regression caught after Task 11 costs days.

- [ ] **Step 1: Claude Code stops and waits**

Claude Code posts the following message to Kim:

> **Gate 2 — Mini-verify requested.** Please run `npm run dev` and test the following checklist. Paste the results back, or just say "verified" if all pass.
>
> **Mini-verify checklist:**
> 1. DRIVE button on title screen starts the scene.
> 2. Taxi is visible at the center of the city, with buildings and roads around it.
> 3. **Press `D` (or right arrow).** Taxi turns RIGHT.
> 4. **Press `A` (or left arrow).** Taxi turns LEFT.
> 5. **Press `W` (or up arrow).** Taxi moves in the direction it's FACING.
> 6. If you drive in a circle to the right, the camera stays behind the taxi correctly. No inversion, no flipping.
> 7. Driving into a building stops the taxi (doesn't phase through).
> 8. No errors in the browser devtools console.
>
> If any of these fail, DO NOT CONTINUE. Describe what went wrong — we'll diagnose before moving on. All pass → reply "verified" and I'll proceed to Task 11 (Traffic).

- [ ] **Step 2: Wait for Kim's response**

Do not start Task 11 until Kim replies. If Kim reports a failure, STOP and collaborate with Kim to diagnose — almost certainly a coordinate-convention bug worth catching now.

---

## Task 11: Traffic system

**Files:**
- Create: `src/world/Traffic.js`

NPC traffic: 10 cars, basic straight-road driving, turning at intersections. Uses the same `forwardVector` from geometry.js — if the mini-verify passed for Taxi, Traffic inherits correctness by reuse. No near-miss detection yet (M2).

- [ ] **Step 1: Implement Traffic.js**

Create `src/world/Traffic.js`:

```javascript
// src/world/Traffic.js
// Basic NPC traffic for M1. 10 cars driving straight along roads,
// turning randomly at intersections. Uses geometry.js for all coordinate math
// — SAME conventions as player (P1 guard by reuse).
// M2 adds density scaling + near-miss detection.

import * as THREE from 'three';
import { forwardVector } from '../math/geometry.js';
import {
  BLOCK_COUNT, BLOCK_SIZE, ROAD_WIDTH, TRAFFIC_SPAWN_RADIUS,
  TRAFFIC_DESPAWN_RADIUS, TRAFFIC_DENSITY_BASE,
} from '../constants.js';

const TRAFFIC_COLORS = [0xC4613A, 0x3A7FC4, 0x2F6B4A, 0x8B3A8B, 0xC4A23A];
const TRAFFIC_SPEED = 12;  // world units / second — slower than max player speed

export class Traffic {
  constructor(scene) {
    this.scene = scene;
    this.cars = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.#spawnInitial();
  }

  update(dt, player) {
    for (const car of this.cars) {
      // Advance along facing direction
      const fwd = forwardVector(car.hdg);
      car.pos.x += fwd.x * TRAFFIC_SPEED * dt;
      car.pos.z += fwd.z * TRAFFIC_SPEED * dt;
      car.mesh.position.set(car.pos.x, car.pos.y, car.pos.z);
      car.mesh.rotation.y = car.hdg;  // §4: NO negation

      // Simple turn-at-intersection: when crossing grid line, 50% chance to turn
      const stride = BLOCK_SIZE + ROAD_WIDTH;
      const ix = Math.round(car.pos.x / stride);
      const iz = Math.round(car.pos.z / stride);
      const distToGridX = Math.abs(car.pos.x - ix * stride);
      const distToGridZ = Math.abs(car.pos.z - iz * stride);
      if (!car.turnedAt || (distToGridX < 1 && distToGridZ < 1 && !car.recentTurn)) {
        car.recentTurn = (distToGridX < 1 && distToGridZ < 1);
        if (car.recentTurn && Math.random() < 0.5) {
          car.hdg += (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 2);
        }
      }
      if (distToGridX > 2 && distToGridZ > 2) car.recentTurn = false;

      // Despawn if too far from player
      const dx = car.pos.x - player.pos.x;
      const dz = car.pos.z - player.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > TRAFFIC_DESPAWN_RADIUS) {
        this.#respawn(car, player);
      }
    }
  }

  #spawnInitial() {
    for (let i = 0; i < TRAFFIC_DENSITY_BASE / 2; i++) {
      this.cars.push(this.#spawnCar({ x: 0, z: 0 }));
    }
  }

  #spawnCar(nearPos) {
    const mesh = this.#buildCarMesh();
    // Spawn on a random grid line, somewhere near but not on top of nearPos
    const stride = BLOCK_SIZE + ROAD_WIDTH;
    const xi = Math.round(nearPos.x / stride) + (Math.floor(Math.random() * 10) - 5);
    const zi = Math.round(nearPos.z / stride) + (Math.floor(Math.random() * 10) - 5);
    const axis = Math.random() < 0.5 ? 'x' : 'z';
    let pos, hdg;
    if (axis === 'x') {
      pos = { x: xi * stride, y: 0, z: zi * stride + (Math.random() - 0.5) * (stride - ROAD_WIDTH - 4) };
      hdg = Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      pos = { x: xi * stride + (Math.random() - 0.5) * (stride - ROAD_WIDTH - 4), y: 0, z: zi * stride };
      hdg = Math.random() < 0.5 ? 0 : Math.PI;
    }
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.y = hdg;
    this.group.add(mesh);
    return { mesh, pos, hdg, recentTurn: false };
  }

  #respawn(car, player) {
    this.group.remove(car.mesh);
    const idx = this.cars.indexOf(car);
    if (idx >= 0) this.cars.splice(idx, 1);
    this.cars.push(this.#spawnCar(player.pos));
  }

  #buildCarMesh() {
    const g = new THREE.Group();
    const color = TRAFFIC_COLORS[Math.floor(Math.random() * TRAFFIC_COLORS.length)];

    const bodyGeo = new THREE.BoxGeometry(2.0, 1.1, 3.6);
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    g.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.8, 0.8, 1.6);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x1a1a22 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.2, -0.2);
    g.add(cabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 6);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const positions = [
      { x:  0.9, z:  1.2 }, { x: -0.9, z:  1.2 },
      { x:  0.9, z: -1.2 }, { x: -0.9, z: -1.2 },
    ];
    for (const p of positions) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(p.x, 0.3, p.z);
      g.add(w);
    }

    return g;
  }
}
```

- [ ] **Step 2: Wire Traffic into GameLoop**

Open `src/game/GameLoop.js`. Find the `constructor` — add a Traffic import and instantiation:

At the top:
```javascript
import { Traffic } from '../world/Traffic.js';
```

In the constructor, after the player setup and before `this.lastTime = performance.now();`, add:

```javascript
    this.traffic = new Traffic(scene);
```

Remove the stub: delete the line `this.traffic = null;` at the bottom of the constructor (no longer a stub).

- [ ] **Step 3: Manual verify**

```powershell
npm run dev
```

Open the app, click DRIVE. Expected:
- Same scene as before plus ~10 NPC cars moving through the streets
- Cars move along roads and occasionally turn at intersections
- Cars despawn far from the player and respawn nearer
- No console errors

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: all existing tests still green.

- [ ] **Step 5: Commit**

```powershell
git add src/world/Traffic.js src/game/GameLoop.js
git commit -m "feat(m1): basic Traffic system — 10 NPC cars using SPEC §4 conventions"
```

---

## Task 12: FareSystem — state machine with tests

**Files:**
- Create: `src/game/FareSystem.js`
- Create: `tests/fareSystem.test.js`

Pure state machine for fare lifecycle: `idle` → `pickupSpawned` → `boarded` → `completed` → `idle`. Structural tests verify transitions. Spatial proximity triggers transitions against the player.

- [ ] **Step 1: Write failing tests**

Create `tests/fareSystem.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FareSystem } from '../src/game/FareSystem.js';
import { EventBus } from '../src/eventBus.js';

describe('FareSystem state machine', () => {
  beforeEach(() => { EventBus._reset(); });

  it('starts in idle state with no active fare', () => {
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 0, y: 0, z: 0 }) });
    expect(fs.state).toBe('idle');
    expect(fs.active).toBe(null);
  });

  it('spawnPickup transitions to pickupSpawned', () => {
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 10, y: 0, z: 20 }) });
    fs.spawnPickup();
    expect(fs.state).toBe('pickupSpawned');
    expect(fs.pickupPin).toBeTruthy();
    expect(fs.pickupPin.pos.x).toBe(10);
  });

  it('emits fare:pickupSpawned with expected payload', () => {
    const spy = vi.fn();
    EventBus.on('fare:pickupSpawned', spy);
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 10, y: 0, z: 20 }) });
    fs.spawnPickup();
    expect(spy).toHaveBeenCalled();
    const payload = spy.mock.calls[0][0];
    expect(payload.fareId).toBeTruthy();
    expect(payload.pos.x).toBe(10);
  });

  it('board transitions to boarded and emits fare:boarded', () => {
    const spy = vi.fn();
    EventBus.on('fare:boarded', spy);
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 10, y: 0, z: 20 }) });
    fs.spawnPickup();
    fs.board();
    expect(fs.state).toBe('boarded');
    expect(fs.active).toBeTruthy();
    expect(fs.dropoffPin).toBeTruthy();
    expect(spy).toHaveBeenCalled();
  });

  it('complete transitions boarded → idle and emits fare:completed with tip', () => {
    const spy = vi.fn();
    EventBus.on('fare:completed', spy);
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 0, y: 0, z: 0 }) });
    fs.spawnPickup();
    fs.board();
    // Force a known distance between pickup and dropoff for deterministic tip
    fs.active.pickupPos = { x: 0, y: 0, z: 0 };
    fs.active.dropoffPos = { x: 0, y: 0, z: 100 };
    fs.dropoffPin = { pos: fs.active.dropoffPos };
    fs.complete();
    expect(fs.state).toBe('idle');
    expect(fs.active).toBe(null);
    expect(fs.dropoffPin).toBe(null);
    expect(spy).toHaveBeenCalled();
    const payload = spy.mock.calls[0][0];
    expect(payload.tip).toBeGreaterThan(0);
  });

  it('tick() auto-spawns a pickup when idle', () => {
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 0, y: 0, z: 0 }) });
    fs.tick(0.016, { pos: { x: 100, y: 0, z: 100 }, speed: 0 });
    expect(fs.state).toBe('pickupSpawned');
  });

  it('tick() auto-boards when player is near pickup and slow', () => {
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 5, y: 0, z: 5 }) });
    fs.spawnPickup();
    fs.tick(0.016, { pos: { x: 6, y: 0, z: 6 }, speed: 0.5 });
    expect(fs.state).toBe('boarded');
  });

  it('tick() does NOT auto-board when player is moving fast', () => {
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 5, y: 0, z: 5 }) });
    fs.spawnPickup();
    fs.tick(0.016, { pos: { x: 6, y: 0, z: 6 }, speed: 20 });
    expect(fs.state).toBe('pickupSpawned');
  });

  it('tick() auto-completes when player near dropoff and slow', () => {
    const fs = new FareSystem({ pickRandomRoadPoint: () => ({ x: 10, y: 0, z: 10 }) });
    fs.spawnPickup();
    fs.board();
    const dropoff = fs.dropoffPin.pos;
    fs.tick(0.016, { pos: { x: dropoff.x + 1, y: 0, z: dropoff.z + 1 }, speed: 0.5 });
    expect(fs.state).toBe('idle');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test
```

Expected: FAIL — cannot import `../src/game/FareSystem.js`.

- [ ] **Step 3: Implement FareSystem.js**

Create `src/game/FareSystem.js`:

```javascript
// src/game/FareSystem.js
// Fare lifecycle: idle → pickupSpawned → boarded → completed → idle.
// No comfort meter yet (M2). No rival-steal (M3). No scripted special fares (P1 item, deferred).

import { EventBus } from '../eventBus.js';
import { distance } from '../math/geometry.js';
import {
  FARE_BASE_RATE, PICKUP_RADIUS, DROPOFF_RADIUS,
  BOARD_SPEED_MAX, DROPOFF_SPEED_MAX, DESTINATION_TYPES,
} from '../constants.js';

let nextId = 1;
const MAX_ATTEMPTS_FOR_DEST = 10;
const MIN_FARE_DIST = 60;

export class FareSystem {
  constructor(city) {
    this.city = city;
    this.state = 'idle';           // 'idle' | 'pickupSpawned' | 'boarded'
    this.active = null;
    this.pickupPin = null;
    this.dropoffPin = null;
  }

  tick(dt, player) {
    if (this.state === 'idle') {
      this.spawnPickup();
      return;
    }
    if (this.state === 'pickupSpawned') {
      const d = distance(player.pos, this.pickupPin.pos);
      if (d < PICKUP_RADIUS && player.speed < BOARD_SPEED_MAX) {
        this.board();
      }
      return;
    }
    if (this.state === 'boarded') {
      const d = distance(player.pos, this.dropoffPin.pos);
      if (d < DROPOFF_RADIUS && player.speed < DROPOFF_SPEED_MAX) {
        this.complete();
      }
      return;
    }
  }

  spawnPickup() {
    if (this.state !== 'idle') return;
    const pos = this.city.pickRandomRoadPoint();
    const destType = DESTINATION_TYPES[Math.floor(Math.random() * DESTINATION_TYPES.length)];
    this.pickupPin = {
      fareId: nextId++,
      pos,
      destType,
      dialogKey: `fare.pickup.${destType}`,
    };
    this.state = 'pickupSpawned';
    EventBus.emit('fare:pickupSpawned', { fareId: this.pickupPin.fareId, pos: { ...pos }, reward: 'pending' });
  }

  board() {
    if (this.state !== 'pickupSpawned') return;
    const dropoffPos = this.#pickDropoff(this.pickupPin.pos);
    this.active = {
      fareId: this.pickupPin.fareId,
      destType: this.pickupPin.destType,
      pickupPos: { ...this.pickupPin.pos },
      dropoffPos: { ...dropoffPos },
    };
    this.dropoffPin = { pos: dropoffPos };
    this.pickupPin = null;
    this.state = 'boarded';
    EventBus.emit('fare:boarded', { fareId: this.active.fareId, destinationPos: { ...dropoffPos } });
  }

  complete() {
    if (this.state !== 'boarded' || !this.active) return;
    const dist = distance(this.active.pickupPos, this.active.dropoffPos);
    const tip = Math.max(5, Math.floor(FARE_BASE_RATE * dist));
    const payload = {
      fareId: this.active.fareId,
      tip,
      comfortFinal: 1.0,   // M2 wires real comfort
    };
    this.active = null;
    this.dropoffPin = null;
    this.state = 'idle';
    EventBus.emit('fare:completed', payload);
  }

  #pickDropoff(pickupPos) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_FOR_DEST; attempt++) {
      const candidate = this.city.pickRandomRoadPoint();
      if (distance(pickupPos, candidate) > MIN_FARE_DIST) return candidate;
    }
    // Fallback
    return this.city.pickRandomRoadPoint();
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test
```

Expected: PASS — all 9 FareSystem tests green.

- [ ] **Step 5: Commit**

```powershell
git add src/game/FareSystem.js tests/fareSystem.test.js
git commit -m "feat(m1): FareSystem state machine with idle→pickup→board→complete transitions"
```

---

## Task 13: Fare pin visuals + GameLoop wiring

**Files:**
- Modify: `src/game/FareSystem.js`
- Modify: `src/game/GameLoop.js`

Add 3D pin meshes to the FareSystem so the pickup and dropoff locations are visible. Wire the system into GameLoop with a cash-tracking accumulator.

- [ ] **Step 1: Extend FareSystem with visual pins**

Edit `src/game/FareSystem.js`. At the top, add:

```javascript
import * as THREE from 'three';
```

Modify the constructor signature and body:

```javascript
export class FareSystem {
  constructor(city, scene) {
    this.city = city;
    this.scene = scene;
    this.state = 'idle';
    this.active = null;
    this.pickupPin = null;
    this.dropoffPin = null;
    this.pickupMesh = null;
    this.dropoffMesh = null;
  }
```

Update `spawnPickup()` — after setting `this.pickupPin`, add:

```javascript
    if (this.scene) {
      this.pickupMesh = this.#buildPin(0x00FF88);
      this.pickupMesh.position.set(pos.x, 2, pos.z);
      this.scene.add(this.pickupMesh);
    }
```

Update `board()` — after setting `this.state = 'boarded'`, add:

```javascript
    if (this.scene) {
      if (this.pickupMesh) { this.scene.remove(this.pickupMesh); this.pickupMesh = null; }
      this.dropoffMesh = this.#buildPin(0xFF3366);
      this.dropoffMesh.position.set(dropoffPos.x, 2, dropoffPos.z);
      this.scene.add(this.dropoffMesh);
    }
```

Update `complete()` — before the `EventBus.emit`, add:

```javascript
    if (this.scene && this.dropoffMesh) {
      this.scene.remove(this.dropoffMesh);
      this.dropoffMesh = null;
    }
```

Add a new private method at the bottom of the class (before the closing `}`):

```javascript
  #buildPin(color) {
    const g = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 4, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2;
    g.add(pole);
    const flagGeo = new THREE.ConeGeometry(1.0, 2.0, 6);
    const flagMat = new THREE.MeshLambertMaterial({ color });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.y = 5;
    g.add(flag);
    // Float animation driven by Date.now in consumers; for M1, leave static.
    return g;
  }
```

Update tests to accept the new constructor signature — they should still pass because `scene` is optional. Open `tests/fareSystem.test.js` — verify all existing tests still instantiate `new FareSystem(mockCity)` (no `scene` argument), which is fine because we defaulted behavior on `if (this.scene)`.

- [ ] **Step 2: Wire FareSystem in GameLoop**

Edit `src/game/GameLoop.js`. At the top:

```javascript
import { FareSystem } from './FareSystem.js';
```

In the constructor, after `this.traffic = new Traffic(scene);`:

```javascript
    this.fareSystem = new FareSystem(this.city, scene);
    this.cash = 0;

    EventBus.on('fare:completed', (e) => {
      this.cash += e.tip;
      EventBus.emit('cash:changed', { value: this.cash, delta: e.tip });
    });
```

Remove the stub line `this.fareSystem = null;` at the bottom of the constructor.

Also import EventBus at the top if not already:

```javascript
import { EventBus } from '../eventBus.js';
```

(Verify whether it's already imported — the line `EventBus.emit('game:started');` at bottom of `start()` requires it. If that line exists, the import is present.)

- [ ] **Step 3: Manual verify**

```powershell
npm run dev
```

Click DRIVE. Expected:
- A green pin appears somewhere on the map (the pickup)
- Drive to the pin and stop near it — the pin disappears and a red pin appears elsewhere (the dropoff)
- Drive to the red pin and stop near it — it disappears
- A new green pin appears (next fare)
- No visual HUD yet but the mechanic works

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: all tests still pass, including the 9 FareSystem tests.

- [ ] **Step 5: Commit**

```powershell
git add src/game/FareSystem.js src/game/GameLoop.js
git commit -m "feat(m1): fare pickup/dropoff pins + GameLoop cash accumulator"
```

---

## Task 14: HUD root + cash readout + speed readout

**Files:**
- Create: `src/hud/HUD.js`
- Create: `src/hud/SpeedReadout.js`
- Create: `src/hud/CashReadout.js`

DOM-based overlay HUD. Respects Accessibility.textScale. Localized via `L.t()`.

- [ ] **Step 1: Implement SpeedReadout.js**

Create `src/hud/SpeedReadout.js`:

```javascript
// src/hud/SpeedReadout.js
import { L } from '../foundations/Localization.js';
import { StyleBible } from '../foundations/StyleBible.js';
import { Accessibility } from '../foundations/Accessibility.js';
import { speedKmh } from '../player/Physics.js';

export class SpeedReadout {
  constructor(root) {
    this.el = document.createElement('div');
    this.el.id = 'hud-speed';
    this.el.setAttribute('role', 'status');
    this.el.setAttribute('aria-live', 'off');
    this.el.style.cssText = `
      position: absolute; top: 14px; left: 14px;
      background: rgba(8, 8, 18, 0.82);
      border: 0.5px solid ${StyleBible.border};
      border-radius: 10px;
      padding: 9px 14px;
      font-family: ${StyleBible.typography.hud};
      pointer-events: none;
    `;
    root.appendChild(this.el);
  }

  update(taxi) {
    const scale = Accessibility.textScale;
    const kmh = speedKmh(taxi);
    this.el.innerHTML = `
      <div style="font-size: calc(9px * ${scale}); color: ${StyleBible.accent}; letter-spacing: 0.12em; margin-bottom: 2px;">${L.t('hud.speed')}</div>
      <div style="font-size: calc(24px * ${scale}); color: #fff; font-weight: 500; line-height: 1;">${kmh}</div>
      <div style="font-size: calc(8px * ${scale}); color: #444; margin-top: 1px;">KM/H</div>
    `;
  }
}
```

- [ ] **Step 2: Implement CashReadout.js**

Create `src/hud/CashReadout.js`:

```javascript
// src/hud/CashReadout.js
import { L } from '../foundations/Localization.js';
import { StyleBible } from '../foundations/StyleBible.js';
import { Accessibility } from '../foundations/Accessibility.js';
import { EventBus } from '../eventBus.js';

export class CashReadout {
  constructor(root) {
    this.cash = 0;
    this.el = document.createElement('div');
    this.el.id = 'hud-cash';
    this.el.style.cssText = `
      position: absolute; top: 14px; left: 50%;
      transform: translateX(-50%);
      background: rgba(8, 8, 18, 0.82);
      border: 0.5px solid ${StyleBible.border};
      border-radius: 10px;
      padding: 9px 20px;
      font-family: ${StyleBible.typography.hud};
      text-align: center;
      pointer-events: none;
    `;
    root.appendChild(this.el);

    EventBus.on('cash:changed', ({ value }) => {
      this.cash = value;
      this.render();
    });

    this.render();
  }

  render() {
    const scale = Accessibility.textScale;
    this.el.innerHTML = `
      <div style="font-size: calc(9px * ${scale}); color: ${StyleBible.accent}; letter-spacing: 0.12em; margin-bottom: 2px;">${L.t('hud.cash')}</div>
      <div style="font-size: calc(20px * ${scale}); color: #fff; font-weight: 500; line-height: 1;">$${this.cash}</div>
    `;
  }
}
```

- [ ] **Step 3: Implement HUD.js root container**

Create `src/hud/HUD.js`:

```javascript
// src/hud/HUD.js
// Root DOM overlay. Owns each HUD widget and delegates update().
import { SpeedReadout } from './SpeedReadout.js';
import { CashReadout } from './CashReadout.js';
import { Accessibility } from '../foundations/Accessibility.js';

export class HUD {
  constructor() {
    this.root = document.getElementById('hud-root');
    if (!this.root) throw new Error('HUD: #hud-root not found');

    this.speed = new SpeedReadout(this.root);
    this.cash = new CashReadout(this.root);
    // DirectionArrow added in Task 15

    this.applyA11y();
    Accessibility.subscribe(() => this.applyA11y());
  }

  applyA11y() {
    this.root.style.setProperty('--hud-text-scale', Accessibility.textScale);
    this.root.classList.toggle('high-contrast', Accessibility.highContrast);
  }

  update(taxi, fareSystem) {
    this.speed.update(taxi);
    // cash updates via EventBus, no-op here
    // arrow updates in Task 15
  }

  dispose() {
    // M1 doesn't dispose (game loop runs until tab close), but provided for completeness
    this.root.innerHTML = '';
  }
}
```

- [ ] **Step 4: Wire HUD into GameLoop**

Edit `src/game/GameLoop.js`. At the top:

```javascript
import { HUD } from '../hud/HUD.js';
```

In the constructor, after `this.fareSystem = new FareSystem(...)`:

```javascript
    this.hud = new HUD();
```

Remove the stub line `this.hud = null;`.

- [ ] **Step 5: Manual verify**

```powershell
npm run dev
```

Click DRIVE. Expected:
- HUD shows: speed readout top-left, cash top-center
- Speed updates as you accelerate
- Driving to a fare pickup, then dropoff, increments cash visibly
- No console errors

- [ ] **Step 6: Run tests**

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```powershell
git add src/hud/HUD.js src/hud/SpeedReadout.js src/hud/CashReadout.js src/game/GameLoop.js
git commit -m "feat(m1): HUD with speed + cash readouts, a11y-aware, localized"
```

---

## Task 15: DirectionArrow with tests

**Files:**
- Create: `src/hud/DirectionArrow.js`
- Create: `tests/directionArrow.test.js`

Indicator showing direction to current fare target (pickup or dropoff). Uses `relativeAngleToTarget` from geometry.js — all math tested upstream. This task tests the angle→CSS-transform conversion.

- [ ] **Step 1: Write failing tests**

Create `tests/directionArrow.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { angleToTransformDegrees } from '../src/hud/DirectionArrow.js';

describe('DirectionArrow angle conversion', () => {
  it('converts 0 radians to 0 degrees', () => {
    expect(angleToTransformDegrees(0)).toBeCloseTo(0, 5);
  });

  it('converts π/2 radians to 90 degrees', () => {
    expect(angleToTransformDegrees(Math.PI / 2)).toBeCloseTo(90, 5);
  });

  it('converts -π/2 radians to -90 degrees', () => {
    expect(angleToTransformDegrees(-Math.PI / 2)).toBeCloseTo(-90, 5);
  });

  it('converts π radians to 180 degrees', () => {
    expect(angleToTransformDegrees(Math.PI)).toBeCloseTo(180, 5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test
```

Expected: FAIL — cannot import from `DirectionArrow.js`.

- [ ] **Step 3: Implement DirectionArrow.js**

Create `src/hud/DirectionArrow.js`:

```javascript
// src/hud/DirectionArrow.js
// Fare direction indicator. Reads current fare target from FareSystem.
// Uses geometry.relativeAngleToTarget — no inline atan2.

import { L } from '../foundations/Localization.js';
import { StyleBible } from '../foundations/StyleBible.js';
import { Accessibility } from '../foundations/Accessibility.js';
import { relativeAngleToTarget, distance } from '../math/geometry.js';

// Pure function so tests can exercise it directly
export function angleToTransformDegrees(rad) {
  return (rad * 180) / Math.PI;
}

export class DirectionArrow {
  constructor(root) {
    this.el = document.createElement('div');
    this.el.id = 'hud-arrow';
    this.el.style.cssText = `
      position: absolute; bottom: 24px; left: 50%;
      transform: translateX(-50%);
      background: rgba(8, 8, 18, 0.82);
      border: 0.5px solid ${StyleBible.border};
      border-radius: 10px;
      padding: 10px 16px;
      font-family: ${StyleBible.typography.hud};
      text-align: center;
      display: none;
      pointer-events: none;
    `;
    this.el.innerHTML = `
      <div id="hud-arrow-glyph" style="font-size: 24px; line-height: 1; color: ${StyleBible.accent}; transition: transform 120ms linear;">↑</div>
      <div id="hud-arrow-distance" style="font-size: 11px; color: #aaa; margin-top: 4px;"></div>
    `;
    root.appendChild(this.el);
    this.glyph = this.el.querySelector('#hud-arrow-glyph');
    this.distanceEl = this.el.querySelector('#hud-arrow-distance');
  }

  update(taxi, fareSystem) {
    const target = fareSystem.dropoffPin?.pos || fareSystem.pickupPin?.pos;
    if (!target) {
      this.el.style.display = 'none';
      return;
    }
    this.el.style.display = 'block';

    const angle = relativeAngleToTarget(taxi.pos, taxi.hdg, target);
    const degrees = angleToTransformDegrees(angle);
    this.glyph.style.transform = `rotate(${degrees}deg)`;

    const dist = Math.round(distance(taxi.pos, target));
    this.distanceEl.textContent = L.t('hud.distance', { m: dist });

    // Accessibility: scale font size
    const scale = Accessibility.textScale;
    this.glyph.style.fontSize = `calc(24px * ${scale})`;
    this.distanceEl.style.fontSize = `calc(11px * ${scale})`;
  }
}
```

- [ ] **Step 4: Wire DirectionArrow into HUD**

Edit `src/hud/HUD.js`. Add import at top:

```javascript
import { DirectionArrow } from './DirectionArrow.js';
```

In the constructor, after `this.cash = new CashReadout(this.root);`:

```javascript
    this.arrow = new DirectionArrow(this.root);
```

Update the `update` method:

```javascript
  update(taxi, fareSystem) {
    this.speed.update(taxi);
    if (fareSystem) this.arrow.update(taxi, fareSystem);
  }
```

- [ ] **Step 5: Run tests to verify they pass**

```powershell
npm test
```

Expected: all tests pass, including 4 new DirectionArrow tests.

- [ ] **Step 6: Manual verify**

```powershell
npm run dev
```

Click DRIVE. Expected:
- Arrow appears at bottom center pointing toward the active fare pin
- Arrow rotates as you turn — if you turn to face the pin, arrow points up
- Distance label updates as you get closer
- When no fare is active (brief moment between complete and next spawn), arrow hides

- [ ] **Step 7: Commit**

```powershell
git add src/hud/DirectionArrow.js src/hud/HUD.js tests/directionArrow.test.js
git commit -m "feat(m1): DirectionArrow with §4-compliant relative-angle math"
```

---

## Task 16: Add M1 string keys to all 5 language files

**Files:**
- Modify: `src/strings/en.json`, `fr.json`, `de.json`, `pt-BR.json`, `es.json`

All HUD strings already exist in M0's seed. Verify they do, add any that are missing. Then run the key-coverage test to ensure parity.

- [ ] **Step 1: Audit existing keys**

Open `src/strings/en.json`. Verify these keys exist:

- `hud.speed` ✓ (from M0)
- `hud.cash` ✓ (from M0)
- `hud.distance` ✓ (from M0)
- `fare.pickup.bar` ✓ (from M0)
- `fare.completed` ✓ (from M0)

These were all seeded in M0. M1 doesn't introduce any new keys. This task is therefore a no-op IF the key-coverage test still passes.

- [ ] **Step 2: Run key-coverage test**

```powershell
npm test -- localizationKeys
```

Expected: PASS — all 4 non-English languages have parity with English.

If a failure somehow surfaces, add the missing key to the appropriate language file. Otherwise this task is complete.

- [ ] **Step 3: Commit only if changes were needed**

If no changes were required, skip the commit and note in the session output: "Task 16 — no string changes required, coverage test green."

---

## Task 17: Performance check

**Files:**
- Modify: none (verification task)

SPEC §34 M1 requires ≥55 FPS desktop, ≥40 FPS midrange mobile. We add a lightweight FPS counter to confirm.

- [ ] **Step 1: Add a minimal FPS overlay to HUD**

Edit `src/hud/HUD.js`. Add to the constructor, after `this.arrow = ...`:

```javascript
    this.fpsEl = document.createElement('div');
    this.fpsEl.id = 'hud-fps';
    this.fpsEl.style.cssText = `
      position: absolute; bottom: 8px; left: 8px;
      font-family: ${StyleBible.typography.hud};
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      pointer-events: none;
    `;
    this.root.appendChild(this.fpsEl);
    this.fpsSamples = [];
    this.fpsLastTime = performance.now();
```

Add import at top:

```javascript
import { StyleBible } from '../foundations/StyleBible.js';
```

Update the `update` method to include FPS measurement:

```javascript
  update(taxi, fareSystem) {
    this.speed.update(taxi);
    if (fareSystem) this.arrow.update(taxi, fareSystem);
    this.#updateFps();
  }

  #updateFps() {
    const now = performance.now();
    const dt = now - this.fpsLastTime;
    this.fpsLastTime = now;
    this.fpsSamples.push(1000 / dt);
    if (this.fpsSamples.length > 60) this.fpsSamples.shift();
    const avg = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;
    this.fpsEl.textContent = `FPS ${Math.round(avg)}`;
  }
```

- [ ] **Step 2: Dev-build and measure**

```powershell
npm run dev
```

Drive around for ~30 seconds. Check the FPS readout bottom-left. Expected:
- Desktop: 55+ (typically 60+ on any modern laptop)
- If you have a mobile device handy and want to check: open `http://YOUR-LOCAL-IP:5173/` from the phone on same Wi-Fi. Expect 40+ on a midrange phone.

If FPS is below target, note it but don't block the plan — further optimization is M4 work. Most likely cause would be the procedural building count (if it's excessive). Block count is fixed at 7×7=49, so that's unlikely.

- [ ] **Step 3: Commit**

```powershell
git add src/hud/HUD.js
git commit -m "feat(m1): add lightweight FPS overlay for performance verification"
```

---

## Task 18: M1 acceptance verification + docs + tag + deploy

**Files:**
- Create: `docs/M1_COMPLETION.md`
- Modify: `CABBIE_SPEC.md`

Final task. Verify every SPEC §34 M1 acceptance criterion, update the spec, tag the commit, deploy to Pages.

- [ ] **Step 1: Run full test suite**

```powershell
npm test
```

Expected: ALL tests pass. Count should be ~100+ (68 from M0 + ~35 from M1's geometry/city/fareSystem/directionArrow tests).

- [ ] **Step 2: Verify all 4 portal builds**

```powershell
rm -r -force dist
npm run build:dev
npm run build:crazygames
npm run build:newgrounds
npm run build:itch
```

Expected: 4 builds succeed, each producing a non-empty `dist/<portal>/`.

- [ ] **Step 3: Final playtest — walk every M1 acceptance criterion**

Run `npm run dev` and open the app. Test each criterion:

- [ ] **Taxi spawns at road intersection (not inside building) — P2:** Click DRIVE. Taxi is visible on a road. Not stuck inside a building.
- [ ] **WASD + arrows + tilt + touchpad all work; persists across reload:** Drive with WASD. Drive with arrows. On a phone or with devtools device emulator, test tilt and touchpad if accessible. Persistence: switch modes (when settings UI lands — currently manual only, may skip if no UI yet), reload, check localStorage manually (`localStorage.getItem('cabbie.controlMode')`).
- [ ] **Fare pickup spawns, arrow points correctly — §4, P3:** Wait for a pickup pin. Arrow at bottom of HUD points toward it. As you turn, arrow rotates to remain accurate.
- [ ] **Board pickup when taxi stops near pin:** Drive to the pin, stop → pin disappears, dropoff pin appears.
- [ ] **Dropoff awards cash:** Drive to dropoff pin, stop → cash counter increments.
- [ ] **Steering: right-turn increases heading — §4, P1:** Press D. Taxi turns right. Forward vector points in the direction the taxi is facing. No inversion.
- [ ] **Camera uses lookAt, no coordinate bugs:** Drive in a full circle. Camera always stays behind the taxi, tracking smoothly. No flipping, no inversion.
- [ ] **FPS ≥55 on desktop, ≥40 midrange mobile:** Check FPS overlay. Desktop target: 55+. Note measured value.
- [ ] **Zero silent console errors during full fare cycle:** Open devtools console. Drive a full fare: pickup → board → dropoff → completion → next spawn. Console shows only your own `[telemetry]` logs, no errors or warnings.
- [ ] **All strings localized via L.t():** `grep -r '"[A-Z][a-z]' src/hud src/ui 2>/dev/null | grep -v 'L.t\|//\|comment'` should return nothing significant. All text flows through L.t. (Optional thoroughness check; trust the reviewed code if unsure.)

If any criterion fails, fix before continuing. Otherwise proceed.

- [ ] **Step 4: Write M1 completion report**

Create `docs/M1_COMPLETION.md`:

```markdown
# M1 — Act 1 Core Driving · Completion Report

**Completed:** [date]
**Sessions:** [n]
**Spec reference:** `CABBIE_SPEC.md` §34 M1
**Live build:** https://kimwpetersen.github.io/Cabbie/

## Acceptance criteria status

- [x] Taxi spawns at road intersection (not inside building) — P2 guarded
- [x] WASD + arrows + tilt + touchpad all work; persists across reload
- [x] Fare pickup spawns, arrow points correctly — §4, P3 guarded
- [x] Board pickup when taxi stops near pin
- [x] Dropoff awards cash
- [x] Steering: right-turn increases heading — §4, P1 guarded
- [x] Camera uses lookAt, no coordinate bugs — P5 guarded
- [x] FPS ≥55 on desktop, ≥40 midrange mobile — measured: [Xdesktop / Ymobile or N/A]
- [x] Zero silent console errors during full fare cycle
- [x] All strings localized via L.t() — no inline user-facing text

## Gates passed

- Gate 1 (pre-Taxi reasoning): §4 convention block embedded at top of Taxi.js before any implementation
- Gate 2 (mini-verify playtest): Kim verified steering direction, forward motion, camera tracking after Taxi+Controls+Camera landed, before Traffic was introduced

## Deferred items (carry to appropriate milestone)

- Comfort meter — M2
- Weather variety (only clear-noon in M1) — M2
- Day cycle and expenses — M2
- SaveSystem integration beyond M0 stubs — M2
- Damage visuals (dents, smoke, revive UI) — M3
- Near-miss detection — M2

## New pitfalls discovered

[None so far / list P13+ if discovered. Add to CABBIE_SPEC.md §35 if any.]

## Test stats

- Total tests: [n]  
- M1 new tests: [n] (geometry, city, fareSystem, directionArrow)
- All portal builds succeeded: dev, crazygames, newgrounds, itch
- Final LOC: [n]
- Git commits this milestone: [n]

## Performance measurements

- Desktop FPS (during active driving with 10 traffic NPCs): [X]
- Mobile FPS (if measured): [Y]
- Bundle size (dev build, gzipped): [see `npm run build:dev` output]

## SPEC updates

- §34 M1 acceptance criteria: all [x] complete
- §34 M1 status changed to ✅ COMPLETE
- §35 pitfall catalog: [unchanged / P13+ added]
```

Fill in the bracketed values.

- [ ] **Step 5: Update SPEC**

Modify `CABBIE_SPEC.md`:

1. In §34, find the `### M1 — Act 1 Core Driving` heading. Change to:

```markdown
### M1 — Act 1 Core Driving ✅ COMPLETE
```

2. Change all `- [ ]` items under M1 to `- [x]`.

3. In the milestone timeline table at §34, change M1's status from "Pending" to "✅ Complete".

4. If any new pitfalls were discovered during M1, add them as P13+ in §35 with symptom/cause/fix/rule format.

- [ ] **Step 6: Deploy to Pages**

```powershell
npm run deploy
```

Wait for "Published". Visit https://kimwpetersen.github.io/Cabbie/ and verify the live site now has the drivable taxi, not just the title screen.

- [ ] **Step 7: Commit, tag, push**

```powershell
git add CABBIE_SPEC.md docs/M1_COMPLETION.md
git commit -m "docs(m1): mark M1 complete in spec + write completion report"
git tag m1-complete
git push
git push origin m1-complete
```

- [ ] **Step 8: Update README milestone checkbox**

Edit `README.md`. Change:

```markdown
- [ ] M1 — Act 1 Core Driving
```

to:

```markdown
- [x] M1 — Act 1 Core Driving
```

Also update the Status line near the top:

```markdown
**Status:** M0 ✅ · M1 ✅ · M2 (Act 1 polish) in progress
```

Commit:

```powershell
git add README.md
git commit -m "docs: mark M1 complete in README"
git push
```

---

## M1 complete. Next steps

Before M2:

1. Kim reviews `docs/M1_COMPLETION.md` and confirms all criteria met.
2. Kim plays the live build at https://kimwpetersen.github.io/Cabbie/ end-to-end.
3. Optional: share the live link anywhere (social, devlog, community). It's the first externally-meaningful Cabbie artifact.
4. Return here to brainstorm M2 (Act 1 polish: comfort meter, weather variety, day cycle, save integration, audio bootstrapping).

M2 kickoff prompt for Claude Code:

> "Read `CABBIE_PRD.md` and `CABBIE_SPEC.md` in full. Confirm M0 and M1 status via `docs/M0_COMPLETION.md` and `docs/M1_COMPLETION.md`. Request the M2 implementation plan and execute task-by-task."

---

*End of M1 Implementation Plan. The SPEC is the authority; this plan is the contract for M1 specifically.*
