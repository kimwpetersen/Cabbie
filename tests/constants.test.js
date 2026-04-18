import { describe, it, expect } from 'vitest';
import * as C from '../src/constants.js';

describe('constants', () => {
  it('exports world geometry constants', () => {
    expect(C.BLOCK_COUNT).toBe(7);
    expect(C.BLOCK_SIZE).toBe(60);
    expect(C.ROAD_WIDTH).toBe(10);
  });

  it('exports player physics constants with expected relations', () => {
    expect(C.MAX_SPEED).toBeGreaterThan(0);
    expect(C.ACCEL_RATE).toBeGreaterThan(0);
    expect(C.BRAKE_RATE).toBeGreaterThan(C.ACCEL_RATE);
    expect(C.TURN_RATE_LOW).toBeGreaterThan(C.TURN_RATE_HIGH);
  });

  it('exports act gate values matching PRD', () => {
    expect(C.ACT1_GATE_CASH).toBe(10000);
    expect(C.ACT1_GATE_RATING).toBe(4.0);
    expect(C.ACT2_GATE_VEHICLES).toBe(10);
    expect(C.ACT2_GATE_DISTRICTS).toBe(3);
    expect(C.ACT2_GATE_RIVAL_SHARE).toBe(0.2);
    expect(C.WIN_HOLD_DAYS).toBe(3);
  });

  it('exports police constants with relaxed variants', () => {
    expect(C.POLICE_SPEED_THRESHOLD).toBe(82);
    expect(C.POLICE_SPEED_RELAXED).toBe(95);
    expect(C.POLICE_ESCAPE_DISTANCE).toBe(500);
    expect(C.POLICE_ESCAPE_RELAXED).toBeLessThan(C.POLICE_ESCAPE_DISTANCE);
  });

  it('exports driver tier table with 4 tiers', () => {
    expect(C.ROSTER_CAP).toBe(12);
    expect(Object.keys(C.TIER_STATS)).toEqual(['rookie', 'journey', 'pro', 'ace']);
    expect(C.TIER_STATS.rookie.wageBaseline).toBe(80);
    expect(C.TIER_STATS.ace.wageBaseline).toBe(450);
  });

  it('exports vehicle fleet constants', () => {
    expect(C.FLEET_CAP).toBe(20);
    expect(Object.keys(C.VEHICLE_BASE_COST)).toEqual(['standard', 'hybrid', 'luxury']);
    expect(C.VEHICLE_CLASS_MULT.luxury.airportEligible).toBe(true);
    expect(C.VEHICLE_CLASS_MULT.standard.airportEligible).toBe(false);
  });

  it('exports Act 3 economy constants', () => {
    expect(C.APP_SURGE_MIN).toBe(1.0);
    expect(C.APP_SURGE_MAX).toBe(2.5);
    expect(C.APP_TAKE_MIN).toBe(0.6);
    expect(C.APP_TAKE_MAX).toBe(0.9);
  });

  it('exports ad + soft-loss constants', () => {
    expect(C.AD_INTERSTITIAL_COOLDOWN_MS).toBe(5 * 60 * 1000);
    expect(C.SKIP_TOKEN_CAP).toBe(3);
    expect(C.SOFT_LOSS_DAYS).toBe(3);
    expect(C.SOFT_LOSS_BONUS.act1).toBe(2000);
  });
});
