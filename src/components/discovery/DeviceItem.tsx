import React from 'react';
import {
  Headphones,
  Speaker,
  Radio,
  Battery,
  Bluetooth,
  CheckCircle2,
  BookmarkPlus,
  RefreshCw,
  PowerOff,
} from 'lucide-react';
import { DiscoveredGattDevice, DeviceCategory } from '../../types/bluetooth';

interface DeviceItemProps {
  device: DiscoveredGattDevice;
  isConnecting: boolean;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSavePreferred: (device: DiscoveredGattDevice) => void;
  isAlreadyPreferred: boolean;
}

export const DeviceItem: React.FC<DeviceItemProps> = ({
  device,
  isConnecting,
  onConnect,
  onDisconnect,
  onSavePreferred,
  isAlreadyPreferred,
}) => {
  const getCategoryIcon = (category: DeviceCategory) => {
    switch (category) {
      case 'earbuds':
      case 'headphones':
        return <Headphones className="w-5 h-5 text-cyan-400" />;
      case 'speaker':
        return <Speaker className="w-5 h-5 text-blue-400" />;
      default:
        return <Radio className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-lg">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
          {getCategoryIcon(device.category)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm md:text-base font-bold text-white truncate">
              {device.name}
            </h4>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                device.connected
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {device.connected ? 'GATT Connected' : 'Authorized'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
            <span className="capitalize">{device.category}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">
              ID: {device.id.substring(0, 10)}...
            </span>

            {device.batteryLevel !== undefined && device.batteryLevel !== null && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <Battery className="w-3.5 h-3.5" />
                  {device.batteryLevel}%
                </span>
              </>
            )}

            {device.manufacturer && (
              <>
                <span>•</span>
                <span className="truncate max-w-[150px]">{device.manufacturer}</span>
              </>
            )}
          </div>

          {device.servicesFound.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {device.servicesFound.map((s, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {!isAlreadyPreferred && (
          <button
            onClick={() => onSavePreferred(device)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Save as preferred earbud"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Save Device</span>
          </button>
        )}

        {device.connected ? (
          <button
            onClick={() => onDisconnect(device.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 hover:border-rose-800 transition cursor-pointer"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            onClick={() => onConnect(device.id)}
            disabled={isConnecting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>Connect GATT</span>
          </button>
        )}
      </div>
    </div>
  );
};
