// src/save/SaveSystem.js
// Schema-versioned single-slot save. See CABBIE_SPEC.md §29.
// M0 ships schema v1. Later milestones extend collectState() to include
// more game state (drivers, fleet, saturation, etc.). Migrations live here.

const STORAGE_KEY = 'cabbie.save';
const SCHEMA_VERSION = 1;

const MIGRATIONS = {
  // 0: (state) => ({ ...state, cash: state.money ?? 0 }), // example for future
};

export const SaveSystem = {
  // M0 stub. Real implementation in M1/M2/M5/M7 as game systems come online.
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
      if (!mig) break;
      state = mig(state);
      v += 1;
    }
    return v === SCHEMA_VERSION ? state : null;
  },

  collectState() {
    if (this._stubState !== null) return this._stubState;
    return {};
  },

  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },
};
