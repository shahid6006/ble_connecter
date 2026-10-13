import React from 'react';
import {
  Search,
  Bluetooth,
  AlertCircle,
  Shield,
  HelpCircle,
  ExternalLink,
  Info,
  Radio,
  CheckCircle,
} from 'lucide-react';
import {
  DiscoveredGattDevice,
  ConnectionOperationStatus,
  BluetoothCapabilities,
} from '../../types/bluetooth';
import { DeviceItem } from './DeviceItem';
import { NoticeBanner } from '../common/NoticeBanner';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

interface DeviceScannerProps {
  status: ConnectionOperationStatus;
  capabilities: BluetoothCapabilities | null;
  devices: DiscoveredGattDevice[];
  onDiscover: () => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSavePreferred: (device: DiscoveredGattDevice) => void;
  preferredIds: Set<string>;
}

export const DeviceScanner: React.FC<DeviceScannerProps> = ({
  status,
  capabilities,
  devices,
  onDiscover,
  onConnect,
  onDisconnect,
  onSavePreferred,
  preferredIds,
}) => {
  const isDiscovering = status.state === 'discovering';
  const isConnecting = status.state === 'connecting';
  const isUnsupported = !capabilities?.webBluetoothSupported;

  const handleOpenSettings = () => {
    audioVerifier.openSystemBluetoothSettings();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Bluetooth Device Discovery</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Use Web Bluetooth to authorize nearby audio peripherals and GATT companion services.
              The browser will open a native system chooser where you can grant access.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onDiscover}
              disabled={isDiscovering || isUnsupported}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/50 transition cursor-pointer disabled:opacity-50"
            >
              <Bluetooth className={`w-4 h-4 ${isDiscovering ? 'animate-pulse' : ''}`} />
              <span>{isDiscovering ? 'Chooser Open in Browser...' : 'Discover Devices'}</span>
            </button>
          </div>
        </div>

        {/* Browser Security Notice */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Browser Privacy Guard:</strong> Websites cannot silently snoop or list nearby Bluetooth devices. Only devices you explicitly pick in the browser dialog are accessed.
            </p>
          </div>
          <button
            onClick={handleOpenSettings}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium shrink-0 cursor-pointer"
          >
            <span>Android Settings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Permission Denied / Error Alerts */}
      {status.state === 'permission-denied' && (
        <NoticeBanner
          type="error"
          title="Bluetooth Permission Blocked"
          message={status.lastError || 'The browser blocked access to Bluetooth.'}
          details="Ensure Bluetooth is enabled on your device, and allow Bluetooth access when prompted by Chrome."
          action={{
            label: 'Retry Permission',
            onClick: onDiscover,
          }}
        />
      )}

      {isUnsupported && (
        <NoticeBanner
          type="warning"
          title="Web Bluetooth Not Supported in Current Browser"
          message="Your current browser does not support the W3C Web Bluetooth API. Supported browsers include Google Chrome, Microsoft Edge, and Samsung Internet on Android, Windows, macOS, and ChromeOS."
          details="On iOS, Apple restricts WebKit from accessing Bluetooth APIs. Please use Android Chrome or your system Bluetooth settings."
          action={{
            label: 'Open Android Bluetooth Settings',
            onClick: handleOpenSettings,
          }}
        />
      )}

      {/* Devices List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Authorized BLE Devices ({devices.length})
          </h4>
          <span className="text-xs text-slate-400">
            {devices.length === 0 ? 'No devices selected yet' : 'Real hardware verified'}
          </span>
        </div>

        {devices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Radio className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-slate-200">No Bluetooth Devices Authorized</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Tap <strong>Discover Devices</strong> above to open the native browser chooser. Make sure your earbuds are turned on and nearby.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {devices.map((device) => (
              <DeviceItem
                key={device.id}
                device={device}
                isConnecting={isConnecting && status.activeTargetId === device.id}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onSavePreferred={onSavePreferred}
                isAlreadyPreferred={preferredIds.has(device.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
