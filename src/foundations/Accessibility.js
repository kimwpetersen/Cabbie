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
      return value;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
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
    subscribers.clear();
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },

  serialize() {
    return { ...state };
  },
}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (prop in state) return state[prop];
    return undefined;
  },
});
