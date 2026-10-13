import {
  ConnectionState,
  ConnectionOperationStatus,
  DiscoveredGattDevice,
} from '../../types/bluetooth';
import {
  GATT_SERVICES,
  GATT_CHARACTERISTICS,
  STANDARD_SERVICES_LIST,
  parseBatteryLevel,
  parseStringCharacteristic,
  inferCategoryFromName,
} from './gattProfiles';
import { storageService } from '../storage/indexedDbService';

export type StateChangeListener = (status: ConnectionOperationStatus) => void;
export type DeviceListListener = (devices: DiscoveredGattDevice[]) => void;

export class BluetoothConnectionEngine {
  private state: ConnectionState = 'idle';
  private activeTargetId: string | null = null;
  private activeTargetName: string | null = null;
  private attemptCount = 0;
  private readonly maxAttempts = 5;
  private retryDelayMs = 1000;
  private lastError: string | null = null;
  private lastStatusChange = Date.now();
  private troubleshootingTip: string | null = null;

  private isCancelled = false;
  private retryTimeoutId: any = null;

  // Stored active BluetoothDevice references for authorized GATT reconnection
  private deviceMap: Map<string, any> = new Map();
  private discoveredDevices: DiscoveredGattDevice[] = [];

  private stateListeners: Set<StateChangeListener> = new Set();
  private deviceListeners: Set<DeviceListListener> = new Set();

  constructor() {
    this.updateState('idle');
  }

  public getStatus(): ConnectionOperationStatus {
    return {
      state: this.state,
      activeTargetId: this.activeTargetId,
      activeTargetName: this.activeTargetName,
      attemptCount: this.attemptCount,
      maxAttempts: this.maxAttempts,
      retryDelayMs: this.retryDelayMs,
      lastError: this.lastError,
      lastStatusChange: this.lastStatusChange,
      troubleshootingTip: this.troubleshootingTip,
    };
  }

  public getDiscoveredDevices(): DiscoveredGattDevice[] {
    return [...this.discoveredDevices];
  }

  public subscribeState(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getStatus());
    return () => this.stateListeners.delete(listener);
  }

  public subscribeDevices(listener: DeviceListListener): () => void {
    this.deviceListeners.add(listener);
    listener(this.getDiscoveredDevices());
    return () => this.deviceListeners.delete(listener);
  }

  private updateState(
    newState: ConnectionState,
    updates: Partial<{
      lastError: string | null;
      troubleshootingTip: string | null;
      retryDelayMs: number;
    }> = {}
  ) {
    this.state = newState;
    this.lastStatusChange = Date.now();

    if ('lastError' in updates) this.lastError = updates.lastError ?? null;
    if ('troubleshootingTip' in updates) this.troubleshootingTip = updates.troubleshootingTip ?? null;
    if ('retryDelayMs' in updates) this.retryDelayMs = updates.retryDelayMs ?? 1000;

    const status = this.getStatus();
    this.stateListeners.forEach((l) => l(status));
  }

  private notifyDevices() {
    const list = this.getDiscoveredDevices();
    this.deviceListeners.forEach((l) => l(list));
  }

  /**
   * Discovers a device via native browser chooser.
   * NEVER invents or fakes devices.
   */
  public async discoverDevices(): Promise<DiscoveredGattDevice | null> {
    if (this.state === 'discovering' || this.state === 'connecting') {
      throw new Error('A Bluetooth operation is already in progress. Please wait or cancel.');
    }

    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.bluetooth) {
      this.updateState('unsupported', {
        lastError: 'Web Bluetooth API is not supported in this browser.',
        troubleshootingTip: 'Use Chrome or Samsung Internet on Android, or Chrome on Windows/macOS/ChromeOS.',
      });
      return null;
    }

    this.isCancelled = false;
    this.updateState('discovering', { lastError: null, troubleshootingTip: null });

    try {
      // Prompt user with real native chooser
      // Include standard GATT audio and accessory services where possible
      const rawDevice = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          ...STANDARD_SERVICES_LIST,
          GATT_SERVICES.BATTERY_SERVICE,
          GATT_SERVICES.DEVICE_INFORMATION,
          0xfe2c, // Fast Pair
          0x1812, // HID
        ],
      });

      if (!rawDevice) {
        this.updateState('idle');
        return null;
      }

      this.deviceMap.set(rawDevice.id, rawDevice);

      // Attach disconnected listener
      rawDevice.addEventListener('gattserverdisconnected', () => {
        this.handleDeviceDisconnected(rawDevice.id);
      });

      const newDiscovered: DiscoveredGattDevice = {
        id: rawDevice.id,
        name: rawDevice.name || 'Unnamed Bluetooth Device',
        connected: Boolean(rawDevice.gatt?.connected),
        category: inferCategoryFromName(rawDevice.name || ''),
        discoveredAt: Date.now(),
        servicesFound: [],
        rawDevice,
      };

      // Add to internal list
      const existingIdx = this.discoveredDevices.findIndex((d) => d.id === rawDevice.id);
      if (existingIdx >= 0) {
        this.discoveredDevices[existingIdx] = newDiscovered;
      } else {
        this.discoveredDevices.unshift(newDiscovered);
      }
      this.notifyDevices();

      await storageService.addLogEntry({
        type: 'discovery',
        deviceName: newDiscovered.name,
        message: `Discovered and authorized device: ${newDiscovered.name}`,
        details: `ID: ${rawDevice.id.substring(0, 8)}... | Category: ${newDiscovered.category}`,
      });

      this.updateState('idle');
      return newDiscovered;
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // User cancelled the chooser
        this.updateState('idle', {
          lastError: 'Device selection cancelled by user.',
          troubleshootingTip: 'Ensure your earbuds are in pairing mode before scanning.',
        });
        return null;
      }

      if (err.name === 'SecurityError') {
        this.updateState('permission-denied', {
          lastError: 'Bluetooth permission was blocked or denied by browser security policy.',
          troubleshootingTip: 'Grant Bluetooth permissions in browser site settings or address bar icon.',
        });
        return null;
      }

      this.updateState('error', {
        lastError: err.message || 'Bluetooth discovery failed.',
        troubleshootingTip: 'Check if Bluetooth is enabled in your Android / system settings.',
      });
      return null;
    }
  }

  /**
   * Real GATT Connection to a previously authorized BluetoothDevice
   */
  public async connectGatt(deviceId: string): Promise<boolean> {
    if (this.state === 'connecting') {
      throw new Error('Connection operation already in progress.');
    }

    const rawDevice = this.deviceMap.get(deviceId);
    if (!rawDevice) {
      this.updateState('error', {
        lastError: 'Device session expired or unauthorized in current browser context.',
        troubleshootingTip: 'Browsers require re-selecting the device via Discover Devices to re-authorize GATT access.',
      });
      return false;
    }

    this.isCancelled = false;
    this.attemptCount = 0;
    this.activeTargetId = deviceId;
    this.activeTargetName = rawDevice.name || 'Bluetooth Device';

    return this.executeGattConnect(rawDevice);
  }

  private async executeGattConnect(rawDevice: any): Promise<boolean> {
    if (this.isCancelled) {
      this.updateState('idle');
      return false;
    }

    this.attemptCount++;
    this.updateState('connecting', {
      lastError: null,
      troubleshootingTip: `Attempt ${this.attemptCount} of ${this.maxAttempts}... Waiting for device response.`,
    });

    try {
      if (!rawDevice.gatt) {
        throw new Error('GATT server not available on this device.');
      }

      const gattServer = await rawDevice.gatt.connect();

      if (!gattServer.connected) {
        throw new Error('GATT server reported not connected after request.');
      }

      // Read standard services
      let batteryLevel: number | null = null;
      let manufacturer: string | null = null;
      let modelNumber: string | null = null;
      const servicesFound: string[] = [];

      try {
        const batteryService = await gattServer.getPrimaryService(GATT_SERVICES.BATTERY_SERVICE);
        if (batteryService) {
          servicesFound.push('Battery Service');
          const char = await batteryService.getCharacteristic(GATT_CHARACTERISTICS.BATTERY_LEVEL);
          const val = await char.readValue();
          batteryLevel = parseBatteryLevel(val);
        }
      } catch {
        // Battery service optional
      }

      try {
        const infoService = await gattServer.getPrimaryService(GATT_SERVICES.DEVICE_INFORMATION);
        if (infoService) {
          servicesFound.push('Device Information');
          try {
            const mChar = await infoService.getCharacteristic(GATT_CHARACTERISTICS.MANUFACTURER_NAME_STRING);
            const mVal = await mChar.readValue();
            manufacturer = parseStringCharacteristic(mVal);
          } catch {}

          try {
            const modChar = await infoService.getCharacteristic(GATT_CHARACTERISTICS.MODEL_NUMBER_STRING);
            const modVal = await modChar.readValue();
            modelNumber = parseStringCharacteristic(modVal);
          } catch {}
        }
      } catch {
        // Info service optional
      }

      // Update in discovered list
      const idx = this.discoveredDevices.findIndex((d) => d.id === rawDevice.id);
      if (idx >= 0) {
        this.discoveredDevices[idx] = {
          ...this.discoveredDevices[idx],
          connected: true,
          batteryLevel: batteryLevel ?? this.discoveredDevices[idx].batteryLevel,
          manufacturer: manufacturer ?? this.discoveredDevices[idx].manufacturer,
          modelNumber: modelNumber ?? this.discoveredDevices[idx].modelNumber,
          lastConnectedAt: Date.now(),
          servicesFound,
        };
      }
      this.notifyDevices();

      await storageService.addLogEntry({
        type: 'connect',
        deviceName: rawDevice.name,
        message: `Successfully connected to GATT server: ${rawDevice.name}`,
        details: `Battery: ${batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}, Services: ${servicesFound.join(', ') || 'Standard GATT'}`,
      });

      this.updateState('connected', {
        lastError: null,
        troubleshootingTip: 'GATT connection active. Note: Audio playback (A2DP) is routed by your operating system.',
      });

      return true;
    } catch (err: any) {
      const errMsg = err.message || 'GATT connection failed.';

      if (this.attemptCount < this.maxAttempts && !this.isCancelled) {
        // Exponential backoff: 1s, 2s, 4s, 8s
        this.retryDelayMs = Math.min(1000 * Math.pow(2, this.attemptCount - 1), 10000);

        this.updateState('connecting', {
          lastError: `Attempt ${this.attemptCount} failed (${errMsg}). Retrying in ${this.retryDelayMs / 1000}s...`,
          retryDelayMs: this.retryDelayMs,
        });

        await new Promise((res) => {
          this.retryTimeoutId = setTimeout(res, this.retryDelayMs);
        });

        if (this.isCancelled) {
          this.updateState('idle');
          return false;
        }

        return this.executeGattConnect(rawDevice);
      }

      // Max attempts reached
      await storageService.addLogEntry({
        type: 'error',
        deviceName: rawDevice.name,
        message: `Failed to connect after ${this.attemptCount} attempts: ${errMsg}`,
      });

      this.updateState('error', {
        lastError: `Could not connect to ${rawDevice.name || 'device'}: ${errMsg}`,
        troubleshootingTip:
          'If the earbuds are connected to a dorm laptop or classmate phone, put them into the charging case and hold the button for 5 seconds to force pairing mode.',
      });

      return false;
    }
  }

  /**
   * Cancel in-flight reconnect or discovery
   */
  public cancelOperation() {
    this.isCancelled = true;
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
    this.attemptCount = 0;
    this.activeTargetId = null;
    this.activeTargetName = null;
    this.updateState('idle', {
      lastError: 'Operation cancelled by user.',
      troubleshootingTip: null,
    });
  }

  /**
   * Real disconnect from GATT server
   */
  public async disconnect(deviceId: string) {
    const rawDevice = this.deviceMap.get(deviceId);
    if (rawDevice && rawDevice.gatt?.connected) {
      rawDevice.gatt.disconnect();
    }
    this.handleDeviceDisconnected(deviceId);
  }

  private async handleDeviceDisconnected(deviceId: string) {
    const rawDevice = this.deviceMap.get(deviceId);
    const name = rawDevice?.name || 'Bluetooth Device';

    const idx = this.discoveredDevices.findIndex((d) => d.id === deviceId);
    if (idx >= 0) {
      this.discoveredDevices[idx] = {
        ...this.discoveredDevices[idx],
        connected: false,
      };
      this.notifyDevices();
    }

    await storageService.addLogEntry({
      type: 'disconnect',
      deviceName: name,
      message: `Device disconnected: ${name}`,
    });

    if (this.activeTargetId === deviceId && this.state === 'connected') {
      this.updateState('disconnected', {
        lastError: `${name} was disconnected.`,
        troubleshootingTip: 'Earbuds may have entered sleep mode, lost battery, or been pulled by another multipoint host.',
      });
    }
  }

  /**
   * Register a device from preferred list to allow user to trigger discovery
   */
  public registerKnownDevice(device: any) {
    if (device?.id) {
      this.deviceMap.set(device.id, device);
    }
  }
}

export const connectionEngine = new BluetoothConnectionEngine();
