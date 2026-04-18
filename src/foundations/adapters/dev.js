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
