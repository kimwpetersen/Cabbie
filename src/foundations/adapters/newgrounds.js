// src/foundations/adapters/newgrounds.js
// Adapter for Newgrounds portal. Full SDK integration deferred to M9.
// See CABBIE_SPEC.md §9.

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
