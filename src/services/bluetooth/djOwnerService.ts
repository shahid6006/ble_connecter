import {
  EventOccasion,
  EventProfileConfig,
  ExclusiveLockLevel,
  InterruptionAlert,
  PreferredSpeakerRecord,
  DiscoveredGattDevice,
} from '../../types/bluetooth';
import { storageService, DJOwnerSettings } from '../storage/indexedDbService';
import { connectionEngine } from './connectionEngine';
import { audioVerifier } from './audioVerifier';

export const EVENT_PROFILES: Record<EventOccasion, EventProfileConfig> = {
  wedding: {
    occasion: 'wedding',
    title: 'Wedding / Formal Gala',
    badge: 'Zero-Tolerance Lock',
    description: 'High-stakes event. Accidental phone connection during vows, toasts, or first dance is catastrophic.',
    threatLevel: 'Critical',
    multipointPolicy: 'Strictly Disable',
    guestPolicy: 'Strictly prohibited. All guest phone Bluetooth handshakes blocked.',
    recommendedAction: 'Engage hardware pairing lock button on speaker; clear all remembered secondary pairings.',
  },
  party: {
    occasion: 'party',
    title: 'Party & Social Gathering',
    badge: 'Host Priority Active',
    description: 'Guests in the room will see the speaker in Bluetooth discovery and try to connect their own playlists.',
    threatLevel: 'High',
    multipointPolicy: 'Host + Backup Only',
    guestPolicy: 'Queue via host Spotify Group Session or Wi-Fi; never hand over Bluetooth connection.',
    recommendedAction: 'Keep host phone within 5 meters of speaker; disable multipoint switching in companion app.',
  },
  presentation: {
    occasion: 'presentation',
    title: 'Presentation & Academic Hall',
    badge: 'Speech Priority',
    description: 'Library lecture or auditorium address. Nearby student laptops and phones may poll the audio receiver.',
    threatLevel: 'Moderate',
    multipointPolicy: 'Host Only',
    guestPolicy: 'Locked to podium presenter device.',
    recommendedAction: 'Lock A2DP audio routing in OS settings; set companion app to single-host mode.',
  },
  silent_disco: {
    occasion: 'silent_disco',
    title: 'Silent Disco & Multi-Speaker Broadcast',
    badge: 'Auracast Broadcast',
    description: 'One host transmits to dozens of partygoers via Bluetooth LE Audio Auracast broadcast channels.',
    threatLevel: 'Low',
    multipointPolicy: 'Open Broadcast',
    guestPolicy: 'Listen-only broadcast reception without host transmission interruption.',
    recommendedAction: 'Initialize Auracast public broadcast stream from transmitter.',
  },
};

export interface SpeakerBrandGuide {
  brand: PreferredSpeakerRecord['brand'];
  displayName: string;
  popularModels: string;
  hardwareLockMethod: string;
  multipointDisableMethod: string;
  auracastSupported: boolean;
}

export const SPEAKER_BRAND_GUIDES: SpeakerBrandGuide[] = [
  {
    brand: 'jbl',
    displayName: 'JBL PartyBox & Portable',
    popularModels: 'PartyBox 110/310/710/Stage 320, Boombox 3, Charge 5',
    hardwareLockMethod: 'Press Bluetooth button once to stop search. Tap the PartyBoost/Auracast button so guests can connect additional speakers without taking over music playback.',
    multipointDisableMethod: 'In the JBL One / JBL Portable app, go to Settings -> Disable "Bluetooth Standby" and turn off "Party Multi-Host".',
    auracastSupported: true,
  },
  {
    brand: 'sony',
    displayName: 'Sony High-Power Audio',
    popularModels: 'SRS-XV800, SRS-XV900, ULT Tower 10, SRS-XG500',
    hardwareLockMethod: 'Press the "FUNCTION / BLUETOOTH" button to exit discovery. Press and hold MIC/GUITAR echo to isolate line-in inputs.',
    multipointDisableMethod: 'In the Sony Music Center app, select Speaker Settings -> Bluetooth Connection -> Set to "Priority on Stable Connection" and disable "Multi-Device Connection".',
    auracastSupported: false,
  },
  {
    brand: 'bose',
    displayName: 'Bose Professional & SoundLink',
    popularModels: 'S1 Pro+, SoundLink Max, SoundLink Revolve+ II',
    hardwareLockMethod: 'On S1 Pro+, use the OLED channel encoder to lock Channel 3 (Bluetooth) from auto-discovery. On portable models, press the Bluetooth button until "Ready to connect another device" stops.',
    multipointDisableMethod: 'Open the Bose App -> Source Device Management -> Clear non-DJ phones from the 8 device memory slots.',
    auracastSupported: false,
  },
  {
    brand: 'ultimate_ears',
    displayName: 'Ultimate Ears (UE)',
    popularModels: 'HYPERBOOM, MEGABOOM 3, EPICBOOM',
    hardwareLockMethod: 'HYPERBOOM features 4 source buttons (Bluetooth 1, Bluetooth 2, Aux, Optical). Press the Bluetooth 1 button to lock channel to your phone.',
    multipointDisableMethod: 'In the BOOM app, disable "PartyUp Guest Sharing" to lock playlist authority to the primary host.',
    auracastSupported: false,
  },
  {
    brand: 'marshall',
    displayName: 'Marshall Loudspeakers',
    popularModels: 'Woburn III, Stanmore III, Middleton',
    hardwareLockMethod: 'Toggle source lever to physical AUX or RCA when stepping away, or leave on Bluetooth with pairing button untouched.',
    multipointDisableMethod: 'Marshall Bluetooth app: Set to Single Source connection.',
    auracastSupported: true,
  },
  {
    brand: 'soundcore',
    displayName: 'Anker Soundcore Party',
    popularModels: 'Rave Neo 2, Motion Boom Plus, PartyCast 100',
    hardwareLockMethod: 'Activate PartyCast / TWS mode to daisy-chain secondary units while preserving single-host audio authority.',
    multipointDisableMethod: 'In Soundcore app: Settings -> Dual Device Connection -> Toggle OFF.',
    auracastSupported: false,
  },
  {
    brand: 'other',
    displayName: 'Generic Bluetooth PA / Party Speaker',
    popularModels: 'Ion Audio, Rockville, Pyle, Samson Expedition',
    hardwareLockMethod: 'Switch master hardware knob away from pairing mode. Keep speaker within 15 feet of DJ phone.',
    multipointDisableMethod: 'Perform a long-press reset on speaker to clear remembered guest devices before event begins.',
    auracastSupported: false,
  },
];

type DJListener = () => void;

class DJOwnerService {
  private alerts: InterruptionAlert[] = [];
  private listeners: Set<DJListener> = new Set();
  private settings: DJOwnerSettings = {
    occasion: 'party',
    activeSpeakerId: null,
    lockLevel: 'unlocked',
    hardwareLockConfirmed: false,
    alertOnDisconnect: true,
  };

  constructor() {
    this.init();
  }

  private async init() {
    this.settings = await storageService.getDJOwnerSettings();
    this.setupConnectionWatcher();
  }

  private setupConnectionWatcher() {
    // Watch connection engine state changes
    connectionEngine.subscribeState((status) => {
      if (status.state === 'disconnected' && this.settings.alertOnDisconnect) {
        this.addAlert({
          type: 'disconnect',
          severity: 'high',
          message: `Host connection to speaker dropped: ${status.activeTargetName || 'DJ Speaker'}`,
          recommendedAction: 'Check speaker power, move phone within 5 meters, and re-trigger Host Reconnect.',
        });
      }
    });
  }

  public subscribe(listener: DJListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getSettings(): DJOwnerSettings {
    return { ...this.settings };
  }

  public async updateSettings(partial: Partial<DJOwnerSettings>): Promise<DJOwnerSettings> {
    const updated = await storageService.saveDJOwnerSettings(partial);
    this.settings = updated;
    this.notify();
    return updated;
  }

  public getAlerts(): InterruptionAlert[] {
    return [...this.alerts];
  }

  public addAlert(alert: Omit<InterruptionAlert, 'id' | 'timestamp'>) {
    const newAlert: InterruptionAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    this.alerts.unshift(newAlert);
    if (this.alerts.length > 20) this.alerts.pop();

    storageService.addLogEntry({
      type: 'error',
      message: `[DJ OWNER ALERT] ${alert.message}`,
      details: `Severity: ${alert.severity.toUpperCase()} | Action: ${alert.recommendedAction}`,
    });

    this.notify();
  }

  public dismissAlert(id: string) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.notify();
  }

  public clearAllAlerts() {
    this.alerts = [];
    this.notify();
  }

  /**
   * Evaluates verified Exclusive Connection Status
   */
  public evaluateLockStatus(
    connectedGattDevice: DiscoveredGattDevice | null,
    speaker: PreferredSpeakerRecord | null
  ): {
    level: ExclusiveLockLevel;
    label: string;
    description: string;
    color: 'emerald' | 'amber' | 'cyan' | 'rose';
    integrityNote: string;
  } {
    const isGattConnected = Boolean(connectedGattDevice?.connected);
    const hasHardwareLock = this.settings.hardwareLockConfirmed;

    if (!speaker && !connectedGattDevice) {
      return {
        level: 'unlocked',
        label: 'No DJ Speaker Configured',
        description: 'Pair or designate a party speaker to monitor playback authority.',
        color: 'rose',
        integrityNote: 'Select your party speaker to evaluate connection boundaries.',
      };
    }

    if (hasHardwareLock && isGattConnected) {
      return {
        level: 'firmware_locked',
        label: 'High Protection: Hardware Locked + GATT Telemetry',
        description: 'Speaker hardware lock confirmed by host & active GATT telemetry link verified.',
        color: 'emerald',
        integrityNote: 'GATT status is hardware-verified. Guest devices cannot pair while hardware lock is engaged.',
      };
    }

    if (isGattConnected) {
      return {
        level: 'monitoring',
        label: 'Monitored Link (Multipoint Risk)',
        description: 'Host GATT link active, but physical hardware lock has not been confirmed on the speaker.',
        color: 'amber',
        integrityNote: 'If multipoint is enabled on the speaker, nearby guest phones can still interrupt playback.',
      };
    }

    if (hasHardwareLock) {
      return {
        level: 'os_priority',
        label: 'Hardware Locked (A2DP OS Audio Routing)',
        description: 'Physical pairing lock engaged on speaker; audio is streamed via host OS.',
        color: 'cyan',
        integrityNote: 'New guest pairings blocked by speaker hardware. Authorize Web Bluetooth for live battery/GATT telemetry.',
      };
    }

    return {
      level: 'unlocked',
      label: 'Open / Interruption Risk High',
      description: 'Speaker is not locked. Anyone within 30 feet can connect and interrupt music.',
      color: 'rose',
      integrityNote: 'Engage pairing lock on speaker hardware or disable multipoint in companion app.',
    };
  }

  /**
   * Sound check chime for DJ Speaker
   */
  public async playDJSoundCheck(volumePercent = 35): Promise<void> {
    await audioVerifier.playTestTone('both', volumePercent);
  }

  /**
   * Connect to speaker via Web Bluetooth GATT
   */
  public async connectSpeakerGatt(speakerId: string): Promise<boolean> {
    return connectionEngine.connectGatt(speakerId);
  }

  /**
   * Disconnect speaker GATT
   */
  public async disconnectSpeaker(speakerId: string): Promise<void> {
    await connectionEngine.disconnect(speakerId);
  }
}

export const djOwnerService = new DJOwnerService();
