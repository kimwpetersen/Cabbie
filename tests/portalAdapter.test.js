import { describe, it, expect, vi } from 'vitest';
import { PortalAdapter } from '../src/foundations/PortalAdapter.js';

describe('PortalAdapter (dev portal)', () => {
  // Note: __PORTAL__ is set to 'dev' by vitest.config.js

  it('initializes without throwing', async () => {
    await expect(PortalAdapter.init()).resolves.not.toThrow();
  });

  it('preRoll() resolves true in dev', async () => {
    expect(await PortalAdapter.preRoll()).toBe(true);
  });

  it('interstitial() resolves true in dev', async () => {
    expect(await PortalAdapter.interstitial('act-transition')).toBe(true);
  });

  it('rewarded() resolves true in dev (grants reward)', async () => {
    expect(await PortalAdapter.rewarded('revive')).toBe(true);
  });

  it('trackEvent() does not throw', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await PortalAdapter.trackEvent('test:event', { value: 1 });
    expect(log).toHaveBeenCalledWith('[telemetry]', 'test:event', { value: 1 });
    log.mockRestore();
  });

  it('cloudSaveSupported() returns false in dev', async () => {
    expect(await PortalAdapter.cloudSaveSupported()).toBe(false);
  });
});
