import React, { useState } from 'react';
import {
  ShieldAlert,
  Speaker,
  Lock,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
} from 'lucide-react';
import { Card } from '../common/Card';
import { SPEAKER_BRAND_GUIDES, SpeakerBrandGuide } from '../../services/bluetooth/djOwnerService';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

interface SpeakerSecurityPanelProps {
  onOpenSdkModal: () => void;
}

export const SpeakerSecurityPanel: React.FC<SpeakerSecurityPanelProps> = ({
  onOpenSdkModal,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('jbl');
  const [expandedSection, setExpandedSection] = useState<boolean>(true);

  const activeGuide: SpeakerBrandGuide =
    SPEAKER_BRAND_GUIDES.find((g) => g.brand === selectedBrand) || SPEAKER_BRAND_GUIDES[0];

  const handleOpenAndroidSettings = () => {
    audioVerifier.openSystemBluetoothSettings();
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <span>Pairing Security & Guest Protection Panel</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware instructions by manufacturer to prevent partygoers from pairing or stealing audio playback.
          </p>
        </div>

        {/* Brand Selector Buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SPEAKER_BRAND_GUIDES.map((b) => (
            <button
              key={b.brand}
              onClick={() => setSelectedBrand(b.brand)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedBrand === b.brand
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {b.displayName.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Card */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-bold text-white">{activeGuide.displayName}</h5>
            <span className="text-[11px] text-slate-400 font-mono">
              Applies to: {activeGuide.popularModels}
            </span>
          </div>

          {activeGuide.auracastSupported && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
              <Radio className="w-3 h-3" /> Auracast Ready
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
              1. Hardware Pairing Lock (Physical Button)
            </span>
            <p className="text-slate-300 leading-relaxed">
              {activeGuide.hardwareLockMethod}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] block">
              2. Disabling Multipoint in Manufacturer App
            </span>
            <p className="text-slate-300 leading-relaxed">
              {activeGuide.multipointDisableMethod}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onOpenSdkModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Manufacturer SDK & Native Companion Spec</span>
          </button>

          <button
            onClick={handleOpenAndroidSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition cursor-pointer"
          >
            <span>Open Android Bluetooth Settings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
