import { describe, it, expect, beforeEach } from 'vitest';
import { L } from '../src/foundations/Localization.js';

describe('Localization', () => {
  beforeEach(() => {
    L.setLanguage('en');
  });

  it('returns a string for a known key', () => {
    expect(L.t('start.title')).toBe('CABBIE');
  });

  it('falls back to the raw key for a missing key', () => {
    expect(L.t('definitely.not.a.key')).toBe('definitely.not.a.key');
  });

  it('interpolates {param} tokens', () => {
    expect(L.t('hud.distance', { m: 120 })).toBe('120m');
  });

  it('interpolates multiple params in one string', () => {
    expect(L.t('fare.completed', { tip: 25, rating: 'Great drive!' }))
      .toBe('+$25 — Great drive!');
  });

  it('handles ICU plural syntax for one', () => {
    expect(L.t('common.plural.drivers', { count: 1 })).toBe('1 driver');
  });

  it('handles ICU plural syntax for other', () => {
    expect(L.t('common.plural.drivers', { count: 3 })).toBe('3 drivers');
  });

  it('pick() returns a string from an array pool', () => {
    const result = L.pick('fare.pickup.bar');
    expect(['Take me to The Rusty Hook, cabbie.', 'Bar district, and step on it.', 'I need a drink. Now.'])
      .toContain(result);
  });

  it('pick() falls back to t() when key is not a pool', () => {
    expect(L.pick('start.title')).toBe('CABBIE');
  });

  it('current() returns the active language', () => {
    expect(L.current()).toBe('en');
    // Register a stub language to test switching (fr wired properly in Task 6)
    L._registerLanguage('fr', { 'start.title': 'CABBIE' });
    L.setLanguage('fr');
    expect(L.current()).toBe('fr');
  });

  it('setLanguage() rejects unknown languages silently', () => {
    L.setLanguage('xx');
    expect(L.current()).toBe('en');
  });
});
