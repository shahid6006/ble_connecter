import { useState, useEffect, useCallback } from 'react';
import { PreferredDeviceRecord } from '../types/bluetooth';
import { storageService } from '../services/storage/indexedDbService';

export function usePreferredDevices() {
  const [preferredDevices, setPreferredDevices] = useState<PreferredDeviceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await storageService.getPreferredDevices();
      setPreferredDevices(list);
    } catch {
      // Empty fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveDevice = useCallback(
    async (device: PreferredDeviceRecord) => {
      await storageService.savePreferredDevice(device);
      await reload();
    },
    [reload]
  );

  const removeDevice = useCallback(
    async (id: string) => {
      await storageService.deletePreferredDevice(id);
      await reload();
    },
    [reload]
  );

  const updateLastConnected = useCallback(
    async (id: string) => {
      const existing = preferredDevices.find((d) => d.id === id);
      if (existing) {
        const updated: PreferredDeviceRecord = {
          ...existing,
          lastConnectedAt: Date.now(),
        };
        await storageService.savePreferredDevice(updated);
        await reload();
      }
    },
    [preferredDevices, reload]
  );

  return {
    preferredDevices,
    isLoading,
    saveDevice,
    removeDevice,
    updateLastConnected,
    reload,
  };
}
