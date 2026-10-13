import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-sm border border-amber-500 animate-bounce">
      <WifiOff className="h-4 w-4 shrink-0 text-white" />
      <span>Offline Mode — Running from cached PWA application shell.</span>
    </div>
  );
};
