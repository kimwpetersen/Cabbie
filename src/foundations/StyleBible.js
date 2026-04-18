// src/foundations/StyleBible.js
// Style token reference. See CABBIE_SPEC.md §6.
// All UI/FX/world modules import tokens from here. No inline colors or fonts anywhere else.

import oldPort        from '../../docs/style-bible/palettes/old-port.json';
import neonQuarter    from '../../docs/style-bible/palettes/neon-quarter.json';
import financialGlass from '../../docs/style-bible/palettes/financial-glass.json';
import sunFlats       from '../../docs/style-bible/palettes/sun-flats.json';
import docklands      from '../../docs/style-bible/palettes/docklands.json';
import festivalRow    from '../../docs/style-bible/palettes/festival-row.json';
import airportSpur    from '../../docs/style-bible/palettes/airport-spur.json';
import heights        from '../../docs/style-bible/palettes/heights.json';

const palettes = {
  'old-port':        oldPort,
  'neon-quarter':    neonQuarter,
  'financial-glass': financialGlass,
  'sun-flats':       sunFlats,
  'docklands':       docklands,
  'festival-row':    festivalRow,
  'airport-spur':    airportSpur,
  'heights':         heights,
};

export const StyleBible = {
  palettes,

  typography: {
    hud:        "'DM Mono', ui-monospace, Menlo, monospace",
    transition: "Georgia, 'Times New Roman', serif",
  },

  // Brand
  accent:          '#F5C400',
  surface:         '#0a0a14',
  surfaceElevated: '#13131e',
  border:          'rgba(245, 196, 0, 0.2)',

  // Motion
  uiEaseCurve: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
  uiDuration:  200, // ms

  // Feedback text colors (§9)
  feedback: {
    cash:    '#F5C400',
    rep:     '#6FD6FF',
    comfort: '#8BFF9C',
    damage:  '#FF6470',
  },

  getPalette(id) {
    return palettes[id] || null;
  },
};
