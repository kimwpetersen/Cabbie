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
