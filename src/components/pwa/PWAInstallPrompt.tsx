import React, { useState } from 'react';
import { Download, Smartphone, Apple, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold">PWA Active:</span> Running in standalone mode on your device.
        </div>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-white">
              Install Library Bluetooth Manager
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch instantly from your phone’s home screen with offline caching.
            </p>
          </div>
        </div>

        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50 transition cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        {isIOS && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer shrink-0"
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS Install Guide</span>
          </button>
        )}
      </div>

      {!isInstallable && !isIOS && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
          <span className="font-semibold text-slate-200">Manual Installation:</span> Tap the three dots (<strong>⋮</strong>) in Chrome / Samsung Internet and select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
        </div>
      )}

      {/* iOS Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Apple className="w-5 h-5 text-slate-200" />
                <span>Install on iPhone / iPad</span>
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="font-bold font-mono text-cyan-400">1.</span>
                <p>Tap the <strong>Share</strong> button (box with upward arrow) at the bottom of Safari.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold font-mono text-cyan-400">2.</span>
                <p>Scroll down in the action sheet and select <strong>Add to Home Screen</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold font-mono text-cyan-400">3.</span>
                <p>Tap <strong>Add</strong> in the top-right corner to place the app on your home screen.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
