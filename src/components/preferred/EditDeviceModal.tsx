import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { PreferredDeviceRecord, DeviceCategory } from '../../types/bluetooth';

interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: PreferredDeviceRecord) => void;
  initialDevice?: Partial<PreferredDeviceRecord> | null;
}

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDevice,
}) => {
  const [name, setName] = useState(initialDevice?.name || '');
  const [nickname, setNickname] = useState(initialDevice?.nickname || '');
  const [brand, setBrand] = useState<PreferredDeviceRecord['brand']>(
    initialDevice?.brand || 'sony'
  );
  const [category, setCategory] = useState<DeviceCategory>(
    initialDevice?.deviceCategory || 'earbuds'
  );
  const [multipoint, setMultipoint] = useState(initialDevice?.multipointEnabled ?? true);
  const [dormNote, setDormNote] = useState(initialDevice?.dormDeviceNote || '');
  const [reminder, setReminder] = useState(initialDevice?.reconnectReminder ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const record: PreferredDeviceRecord = {
      id: initialDevice?.id || `pref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      nickname: nickname.trim() || name.trim(),
      brand,
      deviceCategory: category,
      multipointEnabled: multipoint,
      dormDeviceNote: dormNote.trim() || undefined,
      createdAt: initialDevice?.createdAt || Date.now(),
      lastConnectedAt: initialDevice?.lastConnectedAt || null,
      reconnectReminder: reminder,
    };

    onSave(record);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialDevice?.id ? 'Edit Earbuds Profile' : 'Save Preferred Audio Device'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Device Hardware Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sony WF-1000XM5, AirPods Pro"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Personal Nickname
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Campus Study Buds"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Manufacturer Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none capitalize"
            >
              <option value="sony">Sony</option>
              <option value="apple">Apple</option>
              <option value="samsung">Samsung</option>
              <option value="bose">Bose</option>
              <option value="jabra">Jabra</option>
              <option value="soundcore">Anker Soundcore</option>
              <option value="beats">Beats</option>
              <option value="other">Other Brand</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Device Form Factor
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none capitalize"
            >
              <option value="earbuds">In-Ear Buds</option>
              <option value="headphones">Over-Ear Headphones</option>
              <option value="speaker">Portable Speaker</option>
              <option value="ble_peripheral">BLE Peripheral</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Dorm / Secondary Device Note
          </label>
          <input
            type="text"
            value={dormNote}
            onChange={(e) => setDormNote(e.target.value)}
            placeholder="e.g. Often steals connection from MacBook in Room 304"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Helps you remember which computer might be holding onto your earbuds connection.
          </span>
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={multipoint}
              onChange={(e) => setMultipoint(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Multipoint Capable (Supports two host devices simultaneously)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Prompt sound check when entering study sessions</span>
          </label>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-950/50 transition cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </Modal>
  );
};
