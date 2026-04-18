import { describe, it, expect } from 'vitest';
import { StyleBible } from '../src/foundations/StyleBible.js';

describe('StyleBible', () => {
  it('exports all 8 district palettes', () => {
    const expected = ['old-port', 'neon-quarter', 'financial-glass', 'sun-flats',
                      'docklands', 'festival-row', 'airport-spur', 'heights'];
    expect(Object.keys(StyleBible.palettes).sort()).toEqual(expected.sort());
  });

  it('each palette has 5 required color keys', () => {
    const required = ['base', 'accent', 'sky', 'signage', 'highlight'];
    for (const [id, palette] of Object.entries(StyleBible.palettes)) {
      for (const k of required) {
        expect(palette.colors[k], `Palette ${id} missing ${k}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('exports typography tokens', () => {
    expect(StyleBible.typography.hud).toContain('DM Mono');
    expect(StyleBible.typography.transition).toBeTruthy();
  });

  it('exports brand tokens', () => {
    expect(StyleBible.accent).toBe('#F5C400');
    expect(StyleBible.surface).toBe('#0a0a14');
    expect(StyleBible.surfaceElevated).toBeTruthy();
  });

  it('exports motion tokens', () => {
    expect(StyleBible.uiEaseCurve).toBeTruthy();
    expect(StyleBible.uiDuration).toBeGreaterThan(0);
  });

  it('getPalette() returns a palette by id', () => {
    const p = StyleBible.getPalette('old-port');
    expect(p.colors.base).toBeTruthy();
  });

  it('getPalette() returns null for unknown id', () => {
    expect(StyleBible.getPalette('not-a-district')).toBe(null);
  });
});
