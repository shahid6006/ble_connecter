import { useState, useEffect, useCallback } from 'react';
import { BluetoothCapabilities } from '../types/bluetooth';
import { capabilityService } from '../services/bluetooth/capabilityService';

export function useBluetoothCapabilities() {
  const [capabilities, setCapabilities] = useState<BluetoothCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const caps = await capabilityService.detectCapabilities();
      setCapabilities(caps);
    } catch {
      // Keep previous or default
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Recheck if user returns to tab
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);

  return { capabilities, isLoading, refresh };
}
