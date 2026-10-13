import { describe, it, expect, beforeEach, vi } from 'vitest';
import { djOwnerService, EVENT_PROFILES } from '../services/bluetooth/djOwnerService';
import { storageService } from '../services/storage/indexedDbService';
import { PreferredSpeakerRecord, DiscoveredGattDevice } from '../types/bluetooth';

describe('DJOwnerService', () => {
  beforeEach(async () => {
    localStorage.clear();
    djOwnerService.clearAllAlerts();
    await djOwnerService.updateSettings({
      occasion: 'party',
      activeSpeakerId: null,
      lockLevel: 'unlocked',
      hardwareLockConfirmed: false,
      alertOnDisconnect: true,
    });
  });

  describe('Event Profiles & Supported Operations', () => {
    it('provides all 4 occasion profiles with threat levels', () => {
      expect(EVENT_PROFILES.wedding.threatLevel).toBe('Critical');
      expect(EVENT_PROFILES.party.threatLevel).toBe('High');
      expect(EVENT_PROFILES.presentation.threatLevel).toBe('Moderate');
      expect(EVENT_PROFILES.silent_disco.threatLevel).toBe('Low');
    });

    it('updates and persists event occasion', async () => {
      const updated = await djOwnerService.updateSettings({ occasion: 'wedding' });
      expect(updated.occasion).toBe('wedding');
      expect(djOwnerService.getSettings().occasion).toBe('wedding');
    });

    it('evaluates firmware_locked status when both hardware lock and GATT link are verified', async () => {
      await djOwnerService.updateSettings({ hardwareLockConfirmed: true });

      const mockSpeaker: PreferredSpeakerRecord = {
        id: 'jbl_310',
        name: 'JBL PartyBox 310',
        nickname: 'Main Stage',
        brand: 'jbl',
        isPartySpeaker: true,
        supportsHardwareLock: true,
        hasAuracast: false,
        multipointDisableSupported: true,
        pairingLockInstructions: 'Press Bluetooth button once to stop search',
        lastVerifiedAt: Date.now(),
        createdAt: Date.now(),
      };

      const mockConnectedGatt: DiscoveredGattDevice = {
        id: 'jbl_310',
        name: 'JBL PartyBox 310',
        connected: true,
        category: 'speaker',
        batteryLevel: 90,
        discoveredAt: Date.now(),
        servicesFound: ['battery_service'],
      };

      const result = djOwnerService.evaluateLockStatus(mockConnectedGatt, mockSpeaker);
      expect(result.level).toBe('firmware_locked');
      expect(result.color).toBe('emerald');
      expect(result.label).toContain('High Protection');
    });
  });

  describe('Honest Reporting & Unsupported Operation Boundaries', () => {
    it('reports unlocked when no speaker is configured', () => {
      const result = djOwnerService.evaluateLockStatus(null, null);
      expect(result.level).toBe('unlocked');
      expect(result.color).toBe('rose');
      expect(result.label).toBe('No DJ Speaker Configured');
    });

    it('reports multipoint risk when GATT is connected but physical lock is unconfirmed', async () => {
      await djOwnerService.updateSettings({ hardwareLockConfirmed: false });

      const mockConnectedGatt: DiscoveredGattDevice = {
        id: 'sony_xv800',
        name: 'Sony SRS-XV800',
        connected: true,
        category: 'speaker',
        discoveredAt: Date.now(),
        servicesFound: [],
      };

      const mockSpeaker: PreferredSpeakerRecord = {
        id: 'sony_xv800',
        name: 'Sony SRS-XV800',
        nickname: 'Dance Floor',
        brand: 'sony',
        isPartySpeaker: true,
        supportsHardwareLock: true,
        hasAuracast: false,
        multipointDisableSupported: true,
        pairingLockInstructions: '',
        lastVerifiedAt: null,
        createdAt: Date.now(),
      };

      const result = djOwnerService.evaluateLockStatus(mockConnectedGatt, mockSpeaker);
      expect(result.level).toBe('monitoring');
      expect(result.color).toBe('amber');
      expect(result.integrityNote).toContain('multipoint');
    });
  });

  describe('Interruption Alerts & Errors', () => {
    it('creates, retrieves, and dismisses interruption alerts', () => {
      djOwnerService.addAlert({
        type: 'multipoint_hijack_detected',
        severity: 'high',
        message: 'Secondary phone attempted pairing handshake',
        recommendedAction: 'Engage speaker hardware lock',
      });

      const alerts = djOwnerService.getAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('multipoint_hijack_detected');
      expect(alerts[0].severity).toBe('high');

      djOwnerService.dismissAlert(alerts[0].id);
      expect(djOwnerService.getAlerts().length).toBe(0);
    });

    it('clears all alerts at once', () => {
      djOwnerService.addAlert({
        type: 'disconnect',
        severity: 'high',
        message: 'Speaker connection dropped',
        recommendedAction: 'Check power',
      });
      djOwnerService.addAlert({
        type: 'rf_congestion',
        severity: 'medium',
        message: '2.4 GHz interference high',
        recommendedAction: 'Move phone closer',
      });

      expect(djOwnerService.getAlerts().length).toBe(2);
      djOwnerService.clearAllAlerts();
      expect(djOwnerService.getAlerts().length).toBe(0);
    });
  });

  describe('Speaker Storage Persistence', () => {
    it('saves and deletes preferred speakers in storage', async () => {
      const speaker: PreferredSpeakerRecord = {
        id: 'bose_s1',
        name: 'Bose S1 Pro+',
        nickname: 'Acoustic Stage',
        brand: 'bose',
        isPartySpeaker: true,
        supportsHardwareLock: true,
        hasAuracast: false,
        multipointDisableSupported: true,
        pairingLockInstructions: 'Lock via Channel 3 encoder',
        lastVerifiedAt: null,
        createdAt: Date.now(),
      };

      await storageService.savePreferredSpeaker(speaker);
      const list = await storageService.getPreferredSpeakers();
      expect(list.some((s) => s.id === 'bose_s1')).toBe(true);

      await storageService.deletePreferredSpeaker('bose_s1');
      const afterDelete = await storageService.getPreferredSpeakers();
      expect(afterDelete.some((s) => s.id === 'bose_s1')).toBe(false);
    });
  });
});
