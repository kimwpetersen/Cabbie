// src/foundations/PortalAdapter.js
// Per-portal SDK facade. Loads the correct adapter at build time based on __PORTAL__
// which is set in vite.config.js / vitest.config.js.
// See CABBIE_SPEC.md §9.

const portal = typeof __PORTAL__ !== 'undefined' ? __PORTAL__ : 'dev';

let impl = null;
let initPromise = null;

async function loadImpl() {
  if (impl) return impl;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    let mod;
    switch (portal) {
      case 'crazygames':  mod = await import('./adapters/crazygames.js'); break;
      case 'newgrounds':  mod = await import('./adapters/newgrounds.js'); break;
      case 'itch':        mod = await import('./adapters/itch.js');       break;
      default:            mod = await import('./adapters/dev.js');        break;
    }
    await mod.init();
    impl = mod;
    return mod;
  })();
  return initPromise;
}

export const PortalAdapter = {
  portal,

  async init()                           { await loadImpl(); },

  async preRoll()                        { return (await loadImpl()).preRoll(); },
  async interstitial(trigger)            { return (await loadImpl()).interstitial(trigger); },
  async rewarded(rewardKey)              { return (await loadImpl()).rewarded(rewardKey); },

  async trackEvent(name, props)          { return (await loadImpl()).trackEvent(name, props); },

  async cloudSaveSupported()             { return (await loadImpl()).cloudSaveSupported(); },
  async cloudSaveWrite(state)            { return (await loadImpl()).cloudSaveWrite(state); },
  async cloudSaveRead()                  { return (await loadImpl()).cloudSaveRead(); },
};
