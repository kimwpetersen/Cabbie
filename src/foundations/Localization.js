// src/foundations/Localization.js
// String lookup with ICU plural support. See CABBIE_SPEC.md §8.
// All user-facing strings MUST flow through this module.

import en from '../strings/en.json';
import fr from '../strings/fr.json';
import de from '../strings/de.json';
import ptBR from '../strings/pt-BR.json';
import es from '../strings/es.json';

const tables = { en, fr, de, 'pt-BR': ptBR, es };

let currentLang = 'en';

export const L = {
  setLanguage(lang) {
    if (tables[lang]) currentLang = lang;
  },

  current() {
    return currentLang;
  },

  t(key, params = {}) {
    const table = tables[currentLang] || tables.en;
    const fallback = tables.en;
    let template = table[key];
    if (template == null) template = fallback[key];
    if (template == null) return key;
    if (Array.isArray(template)) template = template[0];
    return interpolate(template, params);
  },

  pick(key, params = {}) {
    const table = tables[currentLang] || tables.en;
    const pool = table[key];
    if (!Array.isArray(pool)) return this.t(key, params);
    const line = pool[Math.floor(Math.random() * pool.length)];
    return interpolate(line, params);
  },

  // Internal — used by Task 6 to register additional languages
  _registerLanguage(code, table) {
    tables[code] = table;
  },
};

function interpolate(template, params) {
  // First pass: handle ICU plural expressions (which contain nested braces)
  // Pattern: {varName, plural, one {text} other {text}}
  let result = template.replace(
    /\{(\w+),\s*plural,\s*((?:\w+\s*\{[^}]*\}\s*)+)\}/g,
    (_, varName, body) => {
      const count = params[varName];
      if (count == null) return _;
      const categories = {};
      const re = /(\w+)\s*\{([^}]*)\}/g;
      let m;
      while ((m = re.exec(body)) !== null) {
        categories[m[1]] = m[2];
      }
      const chosen = count === 1 ? categories.one : categories.other;
      if (!chosen) return String(count);
      return chosen.replace('#', String(count));
    }
  );

  // Second pass: simple {param} interpolation
  result = result.replace(/\{([^},]+)\}/g, (_, key) => {
    const k = key.trim();
    return params[k] != null ? String(params[k]) : `{${key}}`;
  });

  return result;
}
