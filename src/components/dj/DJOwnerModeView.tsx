import React, { useState, useEffect } from 'react';
import {
  Crown,
  Speaker,
  Bluetooth,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  PreferredSpeakerRecord,
  DiscoveredGattDevice,
  ConnectionOperationStatus,
  BluetoothCapabilities,
  EventOccasion,
} from '../../types/bluetooth';
import { djOwnerService } from '../../services/bluetooth/djOwnerService';
import { storageService, DJOwnerSettings } from '../../services/storage/indexedDbService';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

import { EventModeSelector } from './EventModeSelector';
import { ExclusiveStatusCard } from './ExclusiveStatusCard';
import { InterruptionAlertBanner } from './InterruptionAlertBanner';
import { SpeakerSecurityPanel } from './SpeakerSecurityPanel';
import { EditSpeakerModal } from './EditSpeakerModal';
import { ManufacturerSdkModal } from './ManufacturerSdkModal';
import { Card } from '../common/Card';

interface DJOwnerModeViewProps {
  status: ConnectionOperationStatus;
  capabilities: BluetoothCapabilities | null;
  discoveredDevices: DiscoveredGattDevice[];
  onDiscover: () => void;
  onConnectGatt: (id: string) => void;
  onDisconnectGatt: (id: string) => void;
}

export const DJOwnerModeView: React.FC<DJOwnerModeViewProps> = ({
  status,
  capabilities,
  discoveredDevices,
  onDiscover,
  onConnectGatt,
  onDisconnectGatt,
}) => {
  const [speakers, setSpeakers] = useState<PreferredSpeakerRecord[]>([]);
  const [djSettings, setDjSettings] = useState<DJOwnerSettings>(djOwnerService.getSettings());
  const [alerts, setAlerts] = useState(djOwnerService.getAlerts());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<PreferredSpeakerRecord | null>(null);
  const [sdkModalOpen, setSdkModalOpen] = useState(false);
  const [isPlayingCheck, setIsPlayingCheck] = useState(false);

  const loadData = async () => {
    const list = await storageService.getPreferredSpeakers();
    setSpeakers(list);
    const settings = await storageService.getDJOwnerSettings();
    setDjSettings(settings);
    setAlerts(djOwnerService.getAlerts());
  };

  useEffect(() => {
    loadData();
    const unsub = djOwnerService.subscribe(() => {
      setDjSettings(djOwnerService.getSettings());
      setAlerts(djOwnerService.getAlerts());
    });
    return unsub;
  }, []);

  const activeSpeaker =
    speakers.find((s) => s.id === djSettings.activeSpeakerId) ||
    speakers[0] ||
    null;

  const connectedGattDevice =
    discoveredDevices.find((d) => d.connected) ||
    (activeSpeaker ? discoveredDevices.find((d) => d.id === activeSpeaker.id) : null) ||
    null;

  const handleSelectOccasion = async (occasion: EventOccasion) => {
    const updated = await djOwnerService.updateSettings({ occasion });
    setDjSettings(updated);
  };

  const handleToggleHardwareLock = async (confirmed: boolean) => {
    const updated = await djOwnerService.updateSettings({
      hardwareLockConfirmed: confirmed,
      lockLevel: confirmed ? 'firmware_locked' : 'unlocked',
    });
    setDjSettings(updated);
  };

  const handleSaveSpeaker = async (speaker: PreferredSpeakerRecord) => {
    await storageService.savePreferredSpeaker(speaker);
    await djOwnerService.updateSettings({ activeSpeakerId: speaker.id });
    await loadData();
  };

  const handleDeleteSpeaker = async (id: string) => {
    await storageService.deletePreferredSpeaker(id);
    if (djSettings.activeSpeakerId === id) {
      await djOwnerService.updateSettings({ activeSpeakerId: null });
    }
    await loadData();
  };

  const handleConnectSpeaker = async () => {
    if (!activeSpeaker) {
      onDiscover();
      return;
    }
    const known = discoveredDevices.find((d) => d.id === activeSpeaker.id);
    if (known) {
      onConnectGatt(known.id);
    } else {
      onDiscover();
    }
  };

  const handleDJSoundCheck = async () => {
    setIsPlayingCheck(true);
    try {
      await djOwnerService.playDJSoundCheck(35);
    } finally {
      setIsPlayingCheck(false);
    }
  };

  const handleTriggerDiagnostic = () => {
    djOwnerService.addAlert({
      type: 'multipoint_hijack_detected',
      severity: 'medium',
      message: 'Diagnostic Probe: Secondary Bluetooth device polling audio channel.',
      recommendedAction: 'Verify speaker physical pairing lock & confirm host Spotify playback priority.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm">
                <Crown className="w-4 h-4 text-amber-400" />
                DJ Owner Mode • Exclusive Host Control
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-800/80">
                Auditory Safeguard Active
              </span>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {activeSpeaker ? activeSpeaker.nickname : 'No Party Speaker Selected'}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                {activeSpeaker
                  ? `Hardware: ${activeSpeaker.name} (${activeSpeaker.brand.toUpperCase()}) • Prioritize host audio & prevent unwanted guest takeovers.`
                  : 'Designate your stage speaker, lock Bluetooth discovery, and prevent partygoers from interrupting audio.'}
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 font-semibold">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    connectedGattDevice?.connected
                      ? 'bg-emerald-400 animate-pulse'
                      : status.state === 'connecting'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-slate-500'
                  }`}
                />
                <span>
                  {connectedGattDevice?.connected
                    ? 'GATT Telemetry Verified'
                    : status.state === 'connecting'
                    ? 'Connecting...'
                    : 'Awaiting Host Authorization'}
                </span>
              </span>

              {activeSpeaker?.supportsHardwareLock && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Hardware Lock Supported
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleConnectSpeaker}
              disabled={status.state === 'discovering'}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/50 transition cursor-pointer disabled:opacity-50"
            >
              <Bluetooth className="w-4 h-4" />
              <span>
                {connectedGattDevice?.connected
                  ? 'Re-Authorize Speaker'
                  : 'Connect / Authorize Speaker'}
              </span>
            </button>

            <button
              onClick={handleDJSoundCheck}
              disabled={isPlayingCheck}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Volume2 className={`w-4 h-4 text-cyan-400 ${isPlayingCheck ? 'animate-bounce' : ''}`} />
              <span>{isPlayingCheck ? 'Playing Sound Check...' : 'DJ Speaker Sound Check'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interruption Alerts Banner */}
      <InterruptionAlertBanner
        alerts={alerts}
        onDismiss={(id) => djOwnerService.dismissAlert(id)}
        onClearAll={() => djOwnerService.clearAllAlerts()}
        onTriggerDiagnostic={handleTriggerDiagnostic}
      />

      {/* Exclusive Connection Status Indicator */}
      <ExclusiveStatusCard
        speaker={activeSpeaker}
        connectedGattDevice={connectedGattDevice}
        hardwareLockConfirmed={djSettings.hardwareLockConfirmed}
        onToggleHardwareLock={handleToggleHardwareLock}
        onOpenTroubleshoot={() => {}}
      />

      {/* Event Occasion Profile Selector */}
      <EventModeSelector
        currentOccasion={djSettings.occasion}
        onSelectOccasion={handleSelectOccasion}
      />

      {/* Preferred Speaker Manager */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Speaker className="w-5 h-5 text-cyan-400" />
              <span>Preferred DJ Speakers ({speakers.length})</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Save your party speakers, soundboxes, and PA hardware for fast venue switching.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSpeaker(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Speaker Profile</span>
          </button>
        </div>

        {speakers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center space-y-2">
            <p className="text-xs text-slate-400">
              No party speakers saved yet. Add your JBL PartyBox, Sony ULT, Bose S1 Pro, or stage PA.
            </p>
            <button
              onClick={() => {
                setEditingSpeaker(null);
                setModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer"
            >
              Add First Speaker
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {speakers.map((spk) => {
              const isSelected = activeSpeaker?.id === spk.id;
              return (
                <div
                  key={spk.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 inline-block mb-1">
                          {spk.brand.toUpperCase()}
                        </span>
                        <h5 className="font-bold text-sm text-white">{spk.nickname}</h5>
                        <p className="text-xs text-slate-400">{spk.name}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSpeaker(spk);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-white"
                          title="Edit speaker profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSpeaker(spk.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400"
                          title="Delete profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {spk.pairingLockInstructions && (
                      <p className="text-[11px] text-slate-300 mt-2 bg-slate-950 p-2 rounded-lg border border-slate-900 font-mono">
                        Lock Note: {spk.pairingLockInstructions}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {spk.hasAuracast ? 'Auracast Broadcast' : 'Classic / BLE'}
                    </span>

                    {!isSelected ? (
                      <button
                        onClick={() =>
                          djOwnerService.updateSettings({ activeSpeakerId: spk.id })
                        }
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                      >
                        Set as Active Speaker
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Active Target
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Speaker Security Panel */}
      <SpeakerSecurityPanel onOpenSdkModal={() => setSdkModalOpen(true)} />

      {/* Modals */}
      <EditSpeakerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSpeaker}
        initialSpeaker={editingSpeaker}
      />

      <ManufacturerSdkModal
        isOpen={sdkModalOpen}
        onClose={() => setSdkModalOpen(false)}
      />
    </div>
  );
};
