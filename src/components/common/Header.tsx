import React from 'react';
import { Bluetooth, Headphones, ShieldCheck, Download, Settings, RefreshCw } from 'lucide-react';
import { ConnectionOperationStatus, BluetoothCapabilities } from '../../types/bluetooth';
import { Badge } from './Badge';

interface HeaderProps {
  status: ConnectionOperationStatus;
  capabilities: BluetoothCapabilities | null;
  onRefreshCapabilities: () => void;
  onOpenSettings: () => void;
  isInstallable: boolean;
  onInstall: () => void;
  isInstalled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  capabilities,
  onRefreshCapabilities,
  onOpenSettings,
  isInstallable,
  onInstall,
  isInstalled,
}) => {
  const getStatusBadge = () => {
    switch (status.state) {
      case 'connected':
        return (
          <Badge variant="emerald" dot>
            GATT Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="amber" dot>
            Connecting...
          </Badge>
        );
      case 'discovering':
        return (
          <Badge variant="cyan" dot>
            Discovering...
          </Badge>
        );
      case 'permission-denied':
        return <Badge variant="rose">Permission Blocked</Badge>;
      case 'unsupported':
        return <Badge variant="rose">Unsupported Browser</Badge>;
      case 'error':
        return <Badge variant="rose">Action Required</Badge>;
      default:
        return (
          <Badge variant="slate">
            {capabilities?.webBluetoothSupported ? 'Ready to Pair' : 'Limited Mode'}
          </Badge>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-900/30 shrink-0">
            <Headphones className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-slate-800">
              <Bluetooth className="w-3 h-3 text-cyan-400" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-tight truncate">
                Library Bluetooth Manager
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <ShieldCheck className="w-3 h-3" /> PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate hidden xs:block">
              Earbud Connection & Audio Routing Assistant
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge()}

          {/* In-App PWA Install Button if available */}
          {isInstallable && !isInstalled && (
            <button
              onClick={onInstall}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-cyan-950/40 transition cursor-pointer"
              title="Install app to your home screen"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install PWA</span>
            </button>
          )}

          <button
            onClick={onRefreshCapabilities}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            title="Refresh Bluetooth capability detection"
            aria-label="Refresh Bluetooth detection"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            title="Open application settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
