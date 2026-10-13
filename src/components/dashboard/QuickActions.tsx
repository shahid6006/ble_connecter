import React from 'react';
import {
  Search,
  Volume2,
  LifeBuoy,
  Settings,
  Headphones,
  Laptop,
  Crown,
} from 'lucide-react';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

interface QuickActionsProps {
  onDiscover: () => void;
  onNavigateToTab: (tab: any) => void;
  onQuickSoundCheck: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onDiscover,
  onNavigateToTab,
  onQuickSoundCheck,
}) => {
  const actions = [
    {
      title: 'Scan Nearby Devices',
      desc: 'Open browser device chooser for authorized BLE peripherals',
      icon: Search,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      onClick: onDiscover,
    },
    {
      title: 'DJ Owner Mode',
      desc: 'Lock party speaker & prevent wedding/event audio takeovers',
      icon: Crown,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
      onClick: () => onNavigateToTab('dj'),
    },
    {
      title: 'Silent Sound Check',
      desc: 'Verify if audio is actually playing in earbuds vs loudspeaker',
      icon: Volume2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      onClick: onQuickSoundCheck,
    },
    {
      title: 'Wrong Device / Dorm PC?',
      desc: 'Earbuds auto-connected to roommate or distant laptop',
      icon: Laptop,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      onClick: () => onNavigateToTab('troubleshoot'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {actions.map((act, i) => {
        const Icon = act.icon;
        return (
          <button
            key={i}
            onClick={act.onClick}
            className="flex flex-col text-left p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-200 shadow-md group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border mb-3 ${act.color} group-hover:scale-105 transition-transform`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
              {act.title}
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {act.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
};
