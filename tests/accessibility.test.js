import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Accessibility } from '../src/foundations/Accessibility.js';

describe('Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    Accessibility.reset();
  });

  it('has expected defaults', () => {
    expect(Accessibility.reducedMotion).toBe(false);
    expect(Accessibility.highContrast).toBe(false);
    expect(Accessibility.textScale).toBe(1.0);
    expect(Accessibility.colorblindProfile).toBe(null);
    expect(Accessibility.subtitlesEnabled).toBe(true);
    expect(Accessibility.volumeMaster).toBe(0.8);
    expect(Accessibility.volumeMusic).toBe(0.7);
    expect(Accessibility.volumeSFX).toBe(0.9);
    expect(Accessibility.autoPilot).toBe(false);
    expect(Accessibility.relaxedPolice).toBe(false);
    expect(Accessibility.relaxedSLAs).toBe(false);
    expect(Accessibility.economyAssist).toBe(false);
    expect(Accessibility.relaxedTiming).toBe(false);
  });

  it('set() updates a setting and saves', () => {
    Accessibility.set('reducedMotion', true);
    expect(Accessibility.reducedMotion).toBe(true);
    const saved = JSON.parse(localStorage.getItem('cabbie.a11y'));
    expect(saved.reducedMotion).toBe(true);
  });

  it('set() notifies subscribers', () => {
    const spy = vi.fn();
    const off = Accessibility.subscribe(spy);
    Accessibility.set('textScale', 1.5);
    expect(spy).toHaveBeenCalledWith({ key: 'textScale', value: 1.5 });
    off();
  });

  it('load() restores saved values', () => {
    localStorage.setItem('cabbie.a11y', JSON.stringify({ highContrast: true, textScale: 2.0 }));
    Accessibility.load();
    expect(Accessibility.highContrast).toBe(true);
    expect(Accessibility.textScale).toBe(2.0);
    expect(Accessibility.reducedMotion).toBe(false);
  });

  it('load() survives corrupt JSON', () => {
    localStorage.setItem('cabbie.a11y', 'not json');
    expect(() => Accessibility.load()).not.toThrow();
    expect(Accessibility.reducedMotion).toBe(false);
  });

  it('textScale clamped to 0.5 - 2.0', () => {
    Accessibility.set('textScale', 5.0);
    expect(Accessibility.textScale).toBe(2.0);
    Accessibility.set('textScale', 0.1);
    expect(Accessibility.textScale).toBe(0.5);
  });

  it('volumes clamped to 0 - 1', () => {
    Accessibility.set('volumeMaster', 2.0);
    expect(Accessibility.volumeMaster).toBe(1.0);
    Accessibility.set('volumeMusic', -0.5);
    expect(Accessibility.volumeMusic).toBe(0.0);
  });

  it('colorblindProfile accepts valid values or null', () => {
    Accessibility.set('colorblindProfile', 'deuter');
    expect(Accessibility.colorblindProfile).toBe('deuter');
    Accessibility.set('colorblindProfile', 'invalid');
    expect(Accessibility.colorblindProfile).toBe('deuter');
    Accessibility.set('colorblindProfile', null);
    expect(Accessibility.colorblindProfile).toBe(null);
  });

  it('serialize() returns full state', () => {
    Accessibility.set('reducedMotion', true);
    const s = Accessibility.serialize();
    expect(s.reducedMotion).toBe(true);
    expect(s.textScale).toBe(1.0);
  });

  it('unsubscribe() stops further notifications', () => {
    const spy = vi.fn();
    const off = Accessibility.subscribe(spy);
    off();
    Accessibility.set('subtitlesEnabled', false);
    expect(spy).not.toHaveBeenCalled();
  });
});
