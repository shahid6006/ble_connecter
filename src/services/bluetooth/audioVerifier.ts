import { AudioOutputDeviceInfo } from '../../types/bluetooth';
import { storageService } from '../storage/indexedDbService';

export class AudioRoutingVerifier {
  private audioCtx: AudioContext | null = null;
  private isTesting = false;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Enumerate connected audio output devices if supported
   */
  public async getAudioOutputDevices(): Promise<AudioOutputDeviceInfo[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');

      return audioOutputs.map((d) => {
        const label = d.label || 'Default Audio Output';
        const lower = label.toLowerCase();
        const isBluetoothProbable =
          lower.includes('bluetooth') ||
          lower.includes('wireless') ||
          lower.includes('buds') ||
          lower.includes('airpods') ||
          lower.includes('headphone') ||
          lower.includes('headset') ||
          lower.includes('hands-free');

        return {
          deviceId: d.deviceId,
          label,
          kind: d.kind,
          groupId: d.groupId,
          isBluetoothProbable,
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Plays a gentle, volume-guarded stereo test chime.
   * Tests Left channel, Right channel, and Center.
   * channel: 'left' | 'right' | 'both'
   */
  public async playTestTone(
    channel: 'left' | 'right' | 'both' = 'both',
    volumePercent = 20
  ): Promise<void> {
    if (this.isTesting) return;
    this.isTesting = true;

    try {
      const ctx = this.getAudioContext();
      const gainValue = Math.max(0.02, Math.min(volumePercent / 100, 0.4)); // Cap max volume at 40% for library safety

      // Setup Media Session API for mobile lock-screen & notification display
      this.setupMediaSession(channel);

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      // Select frequency based on test
      const freq = channel === 'left' ? 440 : channel === 'right' ? 660 : 523.25; // C5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Volume envelope (smooth fade-in and fade-out to prevent loud pop in quiet room)
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      if (panner) {
        const panValue = channel === 'left' ? -1.0 : channel === 'right' ? 1.0 : 0.0;
        panner.pan.setValueAtTime(panValue, ctx.currentTime);
        osc.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
      }

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.75);

      await storageService.addLogEntry({
        type: 'audio_test',
        message: `Played ${channel.toUpperCase()} earbud audio routing test chime`,
        details: `Volume: ${Math.round(gainValue * 100)}% (Library Safe)`,
      });

      await new Promise((res) => setTimeout(res, 800));
    } finally {
      this.isTesting = false;
      this.clearMediaSession();
    }
  }

  private setupMediaSession(channel: string) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Earbud Sound Check (${channel.toUpperCase()})`,
          artist: 'Library Bluetooth Manager',
          album: 'Audio Routing Verification',
          artwork: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch {
        // Media session metadata optional
      }
    }
  }

  private clearMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch {}
    }
  }

  /**
   * Deep links or opens system Bluetooth settings.
   * On Android, triggers the Android Bluetooth Settings intent.
   */
  public openSystemBluetoothSettings(): { supported: boolean; method: string } {
    if (typeof window === 'undefined') return { supported: false, method: 'none' };

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);

    if (isAndroid) {
      // Android Intent URI for Bluetooth Settings
      try {
        window.location.href = 'intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end';
        return { supported: true, method: 'Android Intent URI' };
      } catch {
        return { supported: false, method: 'Android Intent Failed' };
      }
    }

    // Windows or macOS or iOS cannot be opened via direct intent from standard web sandboxes
    return {
      supported: false,
      method: isAndroid ? 'Android Intent' : 'System instructions provided',
    };
  }
}

export const audioVerifier = new AudioRoutingVerifier();
