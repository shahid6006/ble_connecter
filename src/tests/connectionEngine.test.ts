import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BluetoothConnectionEngine } from '../services/bluetooth/connectionEngine';

describe('BluetoothConnectionEngine', () => {
  let engine: BluetoothConnectionEngine;

  beforeEach(() => {
    engine = new BluetoothConnectionEngine();
  });

  it('initializes in idle state', () => {
    const status = engine.getStatus();
    expect(status.state).toBe('idle');
    expect(status.attemptCount).toBe(0);
    expect(status.maxAttempts).toBe(5);
    expect(status.lastError).toBeNull();
  });

  it('sets unsupported state when navigator.bluetooth is missing', async () => {
    // In default test environment, navigator.bluetooth is undefined
    const res = await engine.discoverDevices();
    expect(res).toBeNull();

    const status = engine.getStatus();
    expect(status.state).toBe('unsupported');
    expect(status.lastError).toContain('Web Bluetooth API is not supported');
  });

  it('cancels in-flight operations cleanly', () => {
    engine.cancelOperation();
    const status = engine.getStatus();
    expect(status.state).toBe('idle');
    expect(status.lastError).toContain('cancelled');
    expect(status.attemptCount).toBe(0);
  });

  it('notifies state subscribers on transition', () => {
    const listener = vi.fn();
    const unsub = engine.subscribeState(listener);

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ state: 'idle' }));

    engine.cancelOperation();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ state: 'idle', lastError: 'Operation cancelled by user.' }));

    unsub();
  });
});
