import React from 'react';
import {
  Headphones,
  Bluetooth,
  RefreshCw,
  ExternalLink,
  Battery,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ConnectionOperationStatus,
  BluetoothCapabilities,
  PreferredDeviceRecord,
  DiscoveredGattDevice,
} from '../../types/bluetooth';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

interface StatusHeroProps {
  status: ConnectionOperationStatus;
  capabilities: BluetoothCapabilities | null;
  primaryDevice?: PreferredDeviceRecord | null;
  activeGattDevice?: DiscoveredGattDevice | null;
  onDiscover: () => void;
  onConnectPrimary: () => void;
  onCancel: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const StatusHero: React.FC<StatusHeroProps> = ({
  status,
  capabilities,
  primaryDevice,
  activeGattDevice,
  onDiscover,
  onConnectPrimary,
  onCancel,
  onNavigateToTab,
}) => {
  const isConnected = status.state === 'connected';
  const isConnecting = status.state === 'connecting';
  const isDiscovering = status.state === 'discovering';

  const handleOpenSettings = () => {
    const res = audioVerifier.openSystemBluetoothSettings();
    if (!res.supported) {
      onNavigateToTab('troubleshoot');
    }
  };

  const formatTimestamp = (ts: number | null | undefined) => {
    if (!ts) return 'Never recorded';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Device Info & State */}
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              <Bluetooth className="w-3.5 h-3.5 text-cyan-400" />
              {capabilities?.browserName || 'Web Bluetooth'} on {capabilities?.osName || 'System'}
            </span>

            {capabilities?.isStandalonePWA && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                <Sparkles className="w-3 h-3" /> Standalone PWA
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {primaryDevice ? (
                <>
                  <span>{primaryDevice.nickname || primaryDevice.name}</span>
                </>
              ) : (
                <span>No Preferred Earbuds Saved</span>
              )}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {primaryDevice
                ? primaryDevice.dormDeviceNote
                  ? `Note: ${primaryDevice.dormDeviceNote}`
                  : `Registered as ${primaryDevice.name} (${primaryDevice.brand.toUpperCase()})`
                : 'Connect your study earbuds and verify audio routing before playing audio in the library.'}
            </p>
          </div>

          {/* Connection State Details */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                    : isConnecting
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-slate-500'
                }`}
              />
              <span className="font-semibold text-white">
                {isConnected
                  ? 'GATT Connected'
                  : isConnecting
                  ? `Reconnecting (Attempt ${status.attemptCount}/${status.maxAttempts})`
                  : isDiscovering
                  ? 'Selecting Device...'
                  : 'Disconnected / Idle'}
              </span>
            </div>

            {activeGattDevice?.batteryLevel !== undefined &&
              activeGattDevice.batteryLevel !== null && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-emerald-400 font-mono">
                  <Battery className="w-3.5 h-3.5" />
                  <span>{activeGattDevice.batteryLevel}% Battery</span>
                </div>
              )}

            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Last connection:{' '}
                {formatTimestamp(
                  activeGattDevice?.lastConnectedAt || primaryDevice?.lastConnectedAt
                )}
              </span>
            </div>
          </div>

          {/* Status Message / Error Banner */}
          {status.lastError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{status.lastError}</p>
                {status.troubleshootingTip && (
                  <p className="mt-1 text-slate-300 text-[11px]">
                    Tip: {status.troubleshootingTip}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Prominent Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          {/* Main Action Button */}
          {isConnecting ? (
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg transition cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Reconnect</span>
            </button>
          ) : isConnected ? (
            <button
              onClick={() => onNavigateToTab('monitor')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-950/40 transition cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>Verify Audio Output</span>
            </button>
          ) : primaryDevice ? (
            <button
              onClick={onConnectPrimary}
              disabled={isDiscovering}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-cyan-950/50 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
              <span>Connect {primaryDevice.nickname || 'Device'}</span>
            </button>
          ) : (
            <button
              onClick={onDiscover}
              disabled={isDiscovering}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-cyan-950/50 transition cursor-pointer disabled:opacity-50"
            >
              <Bluetooth className="w-4 h-4" />
              <span>Discover & Pair Earbuds</span>
            </button>
          )}

          {/* Quick Deep Link to System Bluetooth Settings */}
          <button
            onClick={handleOpenSettings}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Open Android Bluetooth settings or view OS connection guide"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Bluetooth Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
