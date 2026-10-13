import React, { useState } from 'react';
import {
  Headphones,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  ExternalLink,
  Laptop,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { PreferredDeviceRecord } from '../../types/bluetooth';
import { Card } from '../common/Card';
import { EditDeviceModal } from './EditDeviceModal';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

interface PreferredDeviceListProps {
  devices: PreferredDeviceRecord[];
  onSaveDevice: (device: PreferredDeviceRecord) => void;
  onRemoveDevice: (id: string) => void;
  onConnectDevice: (device: PreferredDeviceRecord) => void;
  onOpenTroubleshoot: (brand: string) => void;
}

export const PreferredDeviceList: React.FC<PreferredDeviceListProps> = ({
  devices,
  onSaveDevice,
  onRemoveDevice,
  onConnectDevice,
  onOpenTroubleshoot,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<PreferredDeviceRecord | null>(null);

  const handleEdit = (device: PreferredDeviceRecord) => {
    setEditingDevice(device);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingDevice(null);
    setModalOpen(true);
  };

  const formatLastConnected = (ts: number | null) => {
    if (!ts) return 'Never connected in this browser';
    return new Date(ts).toLocaleDateString() + ' at ' + new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-cyan-400" />
            <span>Preferred Audio Devices</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Store and manage your primary study earbuds, custom nicknames, and multi-device connection notes.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Earbuds Profile</span>
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Headphones className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h5 className="text-sm font-semibold text-slate-200">No Preferred Devices Saved</h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Add your primary earbuds or save them directly from the Discover tab to quickly manage connections.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Profile</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => (
            <Card key={device.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 inline-block mb-1.5">
                      {device.brand.toUpperCase()}
                    </span>
                    <h4 className="text-base font-bold text-white truncate">
                      {device.nickname}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      Hardware Name: {device.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(device)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Edit profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveDevice(device.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                      title="Remove from saved preferences"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dormitory / Secondary Host Note */}
                {device.dormDeviceNote && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs text-slate-300 flex items-start gap-2">
                    <Laptop className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Dorm / Secondary Device:</span>{' '}
                      <span>{device.dormDeviceNote}</span>
                    </div>
                  </div>
                )}

                {/* Features & Limitations */}
                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatLastConnected(device.lastConnectedAt)}</span>
                  </div>

                  {device.multipointEnabled && (
                    <div className="text-[11px] text-cyan-300/80 flex items-center gap-1">
                      <span>• Multipoint enabled: can stay connected to phone & laptop</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenTroubleshoot(device.brand)}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Pairing Guide</span>
                </button>

                <button
                  onClick={() => onConnectDevice(device)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  Re-authorize & Connect
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditDeviceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveDevice}
        initialDevice={editingDevice}
      />
    </div>
  );
};
