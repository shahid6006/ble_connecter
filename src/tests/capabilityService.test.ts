import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BluetoothCapabilityService } from '../services/bluetooth/capabilityService';

describe('BluetoothCapabilityService', () => {
  let service: BluetoothCapabilityService;

  let originalNavigator: any;

  beforeEach(() => {
    service = new BluetoothCapabilityService();
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('detects when navigator.bluetooth is absent', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      configurable: true,
    });

    const caps = await service.detectCapabilities();
    expect(caps.webBluetoothSupported).toBe(false);
    expect(caps.gattSupported).toBe(false);
    expect(caps.availability).toBe('unsupported');
    expect(caps.restrictions.length).toBeGreaterThan(0);
  });

  it('detects when navigator.bluetooth is present and available', async () => {
    const mockBluetooth = {
      getAvailability: vi.fn().mockResolvedValue(true),
      requestLEScan: vi.fn(),
    };

    Object.defineProperty(global, 'navigator', {
      value: {
        bluetooth: mockBluetooth,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0.0.0 Mobile Safari/537.36',
      },
      configurable: true,
    });

    const caps = await service.detectCapabilities();
    expect(caps.webBluetoothSupported).toBe(true);
    expect(caps.scanningSupported).toBe(true);
    expect(caps.availability).toBe('available');
    expect(caps.browserName).toBe('Google Chrome');
    expect(caps.osName).toBe('Android');

    // Truthful disclosures present
    expect(caps.restrictions.some((r) => r.includes('BLE GATT Scope Only'))).toBe(true);
  });

  it('correctly labels iOS Safari WebKit restrictions', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      },
      configurable: true,
    });

    const caps = await service.detectCapabilities();
    expect(caps.webBluetoothSupported).toBe(false);
    expect(caps.osName).toBe('iOS');
    expect(caps.restrictions.some((r) => r.includes('iOS WebKit Limitation'))).toBe(true);
  });
});
