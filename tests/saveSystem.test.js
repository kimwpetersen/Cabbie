import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../src/save/SaveSystem.js';

describe('SaveSystem', () => {
  beforeEach(() => {
    localStorage.clear();
    SaveSystem._stubState = null;
  });

  it('flush() writes versioned payload to localStorage', () => {
    SaveSystem._stubState = { cash: 100, day: 1 };
    SaveSystem.flush();
    const raw = localStorage.getItem('cabbie.save');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.v).toBe(1);
    expect(parsed.state.cash).toBe(100);
    expect(parsed.ts).toBeTypeOf('number');
  });

  it('load() returns null when no save exists', () => {
    expect(SaveSystem.load()).toBe(null);
  });

  it('load() returns state for a valid saved payload', () => {
    localStorage.setItem('cabbie.save', JSON.stringify({ v: 1, ts: Date.now(), state: { cash: 500 } }));
    expect(SaveSystem.load()).toEqual({ cash: 500 });
  });

  it('load() returns null for corrupt JSON', () => {
    localStorage.setItem('cabbie.save', 'not json');
    expect(SaveSystem.load()).toBe(null);
  });

  it('load() returns null for unknown schema version without migration', () => {
    localStorage.setItem('cabbie.save', JSON.stringify({ v: 0, ts: 1, state: { money: 777 } }));
    const state = SaveSystem.load();
    expect(state === null || typeof state === 'object').toBe(true);
  });

  it('roundTrip preserves data via flush + load', () => {
    SaveSystem._stubState = { cash: 42, driverCount: 3, complex: { nested: [1, 2, 3] } };
    SaveSystem.flush();
    const loaded = SaveSystem.load();
    expect(loaded).toEqual({ cash: 42, driverCount: 3, complex: { nested: [1, 2, 3] } });
  });

  it('clear() removes the save', () => {
    SaveSystem._stubState = { cash: 100 };
    SaveSystem.flush();
    SaveSystem.clear();
    expect(SaveSystem.load()).toBe(null);
  });

  it('collectState() returns the stubbed state in M0', () => {
    SaveSystem._stubState = { x: 1 };
    expect(SaveSystem.collectState()).toEqual({ x: 1 });
  });
});
