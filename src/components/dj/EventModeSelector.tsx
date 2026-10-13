import React from 'react';
import { GlassWater, PartyPopper, Presentation, Radio, Shield, AlertTriangle } from 'lucide-react';
import { EventOccasion, EventProfileConfig } from '../../types/bluetooth';
import { EVENT_PROFILES } from '../../services/bluetooth/djOwnerService';
import { Card } from '../common/Card';

interface EventModeSelectorProps {
  currentOccasion: EventOccasion;
  onSelectOccasion: (occasion: EventOccasion) => void;
}

export const EventModeSelector: React.FC<EventModeSelectorProps> = ({
  currentOccasion,
  onSelectOccasion,
}) => {
  const getIcon = (occ: EventOccasion) => {
    switch (occ) {
      case 'wedding':
        return <GlassWater className="w-5 h-5 text-amber-400" />;
      case 'party':
        return <PartyPopper className="w-5 h-5 text-cyan-400" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-blue-400" />;
      case 'silent_disco':
        return <Radio className="w-5 h-5 text-purple-400" />;
    }
  };

  const occasions: EventOccasion[] = ['wedding', 'party', 'presentation', 'silent_disco'];
  const activeProfile = EVENT_PROFILES[currentOccasion];

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span>Event Protection Mode</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the occasion to apply tailored connection security rules and multipoint policies.
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider self-start sm:self-auto border ${
            activeProfile.threatLevel === 'Critical'
              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
              : activeProfile.threatLevel === 'High'
              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
              : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
          }`}
        >
          {activeProfile.threatLevel} Interruption Risk
        </span>
      </div>

      {/* Occasion Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {occasions.map((occ) => {
          const profile = EVENT_PROFILES[occ];
          const isSelected = currentOccasion === occ;
          return (
            <button
              key={occ}
              onClick={() => onSelectOccasion(occ)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {getIcon(occ)}
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span className="text-xs font-bold text-white line-clamp-1">{profile.title}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{profile.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Active Profile Policy Details */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2">
        <div className="flex items-start gap-2 text-slate-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{activeProfile.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[11px]">
          <div>
            <span className="text-slate-400 block font-medium">Multipoint Policy:</span>
            <span className="text-cyan-300 font-semibold">{activeProfile.multipointPolicy}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Guest Playback Policy:</span>
            <span className="text-slate-300">{activeProfile.guestPolicy}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-900 text-[11px] text-emerald-400/90 font-medium">
          Recommended Action: {activeProfile.recommendedAction}
        </div>
      </div>
    </Card>
  );
};
