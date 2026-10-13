import {
  PreferredDeviceRecord,
  PreferredSpeakerRecord,
  EventOccasion,
  ExclusiveLockLevel,
} from '../../types/bluetooth';

const DB_NAME = 'LibraryBluetoothManagerDB';
const DB_VERSION = 2;

export interface AppSettings {
  theme: 'dark' | 'light' | 'midnight';
  volumeGuardLimit: number; // percentage (e.g. 30% for quiet library safe test tone)
  enableReconnectReminders: boolean;
  libraryQuietMode: boolean; // extra warning before playing sound tests
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  volumeGuardLimit: 25,
  enableReconnectReminders: true,
  libraryQuietMode: true,
};

export interface ConnectionLogEntry {
  id: string;
  timestamp: number;
  type: 'discovery' | 'connect' | 'disconnect' | 'reconnect_attempt' | 'error' | 'audio_test';
  deviceName?: string;
  message: string;
  details?: string;
}

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('preferred_devices')) {
          db.createObjectStore('preferred_devices', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('preferred_speakers')) {
          db.createObjectStore('preferred_speakers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('connection_logs')) {
          const logStore = db.createObjectStore('connection_logs', { keyPath: 'id' });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Preferred Devices ---
  async getPreferredDevices(): Promise<PreferredDeviceRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('preferred_devices', 'readonly');
        const store = transaction.objectStore('preferred_devices');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem('lib_bt_preferred_devices');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
  }

  async savePreferredDevice(device: PreferredDeviceRecord): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('preferred_devices', 'readwrite');
        const store = transaction.objectStore('preferred_devices');
        const request = store.put(device);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback
      const current = await this.getPreferredDevices();
      const filtered = current.filter((d) => d.id !== device.id);
      filtered.push(device);
      localStorage.setItem('lib_bt_preferred_devices', JSON.stringify(filtered));
    }
  }

  async deletePreferredDevice(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('preferred_devices', 'readwrite');
        const store = transaction.objectStore('preferred_devices');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const current = await this.getPreferredDevices();
      const filtered = current.filter((d) => d.id !== id);
      localStorage.setItem('lib_bt_preferred_devices', JSON.stringify(filtered));
    }
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction('settings', 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('app_settings');
        request.onsuccess = () => {
          if (request.result && request.result.value) {
            resolve({ ...DEFAULT_SETTINGS, ...request.result.value });
          } else {
            resolve(DEFAULT_SETTINGS);
          }
        };
        request.onerror = () => resolve(DEFAULT_SETTINGS);
      });
    } catch {
      try {
        const raw = localStorage.getItem('lib_bt_settings');
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('settings', 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ key: 'app_settings', value: updated });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      localStorage.setItem('lib_bt_settings', JSON.stringify(updated));
    }
    return updated;
  }

  // --- Logs ---
  async addLogEntry(entry: Omit<ConnectionLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const fullEntry: ConnectionLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    try {
      const db = await this.getDB();
      const transaction = db.transaction('connection_logs', 'readwrite');
      const store = transaction.objectStore('connection_logs');
      store.add(fullEntry);
    } catch {
      // LocalStorage capped log buffer
      try {
        const raw = localStorage.getItem('lib_bt_logs');
        const list: ConnectionLogEntry[] = raw ? JSON.parse(raw) : [];
        list.unshift(fullEntry);
        if (list.length > 50) list.pop();
        localStorage.setItem('lib_bt_logs', JSON.stringify(list));
      } catch {
        // Ignore fallback write errors
      }
    }
  }

  async getRecentLogs(limit = 20): Promise<ConnectionLogEntry[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction('connection_logs', 'readonly');
        const store = transaction.objectStore('connection_logs');
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        const results: ConnectionLogEntry[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
          if (cursor && results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      try {
        const raw = localStorage.getItem('lib_bt_logs');
        return raw ? JSON.parse(raw).slice(0, limit) : [];
      } catch {
        return [];
      }
    }
  }

  // --- DJ Owner Mode: Preferred Speakers ---
  async getPreferredSpeakers(): Promise<PreferredSpeakerRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('preferred_speakers', 'readonly');
        const store = transaction.objectStore('preferred_speakers');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      try {
        const raw = localStorage.getItem('lib_bt_preferred_speakers');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
  }

  async savePreferredSpeaker(speaker: PreferredSpeakerRecord): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('preferred_speakers', 'readwrite');
        const store = transaction.objectStore('preferred_speakers');
        const request = store.put(speaker);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const current = await this.getPreferredSpeakers();
      const filtered = current.filter((s) => s.id !== speaker.id);
      filtered.push(speaker);
      localStorage.setItem('lib_bt_preferred_speakers', JSON.stringify(filtered));
    }
  }

  async deletePreferredSpeaker(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('preferred_speakers', 'readwrite');
        const store = transaction.objectStore('preferred_speakers');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const current = await this.getPreferredSpeakers();
      const filtered = current.filter((s) => s.id !== id);
      localStorage.setItem('lib_bt_preferred_speakers', JSON.stringify(filtered));
    }
  }

  async getDJOwnerSettings(): Promise<DJOwnerSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction('settings', 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('dj_owner_settings');
        request.onsuccess = () => {
          if (request.result && request.result.value) {
            resolve({ ...DEFAULT_DJ_SETTINGS, ...request.result.value });
          } else {
            resolve(DEFAULT_DJ_SETTINGS);
          }
        };
        request.onerror = () => resolve(DEFAULT_DJ_SETTINGS);
      });
    } catch {
      try {
        const raw = localStorage.getItem('lib_bt_dj_settings');
        return raw ? { ...DEFAULT_DJ_SETTINGS, ...JSON.parse(raw) } : DEFAULT_DJ_SETTINGS;
      } catch {
        return DEFAULT_DJ_SETTINGS;
      }
    }
  }

  async saveDJOwnerSettings(settings: Partial<DJOwnerSettings>): Promise<DJOwnerSettings> {
    const current = await this.getDJOwnerSettings();
    const updated = { ...current, ...settings };
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('settings', 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ key: 'dj_owner_settings', value: updated });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      localStorage.setItem('lib_bt_dj_settings', JSON.stringify(updated));
    }
    return updated;
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.getDB();
      const storeNames = ['preferred_devices', 'preferred_speakers', 'settings', 'connection_logs'].filter(
        name => db.objectStoreNames.contains(name)
      );
      const transaction = db.transaction(storeNames, 'readwrite');
      storeNames.forEach(name => transaction.objectStore(name).clear());
    } catch {
      localStorage.removeItem('lib_bt_preferred_devices');
      localStorage.removeItem('lib_bt_preferred_speakers');
      localStorage.removeItem('lib_bt_settings');
      localStorage.removeItem('lib_bt_dj_settings');
      localStorage.removeItem('lib_bt_logs');
    }
  }
}

export interface DJOwnerSettings {
  occasion: EventOccasion;
  activeSpeakerId: string | null;
  lockLevel: ExclusiveLockLevel;
  hardwareLockConfirmed: boolean;
  alertOnDisconnect: boolean;
}

export const DEFAULT_DJ_SETTINGS: DJOwnerSettings = {
  occasion: 'party',
  activeSpeakerId: null,
  lockLevel: 'unlocked',
  hardwareLockConfirmed: false,
  alertOnDisconnect: true,
};

export const storageService = new StorageService();
