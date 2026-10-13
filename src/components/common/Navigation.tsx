import React from 'react';
import {
  LayoutDashboard,
  Search,
  Headphones,
  Crown,
  Activity,
  LifeBuoy,
  Settings,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'discovery'
  | 'preferred'
  | 'dj'
  | 'monitor'
  | 'troubleshoot'
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  preferredCount: number;
}

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  special?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  preferredCount,
}) => {
  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery', label: 'Discover', icon: Search },
    {
      id: 'preferred',
      label: 'My Earbuds',
      icon: Headphones,
      badge: preferredCount > 0 ? preferredCount : undefined,
    },
    { id: 'dj', label: 'DJ Owner', icon: Crown, special: true },
    { id: 'monitor', label: 'Sound Check', icon: Activity },
    { id: 'troubleshoot', label: 'Troubleshoot', icon: LifeBuoy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop / Tablet Tab Bar */}
      <nav className="hidden md:block w-full border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm sticky top-[61px] z-20">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as NavTab)}
                className={`flex items-center gap-2 px-3.5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                } ${tab.special ? 'text-amber-300 hover:text-amber-200' : ''}`}
              >
                <Icon className={`w-4 h-4 ${tab.special ? 'text-amber-400' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg pb-safe">
        <div className="grid grid-cols-7 items-center px-0.5 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as NavTab)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition cursor-pointer relative ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 text-[9px] font-extrabold w-3.5 h-3.5 flex items-center justify-center rounded-full bg-cyan-500 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
