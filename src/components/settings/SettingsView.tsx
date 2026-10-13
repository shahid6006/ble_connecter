import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Trash2,
  Smartphone,
  Layers,
  Info,
  Check,
  AlertTriangle,
  ExternalLink,
  Sliders,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { Card } from '../common/Card';
import { AppSettings } from '../../services/storage/indexedDbService';
import { BluetoothCapabilities } from '../../types/bluetooth';
import { NativeBridgeModal } from './NativeBridgeModal';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  capabilities: BluetoothCapabilities | null;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  capabilities,
  onClearData,
}) => {
  const [bridgeModalOpen, setBridgeModalOpen] = useState(false);
  const [clearedConfirm, setClearedConfirm] = useState(false);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all saved earbuds preferences and local logs?')) {
      onClearData();
      setClearedConfirm(true);
      setTimeout(() => setClearedConfirm(false), 3000);
    }
  };

  const compatibilityMatrix = [
    { browser: 'Google Chrome (Android)', webBluetooth: true, gatt: true, status: 'Full Support' },
    { browser: 'Samsung Internet (Android)', webBluetooth: true, gatt: true, status: 'Full Support' },
    { browser: 'Google Chrome (macOS/Win/ChromeOS)', webBluetooth: true, gatt: true, status: 'Full Support' },
    { browser: 'Microsoft Edge (Desktop)', webBluetooth: true, gatt: true, status: 'Full Support' },
    { browser: 'Apple Safari (iOS / iPadOS)', webBluetooth: false, gatt: false, status: 'Restricted by Apple WebKit' },
    { browser: 'Mozilla Firefox', webBluetooth: false, gatt: false, status: 'Disabled by Mozilla' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Application Preferences & Compliance</span>
        </h3>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Adjust sound safety guards, inspect platform compatibility, and manage on-device data.
        </p>
      </div>

      {/* PWA Installation Card */}
      <PWAInstallPrompt />

      {/* Theme & Volume Guard */}
      <Card className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Interface & Audio Safety</span>
        </h4>

        {/* Theme Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-sm font-semibold text-slate-200 block">Color Theme</label>
            <span className="text-xs text-slate-400">Select display contrast for study environments.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                settings.theme === 'dark' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Navy
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'midnight' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                settings.theme === 'midnight' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Midnight OLED
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                settings.theme === 'light' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Light
            </button>
          </div>
        </div>

        {/* Volume Ceiling */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-sm font-semibold text-slate-200 block">
              Library Volume Safety Ceiling ({settings.volumeGuardLimit}%)
            </label>
            <span className="text-xs text-slate-400">
              Caps test tone oscillator gain to prevent loud audio bursts if earbuds are disconnected.
            </span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={settings.volumeGuardLimit}
              onChange={(e) => onUpdateSettings({ volumeGuardLimit: Number(e.target.value) })}
              className="w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-xs font-mono text-cyan-400 font-bold min-w-8">
              {settings.volumeGuardLimit}%
            </span>
          </div>
        </div>
      </Card>

      {/* Browser Compatibility Matrix */}
      <Card className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
          <Laptop className="w-4 h-4 text-cyan-400" />
          <span>Browser & OS Compatibility Matrix</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-medium">Browser / Platform</th>
                <th className="pb-2 font-medium">Web Bluetooth API</th>
                <th className="pb-2 font-medium">BLE GATT Support</th>
                <th className="pb-2 font-medium">Support Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {compatibilityMatrix.map((item, idx) => (
                <tr key={idx} className="text-slate-300">
                  <td className="py-2.5 font-medium">{item.browser}</td>
                  <td className="py-2.5 font-mono">
                    {item.webBluetooth ? (
                      <span className="text-emerald-400">Available</span>
                    ) : (
                      <span className="text-rose-400">Unavailable</span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono">
                    {item.gatt ? (
                      <span className="text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-rose-400">No</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'Full Support'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="space-y-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Privacy & Security Architecture</span>
        </h4>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            • <strong>100% On-Device Processing:</strong> Preferences and diagnostic logs are stored exclusively in your browser’s IndexedDB sandbox. No external servers or telemetry endpoints receive your Bluetooth data.
          </p>
          <p>
            • <strong>No Unsolicited Scanning:</strong> Web Bluetooth only executes when you explicitly click Discover Devices.
          </p>
          <p>
            • <strong>Secure Context Only:</strong> This application requires a secure cryptographic HTTPS origin or localhost environment as mandated by the W3C specification.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setBridgeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>View Native Android Bridge Spec</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 text-xs font-semibold border border-rose-800/80 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Stored Data</span>
          </button>
        </div>

        {clearedConfirm && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 text-center font-medium">
            All stored preferences and audit logs have been successfully cleared.
          </div>
        )}
      </Card>

      {/* About */}
      <div className="text-center text-xs text-slate-400 pt-4 pb-8 space-y-1">
        <p className="font-semibold text-slate-300">Library Bluetooth Manager PWA v1.0.0</p>
        <p>Built for university students managing personal audio in silent study halls.</p>
        <p className="text-[11px] text-slate-400">Compliant with W3C Web Bluetooth, Media Session API & PWA Standards.</p>
      </div>

      {/* Android Bridge Modal */}
      <NativeBridgeModal
        isOpen={bridgeModalOpen}
        onClose={() => setBridgeModalOpen(false)}
      />
    </div>
  );
};
