import React from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Radio,
  Battery,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { Card } from '../common/Card';
import { PreferredSpeakerRecord, DiscoveredGattDevice } from '../../types/bluetooth';
import { djOwnerService } from '../../services/bluetooth/djOwnerService';

interface ExclusiveStatusCardProps {
  speaker: PreferredSpeakerRecord | null;
  connectedGattDevice: DiscoveredGattDevice | null;
  hardwareLockConfirmed: boolean;
  onToggleHardwareLock: (confirmed: boolean) => void;
  onOpenTroubleshoot: () => void;
}

export const ExclusiveStatusCard: React.FC<ExclusiveStatusCardProps> = ({
  speaker,
  connectedGattDevice,
  hardwareLockConfirmed,
  onToggleHardwareLock,
  onOpenTroubleshoot,
}) => {
  const lockStatus = djOwnerService.evaluateLockStatus(connectedGattDevice, speaker);

  const getStatusBadge = () => {
    switch (lockStatus.color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          pill: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
        };
      case 'amber':
        return {
          bg: 'bg-amber-950/70 border-amber-800 text-amber-300',
          icon: <Lock className="w-5 h-5 text-amber-400" />,
          pill: 'bg-amber-900/60 text-amber-200 border-amber-700',
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-950/70 border-cyan-800 text-cyan-300',
          icon: <Radio className="w-5 h-5 text-cyan-400" />,
          pill: 'bg-cyan-900/60 text-cyan-200 border-cyan-700',
        };
      default:
        return {
          bg: 'bg-rose-950/70 border-rose-800 text-rose-300',
          icon: <Unlock className="w-5 h-5 text-rose-400" />,
          pill: 'bg-rose-900/60 text-rose-200 border-rose-700',
        };
    }
  };

  const style = getStatusBadge();

  return (
    <Card className="space-y-4">
      {/* Top Status Header */}
      <div className={`p-4 rounded-2xl border ${style.bg} transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 mt-0.5">
              {style.icon}
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.pill} inline-block mb-1`}>
                Exclusive Connection Status
              </span>
              <h3 className="text-base md:text-lg font-bold text-white truncate">
                {lockStatus.label}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {lockStatus.description}
              </p>
            </div>
          </div>

          {connectedGattDevice?.batteryLevel !== undefined &&
            connectedGattDevice.batteryLevel !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs shrink-0 self-start sm:self-auto">
                <Battery className="w-4 h-4" />
                <span>{connectedGattDevice.batteryLevel}% Battery</span>
              </div>
            )}
        </div>

        {/* Truthful Disclosures / Architectural Reality */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Security Boundary:</strong> {lockStatus.integrityNote}
          </p>
        </div>
      </div>

      {/* Hardware Pairing Lock Toggle */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="text-xs md:text-sm font-bold text-white block">
            Physical Speaker Pairing Lock Confirmed
          </label>
          <span className="text-xs text-slate-400">
            Check this box once you have pressed the Bluetooth button or toggled PartyBoost on the speaker to disable incoming pairing requests.
          </span>
        </div>

        <button
          onClick={() => onToggleHardwareLock(!hardwareLockConfirmed)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
            hardwareLockConfirmed
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          {hardwareLockConfirmed ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Hardware Locked</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Engage Lock Check</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
};
