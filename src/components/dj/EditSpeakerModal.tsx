import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { PreferredSpeakerRecord } from '../../types/bluetooth';

interface EditSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (speaker: PreferredSpeakerRecord) => void;
  initialSpeaker?: Partial<PreferredSpeakerRecord> | null;
}

export const EditSpeakerModal: React.FC<EditSpeakerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSpeaker,
}) => {
  const [name, setName] = useState(initialSpeaker?.name || '');
  const [nickname, setNickname] = useState(initialSpeaker?.nickname || '');
  const [brand, setBrand] = useState<PreferredSpeakerRecord['brand']>(
    initialSpeaker?.brand || 'jbl'
  );
  const [hasHardwareLock, setHasHardwareLock] = useState(
    initialSpeaker?.supportsHardwareLock ?? true
  );
  const [hasAuracast, setHasAuracast] = useState(initialSpeaker?.hasAuracast ?? false);
  const [lockInstructions, setLockInstructions] = useState(
    initialSpeaker?.pairingLockInstructions || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const record: PreferredSpeakerRecord = {
      id: initialSpeaker?.id || `spk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      nickname: nickname.trim() || name.trim(),
      brand,
      isPartySpeaker: true,
      supportsHardwareLock: hasHardwareLock,
      hasAuracast,
      multipointDisableSupported: true,
      pairingLockInstructions: lockInstructions.trim(),
      lastVerifiedAt: initialSpeaker?.lastVerifiedAt || null,
      createdAt: initialSpeaker?.createdAt || Date.now(),
    };

    onSave(record);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSpeaker?.id ? 'Edit DJ Speaker Profile' : 'Designate Preferred DJ Speaker'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Speaker Hardware Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. JBL PartyBox 310, Sony SRS-XV800"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Stage / Venue Nickname
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Dance Floor PA, Wedding Main Stage"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Manufacturer Brand
          </label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none capitalize"
          >
            <option value="jbl">JBL (PartyBox / Boombox)</option>
            <option value="sony">Sony (SRS / ULT Series)</option>
            <option value="bose">Bose (S1 Pro / SoundLink)</option>
            <option value="ultimate_ears">Ultimate Ears (HYPERBOOM)</option>
            <option value="marshall">Marshall (Woburn / Stanmore)</option>
            <option value="soundcore">Anker Soundcore Party</option>
            <option value="other">Other Brand / PA Speaker</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Hardware Lock Button Notes
          </label>
          <input
            type="text"
            value={lockInstructions}
            onChange={(e) => setLockInstructions(e.target.value)}
            placeholder="e.g. Tap Bluetooth button once after connecting to close discovery"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHardwareLock}
              onChange={(e) => setHasHardwareLock(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Speaker has physical hardware pairing / lock button</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAuracast}
              onChange={(e) => setHasAuracast(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>LE Audio Auracast broadcast supported</span>
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
            Save Speaker
          </button>
        </div>
      </form>
    </Modal>
  );
};
