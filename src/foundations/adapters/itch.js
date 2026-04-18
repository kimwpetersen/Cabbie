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
