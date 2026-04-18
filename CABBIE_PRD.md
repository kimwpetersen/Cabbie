# CABBIE — Product Requirements Document
**Version 1.0 | Canonical Product Reference**
*Authored April 17, 2026 · Companion to CABBIE_SPEC.md*

---

## Document purpose

This PRD is the authoritative product reference for Cabbie. It covers *what* the game is, *who* it is for, *why* it is being built, and *how success is measured*. Implementation detail — coordinate conventions, module paths, constants, pitfall catalog — lives in `CABBIE_SPEC.md` and is referenced here but not duplicated.

Use this document when framing the game for external audiences, locking scope decisions, evaluating proposed changes, or preparing for milestone review. Use `CABBIE_SPEC.md` when writing or reviewing code.

---

## Table of Contents

**Part I — Vision**
1. Executive Summary
2. Vision & Design Pillars
3. Target Player
4. Reference DNA

**Part II — Scope & Business**
5. Distribution & Business Model
6. Platform Scope
7. Quality Bar & Performance Budgets

**Part III — Game Design**
8. Three-Act Progression Overview
9. Driving Feel — The Lane Splitter × Mujaffa Hybrid
10. Act 1 — The Hustle
11. Act 2 — The Fleet
12. Act 3 — The Empire
13. Economy & Balance
14. Content Targets

**Part IV — Production & UX**
15. Tone, Art & Audio Direction
16. UX Principles
17. Accessibility & Localization
18. Ad Integration & Monetization

**Part V — Delivery**
19. Success Metrics
20. Scope Priorities: P0 / P1 / P2 / P3
21. Development Model
22. Risks & Mitigations
23. Roadmap & Milestones
24. Definition of Shipped

**Appendix** — Doc stack, glossary, references

---

# Part I — Vision

## 1. Executive Summary

Cabbie is a browser-based arcade driving game with a three-act business-empire progression, developed as an AI-first solo production for distribution on CrazyGames, Newgrounds, and itch.io. The game fuses Lane Splitter's third-person driving feel with Mujaffa-spillet's city personality and Lula: The Sexy Empire's gated act progression, targeting a 5–10 hour full-arc playthrough with ≥8% completion rate as the north-star success metric. Cabbie is built by Claude Code under Kim's direction, with all art, audio, and localization generated through AI pipelines and curated to a locked style bible. The shipped-state ambition is full three-act content at WCAG 2.2 AA accessibility, in five launch languages, with portal-appropriate monetization that respects player agency. Launch target: September–November 2026.

## 2. Vision & Design Pillars

Cabbie is what you get when you take the arcade driving joy of a 2005 Flash game, fold in the street-level humor of Copenhagen's Mujaffa, and build it on the management scaffolding of a 1998 business sim — then render the whole thing in a modern browser using Three.js and AI pipelines.

The four design pillars:

**Feel good to drive, always.** The driving is the soul. Every system — economy, management, progression — reinforces it. If any system makes driving feel less fun, that system loses the argument.

**Progression is earned, not granted.** Each act gate requires real gameplay achievement. No pay-to-skip. No grind-to-unlock. The player's hours become the player's satisfaction.

**Do right by players, get rewarded fairly.** No dark patterns. No predatory ads. No exploitative mechanics. Portal monetization exists, but the player who refuses every rewarded ad beats the same game as the player who watches them all — just a bit slower.

**AI-first production as a deliberate experiment.** Cabbie tests whether a solo curator with AI pipelines can ship at 5-person-indie-team quality. Succeeding validates a production model; failing teaches exactly where the model breaks.

## 3. Target Player

**Primary audience.** Browser-game portal regular, 16–35 years old, plays in 15–45 minute sessions during breaks or downtime. Has a phone and a laptop but not a console. Appreciates games with attitude, personality, and some edge — not cruelty. Enjoys arcade driving (Crazy Taxi, Lane Splitter, Road Rash) and light management games (Game Dev Tycoon, Lemonade Tycoon). Wants a game that respects their time and doesn't ask for an email address.

**Secondary audience.** Indie game enthusiasts curious about AI-first production. Developers watching for new solo-production patterns. Community members who follow devlogs and care about craft.

**Anti-target — who Cabbie is not for.** Hardcore sim-racing players looking for tire-model realism. Free-to-play whale audiences expecting premium currency and power-ups. Children under 13 (content is PG-13). Players expecting narrative-driven drama or deep RPG mechanics.

## 4. Reference DNA

Cabbie is built from three specific reference games, each contributing distinct DNA. The synthesis is deliberate: no single source would produce this game, and no pair of them either. The three-way fusion is the thesis.

**Lane Splitter (Fractiv LLC)** contributes the *body*: third-person behind-vehicle camera, arcade-forgiving physics, near-miss scoring, magnetic pickups, daily environment rotation, upgrade-economy loops, and the score-multiplier feedback pattern. Everything about how Cabbie feels moment-to-moment when the wheels are turning.

**Mujaffa-spillet (Danmarks Radio, 2000)** contributes the *face*: fixed learnable city geography, absurdist collectibles, music-as-cue audio design, reactive NPC pedestrians, irreverent billboards, visible damage, and tonal edge without meanness. Everything about how Cabbie's world feels alive and specific.

**Lula: The Sexy Empire (cdv/Interactive Strip, 1998)** contributes the *scaffolding*: three-act gated progression, staff hiring with morale and stats, economy tick systems, competitor sabotage, multi-location expansion, and a splashy final win condition. Everything about how Cabbie's ambition grows past the driver's seat.

A cross-reference table showing specific element-to-feature mappings lives in `CABBIE_SPEC.md §2`.

---

# Part II — Scope & Business

## 5. Distribution & Business Model

Cabbie ships simultaneously across three portals, plus a self-hosted dev build:

**CrazyGames (primary).** Main revenue and visibility target. Large audience, competent curator team, reasonable content standards for PG-13 browser games.

**Newgrounds (community target).** Values edgy-but-quality browser games. Community visibility and potential leaderboard integration.

**itch.io (long tail).** No portal SDK; tip-jar model replaces rewarded ads. Portfolio and direct-support channel.

**Self-hosted GitHub Pages build (dev / demo).** Ad-free, SDK-free. Used for portfolio demos and development iteration.

**Poki is explicitly not a launch target.** Cabbie's PG-13 tone is likely too edgy for Poki's family-friendly moderation. Revisitable post-launch if the game lands well elsewhere and a content-light variant is worth producing.

**Business positioning: portfolio-first, revenue-second.** This is a substantial creative work, a production-model experiment, and a portfolio piece. Revenue is a useful signal but not the north star (see §19). If the game's engagement metrics are healthy, modest portal revenue follows. If they're not, revenue tuning won't save it.

## 6. Platform Scope

**Full-parity commitment.** Every screen works properly on phone, tablet, and desktop. No "mobile version" or "desktop version" — one codebase, one experience, responsive to the device.

**Primary device matrix:**

| Device class | Target | Notes |
|---|---|---|
| Mobile phone portrait | iPhone SE (375×667) to Pixel 7 (412×915) | Touch + tilt controls |
| Mobile phone landscape | Same devices rotated | Supported, not primary |
| Tablet portrait | iPad mini (744×1133) to iPad Pro (1024×1366) | Touch + tilt |
| Tablet landscape | Same rotated | Supported |
| Laptop / Desktop | 1280×720 minimum, 1920×1080 sweet spot, 4K supported | Keyboard (WASD + arrows), mouse optional |

**Breakpoints:**

- `< 640px` — single-column mobile layout
- `640–1024px` — tablet / small-desktop 2-column
- `> 1024px` — desktop 3-column where applicable

**Controls per platform:**

- **Desktop:** WASD + arrow keys (remappable). Mouse not required for gameplay.
- **Mobile (tilt):** Device orientation steers; touch accelerates/brakes.
- **Mobile (touch-pad):** Two thumb-pads when no gyro available.
- **All:** Toggleable in settings; persists.

**Mobile-specific commitments:**

- Portrait is primary orientation.
- iOS safe-area respected.
- No multi-finger gestures required.
- System back gesture acts as pause, not exit.

## 7. Quality Bar & Performance Budgets

Hard targets for shipped build:

| Metric | Target |
|---|---|
| Mean FPS (desktop, 1080p) | ≥55 |
| Mean FPS (midrange mobile) | ≥40 |
| P95 initial load time | ≤6 seconds |
| Crash-free session rate | ≥99.3% |
| Initial bundle size | ≤10MB |
| Total assets loaded | ≤50MB |
| Memory footprint, steady state | ≤300MB |
| Cold-start to first input | ≤3 seconds |
| Time to first fare available | ≤45 seconds |

**Rendering budget.** Three.js r128, WebGL 1.0 compatible (WebGL 2 features avoided for portal compatibility). Max 8 dynamic lights. Shadows blob-only, not dynamic. Post-processing limited to gentle bloom + conditional chromatic aberration at high speed.

**Audio budget.** Web Audio API. Music stems decoded and cached on session start. SFX pre-decoded. Max simultaneous SFX voices: 16.

**Network budget.** Telemetry only — no cloud save at launch, no assets loaded from CDN mid-session. Offline play after initial load is a design goal.

---

# Part III — Game Design

## 8. Three-Act Progression Overview

Cabbie unfolds in three acts, each approximately doubling in complexity and narrative stakes, but sharing the same core driving experience throughout. The progression is a seamless escalation, not a genre switch.

| Act | Theme | Player state | Primary mode |
|---|---|---|---|
| **Act 1 — The Hustle** | Survival | 1 cab, 1 driver, 1 district | Driving |
| **Act 2 — The Fleet** | Scaling | Up to 20 cabs, up to 12 drivers, 8 districts unlocked | Drive or manage, daily choice |
| **Act 3 — The Empire** | Leverage | Platform operator, Yellow Dog absorbed, citywide market | Drive, manage, or direct — player chooses |

**Pacing targets:**

- Act 1 gate reachable in ~20–25 in-game days (2.5–4 real hours of focused play)
- Act 2 gate reachable in ~30–60 in-game days from Act 1 gate (2.5–5 real hours)
- Act 3 win reachable in ~20–40 in-game days from Act 2 gate (1.5–3 real hours)
- **Full 3-act run: 5–10 real hours to credits**
- **Typical session: 15–45 minutes**

Each act builds on the prior without abandoning its mechanics. You still drive in Act 3; you just also run the platform that ate your competitor. The game's thesis — that the person who owns the algorithm eats the people who drive the cars — is earned through this layered progression, not told as backstory.

## 9. Driving Feel — The Lane Splitter × Mujaffa Hybrid

**Core principle.** Cabbie plays like Lane Splitter with the soul of Mujaffa. The moment-to-moment physicality comes from Lane Splitter — arcade-forgiving handling, dynamic camera, near-miss scoring, magnetic pickups, speedline feedback. The personality and world readability come from Mujaffa — a fixed learnable city, absurdist collectibles, music-as-cue, reactive NPCs, visible damage. The two layer. Lane Splitter is the body. Mujaffa is the face.

### Camera & city

- Behind-cab camera, height 5.5u, offset 8u back, look-ahead bias 2u toward direction of travel (extends `CABBIE_SPEC.md §8`). FOV locked at 75°. No speed zoom — it breaks readability.
- Camera pulls back 1.0u at >60 km/h, tightens 0.5u on reverse or <5 km/h. Damping 0.12 translation, 0.08 rotation. No mouse-orbit — portal touch players fight it.
- City is a **fixed 7×7 grid per district**, not endless. Lane Splitter's scroll-and-dodge becomes Mujaffa's learn-the-streets. Players build spatial memory of profitable fare zones — like knowing Nørrebro cold in the original.
- **Daily skin rotation** paints the same city seven moods: rain-night, gold-hour rush, festival-lit, fog-dawn, neon-midnight, clear-noon, storm. One city, zero content cost, huge mood delta.

### Physics & control feel

- Arcade, not sim. Target: a new player drives within 30 seconds. No manual gears, no tire-heat, no handbrake as separate input.
- Grip 0.92 dry, 0.85 wet. Slide recovery ~0.7s. Top speed 95 km/h (police threshold 82). Acceleration front-loaded: 0–50 km/h in 2.4s, 50–90 in 4.1s. Satisfying pull, forgiving top-end.
- Steering weighted by speed: tight at low speed for fare-area navigation, looser at speed for controlled drift. Max turn rate 1.6 rad/s at 15 km/h, 0.9 rad/s at 80 km/h.
- Crashes damage, they don't end runs. Damage model handles consequences (see personality layer). Critical for portal retention curves.

### Feedback systems

- **Near-miss detection.** Passing within 1.8u of a traffic car at >40 km/h triggers `NEAR MISS +$5` floating popup. Chain 3+ within 8s → `COMBO x2` on the next fare tip.
- **Comfort meter** (shipped in M2). Smooth driving raises comfort, hard braking/sharp turns/collisions drain it. Higher comfort at drop-off = higher tip.
- **Magnetic pickups.** Collectibles have a 2.5u pull radius; once close, they arc to the cab. No precision required. Pure Lane Splitter DNA.
- **Score/feedback popups.** Floating numbers in DM Mono, rising and fading over 0.8s. Color-coded: yellow=cash, cyan=rep, green=comfort, red=damage.
- **Music-as-cue.** Lo-fi hip-hop base stem. Cop chase layers in a synth-bass stem. Rain adds high-pass filter + rain foley. Fare-inbound adds a kick-drum pulse. Stems synchronized — no jarring cuts.

### Personality layer — the Mujaffa half

- **Absurdist collectibles** reflect the taxi theme: coffee cups (stamina), air fresheners (comfort bonus), lost wallets (cash), vape pens (rep), dropped phones (skip-ad token). Gentle bobbing float. Irreverent by design.
- **NPC pedestrians** on sidewalks react: jump back on near-misses, cheer max-comfort drop-offs, flip off the cab on collisions. Small animation sets, big personality return.
- **Reactive billboards** carry PG-13 jokes. Rotate with the daily skin. Flavor without gameplay cost.
- **Visible damage.** Dents on collision, smoke plume at 30% health, broken headlight at 15%, reduced top speed & steering at 10%. 0% → spinout + rewarded-ad revive prompt (portal monetization hook).
- **District character.** Each of 8 districts has a distinct palette and vibe — neon nightlife, sun-bleached suburbs, corporate glass downtown, grit docklands, etc. Same mechanics, different world.

### What Cabbie's driving is NOT

- Not an endless runner — the city is fixed and learnable.
- Not a sim — no realistic tire model, no gears.
- Not GTA — no pedestrian violence, no weapons, no civilian car theft. It is a taxi, always.
- Not Crazy Taxi — closer than either source, but we avoid the arrow-spam UI; the direction arrow only renders when a fare is active.

## 10. Act 1 — The Hustle

**Shipped-state summary.** Act 1 is implemented and documented in detail in `CABBIE_SPEC.md §13 & §14` (M1–M3). This PRD section summarizes the product-level intent without duplicating implementation specifics.

**Theme.** Survival. One cab. One driver. Daily expenses. Street-level driving with Mujaffa's personality and Lane Splitter's feel.

**Player state.** Single taxi (beat-up), single driver (the player as "Ace"), single district (Old Port), no management layer, no employees.

**Core loop.** Accept fares → navigate traffic to pickup → maintain comfort to dropoff → collect tip → repeat. Daily expenses deduct at day end. Miss rent three days running → soft-loss restart (no permadeath).

**Act 1 introduces all core mechanics that persist through the full game:**
- Third-person driving (§9)
- Fare ping system with comfort multiplier
- Police chase (visual warning + pursuit + bribe option)
- Rival taxi NPCs that steal unclaimed fares
- Street reputation (0.0–5.0 stars) that affects tip rates
- Road collectibles (coffee, fuel, wallets, vape pens, phones)
- Day/night cycle with weather skin rotation
- Save system (single slot, localStorage)
- Vehicle damage model with rewarded-ad revive

**Act 1 gate (unlocks Act 2):**
- Cash on hand ≥ $10,000
- Reputation ≥ 4.0 stars (maintained average)

**Shipped content scope:**
- 1 district (Old Port) fully dressed with palette, signage, billboards
- 3 of 7 daily skins (remaining 4 unlock in Act 2+)
- Single vehicle — the starting beat-up taxi
- ~40 fare dialog lines (subset of the total 200)
- Tutorial tooltips that surface contextually during first session (max 5)

**Pacing target.** 20–25 in-game days (~2.5–4 real hours) to reach the gate, assuming competent play. Rush-path for experienced players: ~15 days.

## 11. Act 2 — The Fleet

**Core principle.** Managing and driving are two modes of the same game, not separate games. Every management decision lands as a driving consequence later, and driving yourself remains the highest-earning activity in the game. You never bolt on a business sim; you graduate into it.

### The daily loop

Each in-game day, the player chooses at sunrise:

- **Drive today** — take personal control of a cab. Earn 1.3× rate plus comfort bonus. Fares missed while the player drives specific routes go to drivers elsewhere.
- **Manage today** — set driver assignments, watch revenue tick, collect SLA bonuses.

Some days are *story-driving*: scripted events require the player in the seat (rival sabotage counter-missions, airport exclusivity tests, VIP runs). Day length stays 5 real minutes per in-game day.

### Dispatch board

Mobile-first management UI. A scrollable vertical list of all 8 districts — not a geographic map, because a district map is unreadable at 375px. Each row shows district name, assigned driver, live hourly revenue, weekly comfort average, incidents today, and rival share %. Tap a row → driver-assign sheet slides up from bottom. Drag-and-drop reassignment. Unassigned districts → rival taxis soak up that market. Same component works at tablet (2-col) and desktop (3-col) breakpoints.

### Drivers — procedural NPCs, 4 tiers, 4 stats, morale layer

**Stats:** Speed (aggression / throughput), Comfort (tip multiplier), Reliability (crash & no-show rate), Loyalty (morale stability under pressure).

**Tiers & wage:**

| Tier | Daily wage | Stats |
|---|---|---|
| Rookie | $80 | Low, high variance |
| Journey | $150 | Mid |
| Pro | $250 | High |
| Ace | $450 | Elite |

**Roster cap:** 12 drivers through Act 2. Forces real hire/fire decisions.

**Morale** responds to wages, vehicle assigned (new car → happier), district assigned (airport → status boost), consecutive late shifts, rival poaching attempts. Low morale → performance drop → quit. High morale → tip bonus + loyalty against poaching.

**Candidate generation:** fresh roster of 6 rolls daily. Rewarded ad rerolls it immediately.

### Vehicles — fleet up to 20, 3 classes, upgrade tree

**Classes:** Standard / Hybrid (fuel-efficient, lower upkeep) / Luxury (comfort multiplier, airport-contract eligible).

**Upgrades per vehicle, 4 levels each:** Engine, Suspension, Fuel Tank, Brakes.

**Maintenance:** wear accumulates with use. Scheduled service = cheap + predictable. Neglect → mid-fare breakdown → angry passenger + rep hit + emergency repair bill. Real decision pressure, not bookkeeping.

### Contracts — guaranteed income with teeth

Three types, unlocked progressively:

| Contract | Weekly pay | SLA | Requirement |
|---|---|---|---|
| Hotel | $500 | Comfort ≥ 4.0 weekly avg | — |
| Airport | $1,500 | ≥95% on-time pickup | Luxury vehicle |
| Corporate | $900 | Reliability standards | Pro+ driver |

SLAs checked weekly. Miss → warning; miss twice in a row → contract lost + rep hit. Chain wins → higher-tier renewal offers.

### Rival Co. — Yellow Dog Cabs

Scripted antagonist, not an adaptive AI. Aggression scales with player market share.

| Trigger | Event |
|---|---|
| 30% share | Rival poaches one of your drivers (retain-with-bonus offer appears) |
| 50% share | Rival billboard attack, -0.2 rep for 3 days |
| 70% share | Rival sabotages one vehicle (breakdown event, story-driving counter-mission unlocks) |
| 90% share | Citywide price war, fare rates -20% for 5 days |

Player counter-tools unlock mid-Act 2: buy billboards (rep + share push), pay driver retention bonuses, install vehicle security (blocks one sabotage).

### Act 2 → Act 3 gate

Triggers Act 3 finale setup. All of:
- Own ≥10 vehicles
- Control ≥3 districts (>50% share in each)
- Yellow Dog reduced to <20% citywide share

### Ad integration (Act 2)

- **Rewarded:** reroll driver candidates, skip one day's expenses (1x per 3 days), pay off one SLA breach.
- **Interstitial:** major story beats (rival escalation triggers), Act 1→2 transition.
- **Pre-roll:** session start (portal SDK default).

### Pacing target

30–60 in-game days from Act 1 gate = 2.5–5 real hours for a focused player.

## 12. Act 3 — The Empire

**Core principle.** Act 3 is Act 2 played with different leverage. Same daily driving option. Same dispatch mechanics. But the board expands from 8 districts to a citywide platform, and the levers change from *operating a fleet* to *running a market*. Lula's satellite-launch beat maps to the CabbieTV finale. The game ends; the player doesn't grind forever.

### The CabbieApp

Unlocked on Act 3 start. Your own ride-hailing platform — which makes you Yellow Dog Cabs' competitor *and* their landlord. Three dials you control from the App screen:

- **Surge multiplier (1.0× – 2.5×).** Raises fare rates citywide, drops passenger satisfaction inversely. Over-surge → app rating tanks → riders defect.
- **Driver take rate (60% – 90%).** Your platform cut. Low cut = drivers flock to you (even rivals' drivers switch), thin margin. High cut = fat margin, drivers quit for Yellow Dog.
- **Passenger promos (off / weekly / aggressive).** Sink cash, pull market share. Aggressive depletes cash fast — high-risk push for a brand-saturation spike.

These three dials *are* the Act 3 puzzle. Miss the balance → drivers leave, riders defect, or cash burns out. Get it right → Yellow Dog bleeds share daily.

### Platform rivals — Yellow Dog joins your platform

The Act 3 twist: Yellow Dog Cabs gets desperate enough to list their drivers on your app. You now take your cut from their fares. This is the game's thesis landing — you own the algorithm, not the cars.

- Rival drivers pay the same take rate as yours.
- Quality: lower comfort ratings than your drivers → affects your app rating → creates tension.
- Rival can still undercut by withdrawing drivers at thresholds. Cat-and-mouse, not static.

### Market saturation — the win meter

Each of 8 districts has a saturation % (0–100). Saturation rises from:
- Active CabbieApp penetration in the district (drivers + ride volume)
- Billboards / advertising placed in the district
- High district-level app rating
- CabbieTV ad campaigns (see finale below)

Saturation decays slowly if neglected. Yellow Dog + indie operators push back.

**Win condition:** 100% saturation across all 8 districts simultaneously, held for 3 consecutive in-game days. Holds, not a snapshot — prevents flukes.

### Sabotage & counter-sabotage — The Fixer's menu

Unlocked with The Fixer character mid-Act 3. PG-13 corporate skullduggery, not crime:

| Action | Cost | Effect |
|---|---|---|
| Plant fake reviews | $400 | Yellow Dog app rating -0.5 for 3 days; 20% exposure chance → your rep -0.3 |
| Poach top driver | $1,200 | Driver comes over with 5-day morale debuff |
| Bribe city inspector | $800 | Blocks one Yellow Dog garage permit for a week in one district |
| Plant a PR story | $2,000 | +1.5% saturation in a chosen district; 10% backfire chance |

Yellow Dog runs the same plays against you on a scripted cadence. Counter-tools: PR firm (blocks incoming fake reviews), driver loyalty package (blocks poaches), lawyer on retainer (neutralizes permit blocks).

### CabbieTV — the finale ramp

When citywide saturation hits 80%, CabbieTV unlocks. A one-shot, high-stakes campaign mode spanning 7 in-game days. Three cash-intensive ad-spend levels (Billboard, Prime Time, Superbowl-tier). Each level adds daily saturation push but drains cash fast. Yellow Dog runs counter-campaigns.

The final day is a scripted *story-driving* mission: the player personally drives a highly visible "CabbieTV launch fare" through all 8 districts under time pressure, with reactive events (paparazzi, rival blockades, hostile pedestrians). Completing it triggers the end cinematic.

### Win, loss, and end-state

- **Win:** CabbieTV final mission complete + 100% saturation held 3 days → end cinematic, credits, unlocked *Legacy Mode* (sandbox with Yellow Dog disabled and tuned-up rates, no ending — plays forever for idle enjoyment).
- **Soft-loss:** cash <$0 for 3 consecutive days with no driving income → rival buyout offer cutscene → restart from Act 3 start with bonus starting cash (not Act 1 — preserves progress).
- **No permadeath, ever.**

### Content targets for Act 3

- 8 districts with distinct palettes & billboards (shared with Acts 1–2, dressed for endgame)
- ~40 sabotage-event story flavor lines (rotating)
- ~20 CabbieTV ad creative templates
- End cinematic: 45–60s, sprite/2D illustration + VO lines via text bubbles, not 3D

### Ad integration (Act 3)

- **Rewarded:** boost saturation in one district (+2%), reroll one Yellow Dog counter-play, reveal their next move
- **Interstitial:** Act 2→3 transition, CabbieTV unlock, finale start
- **Pre-roll:** session start (unchanged)

### Pacing target

20–40 in-game days from Act 3 start to win = 1.5–3 real hours for a focused player. Full 3-act run: 5–10 real hours to credits.

## 13. Economy & Balance

**Core principle.** The economy is the game's tuning dial. Numbers here are starting values tied to current spec constants where possible; exact values will shift in playtest. What matters is the *shape* of the curves and the *ratios* between income and expense.

### The three-act economy arc

- **Act 1: Scarcity.** Every fare matters. Daily expenses bite. Target: player ends Act 1 with just enough to start Act 2.
- **Act 2: Scaling.** Revenue compounds with each driver/vehicle. Expenses scale too, but slower. Target: moderate surplus by gate.
- **Act 3: Leverage.** Revenue decouples from personal labor. Expenses balloon from ad spend and sabotage. Target: cash volatility is the point.

### Act 1 — income & expense baseline

- Fare base rate: $0.08 / world-unit distance (spec constant)
- Comfort tip multiplier: 1.0× – 1.5× based on comfort meter at drop-off
- Near-miss bonus: $5 / miss, combo x2 on next tip if chained (§9)
- Collectibles: coffee $10, fuel can refills tank, wallet $25–$75, vape pen +0.05 rep, phone = 1 skip-ad token
- **Revenue target:** $450–$650 per successful 5-min day driving competently
- **Daily expenses:** garage rent $200, fuel (~$0.02/unit driven), police fines $150 (if caught)
- **Act 1 gate cash:** $10,000 → achievable in ~20–25 in-game days of steady play

### Act 2 — income & expense

- **Per-driver daily income:** Rookie $250 gross / Journey $400 / Pro $650 / Ace $1,100 (after player's contract take)
- **Contracts:** Hotel $500/wk, Airport $1,500/wk, Corporate $900/wk
- **Player-driven day bonus:** 1.3× personal earnings + comfort bonus
- **Daily expenses:** driver wages ($80–$450 per), garage rent $200 per district operated, vehicle upkeep $20/vehicle/day baseline, maintenance $150–$400 per service
- **Cash volatility target:** weekly swings of ±$2,000–$5,000 feel alive without breaking saves
- **Act 2 gate:** ~$40,000–$60,000 net worth + structural conditions (10 vehicles, 3 districts, Yellow Dog <20%)

### Act 3 — income & expense

- **Platform revenue:** (your drivers' fares × take rate) + (Yellow Dog drivers' fares × take rate)
- **Surge economics:** 1.5× surge = +50% revenue, -15% satisfaction, -10% ride volume (net +28%). Optimal sweet spot ~1.4–1.7 for short bursts
- **CabbieTV spend:** Billboard $3,000/day, Prime Time $8,000/day, Superbowl-tier $20,000/day. Final campaign ~$60K–$120K total
- **Sabotage costs:** $400–$2,000 per play (§12)
- **Cash volatility target:** weekly swings of ±$15,000–$40,000 — stakes feel different

### Balance rules the numbers must satisfy

1. **Personal driving is always the top $/hour option, at every point in the game.** Non-negotiable. If management out-earns driving, the game has failed its core pillar.
2. **Each act gate requires ~3–5 hours of real play to reach.** Player-controlled pacing; no artificial gates.
3. **Losing a contract, vehicle, or rep hit should cost ~1 in-game day of work to recover.** Annoying, not punishing.
4. **Full 3-act run: 5–10 hours real time to credits.** Session length 15–45 min. Daily skin rotation rewards daily return without requiring it.
5. **Never an unrecoverable economic state.** Cash-negative 3+ days → rival buyout cutscene → restart at act-start with bonus cash (§12).
6. **Rewarded ads are flavor, never required.** A player who refuses every rewarded ad can still beat the game.

### Collectible & ad-token economy

- Collectibles respawn on timers (45–90s per spawn point). Density: ~1 collectible per 800 world-units on drivable roads.
- Skip-ad tokens from dropped-phone pickups: cap 3 at a time in inventory. Skips one rewarded-ad prompt (keeps flow). Rewarded ads still available voluntarily.

### Save cadence

- `SaveSystem.flush` on `cash:changed` (from M2). Extends in Act 2 to include fleet state, contracts, driver roster, morale. Act 3 adds platform dials, saturation map, Yellow Dog state.
- Single slot per browser. Cloud save deferred to post-launch.

## 14. Content Targets

**Core principle.** Content quantities are a scoping contract. These are the numbers a solo dev with Claude Code plus AI asset pipelines can realistically hit, with enough variety that the 5–10 hour run doesn't feel threadbare.

### World content

- **Districts:** 8 total. 1 unlocked in Act 1, 3 cumulative by Act 2 gate, all 8 by Act 3 start. Distinct palette, signage style, ambient billboard set per district. Same underlying 7×7 grid topology.
- **Daily skin rotation:** 7 moods layered on top of districts. 8 × 7 = 56 unique look combinations from 15 content pieces.
- **Billboards:** 12 per district unique + 24 shared-rotation. ~120 billboard slots, ~50 unique creative lines.
- **NPC pedestrians:** 8 visual variants × 4 reactive animation sets. Single rig, variant textures.

### Vehicles (AI-expanded from baseline)

- Player-purchasable: Standard 8 / Hybrid 7 / Luxury 8 = **23 models**
- NPC traffic variants: **6 unique** (separated from player assets — the city looks populated with cars that aren't just your options)
- Yellow Dog Cabs fleet: **3 distinct models** (rival recognition matters)
- Police: **2 models** (patrol + interceptor for Act 2+ chase escalation)
- **Total: 34 vehicle models**
- Upgrade visual states: 4 levels × 4 systems per vehicle as dirt/chrome/decal tiers, not distinct models
- Damage states: 4 tiers (clean/dented/smoking/wrecked) as overlays + mesh additions

### Drivers

- **Portrait art:** 24 unique across 4 tiers (6 per tier)
- **Names:** procedural generator (40 first × 40 last = 1,600 combos)
- **Personality snippets:** 120 text bubble lines

### Fares

- **Passenger portraits:** 40 unique
- **Destination types:** 8 (bar, office, airport, hotel, hospital non-emergency, home, restaurant, mystery-address)
- **Fare dialog lines:** 200 total one-liners on pickup/dropoff (~25 per destination type)
- **Special fares:** 12 scripted scenarios triggering once per playthrough (P1 — may defer)

### Contracts

- 3 hotel brands × 3 tiers = 9 hotel contracts
- 1 airport + 2 upgrade tiers = 3 airport contracts
- 6 corporate accounts × 2 tiers = 12 corporate contracts
- **24 total contracts**

### Sabotage & counter-plays

- 4 sabotage actions × 3 variant outcomes = 12 sabotage flavor events
- 3 counter-tools × 2 upgrade tiers each
- ~40 story flavor lines

### Audio

- **Music:** 4 base stems + 3 layered stems (chase, rain, fare-inbound). ~45s loops, adaptive crossfading. ~5 min raw music
- **Synthwave finale track:** one-shot, 60s arrangement for CabbieTV mission
- **SFX:** ~60 unique sounds
- **Ambient bed:** 4 variants (day city, night city, rain, festival)

### Cinematics

- Intro: 30s, 2D illustrated panels + text + music
- Act transitions: 3 × 15s
- CabbieTV finale: 45–60s
- Credits sequence: scrolling 30s with Legacy Mode tease

### UI copy

- ~400 unique UI strings, fully localized
- All strings in flat `strings.{lang}.json`

### Totals at a glance

| Content type | Count |
|---|---|
| Districts | 8 |
| Daily skins | 7 |
| Vehicle models | 34 |
| Driver portraits | 24 |
| Passenger portraits | 40 |
| Contracts | 24 |
| Billboard creative lines | 50 |
| Fare dialog lines | 200 |
| Driver personality lines | 120 |
| UI strings | ~400 |
| Music stems | 7 + finale track |
| SFX cues | ~60 |
| 2D cinematics | 5 |

### Content design rules

- **No voice acting.** Everything is text bubbles + pop chimes. Mujaffa had no VO; we preserve it.
- **2D cinematics, not 3D.** Illustrated panels + in-engine pan/zoom + text overlay.
- **7×7 grid shared across all districts.** Only art differs. Biggest scope cut — unique layouts per district would triple world-design work.
- **Procedural driver names.** 1,600 combos covers ~40 drivers per run.
- **PG-13 only affects text, not art.** Edge lives in dialog and billboards; art stays tasteful.

---

# Part IV — Production & UX

## 15. Tone, Art & Audio Direction

**Core principle.** Cabbie's aesthetic is "Mujaffa reprinted in 2026." Cheap-feeling-on-purpose street-game energy, built on modern low-poly rendering so it reads clean at 4K. Looks like one person who cares — not a studio production, not a generic Unity asset flip.

### Voice & tone

- PG-13. Irreverent, observational, street-smart. Not mean-spirited.
- Reference voices: GTA V billboards minus the cruelty; Jazzpunk absurdism; original Mujaffa copy; Disco Elysium's clipped voicey tags.
- Never punches down. Jokes target systems (ride-share economics, corporate brands, gentrification, hustle culture), not individuals or identity groups.
- Swearing: "damn," "hell," "shit" rare and impactful. No harder.
- Innuendo yes, explicit no. Airport passenger flirts with a businessman; never lands.

### Visual direction — hero description

Low-poly arcade, flat-shaded or lightly gradient-shaded. Bright saturated palette per district. Heavy black ink outlines on vehicles and key props (borrowed directly from Mujaffa's sprite aesthetic, rendered in 3D). Sky domes are painted gradients, never HDRI. Shadows are blob shadows on the ground — both style AND performance. Chromatic aberration dialed gently on high speed. Bloom conservative. Film grain off by default (toggle in settings).

### District palette language

Each district gets a 5-color palette — base, accent, sky, signage, highlight. Day/night/rain skins shift luminance and hue without replacing palette identity.

- **Old Port** (Act 1 home): warm brick, mustard yellow signage, overcast sky
- **Neon Quarter:** hot pink / cyan, black sky, magenta light spills
- **Financial Glass:** cool teal, white chrome, steel sky
- **Sun Flats:** bleached ochre, turquoise pools, hot white sky
- **Docklands:** rust orange, steel grey, brown water
- **Festival Row:** strung-light yellows, purple/red accents, warm dusk sky
- **Airport Spur:** tarmac grey, jet-blue, safety orange
- **Heights:** forest green, navy, starlit sky

### Character art direction

2D illustrated portraits — hand-drawn look (clean line + flat fill, single highlight pass). ~250×250px portraits. Used in Act 2 hiring UI, Act 3 sabotage UI, fare pickup popups. Style reference: early Disco Elysium, Kentucky Route Zero, vintage Mad Magazine. Warm, a little grotesque, always specific.

### UI aesthetic

- Type: "DM Mono" for labels/HUD (from session-1 prototype), "Georgia" or similar serif for act-transition titles
- Accent: `#F5C400` (taxi yellow — single brand color)
- Surface: near-black `#0a0a14`, secondary panels `#13131e`, borders 0.5px muted
- Motion: all UI animations 150–300ms, cubic-bezier ease-out. Nothing bounces.
- Iconography: 1.5px stroke line icons, never filled

### Audio direction

- **Music:** Lo-fi hip-hop with jazz-sax lead. Warm, late-night-city feel. Layered stems (base + chase + rain + fare-inbound) that blend, never cut. Target energy: driving feels good at any speed.
- **Finale exception:** CabbieTV final drive swaps to synthwave for the 60-second ride. One-time tonal shift that signals "this is it."
- **SFX:** punchy, short, lo-fi-compressed. Cash chimes are actual register K-chunks, not sparkle twinkles.
- **Passenger bubble pops:** subtle wood-block tick on appear, nothing on dismiss.
- **Sound palette test:** if any sound makes you flinch on the tenth repeat, it's wrong.
- **Mix:** music at -18 LUFS, SFX peaks at -12 LUFS, accessibility setting for -6 dB SFX duck under dialog-bubble moments.

### Vehicle art pipeline

Concept → AI generates 4–6 reference images per variant (style-locked) → Claude Code writes Three.js low-poly geometry → shared texture atlas pass → damage/upgrade overlay system.

### What we deliberately avoid

- Photorealism. Photoreal + arcade driving feels uncanny and ages badly.
- Grimdark. Comedy with teeth, not dystopia.
- Voxel/Minecraft style. Too specific, not Cabbie.
- Flashy particle spam. Restraint is the aesthetic.
- Text-heavy cutscenes. Show, don't narrate.

## 16. UX Principles

**Core principle.** Cabbie plays cleanly on a phone in one hand. Every UX decision serves that. Portrait-first layouts, thumb-reachable controls, no hover states, no precision targets. Desktop and tablet inherit the mobile layout scaled up — not the other way around.

### The four UX rules

1. **One primary action per screen, always thumb-reachable.** The bottom 30% of every screen is the action zone. Secondary actions live in the top bar or scroll into view.
2. **Nothing critical requires hover or right-click.** Tooltips appear on tap-and-hold (500ms). Context menus are bottom sheets.
3. **Tap targets are 44×44pt minimum.** Icons can be smaller visually; the tap area isn't.
4. **Every destructive action is one tap from being reversed.** Firing a driver, selling a vehicle, canceling a contract — all show a 3-second "Undo" toast before committing.

### Screen inventory

- *Driving mode* — full-screen 3D viewport, HUD overlay
- *Dispatch board* — vertical scroll list (mobile), 2-col (tablet), 3-col (desktop)
- *Driver roster* — horizontal card carousel, tap for detail sheet
- *Hire screen* — candidate list, 3 visible at a time
- *Garage* — grid of owned vehicles, tap for detail/upgrade sheet
- *Contracts* — tabbed list (Hotel/Airport/Corporate)
- *CabbieApp (Act 3)* — three-dial control panel + live market share visualization
- *Sabotage menu* — grid of 4 actions + 3 counter-tools
- *Day summary* — modal overlay, auto-dismisses on tap
- *Act gate* — full-screen progress view
- *Main menu* — 4 options (Continue / New Game / Settings / Credits)
- *Settings* — single scrolling list

### Onboarding progression

**Moment 0 — first launch.** Title screen → tap "DRIVE" → skip cinematic option → in-car. Total: ≤3 taps, ≤10 seconds to wheel.

**First fare (0:30–2:00 in).** Contextual tooltips trigger on events, not on a fixed timer. Triggers: first fare pin appears, comfort meter first drops, first near-miss, first day ends. Max 5 tooltips in Act 1. Auto-dismiss after 4 seconds or on tap.

**Act 2 intro.** First dispatch-board open → 3 tooltips on key elements. Nothing blocks input.

**Act 3 intro.** Full-screen "How CabbieApp works" 4-panel explainer. The only unskippable first-time tutorial. Skippable on replay.

### Navigation & mode-switching (Act 2+)

The drive/manage mode toggle lives in the top-left of the HUD — a single icon button. Tap → pause → mode selector sheet slides up → pick Drive or Manage → fade transition (300ms). Never an in-driving modal popup; information waits for stoplights or fare completion.

### Touch controls (driving)

- **Tilt (default mobile):** device orientation → steering. Calibrated on first launch, recalibration in pause menu.
- **Touch-pad (tablet / no-gyro):** two thumb-pads — left = steer, right = accelerate/brake. Opacity 40%, visible only during driving.
- **Keyboard (desktop):** WASD + arrows.
- **Toggle:** anytime in settings, persists.

### Mobile-specific UX

- Portrait is primary. Driving viewport is 9:16, HUD wraps edges. Landscape supported but not required.
- No multi-finger gestures.
- iOS safe area respected.
- Back gesture = pause, not exit.

### Principles the game refuses to break

- **No popups during driving.** Period.
- **No paywalls. No ads mid-fare.** Rewarded ads always player-initiated.
- **No infinite menus.** Any menu deeper than 2 levels gets redesigned or cut.
- **No required signup / account.** Saves local. Cloud sync deferred.
- **No dark patterns.** No fake urgency, no FOMO prompts, no ad-to-continue after losing progress.

## 17. Accessibility & Localization

**Core principle.** Accessibility is a gate, not a polish pass. Portal audiences are global, multi-device, multi-ability. A game that excludes low-vision, motor-impaired, or non-English players is a smaller game — and portal curators increasingly filter for a11y.

### Accessibility — WCAG 2.2 AA baseline

**Visual**
- Text contrast ≥4.5:1 body, ≥3:1 large. HUD text audited against every district palette and weather skin.
- Minimum text size 14px mobile, 16px desktop. User-scalable to 200%.
- Colorblind-safe: no gameplay state communicated by color alone. Traffic lights add position. Damage uses icon + color. Comfort meter uses icon + bar. Saturation map uses pattern + hue.
- Three colorblind profiles: deuteranopia, protanopia, tritanopia.
- Reduced-motion toggle: disables aberration, speedlines, near-miss zoom, camera shake. Comfort meter pulses become gentle fades.
- High-contrast mode: thickens outlines, boosts HUD contrast to ≥7:1, disables film grain.

**Motor**
- Remappable keys (desktop). Controller support deferred to post-launch.
- Touch alternatives to all tilt controls. Tilt-sensitivity and dead-zone sliders.
- No QTE / timing-precision requirements. Closest thing is CabbieTV finale — generous windows + "relaxed timing" toggle.
- Hold-to-confirm replaceable with tap-to-confirm.
- No simultaneous multi-key combos required.

**Auditory**
- Subtitles on by default for all cinematics. Adjustable size and background opacity.
- Every critical audio cue has a visual HUD equivalent.
- Master + music + SFX sliders, each 0–100%. Mute-all shortcut.
- Mono-audio toggle.

**Cognitive / assist**
- Granular assist options rather than a "Difficulty" menu:
  - Economy assist: +25% fare income, -25% expenses
  - Relaxed police: chase threshold 82 → 95 km/h, escape distance 500 → 300u
  - Relaxed SLAs: warnings instead of auto-breach
  - Auto-pilot: hold-to-auto-drive to fare (reduced earnings, full comfort baseline)
- Pause anytime, including mid-fare. Fare timer pauses too.
- Clear goal labels on every screen. No cryptic icons without text.

**Testing & sign-off**
- Pre-launch: automated contrast check across all 8 palettes × 7 skins. Manual colorblind sim pass. Keyboard-only playthrough. Portal submission notes list accessibility features explicitly.

### Localization

**Launch languages (5).** English (canonical), French, German, Brazilian Portuguese, Spanish. Covers ~65% of CrazyGames / Newgrounds traffic.

**Post-launch languages (7, if warranted).** Italian, Polish, Russian, Turkish, Japanese, Korean, Simplified Chinese. ~2-week localization + QA each.

**Implementation**
- All user-facing strings in `src/strings/{lang}.json` as flat key-value.
- CI fails if English keys lack equivalents in active languages.
- Pluralization via ICU MessageFormat.
- RTL-ready: no hard-coded padding/margin direction in CSS.
- Font fallback stack includes Noto Sans CJK.
- Auto-detect from browser; overridable in settings.

**Content scope**
- UI strings: fully localized (all 400+).
- Fare dialog: fully localized.
- Billboards: *culturally* localized, not literally translated. Uber puns get replaced, not translated. Content-pipeline cost.
- Driver names: pool expanded per language. English 40×40 is the reference; each other language gets its own culturally appropriate pool.

**Deliberately excluded from localization**
- Music and SFX (culturally neutral, no lyrics)
- Cinematics (visual storytelling with subtitled text)
- Voice acting (doesn't exist)

**Pacing**
- English from day 1.
- Other launch languages translated in the month before portal submission — after content locks.
- Professional translation recommended for launch 5. AI-assisted translation acceptable for post-launch 7.

## 18. Ad Integration & Monetization

**Core principle.** Ads are a layer the player barely notices on a great run and opts into on a bad one. Rewarded ads are flavor — never required. Interstitials respect narrative beats. Pre-roll is the portal default. A player who beats the game having never watched a rewarded ad gets the same ending.

### The three ad types

**Pre-roll (required by portal)**
- Via portal SDK on session start
- 6–30s depending on portal and ad
- Skippable after 5s where supported
- One per session max (SDK-enforced)

**Interstitial (narrative-gated)**
- Scripted moments only, never arbitrary timers or death events
- Permitted triggers:
  - Act 1 → Act 2 transition
  - Act 2 → Act 3 transition
  - CabbieTV finale start
  - End cinematic → credits (optional)
- Frequency cap: hard max 1 per 5 minutes regardless of triggers
- Never mid-fare, mid-chase, mid-driving, mid-sabotage-event

**Rewarded (player-initiated only)**
- Player chooses every rewarded ad. UI is always a clear opt-in with the reward named.
- Typical rewards: revive-after-wreck, reroll candidates, skip-a-day expenses, saturation boost, fuel refill, rival-move reveal
- Per-reward-type cooldowns layered on SDK caps
- Never gated: every reward earnable through gameplay too

### Skip-ad token economy

Dropped-phone collectibles grant tokens that skip one rewarded-ad prompt:
- Cap 3 in inventory
- Token bypasses ad, still delivers reward
- Token collection is part of driving fun (Mujaffa pickup DNA)
- Portals tolerate because token collection rates cap actual skip volume

### SDK strategy

- **Primary build targets:** CrazyGames, Newgrounds, itch.io. Each has its own SDK.
- **Pattern:** thin `AdManager` module wrapping SDK calls, per-portal adapter loaded at build time via Vite env vars. Four methods: `preRoll()`, `interstitial(trigger)`, `rewarded(reward, onComplete)`, `skipToken(reward, onComplete)`.
- **Portal builds are separate bundles.** `npm run build:crazygames`, `build:newgrounds`, `build:itch`. Same game, different SDK layer.
- **itch.io fallback:** rewarded ads replaced with "Support the game" tip-jar link. Same reward, different gesture.

### Ad-free paths

- **Self-hosted GitHub Pages build:** no ads, no SDK. Portfolio / dev. `npm run build:dev`.
- **itch.io pay-what-you-want tier:** cosmetic unlock (new vehicle palette), no gameplay advantage.

### Portal compliance summary

| Portal | Initial load cap | Full game | Content posture |
|---|---|---|---|
| CrazyGames | 10MB | 50MB | PG-13 OK with accurate tags |
| Newgrounds | No hard caps | — | More permissive |
| itch.io | No caps | — | No compliance pressure |

### Revenue expectations

- Typical browser-game RPM: $2–$8 pre-roll, $8–$25 rewarded (when watched)
- PRD stance: revenue is not the north star (§19). Portfolio / passion positioning. Revenue a bonus signal, not the goal.

### Anti-patterns Cabbie refuses

- No "watch ad to continue" after loss (soft-loss cutscene replaces this)
- No forced ads on death / timeout / loading
- No energy / stamina / wait-timer systems
- No in-app purchases
- No premium currency

---

# Part V — Delivery

## 19. Success Metrics

**Core principle.** The metrics measure whether Cabbie is a good game people want to play, not whether it is a good ad server. Revenue is a lagging signal; engagement and craft quality are leading ones.

### The north star: completion rate

**Target: ≥8% of players who start a run reach the Act 3 CabbieTV finale and win.**

Portal-average completion rates for 5–10 hour games sit at 2–5%. 8% means Cabbie punches above its weight class — the sign of a game people want to finish, not just bounce through.

### Tier 1 — primary engagement metrics

| Metric | Target |
|---|---|
| Completion rate (Act 3 win) | ≥8% |
| Act 1 completion | ≥40% |
| Act 2 completion | ≥18% |
| Median session length | 18–25 min |
| Day-2 return rate | ≥22% |
| Day-7 return rate | ≥10% |
| Avg sessions per player | ≥6 |

### Tier 2 — quality signals

| Metric | Target |
|---|---|
| Crash-free session rate | ≥99.3% |
| Mean time to first fare | ≤45s |
| Mean FPS (desktop) | ≥55 |
| Mean FPS (midrange mobile) | ≥40 |
| P95 initial load time | ≤6s |
| Rage-quit rate (close within 60s of loss) | ≤8% |
| Settings-menu opens per session | ≥0.3 avg |

### Tier 3 — portal & economic signals

| Metric | Target |
|---|---|
| Rewarded ad opt-in rate | 15–30% |
| Pre-roll view rate | ≥90% |
| Interstitial completion | ≥85% |
| Revenue per 1,000 sessions (RP1000) | $3–$8 |
| Portal curator rating | ≥4.0 / 5.0 |
| Net review sentiment | "mostly positive" |

### Tier 4 — content health

| Metric | Target |
|---|---|
| Fare dialog repeat rate per session | ≤15% |
| Driver-hire screen time per visit | 45–90s |
| Sabotage menu usage per Act 3 run | ≥4 |
| CabbieTV finale mission success (first attempt) | ≥55% |
| Assist toggle usage | ≥12% |

### Measurement strategy

- Primary telemetry: portal SDK analytics (CrazyGames and Newgrounds both free)
- Custom events via `Telemetry` module sibling to `AdManager`. ~25 events total
- No personal data. No emails, no third-party trackers. GDPR/CCPA posture: we don't know who you are and we don't want to

### Evaluation timing

Launch week numbers are noisy. Real signal reads from week 4 onward. **Success criteria evaluated at week 8 after portal approval**, not at launch.

### Deliberately NOT measured

- Per-player LTV, churn cohorts
- Individual player tracking
- A/B test infrastructure
- Heat maps / menu funnels

### Decision thresholds

- **All Tier 1 targets hit at week 8:** ship successful; begin post-launch content plan
- **≥5 of 7 Tier 1 hit:** partial success; patch gaps, re-measure week 12
- **≤3 of 7 Tier 1 hit:** retrospective before any further work

## 20. Scope Priorities: P0 / P1 / P2 / P3

**Core principle.** Only P0 ships. P1 ships if it lands cleanly inside the solo timeline. P2 and P3 are named to be laid to rest.

**The cutting rule.** If Claude Code can't ship a P1 feature polished within its milestone window, it gets bumped to P2 without ceremony. The PRD is authoritative; cutting isn't a failure state.

### P0 — Ships at launch (non-negotiable)

**Act 1 — The Hustle (complete)**
- Fixed 7×7 grid, 1 district (Old Port)
- Third-person arcade driving with tilt/touch/keyboard
- Fare pickup/dropoff loop with comfort meter + tip multiplier
- Traffic system (dodgeable, near-miss scoring)
- Collectibles (coffee, fuel, wallets, vape pens, phones)
- Police chase (visual warning + car pursuit + bribe)
- Rival taxi NPCs (steal unclaimed fares)
- Reputation stat 0.0–5.0
- Day cycle, daily expenses, Act 1 gate ($10K + 4.0★)
- 3 daily skins of 7 (rain-night, gold-hour rush, clear-noon)
- Vehicle damage model with smoke/dents + rewarded-ad revive

**Act 2 — The Fleet (complete)**
- All 8 districts unlockable
- Dispatch board (mobile vertical list, desktop grid)
- Driver hire/fire + roster cap 12 + 4 tiers + stats + morale
- Fleet management up to 20 vehicles, 3 classes, 4 upgrade systems
- 3 contract types + SLA system
- Yellow Dog Cabs scripted escalation
- Drive/manage daily choice
- Act 2 gate (10 vehicles, 3 districts, <20% rival share)

**Act 3 — The Empire (complete)**
- CabbieApp three-dial control
- Yellow Dog joining platform (the thesis beat)
- 8-district saturation map + win condition
- 4 sabotage actions + 3 counter-tools
- CabbieTV finale: 7-day ramp + final story-driving mission
- End cinematic + credits + Legacy Mode unlock
- Soft-loss recovery

**Cross-cutting P0**
- All 34 vehicle models
- 24 driver portraits + 40 passenger portraits
- All 4 remaining daily skins (festival-lit, fog-dawn, neon-midnight, storm)
- Music stem system + synthwave finale track
- ~60 SFX, 4 ambient beds
- 400 UI strings, 200 fare dialog lines, 120 driver lines, 50 billboard lines
- 5 cinematics
- Ad integration: pre-roll + narrative interstitials + rewarded opt-ins + skip-token
- Single-slot localStorage save covering all state
- WCAG 2.2 AA pass on all UI
- 5 launch languages (EN / FR / DE / PT-BR / ES)
- Per-portal builds: CrazyGames + Newgrounds + itch.io + dev

### P1 — Ships if timeline holds

- 12 special scripted fares (celebrity, puker, VIP, etc.)
- Legacy Mode tuning pass
- Controller support (gamepad API)
- Cloud save via portal SDKs where available
- Leaderboards on Newgrounds
- 40 → 80 passenger portrait variants
- Screen-shake intensity slider
- Localized billboards (cultural swap-outs per language)

### P2 — Post-launch, if audience found

- 2 bonus districts (10 total)
- Additional Yellow Dog escalation beats for Legacy Mode
- Seasonal skin events (Halloween, Lunar New Year)
- 7 additional languages (IT / PL / RU / TR / JA / KO / ZH-CN)
- Community cosmetic pack
- Mobile app wrapper (Capacitor/Cordova)
- Speedrun mode with category leaderboards
- Full controller remapping

### P3 — Named to be laid to rest

- Multiplayer or co-op
- Procedurally generated district layouts
- Voice acting
- Third-party IP vehicle licensing
- Real-player ride-sharing
- NFT / blockchain integration
- Season pass or premium currency
- Mid-roll ads anywhere

### Scope pressure valves

If P0 is running late, cut in this order:
1. **Daily skins 7 → 5.** ~1 week saved, barely noticed.
2. **Drop Corporate contracts.** Simplifies Act 2 economy. Less mid-game depth.
3. **Roster cap 12 → 8.** Less hire/fire pressure, faster balance.
4. **Passenger portraits 40 → 24.** Visual repetition acceptable.
5. **Cut Legacy Mode.** Easy to patch in post-launch.

### NOT valid pressure valves

These would break the game's thesis:
- Cutting Yellow-Dog-joins-the-platform (that IS the game)
- Cutting full mobile parity
- Cutting accessibility below WCAG AA
- Cutting a launch language
- Cutting the CabbieTV final drive to be a menu screen

## 21. Development Model

**Core principle.** Claude Code is the sole engineer. Kim is product owner, designer, playtester, and AI-pipeline curator. No human writes code for Cabbie. This is a deliberate, tested working model validated through M1 and M2.

### How this works in practice

Kim makes design decisions — in this PRD, in spec updates, in issue framing. Claude Code reads those documents fresh at the start of every session and implements. When bugs surface, Kim reports them in natural language ("nothing is working," "the car steers inverted"); Claude Code diagnoses, fixes, updates the pitfall catalog so the failure can't recur. Kim never writes, reviews line-by-line, or pair-programs.

`CABBIE_SPEC.md` is the authoritative memory that persists across Claude Code's stateless sessions. Decisions made in brainstorming contexts (like this PRD) land in the spec. Implementation learnings return to the spec. The loop is: decide in conversation → write to spec → Claude Code executes → learnings return to spec.

### Full-AI production stack

| Asset | Pipeline | Primary tool(s) |
|---|---|---|
| Code (all 30+ modules) | Claude Code | Claude Code + PRD + CABBIE_SPEC.md |
| Music composition + stems | AI-generated, Kim-curated | Suno / Udio for stems, ElevenLabs for variants |
| SFX library | AI-generated + free-library hybrid | ElevenLabs SFX, Freesound for edge cases |
| Audio mixing/mastering | AI-assisted, Kim-curated | Claude Code writes Web Audio graph |
| 2D character portraits | AI-generated, Kim-curated | Midjourney or Stable Diffusion, style-locked |
| 2D cinematics | AI-generated, Kim-curated | Midjourney panels + in-engine pan/zoom |
| Vehicle concept art | AI-generated, Kim-curated | Midjourney reference → Three.js geometry |
| 3D vehicle models | Claude Code from concept refs | Three.js `BufferGeometry` + procedural detail |
| Billboard art | AI-generated, Kim-curated | Midjourney/SD visuals, Claude Code copy |
| District palette + signage | AI-generated, Kim-curated | Midjourney mood boards → palette extraction |
| Localization (5 launch) | AI-translated, Kim spot-checks | Claude or GPT for translation, native review |
| Localization (7 post-launch) | AI-only, community-reviewed | Same AI, crowdsourced corrections |
| UI copy + dialog | AI-drafted, Kim-curated | Claude conversations, pools in batches |
| Playtesting | Human only | Kim + community |
| Portal submission + curators | Human only | Kim |
| Marketing / social | AI-assisted, Kim-voiced | Claude for drafts, Kim posts |

### What AI-first actually means

The production model is less "Claude Code writes code" and more **"every asset in the game is generated through an AI pipeline, with Kim as curator/director."** The curator role is the most important one — AI pipelines produce a flood of acceptable output; the work is selecting, refining, and enforcing consistent aesthetic across thousands of assets.

### Practices this model requires

1. **Style bible as a first-class artifact.** Short document pinning visual, musical, tonal, UI identity with reference images, mood phrases, negative examples. Every AI pipeline consumes it as prompt context. Prevents drift into generic AI soup.
2. **Style-locked reference sheets per pipeline.** Vehicle, portrait, billboard pipelines each get locked style references. Consistency-across-the-game is where AI art typically fails; locked references are the defense.
3. **Curation volume is the bottleneck, not generation.** Solo curator reviews ~200 image generations per day meaningfully. Content targets scoped accordingly.
4. **Provenance tracking.** Every shipped asset has a `meta.json` entry recording pipeline, prompt, model, date. For debugging style drift — and in case of licensing questions.
5. **License auditing is non-negotiable.** Pre-launch gate confirming every shipped asset is cleared for commercial browser-portal distribution. Biggest unknown in this production model.

### Working practices that make the model hold

1. **Spec-first, code-second.** No milestone begins until its spec section is written.
2. **Context conservation across sessions.** Kim never relies on Claude Code remembering prior work. State lives in files.
3. **Milestone gates are explicit acceptance criteria.** Per-milestone checklists are ship criteria. Claude Code self-checks.
4. **Playtest-driven fix specs.** Natural-language bug reports become documented fixes with acceptance criteria.
5. **Pitfall catalog is sacred.** Any bug that bit the project gets an entry (§15 of spec). Claude Code consults before every new module.
6. **Milestone debrief updates the spec.** Continues through M9.

### The big bet this model makes

Cabbie tests whether AI-first solo production can ship a full 3-act browser game at quality comparable to a 5-person indie team's 18-month project. Succeeding validates a new production model. Failing teaches exactly where the AI pipeline breaks — also valuable.

## 22. Risks & Mitigations

**Core principle.** Risks named are risks you can plan around. Each risk has severity (1–5), likelihood (1–5), concrete mitigation, and a kill-switch — the scope cut that saves the project if the risk lands. Priority focus: anything where S×L ≥ 12.

### Production-model risks (AI-first specific)

**R1 — AI asset license terms shift mid-development** *(S4 × L3 = 12)*
- Risk: Suno, Udio, Midjourney, ElevenLabs licensing for commercial portal distribution is fluid. A TOS change could invalidate shipped assets.
- **Mitigation:** Provenance tracking from day 1. License audit at each milestone end, not just launch. Keep non-AI alternatives identifiable (free-music-archive + commissioned portraits).
- **Kill-switch:** Swap to CC-BY music library (~2 days) or commission ~40 illustrated portraits (~$2K, ~3–6 weeks slip).

**R2 — AI output consistency drifts across pipelines** *(S4 × L4 = 16) — HIGHEST PRIORITY*
- Risk: Without ruthless style-bible enforcement, vehicle art subtly clashes with portraits, which clash with billboards. Game looks like generic AI soup.
- **Mitigation:** Style bible before any bulk generation. Per-pipeline reference lock-in. Generation batches audited against bible before shipping. Visual-consistency playtest at each milestone with an outside observer ("does this feel like one thing?").
- **Kill-switch:** Reduce visual variety. 4 districts coherent > 8 districts incoherent.

**R3 — Curator-capacity bottleneck** *(S3 × L4 = 12)*
- Risk: Kim underestimates 200-images/day for 3 weeks. Curation fatigue compounds into R2.
- **Mitigation:** Curation in 2-week "studio sprints" with breaks. Clear per-pipeline deliverable checklists. Watch for decision-fatigue signal.
- **Kill-switch:** §20 pressure valves.

**R4 — Claude Code hits a complex-system wall mid-project** *(S5 × L2 = 10)*
- Risk: Act 2 (dispatch + morale + SLA) or Act 3 (platform dials + saturation + Yellow Dog) exceeds what Claude Code can coherently build in a milestone-bounded session.
- **Mitigation:** Spec specificity. Each milestone written to detail where Claude Code makes no architectural decisions. Session-bounded scope.
- **Kill-switch:** Split troubled milestone into two (e.g., Act 2a + 2b).

### Game-design risks

**R5 — Driving feel doesn't achieve Lane Splitter × Mujaffa quality** *(S5 × L3 = 15)*
- Risk: §9's target is ambitious. Miss it and nothing else matters.
- **Mitigation:** §9 is the most detailed section for a reason. Physics constants named explicitly. Driving-focused playtest at the end of every milestone. Outside playtesters for genuine feel signal.
- **Kill-switch:** Cut management ambition aggressively. Polished 3-hour Act 1 > broken 8-hour full-arc.

**R6 — Act 2 → Act 3 thesis beat doesn't land emotionally** *(S4 × L3 = 12)*
- Risk: Yellow Dog joining the platform is the thesis. If it reads as "just another mechanic," Act 3 collapses into "Act 2 with bigger numbers."
- **Mitigation:** Treat the Act 3 unlock as scripted narrative beat — cinematic, dialog, explicit framing. Playtest with non-gamers.
- **Kill-switch:** Accept Act 3 as "management at bigger scale" without twist. Rename to "The Monopoly."

**R7 — Full mobile parity harder than expected** *(S4 × L4 = 16) — CO-HIGHEST PRIORITY*
- Risk: Dispatch boards, CabbieApp dials, sabotage menus are difficult at 375px portrait.
- **Mitigation:** Mobile-first UX already baked in (§16). Every new screen designed at 375px FIRST. Test on real phone weekly. 20% additional UX iteration budget for mobile Act 2/3 polish.
- **Kill-switch:** Ship Act 1 fully mobile-parity, Act 2/3 with "desktop/tablet recommended" guidance.

### Distribution / business risks

**R8 — Portal approval reveals unfixable content issues** *(S4 × L2 = 8)*
- Risk: PG-13 push-back, or SDK integration fails curator review.
- **Mitigation:** Submit WIP build to CrazyGames at end of M6. Use feedback cycle to catch issues early.
- **Kill-switch:** Content patch swapping specific billboards/dialog. 1–3 day cost.

**R9 — Revenue-per-session below $3 floor** *(S3 × L3 = 9)*
- Risk: Portal visibility threshold missed, shelf position collapses, discovery fails.
- **Mitigation:** PRD stance decouples success from revenue (§19). If RP1000 < $3 at week 8, A/B test moving one interstitial from optional to mandatory (Act 1→2 transition).
- **Kill-switch:** Low revenue isn't project-ending given portfolio-first positioning.

**R10 — Portal SDK requirements change** *(S3 × L3 = 9)*
- Risk: Portals update SDKs, deprecate endpoints Cabbie uses.
- **Mitigation:** AdManager + Telemetry abstraction isolates SDK changes. Per-portal build pipeline means one break ≠ all.
- **Kill-switch:** Delay affected portal 2–4 weeks; others ship on schedule.

### Solo-production risks

**R11 — Kim burns out mid-Act 3** *(S5 × L3 = 15)*
- Risk: Solo passion projects fail at 60–70% completion. Late-Act-2, early-Act-3 is the danger zone.
- **Mitigation:** Named milestone breaks (§23). Legacy Mode as cuttable P0 gives escape valve. Public dev log (itch.io, social) creates external momentum.
- **Kill-switch:** Ship as "Cabbie: Act 1 & 2" with Act 3 as future free patch.

**R12 — Scope creep from playtest feedback** *(S3 × L4 = 12)*
- Risk: Each individual request is reasonable; collectively they blow the timeline.
- **Mitigation:** PRD adherence. Feedback logged in "P2/P3 candidates" doc, never added to P0 mid-milestone. Every request faces "does the PRD say we'd do this?"
- **Kill-switch:** Mitigation IS the kill-switch.

### Platform-external risks

**R13 — Three.js / WebGL deprecation** *(S4 × L1 = 4)*
- Risk: Major renderer change during development.
- **Mitigation:** Pinned r128 in package.json. Exact version documented in spec.
- **Kill-switch:** WebGPU upgrade path when forced; not a 2026 concern.

**R14 — Portal landscape consolidation / closure** *(S3 × L2 = 6)*
- Risk: CrazyGames business model change, itch.io shuts down.
- **Mitigation:** Multi-portal submission day 1. Self-hosted fallback always available.
- **Kill-switch:** Self-host on Netlify with tip-jar. Ships regardless.

### The three biggest concerns

1. **R2 (AI consistency) & R7 (mobile parity) tied at 16** — craft-quality risks.
2. **R5 (driving feel) at 15** — project-critical foundation.
3. **R11 (burnout) at 15** — most undervalued solo-dev risk.

## 23. Roadmap & Milestones

**Core principle.** The roadmap paces to Claude Code session cadence, not human dev-weeks. A "milestone" is 1–7 Claude Code sessions of 2–4 hours each, plus Kim's design/playtest/curation time. Elapsed time depends on Kim's availability (~15 hrs/week part-time assumed below) more than raw coding speed.

### Milestone detail

| M# | Milestone | Sessions | Elapsed (part-time) | Status |
|---|---|---|---|---|
| M1 | Act 1 Core Driving | ~3 | 1 week | ✅ Shipped |
| M2 | Act 1 Polish & Systems | ~4 | 1.5 weeks | ✅ Shipped |
| M3 | Act 1 Streets | ~4 | 1.5–2 weeks | ⟳ In progress |
| M4 | Act 1 Art & Audio Pass | ~3 | 3–4 weeks | Pending |
| M5 | Act 2 Foundation | ~6 | 3–4 weeks | Pending |
| M6 | Act 2 Systems | ~7 | 3–4 weeks | Pending |
| M7 | Act 3 Foundation | ~6 | 3 weeks | Pending |
| M8 | Act 3 Systems | ~6 | 3 weeks | Pending |
| M9 | Polish & Submit | ~4 | 3–4 weeks | Pending |

### M1 — Act 1 Core Driving ✅ SHIPPED
Third-person arcade driving, 7×7 grid, one district, basic fare loop, HUD. *Complete, spec-conformant.*

### M2 — Act 1 Polish & Systems ✅ SHIPPED
Comfort meter, weather/skin rotation, save system, day cycle, event bus. *Complete, spec-conformant.*

### M3 — Act 1 Streets (in progress)
Police AI + pursuit, rival taxi NPCs, fuel/rep collectibles, street reputation, Act 1 gate UI, night-shift skin.
**Ship criteria:** Act 1 fully playable end-to-end, gate unlockable, spec §15 updated with any new pitfalls.

### M4 — Act 1 Art & Audio Pass
Replace prototype assets with AI-generated final art. Old Port palette locked, vehicles final, portraits in-game, audio stems integrated.
**Ship criteria:** Act 1 passes "visual consistency playtest" (R2 early warning), style bible locked. *First real test of AI-first production model at scale.*

### M5 — Act 2 Foundation
All 8 districts unlocked (art dressing on shared 7×7 grid). Dispatch board UI (mobile-first). Driver hire/fire + roster cap 12 + 4 tiers + stats + morale. Drive/manage daily choice.
**Ship criteria:** Drive/manage loop functional; full-parity mobile UX validated on real phone.

### M6 — Act 2 Systems
Fleet management (20 vehicles, 3 classes, 4 upgrade systems). Maintenance/breakdown. Contracts (Hotel/Airport/Corporate + SLA). Yellow Dog scripted escalation. Act 2 gate.
**Ship criteria:** Full Act 2 playable, gate unlockable, **submitted to CrazyGames as early-access WIP for curator feedback** (R8 mitigation).

### M7 — Act 3 Foundation
CabbieApp three-dial control. Platform revenue flow. Yellow Dog joins platform (thesis beat + cinematic). Saturation map with 8-district meters. Market share decay.
**Ship criteria:** Act 3 core loop functional; thesis beat playtested with non-gamers (R6).

### M8 — Act 3 Systems
Sabotage + counter-tools (4 + 3). CabbieTV finale ramp (7-day campaign). Final story-driving mission. End cinematic. Credits. Legacy Mode unlock. Soft-loss recovery.
**Ship criteria:** Full 3-act playable start-to-finish, win condition reachable, all cinematics integrated.

### M9 — Polish & Submit
Localization pass (5 languages via AI translation + spot-check). Accessibility audit against WCAG 2.2 AA. Portal-specific builds (CrazyGames / Newgrounds / itch.io / dev). SDK integration tests. License audit on all AI-generated assets. Telemetry validation. Final performance pass.
**Ship criteria:** All portal submissions filed, launch ready.

### Timeline summary

| Phase | Elapsed (part-time) |
|---|---|
| M1 + M2 (complete) | ~3 weeks |
| M3 | 1.5–2 weeks |
| M4 | 3–4 weeks |
| M5–M6 (Act 2) | 6–8 weeks |
| M7–M8 (Act 3) | 6 weeks |
| M9 (ship) | 3–4 weeks |
| **Total remaining** | **~20–26 weeks** |
| **Projected launch** | **September–November 2026** |

Full-time pace (~40 hrs/week) compresses to **10–13 weeks remaining → July–August 2026**.

### Named milestone breaks (R11 burnout mitigation)

Three pre-planned pauses, each 1–2 weeks — **not negotiable**:

- **Break 1: After M4.** The "Act 1 really done" moment. Playtest with real players, soak feedback, reset before Act 2.
- **Break 2: After M6** (Act 2 ships for curator WIP). The 60–70% completion danger zone. Use portal submission admin as the break; no new features.
- **Break 3: After M8** (full game reachable). Step away before ship sprint. Return for M9 with polish-mode eyes.

### Post-launch roadmap

| Phase | Timing | Scope |
|---|---|---|
| Launch week 1 | Launch | Portal submissions, hotfix readiness, community response |
| Weeks 2–4 | Post-launch | Metric monitoring, bug fixes, P1 items as time allows |
| Week 8 | Evaluation gate | §19 Tier 1 metrics assessed; decide P2 content investment |
| Months 3–6 | Post-launch content | If metrics hit: 7 additional languages, bonus districts, seasonal skins |
| Month 6+ | Long tail | Legacy Mode tuning, community cosmetics, mobile wrapper |

## 24. Definition of Shipped

**Core principle.** "Shipped" is a binary gate, not a vibe. If every item here is true, Cabbie is done — Kim turns the launch key without second-guessing. If any item is false, either it gets fixed or it gets explicitly waived in writing.

### Gameplay completeness

- [ ] All 3 acts playable from `New Game` to final credits in a single unbroken run
- [ ] Act 1 gate unlockable (≥$10K + 4.0★)
- [ ] Act 2 gate unlockable (10 vehicles + 3 districts + <20% Yellow Dog share)
- [ ] Act 3 win condition reachable (100% saturation held 3 days + CabbieTV finale complete)
- [ ] Soft-loss recovery verified at every cash-negative failure point
- [ ] Legacy Mode unlocks on win and loads into sandbox
- [ ] Save/load verified: mid-Act-2 save resumes with all state intact
- [ ] All collectibles spawn and respawn on intended cadence
- [ ] Driver hire/fire/morale loop verified end-to-end
- [ ] All 3 contract types can be won, held, and lost per SLA rules
- [ ] All 4 sabotage + 3 counter-tool plays execute without errors
- [ ] Special scripted fares trigger once per playthrough (P1 — waive if deferred)

### Content targets met

- [ ] 8 districts dressed with unique palette + signage + billboard set
- [ ] All 7 daily skins rotating correctly
- [ ] 34 vehicle models in rotation
- [ ] 24 driver portraits + 40 passenger portraits
- [ ] ≥400 UI strings, ≥200 fare dialog lines, ≥120 driver lines, ≥50 billboard lines
- [ ] All 5 cinematics integrated
- [ ] Music stem system functional with all 7 stems + synthwave finale track
- [ ] ~60 SFX cues integrated, no missing-audio placeholders
- [ ] Credits accurate with AI pipelines acknowledged

### Quality gates

- [ ] Zero crash-class bugs across full 3-act playthrough
- [ ] P95 initial load ≤6s on midrange hardware
- [ ] Mean 55+ FPS desktop, 40+ FPS midrange mobile
- [ ] No silent JS errors in console across full playthrough
- [ ] All spec §15 pitfalls addressed, catalog current
- [ ] Automated spec-conformance checks pass per milestone
- [ ] Three full playthrough recordings archived for regression reference

### Accessibility (WCAG 2.2 AA)

- [ ] All UI text contrast ≥4.5:1 verified across 8 palettes × 7 skins
- [ ] Three colorblind profiles tested
- [ ] Reduced-motion toggle functional
- [ ] High-contrast mode functional
- [ ] Remappable keys (desktop)
- [ ] Tilt-sensitivity + dead-zone sliders functional (mobile)
- [ ] Subtitles on by default for cinematics
- [ ] Every critical audio cue has visual HUD equivalent
- [ ] All assist options functional and tested
- [ ] Full keyboard-only playthrough confirms no focus-trap regressions

### Localization

- [ ] English canonical strings locked (no unlocalized TODOs)
- [ ] FR, DE, PT-BR, ES translations complete
- [ ] Native-speaker spot-check passed for each
- [ ] Language auto-detection working; override persists
- [ ] Fallback fonts render correctly for all launch languages
- [ ] Billboards culturally localized (not literal)

### Monetization & distribution

- [ ] CrazyGames build submitted with correct SDK
- [ ] Newgrounds build submitted
- [ ] itch.io build submitted (tip-jar mode)
- [ ] Dev build deployed to GitHub Pages (ad-free demo)
- [ ] All 4 builds verified playable through to win
- [ ] Pre-roll, interstitial, rewarded calls firing correctly per portal
- [ ] Skip-ad token economy functional
- [ ] **License audit complete: every AI-generated shipped asset has provenance + commercial-use confirmation**
- [ ] Content descriptor tags accurate on each submission

### Analytics & telemetry

- [ ] ~25 custom events firing to portal SDK
- [ ] Completion rate, act-gate, session length events verified
- [ ] No PII collected; privacy stance verified
- [ ] Telemetry dashboard documented for week-8 review

### Documentation

- [ ] `CABBIE_SPEC.md` current: all 9 milestones marked complete, pitfalls current, constants locked
- [ ] This PRD current: any in-development deviations noted as addenda
- [ ] Style bible archived with final reference sheets
- [ ] Provenance records complete and queryable
- [ ] Personal post-launch runbook written (how to patch, monitor, respond to curators)

### Launch communications

- [ ] Portal submission notes written (features, a11y highlights, content descriptors, contact)
- [ ] Launch devlog post drafted for itch.io
- [ ] Social post drafted for launch day (optional per Kim)
- [ ] "Known issues at launch" doc written (if any items waived)

### Explicit non-requirements

These do NOT need to be true for Cabbie to ship:
- Multiplayer, co-op, or social features
- Mobile app wrapper
- Controller / gamepad support
- Cloud save sync
- Leaderboards beyond Newgrounds-native
- 7 post-launch languages
- Community cosmetic packs
- Seasonal skin events
- Speedrun mode
- Any P2/P3 item from §20

### Waiver protocol

If a checklist item is deemed unshippable-but-non-blocking:

1. Document in `LAUNCH_WAIVERS.md` committed to the project.
2. Record: item description, reason, ship-with-waiver decision owner (Kim), target patch date.
3. Add to "Known issues at launch" for portal submissions.
4. **Do not ship with more than 5 active waivers.** Beyond that, fix before launch.

### The launch decision

When every required item is checked (or explicitly waived per protocol), and all §19 Tier 2 quality gates are green in test playthroughs, Kim submits to portals on a pre-committed launch date.

The launch date is set at the end of M8 — visible, fixed, public. No "soft launch" slippage. No "one more week." The PRD is the contract and this section is the close-out.

If launch-day metrics at week 8 pass §19 thresholds, Cabbie shipped successfully.

---

# Appendix

## Doc stack

| Document | Role |
|---|---|
| `CABBIE_PRD.md` (this doc) | Product reference. What, who, why, how success is measured. |
| `CABBIE_SPEC.md` | Implementation reference. Architecture, coordinate conventions, module paths, constants, pitfall catalog. Living document updated per milestone. |
| `LAUNCH_WAIVERS.md` (created if needed) | Pre-launch waiver record per §24 protocol. |
| Cabbie Game Design Document (original artifact) | Historical context. Superseded by this PRD + spec for shipped-state decisions. |

## Glossary

- **Act gate** — explicit mechanical condition unlocking the next act. Not time-based.
- **Comfort meter** — passenger satisfaction from smooth driving, determining tip multiplier. Shipped in M2.
- **Daily skin** — weather / time-of-day / event-style mood applied over district art. 7 total.
- **District** — one of 8 playable city zones sharing a 7×7 grid topology, differing in art.
- **Fare** — one pickup-to-dropoff run, the atomic unit of driving gameplay.
- **Pitfall catalog** — §15 of `CABBIE_SPEC.md`. Documented bugs with symptom/cause/fix/rule.
- **Rep / Reputation** — 0.0–5.0 star stat gained through good fares, lost through crashes and fines.
- **Rewarded ad** — player-initiated ad viewing in exchange for in-game benefit.
- **Skip-ad token** — collectible that bypasses one rewarded-ad prompt while still granting reward.
- **SLA** — Service Level Agreement. Weekly performance standard attached to contracts.
- **Story-driving** — scripted event requiring player in the driver's seat, typically tied to Yellow Dog or finale beats.
- **Thesis beat** — Act 3 moment where Yellow Dog Cabs joins the player's platform. The game's central statement about platform economics.
- **Yellow Dog Cabs** — scripted rival taxi company, scales aggression with player market share.

## External references

- Reference game research summaries captured in session history (Mujaffa-spillet, Lane Splitter, Lula: The Sexy Empire)
- Three.js r128 documentation: https://threejs.org/docs/
- CrazyGames SDK docs: https://docs.crazygames.com/
- Newgrounds API: https://www.newgrounds.com/wiki/creator-resources/
- itch.io HTML5 guidelines: https://itch.io/docs/creators/html5
- WCAG 2.2 AA: https://www.w3.org/TR/WCAG22/
- Portal-typical RPM benchmarks: tracked in Kim's launch runbook (created at M9)

---

*End of Product Requirements Document — Cabbie v1.0*
*This PRD is a companion to `CABBIE_SPEC.md` and does not replace it. Implementation decisions live in the spec; product decisions live here.*
