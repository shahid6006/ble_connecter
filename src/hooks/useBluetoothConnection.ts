import { useState, useEffect, useCallback } from 'react';
import {
  ConnectionOperationStatus,
  DiscoveredGattDevice,
} from '../types/bluetooth';
import { connectionEngine } from '../services/bluetooth/connectionEngine';

export function useBluetoothConnection() {
  const [status, setStatus] = useState<ConnectionOperationStatus>(connectionEngine.getStatus());
  const [devices, setDevices] = useState<DiscoveredGattDevice[]>(connectionEngine.getDiscoveredDevices());

  useEffect(() => {
    const unsubStatus = connectionEngine.subscribeState((newStatus) => {
      setStatus(newStatus);
    });

    const unsubDevices = connectionEngine.subscribeDevices((newDevices) => {
      setDevices(newDevices);
    });

    return () => {
      unsubStatus();
      unsubDevices();
    };
  }, []);

  const discoverDevices = useCallback(async () => {
    return connectionEngine.discoverDevices();
  }, []);

  const connectGatt = useCallback(async (deviceId: string) => {
    return connectionEngine.connectGatt(deviceId);
  }, []);

  const cancelOperation = useCallback(() => {
    connectionEngine.cancelOperation();
  }, []);

  const disconnect = useCallback(async (deviceId: string) => {
    return connectionEngine.disconnect(deviceId);
  }, []);

  return {
    status,
    devices,
    discoverDevices,
    connectGatt,
    cancelOperation,
    disconnect,
  };
}
