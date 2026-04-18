# CABBIE — Technical Specification
**Version 2.0 | Clean-Rebuild Canonical Reference**
*Authored April 17, 2026 · Companion to CABBIE_PRD.md*

---

## About this version

**v2.0 is a clean-rebuild spec.** It supersedes v1.2 and assumes an empty `src/` directory. The M1 and M2 implementations from v1.x are archived in git history (`v1-archive` branch) for reference, but no code from the old codebase is carried into v2.0. All modules are built fresh against this specification, with PRD-level concerns (full mobile parity, WCAG 2.2 AA, i18n, portal builds, AdManager, Telemetry) architected in from M0 rather than retrofitted.

**What this spec is:** the authoritative implementation reference. Architecture, coordinate conventions, module paths, event names, constants, pitfall catalog. Read fresh at the start of every Claude Code session. Updated after every milestone.

**What this spec is not:** the product reference. Product-level decisions (target player, scope priorities, success metrics, risks, roadmap) live in `CABBIE_PRD.md`. This spec implements the PRD; it does not duplicate it.

**Reading order for Claude Code:** §4 (Coordinate System) → §5 (Event Bus) → §35 (Pitfalls) → milestone-specific sections. Always consult §35 before writing any module that touches previously-debugged territory.

---

## Table of Contents

**Part I — Foundations**
1. Project Overview
2. Tech Stack
3. Project Structure
4. Coordinate System (CRITICAL)
5. Event Bus Architecture
6. Style Bible Reference
7. Accessibility Architecture
8. Localization Architecture
9. Portal Build Abstraction

**Part II — World & Player**
10. World & City Generation
11. Player / Taxi System
12. Camera System
13. Traffic System
14. Fare System
15. HUD System
16. Police System
17. Comfort & Reputation Systems
18. Collectibles System

**Part III — Act 2 Systems**
19. Dispatch Board
20. Driver System
21. Vehicle Fleet & Upgrade Tree
22. Contract System
23. Yellow Dog Rival System

**Part IV — Act 3 Systems**
24. CabbieApp Platform
25. Saturation & Market Share
26. Sabotage & Counter-tools
27. CabbieTV Finale
28. End-state & Legacy Mode

**Part V — Cross-cutting Modules**
29. Save System
30. Audio System
31. Visual Effects & Post-processing
32. Telemetry Module
33. Ad Manager Module

**Part VI — Delivery**
34. Milestone Plan (M0–M9)
35. Known Pitfalls & Rules
36. Constants Reference
37. Appendices

---

# Part I — Foundations

## 1. Project Overview

**Game:** Cabbie — browser-based arcade driving game with 3-act business-empire progression.
**Engine:** Three.js r128 on vanilla JS ES modules, Vite bundler.
**Target:** CrazyGames, Newgrounds, itch.io. Full mobile/tablet/desktop parity.
**Production model:** Claude Code as sole engineer, AI-first asset pipelines, Kim as curator/director.
**Product reference:** `CABBIE_PRD.md` — read it before making architectural choices. This spec implements the PRD.

Design pillars (from PRD §2), referenced here so every module decision can pattern-match:
1. Feel good to drive, always.
2. Progression earned, not granted.
3. Do right by players, get rewarded fairly.
4. AI-first production as deliberate experiment.

## 2. Tech Stack

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| Bundler | Vite | latest | Fast HMR, zero-config, ESM native |
| 3D Engine | Three.js | **r128** (pinned) | CDN-reliable, broad browser support, stable API |
| Language | JavaScript | ES2020+ | No TypeScript — reduces build complexity for Claude Code |
| Styling | CSS custom properties | — | Theme consistency, no preprocessor |
| State | Plain JS modules + event bus | — | No framework |
| Save | localStorage JSON | — | Single slot, schema versioned |
| Audio | Web Audio API | — | Stem-based adaptive mixer |
| Analytics | Portal SDK + abstraction | Per-portal | See §32 |
| Ads | Portal SDK + abstraction | Per-portal | See §33 |
| i18n | Custom flat-file | — | `strings/{lang}.json`, see §8 |

### Dev setup

```bash
npm create vite@latest cabbie -- --template vanilla
cd cabbie
npm install three
npm install --save-dev vite-plugin-dynamic-import
npm run dev        # localhost:5173
```

### Build targets

```bash
npm run build:dev          # GitHub Pages / self-host (no SDK, no ads)
npm run build:crazygames   # CrazyGames SDK
npm run build:newgrounds   # Newgrounds SDK
npm run build:itch         # itch.io (tip-jar mode, no SDK)
```

Build target selection driven by `VITE_PORTAL` env var. See §9.

### Browser compatibility targets

- Chrome/Edge ≥100, Firefox ≥100, Safari ≥15.4
- iOS Safari ≥15.4, Chrome Android ≥100
- WebGL 1.0 required. WebGL 2 features avoided (portal consistency).

## 3. Project Structure

```
cabbie/
├── CABBIE_PRD.md              # Product reference (doesn't change often)
├── CABBIE_SPEC.md              # This file — implementation reference (living doc)
├── LAUNCH_WAIVERS.md           # Created pre-launch if needed (see PRD §24)
├── index.html                  # Root HTML entry
├── package.json
├── vite.config.js              # Per-portal build config
├── public/
│   ├── fonts/                  # DM Mono, Georgia fallback
│   └── assets/
│       ├── models/             # Vehicle geometry (generated or imported)
│       ├── textures/           # Shared atlases
│       ├── audio/              # Music stems, SFX, ambience
│       ├── portraits/          # Driver & passenger art
│       └── cinematics/         # Intro/transition/finale panels
├── src/
│   ├── main.js                 # App entry, scene setup, game loop
│   ├── constants.js            # ALL tunable numbers — see §36
│   ├── eventBus.js             # Pub/sub (see §5)
│   ├── foundations/
│   │   ├── Accessibility.js    # a11y settings + feature flags
│   │   ├── Localization.js     # strings lookup, ICU plural
│   │   ├── StyleBible.js       # AI-pipeline style-lock references
│   │   └── PortalAdapter.js    # Per-portal SDK facade
│   ├── world/
│   │   ├── City.js             # 7x7 grid, road/block geometry
│   │   ├── District.js         # Palette, signage, billboards
│   │   ├── Weather.js          # Daily skin rotation
│   │   ├── Traffic.js          # NPC cars
│   │   ├── Pedestrians.js      # Sidewalk NPCs
│   │   └── Collectibles.js     # Coffee, fuel, wallets, etc.
│   ├── player/
│   │   ├── Taxi.js             # Player vehicle
│   │   ├── Controls.js         # Keyboard / tilt / touchpad
│   │   ├── Physics.js          # Arcade driving model
│   │   └── Damage.js           # Dents, smoke, revive
│   ├── camera/
│   │   └── FollowCamera.js     # Third-person rig
│   ├── game/
│   │   ├── FareSystem.js       # Pickup/dropoff loop
│   │   ├── PoliceSystem.js     # Pursuit AI
│   │   ├── Comfort.js          # Passenger satisfaction meter
│   │   ├── Reputation.js       # Star rating 0.0-5.0
│   │   ├── DaySystem.js        # Day/night, expenses, rollover
│   │   └── ActGate.js          # Act unlock conditions
│   ├── fleet/                  # Act 2 only — disabled until M5
│   │   ├── DispatchBoard.js
│   │   ├── Driver.js
│   │   ├── DriverRoster.js
│   │   ├── VehicleFleet.js
│   │   ├── Contracts.js
│   │   ├── Morale.js
│   │   └── YellowDog.js
│   ├── empire/                 # Act 3 only — disabled until M7
│   │   ├── CabbieApp.js
│   │   ├── Saturation.js
│   │   ├── Sabotage.js
│   │   ├── CabbieTV.js
│   │   ├── Finale.js
│   │   └── LegacyMode.js
│   ├── hud/
│   │   ├── HUD.js              # Root HUD container
│   │   ├── SpeedReadout.js
│   │   ├── CashReadout.js
│   │   ├── ComfortBar.js
│   │   ├── FuelBar.js
│   │   ├── ReputationStars.js
│   │   ├── DirectionArrow.js
│   │   ├── BribeButton.js
│   │   └── ModeToggle.js       # Act 2+ drive/manage toggle
│   ├── ui/
│   │   ├── StartScreen.js
│   │   ├── DaySummary.js
│   │   ├── ActTransition.js
│   │   ├── Settings.js
│   │   ├── TooltipCoach.js
│   │   └── Menu.js
│   ├── audio/
│   │   ├── AudioSystem.js      # Web Audio graph
│   │   ├── MusicStems.js       # Adaptive crossfade stems
│   │   └── SFX.js              # Short sound cues
│   ├── fx/
│   │   ├── PostProcessing.js   # Bloom, chromatic aberration
│   │   ├── FloatingText.js     # +$5 popups
│   │   └── Shake.js            # Camera shake (respects reduced-motion)
│   ├── save/
│   │   └── SaveSystem.js       # Single-slot localStorage + schema version
│   ├── telemetry/
│   │   └── Telemetry.js        # Event emitter to portal SDK
│   ├── ads/
│   │   └── AdManager.js        # Portal-agnostic ad facade
│   └── strings/
│       ├── en.json             # Canonical — authored first
│       ├── fr.json
│       ├── de.json
│       ├── pt-BR.json
│       └── es.json
└── dist/                        # Build output
```

### Module boundary rules

- **Foundations modules have no game-logic imports.** `Accessibility`, `Localization`, `StyleBible`, `PortalAdapter` are pure infrastructure consumed by other modules.
- **No cross-Act imports.** Act 1 modules (`game/*`) never import from `fleet/*` or `empire/*`. Act 2 modules can import Act 1 modules but not Act 3. Act 3 can import from either.
- **All game state flows through the event bus.** Direct module-to-module calls are read-only (e.g., `Comfort.currentValue()`); mutations broadcast events.
- **constants.js is the only source of tunable numbers.** Never inline a number in game logic; always import from constants.

## 4. Coordinate System (CRITICAL)

**Every bug in the v1 prototype phase traces back to coordinate convention ambiguity. This section is authoritative. Read it before writing any code that touches headings, rotations, or direction vectors. If you find yourself unsure about a sign, re-read this section — do not guess.**

### World axes

Three.js uses a **right-handed coordinate system**:

- **+X** points east (right in default camera view)
- **+Y** points up (sky)
- **+Z** points south (toward the camera in default view)

**The ground plane is XZ.** Y is always "up". Vehicle movement happens on the XZ plane with Y fixed at the vehicle's ride height.

### Heading convention

The player's heading (`hdg`) is a scalar angle in radians representing the vehicle's facing direction on the ground plane.

- `hdg = 0` → vehicle faces **+Z** (south)
- `hdg = π/2` → vehicle faces **+X** (east)
- `hdg = π` → vehicle faces **-Z** (north)
- `hdg = -π/2` → vehicle faces **-X** (west)

Hdg increases **clockwise when viewed from above**.

### The forward vector

The forward unit vector for a given heading is:

```javascript
const forward = {
  x: Math.sin(hdg),
  y: 0,
  z: Math.cos(hdg)
};
```

**Why `sin` on X and `cos` on Z, not the other way around.** Because hdg=0 means facing +Z. At hdg=0, we want forward=(0,0,1). sin(0)=0, cos(0)=1 → correct.

At hdg=π/2 (facing +X): sin(π/2)=1, cos(π/2)=0 → forward=(1,0,0). Correct.

### Applying rotation to Three.js mesh

Three.js `Object3D.rotation.y` is a rotation about the +Y axis. **The sign convention matches our hdg directly — no negation.**

```javascript
// ✅ CORRECT
taxi.mesh.rotation.y = hdg;

// ❌ WRONG — this caused "left feels like right" in v1 prototype
taxi.mesh.rotation.y = -hdg;
```

**Proof:** at hdg=π/2, forward is +X (east). A rotation of π/2 about +Y applied to a mesh pointing +Z natively rotates it to point +X. `rotation.y = hdg = π/2` gives us mesh pointing +X. Matches forward. Correct.

### Steering

When the player presses "turn right" (D / right arrow / tilt right):

```javascript
// ✅ CORRECT — turning right INCREASES hdg (clockwise-from-above)
hdg += turnRate * dt;

// ❌ WRONG — this caused steering inversion in v1 prototype
hdg -= turnRate * dt;
```

**The rule:** right-turn = hdg-increase. Left-turn = hdg-decrease. This matches the clockwise-from-above convention of the heading itself.

### Direction arrow to a target

When computing the HUD direction arrow pointing to a target position:

```javascript
const dx = target.x - taxi.x;
const dz = target.z - taxi.z;
const absoluteAngle = Math.atan2(dx, dz);  // angle in same convention as hdg
const relativeAngle = absoluteAngle - hdg;  // where to point on HUD
```

**The critical detail:** `Math.atan2(dx, dz)` — not `atan2(dz, dx)`. In Three.js's coordinate system with our hdg convention, the "first argument" is the component along +X (sine-multiplied) and the "second" is along +Z (cosine-multiplied). This matches `Math.atan2(sin, cos)` which returns the angle of the (sin, cos) vector — i.e., our heading convention.

### Applying to traffic and AI vehicles

**Every AI vehicle uses the same convention as the player.** Traffic cars, rival taxis, police cars — all use:

```javascript
mesh.rotation.y = car.hdg;   // NOT -car.hdg
```

**Pitfall:** if you see code using `-hdg` or `+=` for right-turn or `atan2(dz, dx)`, it is wrong. Fix it at the call site. Do not propagate the error.

### Camera coordinate independence

**The camera has its own sign conventions that are INDEPENDENT of the player's hdg.** When computing camera position relative to the taxi:

```javascript
// Camera sits BEHIND the taxi, meaning opposite the forward vector
const camPos = {
  x: taxi.x - forward.x * CAM_BACK_DISTANCE,
  y: taxi.y + CAM_HEIGHT,
  z: taxi.z - forward.z * CAM_BACK_DISTANCE
};
camera.position.set(camPos.x, camPos.y, camPos.z);
camera.lookAt(taxi.x, taxi.y + CAM_LOOK_HEIGHT, taxi.z);
```

**Never use `camera.rotation.y` directly.** Always use `camera.lookAt()`. This prevents P1/P2-class bugs where camera Euler angles get confused with player heading.

### Quick-reference — sign convention summary

| Operation | Correct form |
|---|---|
| Forward vector | `(sin(hdg), 0, cos(hdg))` |
| Mesh rotation | `mesh.rotation.y = hdg` |
| Right-turn | `hdg += rate * dt` |
| Left-turn | `hdg -= rate * dt` |
| atan2 for direction | `Math.atan2(dx, dz)` |
| Relative angle | `atan2(dx, dz) - hdg` |
| Camera position | `taxi - forward * dist` |
| Camera orient | `camera.lookAt(taxi)` |

**If any module diverges from this table, the module is wrong.**

## 5. Event Bus Architecture

Cabbie's modules communicate via a pub/sub event bus (`src/eventBus.js`). This pattern was validated in v1 M2 and is carried forward.

### API

```javascript
// eventBus.js
const listeners = new Map();

export const EventBus = {
  on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => listeners.get(event).delete(handler); // unsubscribe
  },
  emit(event, payload) {
    const handlers = listeners.get(event);
    if (!handlers) return;
    for (const h of handlers) {
      try { h(payload); }
      catch (e) { console.error(`EventBus handler error for ${event}:`, e); }
    }
  },
  off(event, handler) {
    listeners.get(event)?.delete(handler);
  }
};
```

### Event naming convention

Events are namespaced with a colon: `domain:verb[Past]`.

- ✅ `fare:boarded`, `fare:completed`, `police:chaseStarted`
- ❌ `board_fare`, `fareStart`, `PoliceChase`

### Canonical event map (M1–M9)

#### Act 1 events

| Event | Payload | Emitters | Listeners |
|---|---|---|---|
| `app:ready` | `{}` | main | all systems |
| `input:mode` | `{mode: 'keyboard'\|'tilt'\|'touchpad'}` | Controls | HUD, Settings |
| `taxi:moved` | `{pos, hdg, speed}` | Taxi (throttled 10Hz) | Camera, Audio, Traffic |
| `taxi:crashed` | `{severity, position}` | Physics | Damage, Comfort, Reputation, Audio |
| `fare:pickupSpawned` | `{fareId, pos, reward}` | FareSystem | HUD, RivalTaxi |
| `fare:boarded` | `{fareId, destinationPos}` | FareSystem | Comfort, HUD |
| `fare:completed` | `{fareId, tip, comfortFinal}` | FareSystem | main, Reputation, HUD, Telemetry |
| `fare:canceled` | `{fareId, reason}` | FareSystem | HUD |
| `comfort:changed` | `{value}` | Comfort | HUD |
| `collectible:collected` | `{type, payload}` | Collectibles | main, HUD, Audio |
| `police:chaseStarted` | `{}` | PoliceSystem | HUD, Audio, RivalTaxi |
| `police:chaseEnded` | `{reason}` | PoliceSystem | HUD, Audio |
| `police:finePaid` | `{amount}` | PoliceSystem | main, Reputation |
| `reputation:changed` | `{stars, delta, reason}` | Reputation | HUD, SaveSystem |
| `cash:changed` | `{value, delta}` | main | HUD, SaveSystem |
| `fuel:changed` | `{value}` | Taxi | HUD |
| `day:started` | `{day, weather}` | DaySystem | Weather, Traffic, all |
| `day:ended` | `{day, revenue, expenses, rating}` | DaySystem | DaySummary, main |
| `day:resume` | `{}` | DaySummary | DaySystem, main |
| `weather:changed` | `{type}` | Weather | Physics, Audio, FX |
| `actGate:progress` | `{cash, rating, required}` | ActGate | ActGate UI |
| `actGate:unlocked` | `{act}` | ActGate | main, ActTransition |

#### Act 2 events (added at M5)

| Event | Payload | Emitters | Listeners |
|---|---|---|---|
| `mode:changed` | `{mode: 'drive'\|'manage'}` | ModeToggle | main, HUD, DispatchBoard |
| `driver:hired` | `{driverId, tier, stats}` | DriverRoster | main, DispatchBoard, Telemetry |
| `driver:fired` | `{driverId, reason}` | DriverRoster | main, DispatchBoard |
| `driver:quit` | `{driverId, reason}` | Morale | main, DispatchBoard |
| `driver:assigned` | `{driverId, districtId}` | DispatchBoard | DriverRoster |
| `driver:morale` | `{driverId, value}` | Morale | DispatchBoard |
| `vehicle:purchased` | `{vehicleId, class}` | VehicleFleet | main, Garage |
| `vehicle:breakdown` | `{vehicleId, cause}` | VehicleFleet | main, DispatchBoard, Reputation |
| `vehicle:upgraded` | `{vehicleId, system, level}` | VehicleFleet | Garage |
| `contract:won` | `{contractId, type}` | Contracts | main, Telemetry |
| `contract:slaWarning` | `{contractId}` | Contracts | HUD |
| `contract:lost` | `{contractId, cause}` | Contracts | main, Reputation |
| `rival:escalated` | `{threshold, event}` | YellowDog | main, HUD, ActTransition |
| `rival:fareStolen` | `{fareId}` | YellowDog | FareSystem, HUD |

#### Act 3 events (added at M7)

| Event | Payload | Emitters | Listeners |
|---|---|---|---|
| `app:dialChanged` | `{dial, value}` | CabbieApp | Saturation, DriverRoster, main |
| `saturation:changed` | `{districtId, value}` | Saturation | HUD, WinCondition |
| `saturation:decayed` | `{districtId}` | Saturation | HUD |
| `sabotage:executed` | `{action, success}` | Sabotage | main, Telemetry |
| `sabotage:rivalMove` | `{action}` | YellowDog | HUD |
| `cabbieTV:unlocked` | `{}` | CabbieApp | main, ActTransition |
| `cabbieTV:adSpent` | `{level, districtId, amount}` | CabbieTV | main, Saturation |
| `cabbieTV:finaleStarted` | `{}` | CabbieTV | main, Audio, FX |
| `cabbieTV:finaleCompleted` | `{success}` | Finale | main, WinCondition |
| `winCondition:held` | `{daysRemaining}` | WinCondition | HUD |
| `winCondition:achieved` | `{}` | WinCondition | main, EndCinematic |
| `legacyMode:unlocked` | `{}` | main | Menu |
| `softLoss:triggered` | `{cause}` | main | main (handles restart) |

### Event bus rules

1. **No circular emits.** A handler must never emit an event it also listens to without a guard. If unavoidable, use a flag or frame-delay.
2. **Payloads are plain objects.** No Three.js objects in payloads (breaks JSON-serialization for save/telemetry).
3. **Handler order is insertion order but not guaranteed — don't depend on order.**
4. **Handlers are synchronous.** No async handlers on hot-path events (`taxi:moved`). Use a queue + drain pattern if needed.
5. **Throttle hot-path emits.** `taxi:moved` fires at 10Hz max, not every frame.

## 6. Style Bible Reference

The style bible is a separate curated artifact (not part of this spec) that locks the visual, audio, and tonal identity for all AI-generation pipelines. It lives at `docs/style-bible/` in the project and is consumed by generation prompts.

**This section exists so modules know where to look for style authority and how to maintain provenance.**

### Style bible contents

```
docs/style-bible/
├── README.md                       # Top-level identity: "Mujaffa reprinted in 2026"
├── palettes/
│   ├── old-port.json               # 5-color palette per district
│   ├── neon-quarter.json
│   ├── financial-glass.json
│   ├── sun-flats.json
│   ├── docklands.json
│   ├── festival-row.json
│   ├── airport-spur.json
│   └── heights.json
├── typography/
│   └── type-system.md              # DM Mono for HUD, Georgia for transitions
├── vehicles/
│   ├── reference-sheet.png         # Locked style sheet for all vehicle gens
│   └── prompts.md                  # Per-class prompt templates
├── portraits/
│   ├── drivers-reference.png
│   ├── passengers-reference.png
│   └── prompts.md
├── billboards/
│   ├── reference.png
│   └── copywriting-voice.md        # PG-13 tone examples
├── audio/
│   ├── music-direction.md          # Lo-fi hip-hop + jazz sax
│   ├── sfx-palette.md              # Punchy, short, lo-fi compressed
│   └── reference-tracks.md         # Links to style references
└── cinematics/
    ├── reference.png
    └── storyboards/
```

### Runtime access via `StyleBible.js`

```javascript
// src/foundations/StyleBible.js
import oldPortPalette from '../../docs/style-bible/palettes/old-port.json';
// ... imports for each district

export const StyleBible = {
  palettes: {
    'old-port':     oldPortPalette,
    'neon-quarter': neonQuarterPalette,
    // ... 8 total
  },
  typography: {
    hud:        "'DM Mono', monospace",
    transition: "Georgia, serif",
  },
  accent: '#F5C400',
  surface: '#0a0a14',
  surfaceElevated: '#13131e',
  border: 'rgba(245, 196, 0, 0.2)',
  // Motion
  uiEaseCurve: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
  uiDuration: 200,  // ms
};
```

**All district rendering, HUD, UI, and FX modules import palette and typography values from `StyleBible.js`. No module hard-codes a color or font.**

### Asset provenance

Every shipped generated asset has a sibling `meta.json`:

```json
{
  "asset": "vehicles/luxury-02.glb",
  "pipeline": "midjourney-concept -> blender-lowpoly",
  "prompt": "low-poly stretched limo cab, black paint, gold trim...",
  "model": "midjourney-v6",
  "date": "2026-05-12",
  "license": "midjourney-pro-commercial",
  "curator": "kim"
}
```

Scripts that regenerate assets preserve provenance. License audit (PRD §24) reads these files.

## 7. Accessibility Architecture

**Core principle: a11y is baked into every module from M1, not added in M9.** The PRD commits to WCAG 2.2 AA. Retrofitting accessibility after the fact produces half-a11y games; architecting it from M0 produces fully-accessible games.

### `Accessibility.js` — central settings module

```javascript
// src/foundations/Accessibility.js
export const Accessibility = {
  // Visual
  reducedMotion:       false,
  highContrast:        false,
  colorblindProfile:   null,  // 'deuter' | 'protan' | 'tritan' | null
  textScale:           1.0,   // 1.0 - 2.0
  // Motor
  holdToConfirm:       false, // false = tap to confirm (easier)
  tiltSensitivity:     0.5,   // 0.0 - 1.0
  tiltDeadZone:        0.1,
  relaxedTiming:       false,
  // Auditory
  subtitlesEnabled:    true,
  monoAudio:           false,
  // Cognitive
  economyAssist:       false, // +25% income, -25% expenses
  relaxedPolice:       false, // raised threshold, shorter escape
  relaxedSLAs:         false, // warnings not breaches
  autoPilot:           false, // hold-to-auto-drive
  // Volumes
  volumeMaster:        0.8,
  volumeMusic:         0.7,
  volumeSFX:           0.9,
  // Internal
  load() { /* from localStorage */ },
  save() { /* to localStorage */ },
  subscribe(callback) { /* for live updates */ },
};
```

### Module-level a11y patterns

**Every UI module MUST:**
- Respect `Accessibility.reducedMotion` — if true, disable animation loops, camera shake, chromatic aberration, speedlines
- Respect `Accessibility.highContrast` — if true, apply thicker borders and higher-contrast palette
- Respect `Accessibility.textScale` — multiply text size by this factor
- Provide a non-color visual signal for any state (pattern, icon, label)

**Every gameplay module MUST:**
- Respect `Accessibility.economyAssist` — apply multipliers at money-flow boundaries
- Respect `Accessibility.relaxedPolice` — use eased constants when true
- Respect `Accessibility.relaxedSLAs` — skip auto-breach, log warning instead
- Respect `Accessibility.autoPilot` — allow hold-to-auto-drive substitute for manual

**Every audio cue MUST:**
- Have a visual HUD equivalent so deaf/HoH players don't miss critical state changes
- Duck under dialog when `Accessibility.subtitlesEnabled` and a bubble is on screen

### Contrast enforcement

```javascript
// src/foundations/Accessibility.js
export function ensureContrast(fg, bg, min = 4.5) {
  const ratio = computeContrastRatio(fg, bg);
  if (ratio < min) {
    console.warn(`Contrast fail: ${fg} on ${bg} = ${ratio.toFixed(2)} (min ${min})`);
    return false;
  }
  return true;
}
```

Run as a lint pass during M9 audit: every HUD element checked against every district palette × every weather skin.

### Tap target minimums

```javascript
// CSS-level enforcement
.tap-target { min-width: 44px; min-height: 44px; }
```

No interactive element (button, icon, toggle) may have a tap area smaller than 44×44 CSS pixels.

### Focus management (keyboard players)

- Every interactive element has `tabindex="0"` or is a focusable native element
- Custom focus outline using `StyleBible.accent` color
- Modal dialogs trap focus and return it to trigger element on close
- No focus trap without a visible escape action

## 8. Localization Architecture

**Core principle: no inline user-facing strings ever.** From M1 onward, every piece of text displayed to a user is retrieved via `L.t()`. This is enforced by convention — breaking it means billboards, dialog, and UI can't localize without refactoring.

### `Localization.js` — central string retrieval

```javascript
// src/foundations/Localization.js
import en from '../strings/en.json';
import fr from '../strings/fr.json';
// ... imports for each active language

const strings = { en, fr, de, 'pt-BR': ptBR, es };
let currentLang = 'en';

export const L = {
  setLanguage(lang) {
    if (strings[lang]) currentLang = lang;
  },
  current() { return currentLang; },

  // Flat lookup with ICU pluralization
  t(key, params = {}) {
    const table = strings[currentLang] || strings.en;
    let template = table[key] || strings.en[key] || key;
    return interpolate(template, params);
  },

  // Pick from a pool (fare dialog, driver personality)
  pick(poolKey, params = {}) {
    const table = strings[currentLang] || strings.en;
    const pool = table[poolKey];
    if (!Array.isArray(pool)) return this.t(poolKey, params);
    const line = pool[Math.floor(Math.random() * pool.length)];
    return interpolate(line, params);
  },
};

function interpolate(template, params) {
  // ICU plural: {count, plural, one {# driver} other {# drivers}}
  // Simple: {name} -> params.name
  return template.replace(/\{([^}]+)\}/g, (_, expr) => {
    if (expr.includes('plural')) return icuPlural(expr, params);
    return params[expr] ?? `{${expr}}`;
  });
}
```

### String file format

```json
// src/strings/en.json
{
  "start.title": "CABBIE",
  "start.subtitle": "One cab. One driver. Make rent.",
  "start.button": "DRIVE",
  "hud.speed": "SPEED",
  "hud.cash": "CASH",
  "fare.pickup.bar": [
    "Take me to The Rusty Hook, cabbie.",
    "Bar district, and step on it.",
    "I need a drink. Now."
  ],
  "fare.completed": "+${tip} — Good drive!",
  "driver.hire.tier.rookie": "Rookie",
  "driver.hire.tier.journey": "Journey",
  "driver.hire.tier.pro": "Pro",
  "driver.hire.tier.ace": "Ace"
}
```

### Usage rules

- **Keys use dot notation:** `domain.subdomain.name`
- **Arrays for pools:** dialog pools are arrays, `L.pick(key)` returns a random entry
- **Interpolation:** `{paramName}` with string replacement, or ICU plural syntax
- **Fallback chain:** missing in current language → fall back to English → fall back to raw key
- **CI check:** build fails if non-English language file is missing a key English has

### Language detection

```javascript
// main.js on boot
const browserLang = navigator.language; // e.g. 'fr-FR'
const shortLang = browserLang.split('-')[0];
const saved = localStorage.getItem('cabbie.lang');
const initialLang = saved || (strings[browserLang] ? browserLang
                            : strings[shortLang] ? shortLang : 'en');
L.setLanguage(initialLang);
```

### Cultural localization of billboards

Billboards are NOT literally translated. Each language has its own billboard pool that's culturally adapted — Uber jokes get replaced with local ride-share equivalents, not translated word-for-word. Production cost is acknowledged in PRD §17.

```json
// en.json
"billboards.district.airport": [
  "UBER? We barely know her.",
  "Lose your luggage FASTER with Yellow Dog Cabs",
  ...
]

// fr.json
"billboards.district.airport": [
  "BlaBlaCar? On préfère blabla-cash.",
  ...  // different jokes, same slot
]
```

## 9. Portal Build Abstraction

Cabbie ships as separate bundles per portal. Each bundle embeds its own SDK but the game code is identical.

### Build config

```javascript
// vite.config.js
import { defineConfig } from 'vite';

const portal = process.env.VITE_PORTAL || 'dev';

export default defineConfig({
  base: portal === 'crazygames' ? './' : './',
  define: {
    __PORTAL__: JSON.stringify(portal),
  },
  build: {
    outDir: `dist/${portal}`,
    assetsDir: 'assets',
  },
});
```

### `PortalAdapter.js` — unified SDK facade

```javascript
// src/foundations/PortalAdapter.js
const portal = __PORTAL__;

// Lazy-load the right SDK
let impl = null;

async function load() {
  if (impl) return impl;
  switch (portal) {
    case 'crazygames':  impl = await import('./adapters/crazygames.js'); break;
    case 'newgrounds':  impl = await import('./adapters/newgrounds.js'); break;
    case 'itch':        impl = await import('./adapters/itch.js');       break;
    default:            impl = await import('./adapters/dev.js');        break;
  }
  await impl.init();
  return impl;
}

export const PortalAdapter = {
  async init() { return load(); },

  // Ads — all portal-agnostic
  async preRoll()               { return (await load()).preRoll(); },
  async interstitial(trigger)   { return (await load()).interstitial(trigger); },
  async rewarded(rewardKey)     { return (await load()).rewarded(rewardKey); },

  // Telemetry
  async trackEvent(name, props) { return (await load()).trackEvent(name, props); },

  // Cloud save (optional per portal)
  async cloudSaveSupported()    { return (await load()).cloudSaveSupported(); },
  async cloudSaveWrite(state)   { return (await load()).cloudSaveWrite(state); },
  async cloudSaveRead()         { return (await load()).cloudSaveRead(); },
};
```

### Per-portal adapter stubs

Each portal gets its own adapter file implementing the interface. Adapters are thin:

```javascript
// src/foundations/adapters/crazygames.js
export async function init() {
  await loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js');
  window.CrazyGames.SDK.init();
}
export function preRoll()         { return window.CrazyGames.SDK.ad.requestAd('midgame'); }
export function interstitial(t)   { return window.CrazyGames.SDK.ad.requestAd('midgame'); }
export function rewarded(key)     { return window.CrazyGames.SDK.ad.requestAd('rewarded'); }
export function trackEvent(n, p)  { window.CrazyGames.SDK.analytics.event(n, p); }
export function cloudSaveSupported() { return false; }
// etc.
```

### Dev-build adapter (no-op)

```javascript
// src/foundations/adapters/dev.js
export async function init() { console.log('[dev] no SDK loaded'); }
export async function preRoll()         { return true; }   // auto-succeed
export async function interstitial(t)   { return true; }
export async function rewarded(key)     { return true; }   // grant reward
export function trackEvent(n, p)        { console.log('[telemetry]', n, p); }
export function cloudSaveSupported()    { return false; }
```

The dev build treats all ad calls as auto-succeed so gameplay is never gated on an SDK that's not present. Production builds fail loudly if SDK load fails.

---

# Part II — World & Player

## 10. World & City Generation

Cabbie's world is a **fixed 7×7 grid per district**. Same grid topology across all 8 districts — only art, palette, and prop-dressing differ.

### Grid coordinates

```
District is BLOCK_COUNT × BLOCK_COUNT = 7 × 7 blocks.
Each block is BLOCK_SIZE = 60 world units square.
Road width is ROAD_WIDTH = 10 world units.
District total: 7 * (60 + 10) = 490 world units on each side, minus one trailing road.
District extent: centered at origin (x, z) ∈ [-245, +245].
```

### Intersection vs block-center math

**Critical for spawn logic (pitfall P2 in v1):**

```javascript
// Block center — where buildings sit
function blockCenter(i, j) {
  const totalStride = BLOCK_SIZE + ROAD_WIDTH;
  return {
    x: (i - (BLOCK_COUNT - 1) / 2) * totalStride,
    z: (j - (BLOCK_COUNT - 1) / 2) * totalStride,
  };
}

// Road intersection — where cars can safely spawn
function roadIntersection(i, j) {
  const totalStride = BLOCK_SIZE + ROAD_WIDTH;
  return {
    x: blockCenter(i, j).x + totalStride / 2,
    z: blockCenter(i, j).z + totalStride / 2,
  };
}

// Is this world position on a drivable road?
function isOnRoad(x, z) {
  const totalStride = BLOCK_SIZE + ROAD_WIDTH;
  const offsetX = ((x + BLOCK_SIZE/2) % totalStride + totalStride) % totalStride;
  const offsetZ = ((z + BLOCK_SIZE/2) % totalStride + totalStride) % totalStride;
  return offsetX < ROAD_WIDTH || offsetZ < ROAD_WIDTH;
}
```

**Rule:** NEVER spawn the taxi, traffic, or fare pins at a block-center. Always at a road-intersection or mid-road position.

### Building geometry

Each block contains 1–4 buildings, procedurally placed (seeded per district for consistency across sessions):

```javascript
function generateBlockBuildings(i, j, districtId, seed) {
  const rng = seedrandom(`${districtId}:${i}:${j}:${seed}`);
  const count = 1 + Math.floor(rng() * 4);
  const { x, z } = blockCenter(i, j);
  const buildings = [];
  for (let k = 0; k < count; k++) {
    const h = 8 + rng() * 32;  // height
    const w = 15 + rng() * 25;  // width
    const d = 15 + rng() * 25;  // depth
    buildings.push({ x, z, h, w, d, colorIdx: Math.floor(rng() * 5) });
  }
  return buildings;
}
```

Colors are pulled from the district's palette.

### District definition

```javascript
// src/world/District.js
export class District {
  constructor(id, styleBiblePalette, signageTheme, billboardKeys) {
    this.id = id;
    this.palette = styleBiblePalette;  // 5-color from StyleBible
    this.signage = signageTheme;
    this.billboardKeys = billboardKeys; // strings keys like 'billboards.district.old-port'
  }

  // Apply district look to scene (sky, lighting, palette)
  apply(scene, renderer) { /* ... */ }
}
```

### Districts (8 total, unlocked progressively)

| Act | Districts unlocked |
|---|---|
| Act 1 | Old Port (starting) |
| Act 2 gate requires | 3 of 8 controlled |
| Act 3 start | All 8 accessible |

District list with palette reference:
1. Old Port (home, warm brick/mustard/overcast) — Act 1 start
2. Neon Quarter (hot pink/cyan/black) — Act 2
3. Financial Glass (teal/white chrome/steel) — Act 2
4. Sun Flats (bleached ochre/turquoise) — Act 2
5. Docklands (rust/steel grey/brown water) — Act 2
6. Festival Row (strung-light yellows/purple) — Act 3 start
7. Airport Spur (tarmac grey/jet blue/safety orange) — Act 3 start
8. Heights (forest green/navy/starlit) — Act 3 start

### Weather / daily skin

Weather is a top-layer atmospheric state that modifies any district:

```javascript
// src/world/Weather.js
export const WEATHER_TYPES = [
  'clear-noon', 'rain-night', 'gold-hour-rush', 'festival-lit',
  'fog-dawn', 'neon-midnight', 'storm'
];

export class Weather {
  apply(scene, districtPalette, type) {
    // Adjust sky dome, fog, ambient light, sun color
    // WITHOUT replacing district palette identity
  }

  // Weather rolls at day:ended only, applied on day:resume
  // See P12 in §35
  roll(day) {
    const rng = seedrandom(`weather:${day}`);
    if (day < 3) return 'clear-noon';  // intro days are stable
    return WEATHER_TYPES[Math.floor(rng() * WEATHER_TYPES.length)];
  }

  applyPhysicsEffects(type) {
    if (type === 'rain-night' || type === 'storm') {
      return { frictionMultiplier: 0.92 };  // slipperier
    }
    return { frictionMultiplier: 1.0 };
  }
}
```

## 11. Player / Taxi System

### `Taxi.js` — the player vehicle

```javascript
// src/player/Taxi.js
export class Taxi {
  constructor(scene) {
    this.pos = { x: 0, y: 0, z: 0 };
    this.hdg = 0;                  // radians (see §4)
    this.speed = 0;                // world units / second
    this.fuel = 1.0;               // 0.0 - 1.0
    this.health = 1.0;             // 0.0 - 1.0
    this.mesh = this.buildMesh();
    scene.add(this.mesh);
  }

  buildMesh() {
    // Low-poly taxi with texture atlas
    // Returns THREE.Group
  }

  // Critical: use §4's conventions. mesh.rotation.y = hdg, NOT -hdg.
  syncMeshToState() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.y = this.hdg;
  }

  forward() {
    return { x: Math.sin(this.hdg), y: 0, z: Math.cos(this.hdg) };
  }
}
```

### Spawn rules (pitfall P2)

```javascript
// Always spawn on a road intersection, never a block center
function spawnTaxi(taxi, districtId) {
  const { x, z } = roadIntersection(3, 3);  // center-ish of the district
  taxi.pos.x = x;
  taxi.pos.y = 0;
  taxi.pos.z = z;
  taxi.hdg = 0;  // facing +Z
  taxi.syncMeshToState();
}
```

### Physics (`Physics.js`)

Arcade-forgiving, not sim. Values in §36.

```javascript
// src/player/Physics.js
export function stepPhysics(taxi, input, weather, dt) {
  const accel = input.throttle * ACCEL_RATE
              - input.brake * BRAKE_RATE
              - FRICTION_DECAY * taxi.speed;
  taxi.speed = clamp(taxi.speed + accel * dt, 0, MAX_SPEED);

  // Speed-weighted steering (tight at low speed, loose at high)
  const turnRate = lerp(TURN_RATE_LOW, TURN_RATE_HIGH,
                        taxi.speed / MAX_SPEED);
  taxi.hdg += input.steer * turnRate * dt;  // P1: += for right-turn (§4)

  // Weather friction modifier
  const frictionMul = weather.applyPhysicsEffects(weather.current).frictionMultiplier;

  const fwd = taxi.forward();
  taxi.pos.x += fwd.x * taxi.speed * dt * frictionMul;
  taxi.pos.z += fwd.z * taxi.speed * dt * frictionMul;

  // Collision with buildings (AABB vs block geometry)
  resolveCollisions(taxi);

  taxi.syncMeshToState();

  // Fuel burn
  taxi.fuel = Math.max(0, taxi.fuel - FUEL_BURN_RATE * taxi.speed * dt);

  EventBus.emit('taxi:moved', { pos: { ...taxi.pos }, hdg: taxi.hdg, speed: taxi.speed });
}
```

### Damage model

```javascript
// src/player/Damage.js
export class Damage {
  constructor(taxi) {
    this.taxi = taxi;
    EventBus.on('taxi:crashed', (e) => this.apply(e.severity));
  }

  apply(severity) {
    const before = this.taxi.health;
    this.taxi.health = Math.max(0, this.taxi.health - severity);
    this.updateVisuals();

    if (this.taxi.health <= 0 && before > 0) {
      this.triggerSpinout();
      // Offer rewarded ad revive
      EventBus.emit('taxi:wrecked');
    }
  }

  updateVisuals() {
    // Apply damage tier (clean/dented/smoking/wrecked)
    // Tier 3 adds smoke particle emitter
    // Tier 4 adds missing-headlight, dangling bumper
  }

  async reviveViaAd() {
    const ok = await PortalAdapter.rewarded('revive');
    if (ok) {
      this.taxi.health = 0.5;
      this.updateVisuals();
      EventBus.emit('taxi:revived');
    }
  }
}
```

## 12. Camera System

Behind-cab third-person follow camera. **See §4 on camera coordinate independence.**

```javascript
// src/camera/FollowCamera.js
import { StyleBible } from '../foundations/StyleBible.js';
import { Accessibility } from '../foundations/Accessibility.js';

export class FollowCamera {
  constructor(threeCamera, taxi) {
    this.cam = threeCamera;
    this.taxi = taxi;
    this.currentPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.cam.fov = CAM_FOV;  // 75 (locked, no speed-zoom)
    this.cam.updateProjectionMatrix();
  }

  update(dt) {
    // Dynamic pull-back at high speed
    const extraBack = this.taxi.speed > 60 ? CAM_PULL_BACK_EXTRA
                     : this.taxi.speed < 5 ? -CAM_PULL_BACK_TIGHTEN
                     : 0;

    const fwd = this.taxi.forward();
    const targetPos = {
      x: this.taxi.pos.x - fwd.x * (CAM_BACK + extraBack),
      y: this.taxi.pos.y + CAM_HEIGHT,
      z: this.taxi.pos.z - fwd.z * (CAM_BACK + extraBack),
    };
    const lookAtTarget = {
      x: this.taxi.pos.x + fwd.x * CAM_LOOK_AHEAD,
      y: this.taxi.pos.y + CAM_LOOK_HEIGHT,
      z: this.taxi.pos.z + fwd.z * CAM_LOOK_AHEAD,
    };

    // Damped interpolation
    this.currentPos.lerp(toVec3(targetPos), CAM_DAMP_POS);
    this.currentLookAt.lerp(toVec3(lookAtTarget), CAM_DAMP_LOOK);

    this.cam.position.copy(this.currentPos);
    this.cam.lookAt(this.currentLookAt);
  }

  shake(intensity, duration) {
    if (Accessibility.reducedMotion) return;
    // apply controlled offset decay
  }
}
```

## 13. Traffic System

NPC cars populate the world. They dodge the player (mostly), spawn/despawn around the camera frustum, and trigger near-miss scoring.

```javascript
// src/world/Traffic.js
const TRAFFIC_DENSITY_BASE = 20;

export class Traffic {
  constructor(scene) {
    this.cars = [];
    this.scene = scene;
    EventBus.on('weather:changed', (e) => this.adjustDensity(e.type));
  }

  spawn(count) { /* spawn around player, off-camera */ }
  despawn(car) { /* when car leaves extended radius */ }

  update(dt, player) {
    for (const car of this.cars) {
      car.hdg += 0;  // basic: drive straight along its road
      const fwd = { x: Math.sin(car.hdg), y: 0, z: Math.cos(car.hdg) };
      car.pos.x += fwd.x * car.speed * dt;
      car.pos.z += fwd.z * car.speed * dt;
      car.mesh.position.set(car.pos.x, 0, car.pos.z);
      car.mesh.rotation.y = car.hdg;  // P1: same convention as player

      // Turn at intersection (simple: 50% turn, 50% straight)
      if (reachedIntersection(car)) this.maybeTurn(car);

      // Near-miss detection
      const dist = distance(car.pos, player.pos);
      if (dist < NEAR_MISS_RADIUS && player.speed > NEAR_MISS_SPEED) {
        EventBus.emit('near:miss', { distance: dist });
      }
    }
  }

  adjustDensity(weatherType) {
    const mul = weatherType === 'gold-hour-rush' ? 1.5 : 1.0;
    // Spawn or despawn toward target density
  }
}
```

### Traffic car variants

- 6 unique NPC models (distinct from player-purchasable fleet)
- Shared damage/collision behavior
- Basic AI: follow road network, turn at intersections, slow for intersections

## 14. Fare System

Core Act 1 loop — spawn pin → navigate to pickup → board → drive to dropoff → collect tip.

```javascript
// src/game/FareSystem.js
export class FareSystem {
  constructor() {
    this.active = null;  // current fare or null
    this.pickupPin = null;
    this.dropoffPin = null;
    this.timer = 0;
  }

  tick(dt, taxi) {
    if (!this.active && this.pickupPin === null) {
      this.spawnPickup();
    }
    if (this.pickupPin) {
      if (distance(taxi.pos, this.pickupPin.pos) < PICKUP_RADIUS && taxi.speed < BOARD_SPEED_MAX) {
        this.board();
      }
    }
    if (this.active) {
      if (distance(taxi.pos, this.dropoffPin.pos) < DROPOFF_RADIUS && taxi.speed < DROPOFF_SPEED_MAX) {
        this.complete();
      }
    }
  }

  spawnPickup() {
    const districtRoad = pickRandomRoadPoint();
    const destType = pickRandom(DESTINATION_TYPES);
    this.pickupPin = {
      pos: districtRoad,
      dialogKey: `fare.pickup.${destType}`,
      destType,
    };
    EventBus.emit('fare:pickupSpawned', { fareId: uid(), pos: districtRoad, reward: 'pending' });
  }

  board() {
    const destination = pickDestinationForType(this.pickupPin.destType);
    this.active = {
      fareId: uid(),
      destType: this.pickupPin.destType,
      pickupPos: this.pickupPin.pos,
      dropoffPos: destination,
    };
    this.dropoffPin = { pos: destination };
    this.pickupPin = null;
    EventBus.emit('fare:boarded', {
      fareId: this.active.fareId,
      destinationPos: destination,
    });
  }

  complete() {
    const dist = distance(this.active.pickupPos, this.active.dropoffPos);
    const comfortFinal = Comfort.currentValue();
    const tip = Math.floor(FARE_BASE_RATE * dist * (1 + comfortFinal * 0.5));
    EventBus.emit('fare:completed', { fareId: this.active.fareId, tip, comfortFinal });
    this.active = null;
    this.dropoffPin = null;
  }
}
```

### Comfort reset rule (P11)

Comfort resets **on `fare:boarded`**, not on `fare:pickupSpawned`. See §35.

## 15. HUD System

Mobile-first overlay. All HUD components respect `Accessibility.textScale`, `Accessibility.highContrast`, `Accessibility.reducedMotion`.

### `HUD.js` — root container

```javascript
// src/hud/HUD.js
export class HUD {
  constructor(root) {
    this.root = root;  // DOM element in index.html
    this.speed = new SpeedReadout(root);
    this.cash = new CashReadout(root);
    this.comfort = new ComfortBar(root);
    this.fuel = new FuelBar(root);
    this.rep = new ReputationStars(root);
    this.arrow = new DirectionArrow(root);
    this.bribeBtn = new BribeButton(root);
    this.mode = new ModeToggle(root);  // shown from Act 2+
    // ... etc.
  }

  applyA11y() {
    const scale = Accessibility.textScale;
    this.root.style.setProperty('--hud-text-scale', scale);
    if (Accessibility.highContrast) this.root.classList.add('high-contrast');
  }
}
```

### HUD layout regions

- **Top bar:** speed (left), cash (center), rep stars (right)
- **Left rail:** mode toggle (Act 2+), comfort bar
- **Right rail:** fuel bar, health indicator
- **Bottom:** direction arrow during active fare, bribe button during chase
- **Center-top (transient):** floating popups, chase warning, fare inbound

### Direction arrow — P3 critical

```javascript
// src/hud/DirectionArrow.js
update(taxiPos, taxiHdg, targetPos) {
  const dx = targetPos.x - taxiPos.x;
  const dz = targetPos.z - taxiPos.z;
  const absoluteAngle = Math.atan2(dx, dz);  // §4: atan2(dx, dz) NOT atan2(dz, dx)
  const relativeAngle = absoluteAngle - taxiHdg;  // how much to rotate from "forward"
  this.arrowElement.style.transform = `rotate(${relativeAngle}rad)`;
  this.distanceLabel.textContent = L.t('hud.distance', { m: Math.round(Math.hypot(dx, dz)) });
}
```

## 16. Police System

Triggers when speed exceeds threshold for duration. Escalates through Acts.

```javascript
// src/game/PoliceSystem.js
export class PoliceSystem {
  constructor() {
    this.active = false;
    this.timer = 0;
    this.policeCar = null;  // THREE mesh, null until M3
    EventBus.on('police:finePaid', () => this.endChase('paid'));
  }

  tick(dt, taxi) {
    const threshold = Accessibility.relaxedPolice ? POLICE_SPEED_RELAXED : POLICE_SPEED_THRESHOLD;
    if (taxi.speed > threshold && !this.active) {
      this.startChase(taxi);
    }
    if (this.active) {
      this.updatePursuit(dt, taxi);
      this.checkEscape(taxi);
    }
  }

  startChase(taxi) {
    this.active = true;
    this.timer = 0;
    if (!this.policeCar) this.spawnPoliceCar(taxi);
    EventBus.emit('police:chaseStarted');
  }

  spawnPoliceCar(taxi) {
    // Spawn 100u behind the player
    const fwd = taxi.forward();
    const pos = {
      x: taxi.pos.x - fwd.x * POLICE_SPAWN_DISTANCE,
      y: 0,
      z: taxi.pos.z - fwd.z * POLICE_SPAWN_DISTANCE,
    };
    this.policeCar = createPoliceCarMesh();
    this.policeCar.position.set(pos.x, 0, pos.z);
    this.policeCar.hdg = taxi.hdg;  // P1: facing direction of travel
    scene.add(this.policeCar);
  }

  updatePursuit(dt, taxi) {
    if (!this.policeCar) return;
    // Steer toward player using atan2
    const pc = this.policeCar;
    const dx = taxi.pos.x - pc.position.x;
    const dz = taxi.pos.z - pc.position.z;
    const targetHdg = Math.atan2(dx, dz);  // §4: atan2(dx, dz)
    const hdgDiff = angleDiff(targetHdg, pc.hdg);
    pc.hdg += clamp(hdgDiff, -POLICE_TURN_RATE * dt, POLICE_TURN_RATE * dt);

    const fwd = { x: Math.sin(pc.hdg), y: 0, z: Math.cos(pc.hdg) };
    pc.position.x += fwd.x * POLICE_SPEED * dt;
    pc.position.z += fwd.z * POLICE_SPEED * dt;
    pc.rotation.y = pc.hdg;  // P1: no negation
  }

  checkEscape(taxi) {
    if (!this.policeCar) return;
    const dist = Math.hypot(taxi.pos.x - this.policeCar.position.x,
                            taxi.pos.z - this.policeCar.position.z);
    const escape = Accessibility.relaxedPolice ? POLICE_ESCAPE_RELAXED : POLICE_ESCAPE_DISTANCE;
    if (dist > escape) this.endChase('escaped');
  }

  bribe() {
    EventBus.emit('police:finePaid', { amount: POLICE_BRIBE });
  }

  endChase(reason) {
    this.active = false;
    if (this.policeCar) {
      scene.remove(this.policeCar);
      this.policeCar = null;
    }
    EventBus.emit('police:chaseEnded', { reason });
  }
}
```

## 17. Comfort & Reputation Systems

### Comfort — per-fare passenger satisfaction

```javascript
// src/game/Comfort.js
export const Comfort = {
  value: 1.0,  // 0.0 - 1.0
  tipMultiplier() { return 1.0 + this.value * 0.5; },  // 1.0x - 1.5x

  // P11: reset on fare:boarded, not fare:pickupSpawned
  init() {
    EventBus.on('fare:boarded', () => {
      this.value = 1.0;
      EventBus.emit('comfort:changed', { value: this.value });
    });
    EventBus.on('taxi:crashed', ({ severity }) => {
      this.value = Math.max(0, this.value - severity);
      EventBus.emit('comfort:changed', { value: this.value });
    });
    EventBus.on('taxi:moved', ({ speed, hdg, pos }) => {
      // Drain on sharp turns
      // (implementation: compare hdg delta per tick)
    });
  },
  currentValue() { return this.value; },
};
```

### Reputation — persistent star rating

```javascript
// src/game/Reputation.js
export const Reputation = {
  stars: 0.0,  // 0.0 - 5.0
  totalFares: 0,

  init() {
    EventBus.on('fare:completed', ({ comfortFinal }) => {
      this.updateFromFare(comfortFinal);
    });
    EventBus.on('taxi:crashed', () => this.adjust(-REP_CRASH_PENALTY));
    EventBus.on('police:finePaid', () => this.adjust(-REP_FINE_PENALTY));
  },

  updateFromFare(comfortFinal) {
    const delta = REP_FARE_BASE + comfortFinal * REP_COMFORT_BONUS;
    this.adjust(delta);
  },

  adjust(delta) {
    this.stars = clamp(this.stars + delta, 0.0, 5.0);
    EventBus.emit('reputation:changed', { stars: this.stars, delta });
  },
};
```

## 18. Collectibles System

Road pickups: coffee, fuel cans, wallets, vape pens, phones.

```javascript
// src/world/Collectibles.js
export class Collectibles {
  constructor(scene) {
    this.items = [];
    this.scene = scene;
    this.spawnPool();
  }

  spawnPool() {
    // ~1 per 800 world-units on drivable roads
    // Types weighted: coffee 40%, fuel 20%, wallet 25%, vape 10%, phone 5%
  }

  update(dt, taxi) {
    for (const item of this.items) {
      // Magnetic attraction within COLLECT_MAGNET_RADIUS
      const dist = distance(taxi.pos, item.pos);
      if (dist < COLLECT_MAGNET_RADIUS) {
        // arc toward taxi
        const t = 1 - (dist / COLLECT_MAGNET_RADIUS);
        item.pos.x = lerp(item.pos.x, taxi.pos.x, t * 0.15);
        item.pos.z = lerp(item.pos.z, taxi.pos.z, t * 0.15);
      }
      if (dist < COLLECT_RADIUS) this.collect(item, taxi);
      item.mesh.rotation.y += dt * 2;
      item.mesh.position.y = 1 + Math.sin(Date.now() / 500 + item.bobOffset) * 0.3;
    }
  }

  collect(item, taxi) {
    switch (item.type) {
      case 'coffee':  EventBus.emit('collectible:collected', { type: item.type, payload: { cash: 10 } }); break;
      case 'fuel':    taxi.fuel = Math.min(1, taxi.fuel + 0.3); EventBus.emit('fuel:changed', { value: taxi.fuel }); break;
      case 'wallet':  EventBus.emit('collectible:collected', { type: item.type, payload: { cash: 25 + Math.floor(Math.random() * 50) } }); break;
      case 'vape':    EventBus.emit('collectible:collected', { type: item.type, payload: { rep: 0.05 } }); break;
      case 'phone':   EventBus.emit('collectible:collected', { type: item.type, payload: { skipToken: 1 } }); break;
    }
    this.items = this.items.filter(i => i !== item);
    this.scene.remove(item.mesh);
    setTimeout(() => this.respawn(item.type), COLLECT_RESPAWN_MS);
  }

  respawn(type) { /* ... */ }
}
```

---

# Part III — Act 2 Systems

## 19. Dispatch Board

Mobile-first vertical list of 8 districts. Same component scales to tablet (2-col) and desktop (3-col).

```javascript
// src/fleet/DispatchBoard.js
export class DispatchBoard {
  constructor(rootDom) {
    this.root = rootDom;
    this.rows = [];
    for (let i = 0; i < 8; i++) {
      this.rows.push(this.buildRow(i));
    }
    EventBus.on('driver:assigned', (e) => this.updateRow(e.districtId));
    EventBus.on('saturation:changed', (e) => this.updateRow(e.districtId));
  }

  buildRow(districtId) {
    // DOM: district name, assigned driver, hourly revenue, comfort avg, incidents, rival share
    // Tap row → slide up driver-assign bottom sheet
  }

  show() { /* fade in */ }
  hide() { /* fade out */ }
}
```

### Breakpoint behavior

- `< 640px` — 1 column vertical scroll
- `640–1024px` — 2 columns
- `> 1024px` — 3 columns

### Mode toggle integration

The toggle in HUD (`ModeToggle`) determines whether dispatch board is visible (manage mode) or hidden behind driving HUD (drive mode). See §15.

## 20. Driver System

### `Driver.js` — data model

```javascript
// src/fleet/Driver.js
export class Driver {
  constructor(tier, seed) {
    this.id = uid();
    this.tier = tier;  // 'rookie' | 'journey' | 'pro' | 'ace'
    this.stats = this.rollStats(seed);
    this.morale = 0.7;  // 0.0 - 1.0
    this.wage = this.wageForTier(tier);
    this.assignedDistrict = null;
    this.assignedVehicle = null;
    this.personalityKey = pickPersonalityKey(seed);  // for text bubbles
    this.portraitId = pickPortraitId(tier, seed);
  }

  rollStats(seed) {
    const rng = seedrandom(`driver:${seed}`);
    // tier sets mean, high variance on rookie
    const variance = this.tier === 'rookie' ? 0.4 : 0.15;
    return {
      speed:       gauss(TIER_STATS[this.tier].speed, variance, rng),
      comfort:     gauss(TIER_STATS[this.tier].comfort, variance, rng),
      reliability: gauss(TIER_STATS[this.tier].reliability, variance, rng),
      loyalty:     gauss(TIER_STATS[this.tier].loyalty, variance, rng),
    };
  }

  wageForTier(tier) {
    return { rookie: 80, journey: 150, pro: 250, ace: 450 }[tier];
  }

  nameForDisplay() {
    return generateProceduralName(this.id);  // 40x40 combo pool
  }
}
```

### `DriverRoster.js` — hire/fire

```javascript
// src/fleet/DriverRoster.js
export class DriverRoster {
  constructor() {
    this.hired = [];  // max ROSTER_CAP
    this.candidates = [];
    this.lastRoll = 0;
  }

  rollCandidates(day) {
    if (day === this.lastRoll) return;
    const rng = seedrandom(`candidates:${day}`);
    this.candidates = [];
    const tierWeights = { rookie: 0.5, journey: 0.3, pro: 0.15, ace: 0.05 };
    for (let i = 0; i < CANDIDATE_POOL_SIZE; i++) {
      const tier = weightedPick(tierWeights, rng);
      this.candidates.push(new Driver(tier, `cand:${day}:${i}`));
    }
    this.lastRoll = day;
  }

  async rerollViaAd() {
    const ok = await PortalAdapter.rewarded('reroll_candidates');
    if (ok) { this.candidates = []; this.rollCandidates(DaySystem.currentDay); }
  }

  hire(candidateId) {
    if (this.hired.length >= ROSTER_CAP) throw new Error('ROSTER_FULL');
    const idx = this.candidates.findIndex(c => c.id === candidateId);
    const driver = this.candidates.splice(idx, 1)[0];
    this.hired.push(driver);
    EventBus.emit('driver:hired', { driverId: driver.id, tier: driver.tier, stats: driver.stats });
  }

  fire(driverId) {
    const idx = this.hired.findIndex(d => d.id === driverId);
    if (idx < 0) return;
    this.hired.splice(idx, 1);
    EventBus.emit('driver:fired', { driverId, reason: 'player' });
  }
}
```

### `Morale.js` — driver satisfaction

```javascript
// src/fleet/Morale.js
export const Morale = {
  // Event-driven morale shifts
  init(roster) {
    EventBus.on('day:ended', () => this.dailyTick(roster));
    EventBus.on('vehicle:breakdown', ({ vehicleId }) => this.penaltyForBreakdownDriver(vehicleId, roster));
    // etc.
  },

  dailyTick(roster) {
    for (const driver of roster.hired) {
      let delta = 0;
      if (driver.wage >= TIER_STATS[driver.tier].wageBaseline) delta += 0.01;
      else delta -= 0.02;

      if (driver.assignedVehicle?.condition > 0.8) delta += 0.01;
      if (driver.assignedDistrict === 'airport-spur') delta += 0.02;  // status boost

      driver.morale = clamp(driver.morale + delta, 0, 1);

      if (driver.morale < 0.2 && Math.random() < 0.1) {
        EventBus.emit('driver:quit', { driverId: driver.id, reason: 'morale' });
      }

      EventBus.emit('driver:morale', { driverId: driver.id, value: driver.morale });
    }
  },
};
```

## 21. Vehicle Fleet & Upgrade Tree

### `VehicleFleet.js`

```javascript
// src/fleet/VehicleFleet.js
export class VehicleFleet {
  constructor() {
    this.vehicles = [];
  }

  purchase(modelId, classType) {
    if (this.vehicles.length >= FLEET_CAP) throw new Error('FLEET_FULL');
    const vehicle = new Vehicle(modelId, classType);
    this.vehicles.push(vehicle);
    EventBus.emit('vehicle:purchased', { vehicleId: vehicle.id, class: classType });
    return vehicle;
  }

  upgradeSystem(vehicleId, systemName, targetLevel) {
    const v = this.get(vehicleId);
    if (v[systemName] >= targetLevel) return;
    const cost = UPGRADE_COST[systemName][targetLevel];
    // deduct cash via event
    v[systemName] = targetLevel;
    EventBus.emit('vehicle:upgraded', { vehicleId, system: systemName, level: targetLevel });
  }

  tick(dt) {
    for (const v of this.vehicles) {
      v.wear += WEAR_RATE * dt * v.usageIntensity;
      if (v.wear > 1 && Math.random() < BREAKDOWN_CHANCE_PER_TICK) {
        this.breakdown(v);
      }
    }
  }

  breakdown(v) {
    v.wear = 0.5;
    EventBus.emit('vehicle:breakdown', { vehicleId: v.id, cause: 'neglect' });
  }
}
```

### Vehicle classes

| Class | Base cost | Fuel efficiency | Comfort mult | Airport-eligible |
|---|---|---|---|---|
| Standard | $5,000 | 1.0x | 1.0x | No |
| Hybrid | $12,000 | 1.4x | 1.0x | No |
| Luxury | $30,000 | 0.8x | 1.3x | Yes |

### Upgrade systems

Each vehicle has 4 systems, 4 upgrade levels each. Costs scale per level. See §36.

## 22. Contract System

```javascript
// src/fleet/Contracts.js
export class Contracts {
  constructor() {
    this.active = [];
    this.available = [];
    this.slaWeekCounter = 0;
  }

  tick(dt) {
    // Weekly SLA check
    if (DaySystem.isNewWeek()) this.evaluateSLAs();
  }

  evaluateSLAs() {
    for (const c of this.active) {
      const metSLA = this.checkSLA(c);
      if (!metSLA) {
        c.warnings += 1;
        EventBus.emit('contract:slaWarning', { contractId: c.id });
        if (c.warnings >= 2 && !Accessibility.relaxedSLAs) {
          this.lose(c);
        }
      } else {
        c.warnings = 0;
      }
    }
  }

  checkSLA(contract) {
    switch (contract.type) {
      case 'hotel':     return contract.weeklyComfortAvg >= 4.0;
      case 'airport':   return contract.weeklyOnTimeRate >= 0.95;
      case 'corporate': return contract.driverTier === 'pro' || contract.driverTier === 'ace';
    }
  }

  lose(contract) {
    this.active = this.active.filter(c => c !== contract);
    EventBus.emit('contract:lost', { contractId: contract.id, cause: 'sla' });
  }
}
```

### Contract catalog (PRD §14)

24 total: 9 Hotel + 3 Airport + 12 Corporate. All in `constants.js`.

## 23. Yellow Dog Rival System

```javascript
// src/fleet/YellowDog.js
export class YellowDog {
  constructor() {
    this.marketShareCitywide = 0.7;  // starts dominant
    this.triggersFired = new Set();
  }

  tick(dt) {
    // Recompute citywide share based on player performance
    this.updateShare();

    // Check escalation thresholds
    if (this.playerShare() >= 0.30 && !this.triggersFired.has(30)) this.trigger(30);
    if (this.playerShare() >= 0.50 && !this.triggersFired.has(50)) this.trigger(50);
    if (this.playerShare() >= 0.70 && !this.triggersFired.has(70)) this.trigger(70);
    if (this.playerShare() >= 0.90 && !this.triggersFired.has(90)) this.trigger(90);
  }

  trigger(threshold) {
    this.triggersFired.add(threshold);
    let event;
    switch (threshold) {
      case 30: event = this.poachDriver(); break;
      case 50: event = this.billboardAttack(); break;
      case 70: event = this.sabotageVehicle(); break;
      case 90: event = this.priceWar(); break;
    }
    EventBus.emit('rival:escalated', { threshold, event });
  }

  poachDriver()       { /* target random hired driver; offer retention or lose them */ }
  billboardAttack()   { Reputation.adjust(-0.2); }
  sabotageVehicle()   { /* pick random vehicle; trigger breakdown + counter-mission */ }
  priceWar()          { FareSystem.applyRateMultiplier(0.8, 5); }

  // Act 3: joins player's platform (§24)
  joinPlatform() { /* yields drivers to CabbieApp, takes rate cut */ }
}
```

---

# Part IV — Act 3 Systems

## 24. CabbieApp Platform

Three-dial economic puzzle. Unlocks at Act 3 start.

```javascript
// src/empire/CabbieApp.js
export class CabbieApp {
  constructor() {
    this.surge = 1.0;        // 1.0 - 2.5
    this.takeRate = 0.7;     // 0.6 - 0.9
    this.promos = 'off';     // 'off' | 'weekly' | 'aggressive'
    this.appRating = 4.5;    // 0.0 - 5.0
    this.yellowDogAbsorbed = false;
  }

  setSurge(value) {
    this.surge = clamp(value, APP_SURGE_MIN, APP_SURGE_MAX);
    EventBus.emit('app:dialChanged', { dial: 'surge', value: this.surge });
    // Impacts: revenue multiplier, satisfaction penalty, ride volume
    this.recalculateFlows();
  }

  setTakeRate(value) {
    this.takeRate = clamp(value, APP_TAKE_MIN, APP_TAKE_MAX);
    EventBus.emit('app:dialChanged', { dial: 'take', value: this.takeRate });
    // Impacts: driver flow to/from platform
    this.recalculateFlows();
  }

  setPromos(mode) {
    this.promos = mode;
    EventBus.emit('app:dialChanged', { dial: 'promos', value: mode });
    // Impacts: cash outflow per day, saturation boost
    this.recalculateFlows();
  }

  recalculateFlows() {
    // Dial interactions computed here
    // Surge 1.5 = +50% revenue, -15% satisfaction, -10% ride volume (net +28%)
    // Take 0.6 = max driver inflow from rivals, thin margin
    // Promos 'aggressive' = -$N/day cash, +X% saturation velocity
  }

  // Thesis beat: Yellow Dog joins the platform
  absorbYellowDog() {
    this.yellowDogAbsorbed = true;
    EventBus.emit('rival:joinedPlatform');
    // Unlocks: rival drivers earning on your take rate
  }
}
```

### Three-dial UI (`CabbieApp.ui`)

Mobile-friendly control panel. Three horizontal sliders, one for each dial. Live market-share visualization below. See §15 for HUD integration.

## 25. Saturation & Market Share

Win condition driver.

```javascript
// src/empire/Saturation.js
export class Saturation {
  constructor() {
    this.perDistrict = {
      'old-port': 0, 'neon-quarter': 0, /* ... */
    };
    this.heldStreakDays = 0;
  }

  tick(dt, app) {
    for (const d of DISTRICT_IDS) {
      // Rise from: app penetration, billboards, app rating, CabbieTV spend
      const rise = this.computeRise(d, app);
      // Decay from: neglect, rival counter-action
      const decay = this.computeDecay(d);
      const current = this.perDistrict[d];
      const next = clamp(current + (rise - decay) * dt, 0, 100);
      this.perDistrict[d] = next;
      if (Math.abs(next - current) > 0.1) {
        EventBus.emit('saturation:changed', { districtId: d, value: next });
      }
    }

    // Check win condition
    this.checkWin();
  }

  checkWin() {
    const allFull = DISTRICT_IDS.every(d => this.perDistrict[d] >= 100);
    if (allFull) {
      this.heldStreakDays += 1/SECONDS_PER_DAY;  // fractional day accumulation
      EventBus.emit('winCondition:held', { daysRemaining: WIN_HOLD_DAYS - this.heldStreakDays });
      if (this.heldStreakDays >= WIN_HOLD_DAYS) {
        EventBus.emit('winCondition:achieved');
      }
    } else {
      this.heldStreakDays = 0;
    }
  }
}
```

## 26. Sabotage & Counter-tools

```javascript
// src/empire/Sabotage.js
export const SABOTAGE_ACTIONS = {
  'fake_reviews':  { cost: 400,  exposureChance: 0.2, effect: 'yd_rating -0.5 for 3d' },
  'poach':         { cost: 1200, exposureChance: 0,    effect: 'pull driver with morale debuff' },
  'bribe':         { cost: 800,  exposureChance: 0,    effect: 'block YD garage permit 1wk' },
  'pr_story':      { cost: 2000, exposureChance: 0.1,  effect: '+1.5% saturation in chosen district' },
};

export const COUNTER_TOOLS = {
  'pr_firm':        { tier1: 1500, tier2: 3000, effect: 'block incoming fake reviews' },
  'loyalty_pkg':    { tier1: 1000, tier2: 2500, effect: 'block poaches' },
  'lawyer':         { tier1: 1200, tier2: 2800, effect: 'neutralize permit blocks' },
};

export class Sabotage {
  execute(action, target) {
    const def = SABOTAGE_ACTIONS[action];
    // Deduct cost
    // Roll backfire
    // Apply effect
    EventBus.emit('sabotage:executed', { action, success: !exposed });
  }
}
```

## 27. CabbieTV Finale

Unlocks at citywide saturation ≥ 80%. 7 in-game day campaign. Final day is story-driving.

```javascript
// src/empire/CabbieTV.js
export class CabbieTV {
  constructor() {
    this.unlocked = false;
    this.daysRemaining = 7;
    this.spentBudget = 0;
  }

  unlock() {
    this.unlocked = true;
    EventBus.emit('cabbieTV:unlocked');
  }

  spend(level, districtId) {
    const cost = { billboard: 3000, prime: 8000, superbowl: 20000 }[level];
    // Deduct cash
    this.spentBudget += cost;
    // Push saturation in target district
    EventBus.emit('cabbieTV:adSpent', { level, districtId, amount: cost });
  }

  startFinale() {
    EventBus.emit('cabbieTV:finaleStarted');
    // Load finale scene: scripted route through all 8 districts
    // with reactive events (paparazzi, rival blockades, pedestrian chaos)
  }
}
```

### Finale mission — `Finale.js`

Scripted story-drive through all 8 districts. Time-pressure with relaxed window if `Accessibility.relaxedTiming`. Completing triggers `winCondition:achieved`.

## 28. End-state & Legacy Mode

### Win cinematic trigger

```javascript
// main.js
EventBus.on('winCondition:achieved', () => {
  Telemetry.track('game:won', { sessionDuration, act1Time, act2Time, act3Time });
  PortalAdapter.interstitial('finale_complete');
  EndCinematic.play().then(() => {
    EventBus.emit('legacyMode:unlocked');
    Menu.show();
  });
});
```

### Legacy Mode

```javascript
// src/empire/LegacyMode.js
export class LegacyMode {
  start(save) {
    // Disable Yellow Dog rival
    YellowDog.disabled = true;
    // Tune up fare rates
    FareSystem.rateMultiplier = LEGACY_RATE_MUL;
    // No failure states
    DaySystem.softLossEnabled = false;
    // No ending triggers
    Saturation.winConditionDisabled = true;
  }
}
```

### Soft-loss

```javascript
// main.js
let cashNegativeDays = 0;
EventBus.on('day:ended', ({ cash }) => {
  if (cash < 0) cashNegativeDays += 1;
  else cashNegativeDays = 0;
  if (cashNegativeDays >= SOFT_LOSS_DAYS) {
    EventBus.emit('softLoss:triggered', { cause: 'cashNegative' });
  }
});

EventBus.on('softLoss:triggered', ({ cause }) => {
  SoftLossCinematic.play();
  SaveSystem.restartCurrentAct();  // preserves act progress, adds bonus cash
});
```

---

# Part V — Cross-cutting Modules

## 29. Save System

Single-slot localStorage. Schema-versioned for forward compatibility.

```javascript
// src/save/SaveSystem.js
const SCHEMA_VERSION = 1;

export const SaveSystem = {
  flush() {
    const state = this.collectState();
    const payload = { v: SCHEMA_VERSION, ts: Date.now(), state };
    localStorage.setItem('cabbie.save', JSON.stringify(payload));
    // Also push to cloud if portal supports (best-effort, non-blocking)
    if (PortalAdapter.cloudSaveSupported) {
      PortalAdapter.cloudSaveWrite(payload).catch(() => {});
    }
  },

  load() {
    const raw = localStorage.getItem('cabbie.save');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return this.migrate(parsed);
    } catch (e) { return null; }
  },

  migrate(payload) {
    let state = payload.state;
    let v = payload.v;
    // Future: run per-version migrations v1 -> v2 -> v3
    return state;
  },

  collectState() {
    return {
      cash: main.cash,
      day: DaySystem.currentDay,
      taxi: { pos: player.pos, hdg: player.hdg, fuel: player.fuel, health: player.health },
      reputation: Reputation.stars,
      act: main.currentAct,
      // Act 2 (if applicable)
      drivers: DriverRoster.hired.map(d => d.serialize()),
      fleet: VehicleFleet.vehicles.map(v => v.serialize()),
      contracts: Contracts.active.map(c => c.serialize()),
      yellowDog: YellowDog.serialize(),
      // Act 3
      app: CabbieApp.serialize?.(),
      saturation: Saturation.perDistrict,
      // Settings
      language: L.current(),
      a11y: Accessibility.serialize(),
    };
  },

  restartCurrentAct() {
    const state = this.load();
    // Reset within-act state but preserve act + cosmetic progress
    // Apply act-restart bonus cash
  },

  // Flush on key events
  init() {
    EventBus.on('cash:changed', () => this.flush());
    EventBus.on('fare:completed', () => this.flush());
    EventBus.on('day:ended', () => this.flush());
    EventBus.on('actGate:unlocked', () => this.flush());
    EventBus.on('driver:hired', () => this.flush());
    EventBus.on('vehicle:purchased', () => this.flush());
    EventBus.on('winCondition:achieved', () => this.flush());
  },
};
```

## 30. Audio System

Web Audio stem graph. Adaptive crossfading between states.

```javascript
// src/audio/AudioSystem.js
export class AudioSystem {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.sfxBus = this.ctx.createGain();
    this.musicBus.connect(this.masterGain);
    this.sfxBus.connect(this.masterGain);

    Accessibility.subscribe(() => this.syncVolumes());
    this.syncVolumes();
  }

  syncVolumes() {
    this.masterGain.gain.value = Accessibility.volumeMaster;
    this.musicBus.gain.value = Accessibility.volumeMusic;
    this.sfxBus.gain.value = Accessibility.volumeSFX;
  }

  loadStems() {
    // Pre-decode music stems into AudioBuffers
    // base, chase, rain, fare-inbound, synthwave-finale
  }
}
```

### `MusicStems.js` — adaptive music

```javascript
// src/audio/MusicStems.js
export class MusicStems {
  constructor(audio) {
    this.stems = {
      base:         { node: null, targetGain: 1.0 },
      chase:        { node: null, targetGain: 0.0 },
      rain:         { node: null, targetGain: 0.0 },
      fareInbound:  { node: null, targetGain: 0.0 },
    };
    EventBus.on('police:chaseStarted', () => this.setStem('chase', 1.0));
    EventBus.on('police:chaseEnded',   () => this.setStem('chase', 0.0));
    EventBus.on('weather:changed', (e) => this.setStem('rain', e.type.includes('rain') ? 1.0 : 0.0));
    EventBus.on('fare:pickupSpawned',  () => this.setStem('fareInbound', 1.0));
    EventBus.on('fare:boarded',        () => this.setStem('fareInbound', 0.0));
  }

  setStem(name, target) {
    this.stems[name].targetGain = target;
    // Crossfade over 400ms
  }

  swapToFinale() {
    // Fade out all stems, swap to synthwave-finale track
  }
}
```

### `SFX.js`

```javascript
// src/audio/SFX.js
export class SFX {
  constructor(audio) {
    this.buffers = {};
    EventBus.on('fare:completed', () => this.play('cash_chime'));
    EventBus.on('collectible:collected', () => this.play('pickup'));
    EventBus.on('police:chaseStarted', () => this.play('siren_start'));
    // ... ~60 cues
  }

  play(name) {
    if (Accessibility.monoAudio) /* merge to mono bus */;
    // Create AudioBufferSourceNode, connect, start
  }
}
```

## 31. Visual Effects & Post-processing

```javascript
// src/fx/PostProcessing.js
export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloomPass = new UnrealBloomPass(/* conservative */);
    this.composer.addPass(this.bloomPass);
    this.aberrationPass = /* custom shader */;
    this.composer.addPass(this.aberrationPass);
    EventBus.on('taxi:moved', ({ speed }) => this.updateAberration(speed));
  }

  updateAberration(speed) {
    if (Accessibility.reducedMotion) { this.aberrationPass.enabled = false; return; }
    const intensity = clamp((speed - 60) / 40, 0, 0.008);
    this.aberrationPass.uniforms.intensity.value = intensity;
  }
}
```

```javascript
// src/fx/FloatingText.js — +$5 NEAR MISS popups
export class FloatingText {
  constructor(root) {
    this.root = root;
    EventBus.on('near:miss', (e) => this.show(`+$5 NEAR MISS!`, 'cash'));
    EventBus.on('fare:completed', (e) => this.show(`+$${e.tip}`, 'cash'));
    EventBus.on('collectible:collected', (e) => {
      if (e.payload.cash) this.show(`+$${e.payload.cash}`, 'cash');
      if (e.payload.rep) this.show(`+${e.payload.rep.toFixed(2)}★`, 'rep');
    });
  }

  show(text, colorKey) {
    // DOM element, absolute position, float up + fade over 800ms
    // Respects Accessibility.reducedMotion (instant appear + fade)
  }
}
```

## 32. Telemetry Module

```javascript
// src/telemetry/Telemetry.js
export const Telemetry = {
  track(eventName, props = {}) {
    // Never PII. Only gameplay signals.
    PortalAdapter.trackEvent(eventName, {
      ...props,
      sessionId: this.sessionId,
      act: main.currentAct,
    });
  },

  init() {
    this.sessionId = crypto.randomUUID();
    this.track('session:start', { portal: __PORTAL__, lang: L.current() });
    EventBus.on('fare:completed', (e) => this.track('fare:completed', e));
    EventBus.on('actGate:unlocked', (e) => this.track('act:gate', e));
    EventBus.on('winCondition:achieved', () => this.track('game:won'));
    EventBus.on('softLoss:triggered', (e) => this.track('game:softloss', e));
    EventBus.on('driver:hired', (e) => this.track('driver:hired', e));
    EventBus.on('contract:won', (e) => this.track('contract:won', e));
    EventBus.on('contract:lost', (e) => this.track('contract:lost', e));
    EventBus.on('taxi:wrecked', () => this.track('taxi:wrecked'));
    EventBus.on('sabotage:executed', (e) => this.track('sabotage:executed', e));
    EventBus.on('cabbieTV:finaleStarted', () => this.track('finale:started'));
    EventBus.on('cabbieTV:finaleCompleted', (e) => this.track('finale:completed', e));
    EventBus.on('rival:escalated', (e) => this.track('rival:escalated', e));
    EventBus.on('reputation:changed', (e) => this.track('rep:changed', { stars: e.stars }));
    EventBus.on('cash:changed', (e) => this.track('cash:changed', { value: e.value }));

    // Quality signals
    this.fpsSampler = setInterval(() => {
      this.track('perf:fps', { fps: measureFPS() });
    }, 60_000);
  },
};
```

## 33. Ad Manager Module

```javascript
// src/ads/AdManager.js
export const AdManager = {
  skipTokens: 0,
  lastInterstitial: 0,

  async preRoll()       { return PortalAdapter.preRoll(); },

  async interstitial(trigger) {
    const now = Date.now();
    if (now - this.lastInterstitial < AD_INTERSTITIAL_COOLDOWN_MS) return false;
    const ok = await PortalAdapter.interstitial(trigger);
    if (ok) this.lastInterstitial = now;
    return ok;
  },

  async rewarded(rewardKey) {
    // If skip tokens available, offer bypass
    if (this.skipTokens > 0) {
      this.skipTokens -= 1;
      return true;  // grant reward without ad
    }
    return PortalAdapter.rewarded(rewardKey);
  },

  grantSkipToken() {
    this.skipTokens = Math.min(SKIP_TOKEN_CAP, this.skipTokens + 1);
  },
};

// Wire collectible:phone → skip token
EventBus.on('collectible:collected', (e) => {
  if (e.type === 'phone') AdManager.grantSkipToken();
});
```

---

# Part VI — Delivery

## 34. Milestone Plan (M0–M9)

**Total: 10 milestones. M0 is new in v2.0 (style bible + portal scaffolding before any game code).**

### M0 — Foundations (new)

**Goal:** Establish foundational infrastructure before any game code. Validates AI-first production model before scaling content.

**Deliverables:**
- Vite project scaffolded with per-portal build config (§2, §9)
- `StyleBible.js` loaded with reference paths (palettes, typography, refs)
- Full style bible authored in `docs/style-bible/` (palettes for all 8 districts, vehicle reference sheet, portrait reference, audio direction, billboard voice)
- `Accessibility.js` with all settings wired to localStorage
- `Localization.js` with `en.json` scaffolded (~50 seed keys) and CI check for missing keys
- `EventBus.js` implemented and tested with a dummy event
- `PortalAdapter.js` with all 4 adapters (crazygames, newgrounds, itch, dev) — stubs where SDK integration is deferred
- `SaveSystem.js` schema v1 with stub state and load/flush round-trip
- `constants.js` with §36 starting values
- All 5 launch language files present with placeholder translations of the 50 seed keys

**Acceptance criteria:**
- [ ] `npm run build:dev` produces a working empty scene with title screen
- [ ] `npm run build:crazygames` / `:newgrounds` / `:itch` produce bundles with correct SDK stubs
- [ ] Title screen renders in EN, FR, DE, PT-BR, ES (browser-detected or setting-override)
- [ ] Style bible referenced correctly — no hard-coded colors or fonts anywhere
- [ ] Accessibility settings panel shows all toggles; state persists across reload
- [ ] Event bus dummy round-trip works
- [ ] No silent console errors in any build

**Sessions:** ~3. **Elapsed (part-time):** 1–1.5 weeks.

### M1 — Act 1 Core Driving

**Goal:** Third-person arcade driving on a single district grid with a playable fare loop.

**Modules built:**
- `world/City.js`, `world/District.js` (Old Port), `world/Weather.js` (clear-noon only)
- `player/Taxi.js`, `player/Controls.js`, `player/Physics.js`
- `camera/FollowCamera.js`
- `world/Traffic.js` (basic: 10 cars, straight drive, turn at intersections)
- `game/FareSystem.js` (pickup → dropoff loop, no comfort yet)
- `hud/HUD.js`, `SpeedReadout.js`, `CashReadout.js`, `DirectionArrow.js`
- `ui/StartScreen.js`

**Acceptance criteria:**
- [ ] Taxi spawns at road intersection (not inside building) — P2
- [ ] WASD + arrows + tilt + touchpad all work; persists across reload
- [ ] Fare pickup spawns, arrow points correctly (§4, P3)
- [ ] Board pickup when taxi stops near pin
- [ ] Dropoff awards cash
- [ ] Steering: right-turn increases heading (§4, P1)
- [ ] Camera uses lookAt, no coordinate bugs
- [ ] FPS ≥55 on desktop, ≥40 on midrange mobile
- [ ] Zero silent console errors during full fare cycle
- [ ] All strings localized via `L.t()` (no inline text)

**Sessions:** ~3. **Elapsed:** 1 week.

### M2 — Act 1 Polish & Systems

**Goal:** Add comfort, weather variety, day cycle, save, and audio.

**Modules built:**
- `game/Comfort.js` (P11: reset on fare:boarded)
- `world/Weather.js` (full 7 skins + rain friction P12)
- `game/DaySystem.js` (5-min days, expenses, rollover)
- `ui/DaySummary.js`
- `save/SaveSystem.js` integration
- `audio/AudioSystem.js`, `MusicStems.js`, `SFX.js`
- `fx/FloatingText.js`
- `hud/ComfortBar.js`, `FuelBar.js`

**Acceptance criteria:**
- [ ] Comfort meter behaves per §17: reset on board, drained by crashes/sharp turns
- [ ] Tip multiplier applies at drop-off
- [ ] Weather rolls at day end, applies at day resume (P12)
- [ ] Rain friction applies, night skin darkens sky
- [ ] Day/night cycle functional
- [ ] Save/load round-trip survives reload mid-fare
- [ ] Music stems crossfade on chase/rain/fare events
- [ ] FloatingText popups respect reduced-motion
- [ ] All 60 SFX cues wired or stubbed

**Sessions:** ~4. **Elapsed:** 1.5 weeks.

### M3 — Act 1 Streets

**Goal:** Police AI, rival taxis, reputation, collectibles, Act 1 gate. Completes Act 1 mechanical scope.

**Before writing any M3 code, Claude Code MUST:**
1. Re-read §4 Coordinate System in full.
2. Explicitly state which sign conventions apply to police car heading AI.
3. Confirm police car uses `hdg += turn * rate` for right-turn (not `-=`).
4. Confirm police car mesh rotation uses `mesh.rotation.y = hdg` (not `-hdg`).
5. Confirm police pursuit uses `Math.atan2(dx, dz)`, not `atan2(dz, dx)`.

This forced-reasoning step exists to prevent P1/P2/P3 class regressions.

**Modules built:**
- `game/PoliceSystem.js` (full pursuit AI, bribe, escape)
- `traffic/RivalTaxi.js` (subscribes to fare:pickupSpawned, races player)
- `world/Collectibles.js` (full: coffee, fuel, wallets, vape, phones)
- `game/Reputation.js`
- `hud/ReputationStars.js`, `BribeButton.js`
- `ui/ActGate.js` (Act 1 gate progress UI)
- Night-shift weather skin

**Acceptance criteria:**
- [ ] Police car pursues correctly using §4 conventions
- [ ] 500u escape distance ends chase (300u with `relaxedPolice`)
- [ ] Bribe ($50) dismisses chase immediately
- [ ] Rival taxis steal unclaimed fares
- [ ] All 5 collectible types spawn and grant correct rewards
- [ ] Phone pickup grants skip token, visible in HUD
- [ ] Reputation: +0.1/fare +0.05/comfort pt, -0.3/crash, -0.5/fine
- [ ] Act 1 gate unlocks at $10K + 4.0★
- [ ] Night-shift skin: +25% fare rates, threshold 95 km/h with `relaxedPolice`
- [ ] Act 1 playable end-to-end to gate

**Sessions:** ~4. **Elapsed:** 1.5–2 weeks.

### M4 — Act 1 Art & Audio Pass

**Goal:** Replace prototype assets with AI-generated final art. Validates AI-first production at scale.

**Deliverables:**
- Old Port district fully dressed (palette locked, billboards painted, signage placed)
- Player taxi final model (4 damage states)
- 6 NPC traffic models final
- Police + rival taxi models final
- Music stems integrated (base + chase + rain + fare-inbound)
- All SFX cues replaced with final audio
- Ambient bed (day city, night city, rain)
- Billboard art for Old Port (~20 placements)

**Acceptance criteria:**
- [ ] All placeholder assets replaced
- [ ] `docs/style-bible/` complete with locked reference sheets
- [ ] Provenance `meta.json` for every shipped asset
- [ ] Visual consistency playtest passes (outside observer: "does this feel like one thing?")
- [ ] No dropped FPS compared to M3
- [ ] Performance: ≥55 FPS desktop, ≥40 FPS midrange mobile

**Sessions:** ~3 (generation in parallel with integration). **Elapsed:** 3–4 weeks (including curation sprint).

**★ Named break after M4 — see PRD §23 Break 1.**

### M5 — Act 2 Foundation

**Goal:** Unlock all 8 districts, introduce dispatch board, hiring, drive/manage toggle.

**Modules built:**
- All 7 remaining districts (art + palette + billboards)
- `fleet/DispatchBoard.js` (mobile-first, 2-col tablet, 3-col desktop)
- `fleet/Driver.js`, `DriverRoster.js`, `Morale.js`
- `hud/ModeToggle.js`
- Driver hire/fire UI

**Acceptance criteria:**
- [ ] All 8 districts navigable and visually distinct
- [ ] Dispatch board renders at 375px portrait cleanly
- [ ] Hire/fire roster cap 12 enforced
- [ ] All 4 driver tiers with stats + wages correct
- [ ] Morale ticks daily; low morale → quit
- [ ] Mode toggle drive/manage functional
- [ ] Drive-mode: 1.3× personal earnings active
- [ ] No silent errors switching between modes mid-day
- [ ] Full-parity mobile UX validated on real phone

**Sessions:** ~6. **Elapsed:** 3–4 weeks.

### M6 — Act 2 Systems

**Goal:** Complete Act 2: fleet management, contracts, Yellow Dog rival, Act 2 gate.

**Modules built:**
- `fleet/VehicleFleet.js` (20 vehicle cap, 3 classes, 4 upgrade systems)
- Vehicle maintenance + breakdown
- `fleet/Contracts.js` (9 hotel + 3 airport + 12 corporate)
- `fleet/YellowDog.js` (4 escalation thresholds)
- Counter-tool system (billboards, retention bonus, security)
- Act 2 gate

**Acceptance criteria:**
- [ ] Vehicles purchaseable, upgradeable, service/breakdown loop works
- [ ] All 24 contracts available per unlock schedule
- [ ] Weekly SLA evaluation, 2-warning breach rule (skip breach with `relaxedSLAs`)
- [ ] Yellow Dog escalates at 30/50/70/90% share with correct events
- [ ] Counter-tools purchaseable and work against rival escalation
- [ ] Act 2 gate triggers on 10 vehicles + 3 districts + <20% rival share
- [ ] Full Act 2 playable to gate
- [ ] **WIP build submitted to CrazyGames for curator feedback** (PRD R8)

**Sessions:** ~7. **Elapsed:** 3–4 weeks.

**★ Named break after M6 — see PRD §23 Break 2. Use curator feedback cycle as the break.**

### M7 — Act 3 Foundation

**Goal:** CabbieApp three-dial control, Yellow Dog joins platform, saturation map.

**Modules built:**
- `empire/CabbieApp.js` (three dials + recalculation logic)
- `empire/Saturation.js` (per-district tracking, win-condition checker)
- Act 2→3 transition cinematic
- Yellow Dog platform-join thesis beat (cinematic + dialog)
- CabbieApp UI (mobile-first control panel + saturation visualization)

**Acceptance criteria:**
- [ ] Three dials functional, effects correctly interact
- [ ] Yellow Dog joining platform triggers cinematic
- [ ] Rival drivers earning on your take rate functional
- [ ] Saturation decays on neglect, rises on penetration
- [ ] 100% held 3 days → win condition triggers
- [ ] Thesis beat playtested with non-gamers (PRD R6)
- [ ] Act 3 core loop functional

**Sessions:** ~6. **Elapsed:** 3 weeks.

### M8 — Act 3 Systems

**Goal:** Complete Act 3 with sabotage, CabbieTV finale, end-state, Legacy Mode.

**Modules built:**
- `empire/Sabotage.js` (4 actions + 3 counter-tools)
- `empire/CabbieTV.js` (7-day campaign + 3 ad-spend levels)
- `empire/Finale.js` (scripted story-drive mission)
- End cinematic + credits
- `empire/LegacyMode.js`
- Soft-loss cinematic + restart-in-act

**Acceptance criteria:**
- [ ] All 4 sabotage actions execute with correct outcomes
- [ ] All 3 counter-tools work with upgrade tiers
- [ ] Yellow Dog runs sabotage against player on scripted cadence
- [ ] CabbieTV unlocks at 80% citywide saturation
- [ ] 3 ad-spend levels all work with correct costs/effects
- [ ] Finale mission: route through all 8 districts under timer
- [ ] `relaxedTiming` works on finale
- [ ] End cinematic plays on win; credits roll; Legacy Mode unlocks
- [ ] Legacy Mode loads sandbox without failure states
- [ ] Soft-loss triggers after 3 cash-negative days, restarts at act start with bonus cash
- [ ] Full 3-act playthrough start-to-finish without errors

**Sessions:** ~6. **Elapsed:** 3 weeks.

**★ Named break after M8 — see PRD §23 Break 3.**

### M9 — Polish & Submit

**Goal:** Ship.

**Deliverables:**
- Localization complete for all 5 languages (FR, DE, PT-BR, ES) with spot-check
- Full WCAG 2.2 AA audit pass
- Per-portal builds tested end-to-end (CrazyGames, Newgrounds, itch.io, dev)
- SDK integration verified on each portal
- License audit on all AI-generated assets
- Telemetry dashboard validated
- `LAUNCH_WAIVERS.md` (if needed)
- Post-launch runbook
- Launch devlog post
- Three full playthrough recordings archived

**Acceptance criteria:**
- [ ] All §24 shipping-gate checkboxes true (or waived per protocol)
- [ ] All portals submit successfully
- [ ] ≤5 active waivers
- [ ] Launch date set and held

**Sessions:** ~4. **Elapsed:** 3–4 weeks.

## 35. Known Pitfalls & Rules

**This is the most valuable section of the spec after §4.** Every bug that bit the project gets a permanent entry. Read before every new module.

Format: **Pitfall N — name**
- **Symptom:** what the player/dev sees
- **Cause:** root cause
- **Fix:** correct implementation
- **Rule:** the permanent guard

### P1 — Heading sign inversion on mesh rotation

- **Symptom:** Left input makes the taxi visibly turn right, or vice versa. Steering feels backwards.
- **Cause:** `mesh.rotation.y = -hdg` instead of `mesh.rotation.y = hdg`.
- **Fix:** Always use `mesh.rotation.y = hdg`. The forward vector `(sin(hdg), 0, cos(hdg))` and the mesh orientation MUST use the same heading value, no negation.
- **Rule:** §4 Coordinate System is authoritative. Any code that sets `rotation.y` to something other than raw `hdg` is wrong.

### P2 — Spawning inside buildings

- **Symptom:** Taxi or NPCs spawn at block centers, inside buildings, stuck in geometry.
- **Cause:** Using `blockCenter(i, j)` as a spawn position.
- **Fix:** Use `roadIntersection(i, j)` or mid-road positions. Block centers are for buildings only.
- **Rule:** `isOnRoad(x, z)` must return true before any entity spawns at a position.

### P3 — Direction arrow points wrong way

- **Symptom:** HUD direction arrow points away from the fare pin.
- **Cause:** `Math.atan2(dz, dx)` instead of `Math.atan2(dx, dz)`, OR adding instead of subtracting hdg for relative angle.
- **Fix:** `const rel = Math.atan2(target.x - taxi.x, target.z - taxi.z) - taxi.hdg`.
- **Rule:** §4 specifies `atan2(dx, dz)`. Always.

### P4 — Steering direction inverted

- **Symptom:** A/left makes the taxi turn right.
- **Cause:** `hdg -= turn * dt` for right-turn input.
- **Fix:** Right-turn → `hdg += turn * dt`. Left-turn → `hdg -= turn * dt`. Match the clockwise-from-above convention.
- **Rule:** Right-turn INCREASES hdg. This is inseparable from the sin(hdg)/cos(hdg) forward vector convention.

### P5 — Camera inverts on reverse

- **Symptom:** Driving in reverse, the camera does strange flips or the player loses visual orientation.
- **Cause:** Camera trying to face the direction of motion instead of the taxi's forward.
- **Fix:** Camera ALWAYS points the direction the taxi is facing (its `hdg`), regardless of motion direction. Use `camera.lookAt(taxi.pos + forward * lookAhead)`.
- **Rule:** Camera follows heading, not velocity.

### P6 — Three.js Euler replacement

- **Symptom:** Click handlers silently stop working after setting rotation. No console errors.
- **Cause:** `Object.assign(mesh, { rotation: { x:0, y:1, z:0 } })` replaces Three.js's Euler object with a plain JS object, throwing a later silent error.
- **Fix:** Always set rotation via methods or direct property: `mesh.rotation.y = val`. NEVER spread or Object.assign rotation.
- **Rule:** For Three.js objects, only use `.set(x,y,z)` or direct property assignment on existing Euler/Vector3 instances. Never replace them.

### P7 — Silent JS errors break event listeners

- **Symptom:** A button that worked before some unrelated change now does nothing.
- **Cause:** A silent error early in init code prevents the event listener from being registered.
- **Fix:** Wrap init code in try/catch during development. Check console on every change. Never ignore warnings.
- **Rule:** Zero console errors is a M1 acceptance criterion and every subsequent milestone.

### P8 — Constants scattered across files

- **Symptom:** Tuning a value requires grepping 5 files and hoping to find all references.
- **Cause:** Inlining magic numbers like `0.026` or `82` in game logic.
- **Fix:** All tunable numbers live in `constants.js` (§36). Import them.
- **Rule:** If you type a number that isn't 0, 1, or part of math, it belongs in constants.

### P9 — Stale camera lookAt on respawn

- **Symptom:** After taxi respawn, camera keeps looking at old position.
- **Cause:** Camera's internal lookAt cache not reset when taxi.pos changes discontinuously.
- **Fix:** Call `camera.resetFollowState()` on respawn; reset `currentPos` and `currentLookAt` to the new taxi position.
- **Rule:** Any discontinuous teleport (respawn, district change) must reset all dampened state.

### P10 — Localization key typos crash UI

- **Symptom:** `L.t('hud.speeed')` (typo) renders as `{hud.speeed}` or undefined.
- **Cause:** No CI check for referenced-but-missing keys.
- **Fix:** Lint pass scanning all `L.t(` and `L.pick(` call sites against `en.json`. CI fails on unknown keys.
- **Rule:** Add new strings to `en.json` first, then reference them. Never the other way around.

### P11 — Comfort state carry-over between fares

- **Symptom:** Passenger boards with comfort bar already depleted from previous ride.
- **Cause:** Reset logic triggered on `fare:pickupSpawned` instead of `fare:boarded`.
- **Fix:** Comfort resets on `fare:boarded`. Not on pickup spawn, not on pickup tap.
- **Rule:** State that belongs to a specific fare instance resets at the start of that instance, not at the start of the approach.

### P12 — Weather changes mid-fare

- **Symptom:** Car grip suddenly changes while carrying a passenger; feels like a bug.
- **Cause:** Weather roll happening on a timer that can fire mid-fare.
- **Fix:** Weather rolls at `day:ended` only, applied on `day:resume`.
- **Rule:** Environmental state changes only at day boundaries, never mid-gameplay.

### P13 — Reserved for v2.0 additions

(To be populated during M0–M9 as new pitfalls are discovered.)

## 36. Constants Reference

All tunable numbers live in `src/constants.js`. This section mirrors the file structure.

```javascript
// src/constants.js

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
export const MAX_SPEED         = 95;     // km/h (display), matched in world units/s
export const ACCEL_RATE        = 28;     // units/s²
export const BRAKE_RATE        = 45;
export const FRICTION_DECAY    = 0.6;
export const TURN_RATE_LOW     = 1.6;    // rad/s at 15 km/h
export const TURN_RATE_HIGH    = 0.9;    // rad/s at 80 km/h
export const FUEL_BURN_RATE    = 0.0005; // per unit-distance

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
export const FARE_BASE_RATE    = 0.08;  // $ per world-unit distance
export const PICKUP_RADIUS     = 3;
export const DROPOFF_RADIUS    = 3;
export const BOARD_SPEED_MAX   = 2;     // km/h to board
export const DROPOFF_SPEED_MAX = 2;
export const FARE_TIMEOUT_S    = 90;

// Fare dialog destination types
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
export const POLICE_SPEED_THRESHOLD = 82;   // km/h
export const POLICE_SPEED_RELAXED   = 95;   // with Accessibility.relaxedPolice
export const POLICE_CHASE_FRAMES    = 220;  // ~3.7s at 60fps
export const POLICE_SPAWN_DISTANCE  = 100;  // units behind taxi
export const POLICE_ESCAPE_DISTANCE = 500;
export const POLICE_ESCAPE_RELAXED  = 300;
export const POLICE_TURN_RATE       = 1.2;  // rad/s
export const POLICE_SPEED           = 22;   // world units/s
export const POLICE_BRIBE           = 50;   // $

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
export const COLLECT_RESPAWN_MS   = 60_000;  // avg; randomized 45–90s
export const COLLECT_WEIGHTS      = { coffee: 0.40, fuel: 0.20, wallet: 0.25, vape: 0.10, phone: 0.05 };

// ============================================================
// DAY SYSTEM & EXPENSES
// ============================================================
export const SECONDS_PER_DAY   = 300;  // 5 real minutes per in-game day
export const DAILY_RENT        = 200;
export const FUEL_COST_PER_UNIT = 0.02;

// ============================================================
// ACT GATES
// ============================================================
export const ACT1_GATE_CASH   = 10000;
export const ACT1_GATE_RATING = 4.0;
export const ACT2_GATE_VEHICLES     = 10;
export const ACT2_GATE_DISTRICTS    = 3;
export const ACT2_GATE_RIVAL_SHARE  = 0.2;  // <20%
export const ACT3_START_SATURATION = 0.0;
export const WIN_HOLD_DAYS = 3;

// ============================================================
// ACT 2 — DRIVERS
// ============================================================
export const ROSTER_CAP = 12;
export const CANDIDATE_POOL_SIZE = 6;
export const TIER_STATS = {
  rookie:  { speed: 0.5, comfort: 0.5, reliability: 0.5, loyalty: 0.5, wageBaseline: 80 },
  journey: { speed: 0.65, comfort: 0.65, reliability: 0.65, loyalty: 0.6, wageBaseline: 150 },
  pro:     { speed: 0.8, comfort: 0.8, reliability: 0.8, loyalty: 0.7, wageBaseline: 250 },
  ace:     { speed: 0.9, comfort: 0.9, reliability: 0.9, loyalty: 0.8, wageBaseline: 450 },
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
  suspension: [null, 400, 1200, 3200, 8000],
  fuelTank:   [null, 300, 900,  2400, 6000],
  brakes:     [null, 450, 1350, 3600, 9000],
};
export const WEAR_RATE = 0.0003;
export const BREAKDOWN_CHANCE_PER_TICK = 0.002;

// ============================================================
// ACT 2 — CONTRACTS
// ============================================================
export const CONTRACT_PAY = { hotel: 500, airport: 1500, corporate: 900 };  // weekly
export const CONTRACT_SLA_HOTEL     = 4.0;   // weekly comfort avg
export const CONTRACT_SLA_AIRPORT   = 0.95;  // on-time rate
export const CONTRACT_SLA_CORPORATE = 'pro'; // driver tier min

// ============================================================
// ACT 2 — YELLOW DOG
// ============================================================
export const YD_THRESHOLDS = [0.30, 0.50, 0.70, 0.90];
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
export const CABBIETV_DAYS = 7;
export const CABBIETV_AD_COST = { billboard: 3000, prime: 8000, superbowl: 20000 };

// ============================================================
// ADS
// ============================================================
export const AD_INTERSTITIAL_COOLDOWN_MS = 5 * 60 * 1000;  // 5 min
export const SKIP_TOKEN_CAP = 3;

// ============================================================
// LEGACY MODE
// ============================================================
export const LEGACY_RATE_MUL = 1.25;

// ============================================================
// SOFT LOSS
// ============================================================
export const SOFT_LOSS_DAYS = 3;
export const SOFT_LOSS_BONUS = { act1: 2000, act2: 20000, act3: 100000 };
```

## 37. Appendices

### A. Deployment recipes

```bash
# Self-hosted dev build
npm run build:dev
# Upload dist/dev/ to Netlify or GitHub Pages

# CrazyGames submission
npm run build:crazygames
# Zip dist/crazygames/ and upload via CrazyGames developer portal

# Newgrounds submission
npm run build:newgrounds
# Zip dist/newgrounds/ and upload via Newgrounds project editor

# itch.io submission
npm run build:itch
# Upload dist/itch/ as HTML5 game to itch.io, enable "play in browser"
```

Vite config for portal base paths:

```javascript
// vite.config.js snippet
base: portal === 'dev' && repoName ? `/${repoName}/` : './',
```

### B. Three.js r128 gotchas

```javascript
// Valid geometries in r128
new THREE.BoxGeometry(w, h, d);
new THREE.CylinderGeometry(rt, rb, h, seg);
new THREE.SphereGeometry(r, wSeg, hSeg);
new THREE.PlaneGeometry(w, h);
// THREE.CapsuleGeometry is r142+ — DO NOT USE. Compose from Cylinder+Sphere instead.

// Materials
new THREE.MeshLambertMaterial({ color });   // fast, no specular
new THREE.MeshPhongMaterial({ color, shininess });   // specular
// Avoid MeshStandardMaterial for player-visible geometry on mobile (too slow)

// Lights
new THREE.AmbientLight(color, intensity);
new THREE.DirectionalLight(color, intensity);  // one for sun, cast no shadows
// Max 8 dynamic lights. Blob shadows for characters.

// Setting position/rotation — see P6
mesh.position.set(x, y, z);      // ✅
mesh.position.x = 5;             // ✅
mesh.rotation.y = val;           // ✅
mesh.rotation.set(x, y, z);      // ✅
Object.assign(mesh, {...});      // ❌ NEVER on rotation/position
```

### C. Glossary

(See PRD §Appendix for the full glossary. Terms specific to implementation:)

- **hdg** — heading, scalar angle in radians. See §4.
- **road intersection** — position where two roads cross. Valid spawn point.
- **block center** — position at center of a building block. NEVER spawn here.
- **forward vector** — `(sin(hdg), 0, cos(hdg))`. See §4.
- **stem** — a music track layered adaptively with other stems. See §30.
- **adapter** — per-portal SDK facade. See §9.
- **provenance** — AI-asset generation metadata stored alongside the asset. See §6.

### D. Code style

- 2-space indentation, LF line endings
- Semicolons required
- Single quotes for strings, backticks for templates
- ES modules (import/export), no CommonJS
- No TypeScript, no Flow, no decorators
- JSDoc on exported functions only when behavior is non-obvious
- Comments explain *why*, not *what*
- Module exports: prefer named over default

### E. Pitfall catalog change log

| Version | Pitfalls |
|---|---|
| v1.0 | P1–P10 (from v1 prototyping) |
| v1.2 | +P11, +P12 (from M2 shipping) |
| v2.0 | P1–P12 carried forward, ready for M0–M9 additions |

---

*End of Technical Specification — Cabbie v2.0*
*This spec implements `CABBIE_PRD.md`. Decisions here are implementation; product decisions are the PRD's authority.*
*Living document: updated after every milestone with completion status, new pitfalls, new constants.*
