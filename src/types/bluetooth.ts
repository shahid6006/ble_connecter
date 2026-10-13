export type ConnectionState =
  | 'idle'
  | 'discovering'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'unsupported'
  | 'permission-denied'
  | 'error';

export type BluetoothAvailability = 'available' | 'unavailable' | 'unknown' | 'unsupported';

export interface BluetoothCapabilities {
  webBluetoothSupported: boolean;
  scanningSupported: boolean;
  gattSupported: boolean;
  secureContext: boolean;
  isStandalonePWA: boolean;
  browserName: string;
  osName: string;
  availability: BluetoothAvailability;
  restrictions: string[];
  reasons: string[];
}

export type DeviceCategory = 'earbuds' | 'headphones' | 'speaker' | 'ble_peripheral' | 'unknown';

export interface DiscoveredGattDevice {
  id: string;
  name: string;
  connected: boolean;
  category: DeviceCategory;
  batteryLevel?: number | null;
  manufacturer?: string | null;
  modelNumber?: string | null;
  discoveredAt: number;
  lastConnectedAt?: number | null;
  servicesFound: string[];
  rssi?: number | null; // null if browser does not expose RSSI in GATT
  rawDevice?: any; // Native BluetoothDevice reference
}

export interface PreferredDeviceRecord {
  id: string;
  name: string;
  nickname: string;
  brand: 'apple' | 'sony' | 'samsung' | 'bose' | 'jabra' | 'soundcore' | 'beats' | 'other';
  deviceCategory: DeviceCategory;
  multipointEnabled: boolean;
  dormDeviceNote?: string; // e.g. "Also paired to Laptop on desk"
  createdAt: number;
  lastConnectedAt: number | null;
  reconnectReminder: boolean;
}

export interface ConnectionOperationStatus {
  state: ConnectionState;
  activeTargetId: string | null;
  activeTargetName: string | null;
  attemptCount: number;
  maxAttempts: number;
  retryDelayMs: number;
  lastError: string | null;
  lastStatusChange: number;
  troubleshootingTip: string | null;
}

export interface AudioOutputDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
  isBluetoothProbable: boolean;
}

export interface ProtocolDistinction {
  title: string;
  level: 'Web API' | 'OS Stack' | 'Hardware/RF';
  supportedInBrowser: boolean;
  summary: string;
  howToManage: string;
}

// ==========================================
// DJ OWNER MODE TYPES
// ==========================================

export type EventOccasion = 'wedding' | 'party' | 'presentation' | 'silent_disco';

export type ExclusiveLockLevel =
  | 'unlocked'
  | 'monitoring'
  | 'firmware_locked'
  | 'os_priority';

export interface InterruptionAlert {
  id: string;
  timestamp: number;
  type: 'disconnect' | 'stolen_audio_focus' | 'multipoint_hijack_detected' | 'rf_congestion';
  severity: 'high' | 'medium' | 'low';
  message: string;
  recommendedAction: string;
}

export interface PreferredSpeakerRecord {
  id: string;
  name: string;
  nickname: string;
  brand: 'jbl' | 'sony' | 'bose' | 'ultimate_ears' | 'marshall' | 'soundcore' | 'other';
  isPartySpeaker: boolean;
  supportsHardwareLock: boolean;
  hasAuracast: boolean;
  multipointDisableSupported: boolean;
  pairingLockInstructions: string;
  lastVerifiedAt: number | null;
  createdAt: number;
}

export interface EventProfileConfig {
  occasion: EventOccasion;
  title: string;
  badge: string;
  description: string;
  threatLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  multipointPolicy: 'Strictly Disable' | 'Host Only' | 'Host + Backup Only' | 'Managed' | 'Open Broadcast';
  guestPolicy: string;
  recommendedAction: string;
}

