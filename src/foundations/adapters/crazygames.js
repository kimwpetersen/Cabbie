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
    return true;
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
