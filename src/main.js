// src/main.js
// Cabbie app entry. See CABBIE_PRD.md and CABBIE_SPEC.md for authoritative references.
// M0: boot sequence, portal init, accessibility load, language detection, title screen.

import { EventBus } from './eventBus.js';
import { L } from './foundations/Localization.js';
import { Accessibility } from './foundations/Accessibility.js';
import { StyleBible } from './foundations/StyleBible.js';
import { PortalAdapter } from './foundations/PortalAdapter.js';
import { SaveSystem } from './save/SaveSystem.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './constants.js';

async function boot() {
  // 1. Load accessibility settings (respects reduced-motion etc on first render)
  Accessibility.load();

  // 2. Detect language (saved > browser full locale > browser short > default)
  const saved = (() => {
    try { return localStorage.getItem('cabbie.lang'); } catch { return null; }
  })();
  const browser = navigator.language || DEFAULT_LANGUAGE;
  const short = browser.split('-')[0];

  let lang = DEFAULT_LANGUAGE;
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) lang = saved;
  else if (SUPPORTED_LANGUAGES.includes(browser)) lang = browser;
  else if (SUPPORTED_LANGUAGES.includes(short)) lang = short;
  L.setLanguage(lang);

  // 3. Portal init — async, non-blocking for title screen
  PortalAdapter.init().catch(e => console.warn('Portal init failed:', e));
  PortalAdapter.trackEvent('session:start', { portal: PortalAdapter.portal, lang });

  // 4. Render the title screen
  renderTitleScreen();
}

function renderTitleScreen() {
  const app = document.getElementById('app');
  if (!app) return;

  const hasSave = SaveSystem.load() !== null;

  app.innerHTML = `
    <div class="title-screen" style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${StyleBible.surface};
      color: #fff;
      font-family: ${StyleBible.typography.hud};
      padding: 2rem;
    ">
      <div style="
        font-family: ${StyleBible.typography.transition};
        font-size: calc(3.5rem * ${Accessibility.textScale});
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 0.5rem;
      ">
        ${L.t('start.title')}<span style="color: ${StyleBible.accent}">.</span>
      </div>
      <div style="
        font-size: calc(0.875rem * ${Accessibility.textScale});
        color: rgba(255,255,255,0.6);
        margin-bottom: 2rem;
        text-align: center;
        max-width: 30ch;
      ">
        ${L.t('start.subtitle')}
      </div>
      <button id="drive-btn" class="tap-target" style="
        background: ${StyleBible.accent};
        color: ${StyleBible.surface};
        border: none;
        padding: 14px 32px;
        font-size: calc(0.875rem * ${Accessibility.textScale});
        font-weight: 600;
        font-family: ${StyleBible.typography.hud};
        letter-spacing: 0.1em;
        border-radius: 8px;
        cursor: pointer;
        min-width: 44px;
        min-height: 44px;
        transition: transform ${StyleBible.uiDuration}ms ${StyleBible.uiEaseCurve};
      ">
        ▶ ${hasSave ? L.t('menu.continue') : L.t('start.button')}
      </button>
      <div style="
        margin-top: 1.5rem;
        font-size: calc(0.75rem * ${Accessibility.textScale});
        color: rgba(255,255,255,0.3);
        letter-spacing: 0.05em;
      ">
        ${L.t('start.hint')}
      </div>
      <div style="
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        font-size: 0.7rem;
        color: rgba(255,255,255,0.25);
        font-family: ${StyleBible.typography.hud};
      ">
        v0.1 · M0
      </div>
    </div>
  `;

  const driveBtn = document.getElementById('drive-btn');
  if (driveBtn) {
    driveBtn.addEventListener('click', () => {
      EventBus.emit('app:driveClicked');
      // M1 wires this to start the gameplay scene.
      console.log('[m0] Drive button clicked. M1 will wire gameplay.');
    });
  }
}

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
