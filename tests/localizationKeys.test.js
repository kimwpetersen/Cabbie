import { describe, it, expect } from 'vitest';
import en from '../src/strings/en.json';
import fr from '../src/strings/fr.json';
import de from '../src/strings/de.json';
import ptBR from '../src/strings/pt-BR.json';
import es from '../src/strings/es.json';

// This test enforces pitfall P10: missing keys in non-English languages
// cause UI breakage. CI fails if any language is missing a key English has.

const LANG_TABLES = { fr, de, 'pt-BR': ptBR, es };

describe('Localization key coverage', () => {
  const enKeys = Object.keys(en);

  for (const [lang, table] of Object.entries(LANG_TABLES)) {
    it(`${lang} has all ${enKeys.length} keys that en has`, () => {
      const missing = enKeys.filter(k => !(k in table));
      expect(missing, `Missing keys in ${lang}: ${missing.join(', ')}`).toEqual([]);
    });

    it(`${lang} has no extra keys not in en`, () => {
      const extra = Object.keys(table).filter(k => !(k in en));
      expect(extra, `Extra keys in ${lang}: ${extra.join(', ')}`).toEqual([]);
    });

    it(`${lang} preserves array-vs-string type per key`, () => {
      for (const k of enKeys) {
        const enIsArray = Array.isArray(en[k]);
        const langIsArray = Array.isArray(table[k]);
        expect(langIsArray, `Type mismatch for ${k} in ${lang}`).toBe(enIsArray);
      }
    });
  }
});
