import { describe, it, expect, beforeEach } from 'vitest';
import { storageService, DEFAULT_SETTINGS } from '../services/storage/indexedDbService';
import { PreferredDeviceRecord } from '../types/bluetooth';

describe('StorageService', () => {
  beforeEach(async () => {
    localStorage.clear();
  });

  it('retrieves default settings when no preferences saved', async () => {
    const settings = await storageService.getSettings();
    expect(settings.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(settings.volumeGuardLimit).toBe(DEFAULT_SETTINGS.volumeGuardLimit);
  });

  it('saves and updates app settings', async () => {
    const updated = await storageService.saveSettings({
      theme: 'midnight',
      volumeGuardLimit: 15,
    });
    expect(updated.theme).toBe('midnight');
    expect(updated.volumeGuardLimit).toBe(15);
  });

  it('stores and retrieves preferred devices', async () => {
    const testDevice: PreferredDeviceRecord = {
      id: 'test_device_1',
      name: 'Sony WF-1000XM5',
      nickname: 'Campus Earbuds',
      brand: 'sony',
      deviceCategory: 'earbuds',
      multipointEnabled: true,
      dormDeviceNote: 'Paired to Room 102 Mac',
      createdAt: Date.now(),
      lastConnectedAt: null,
      reconnectReminder: true,
    };

    await storageService.savePreferredDevice(testDevice);
    const list = await storageService.getPreferredDevices();
    expect(list.some((d) => d.id === 'test_device_1')).toBe(true);

    await storageService.deletePreferredDevice('test_device_1');
    const afterDelete = await storageService.getPreferredDevices();
    expect(afterDelete.some((d) => d.id === 'test_device_1')).toBe(false);
  });
});
