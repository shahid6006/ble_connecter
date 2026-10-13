import React from 'react';
import { AlertTriangle, Bell, Check, X, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { InterruptionAlert } from '../../types/bluetooth';

interface InterruptionAlertBannerProps {
  alerts: InterruptionAlert[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onTriggerDiagnostic: () => void;
}

export const InterruptionAlertBanner: React.FC<InterruptionAlertBannerProps> = ({
  alerts,
  onDismiss,
  onClearAll,
  onTriggerDiagnostic,
}) => {
  if (alerts.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>No connection interruptions detected. Telemetry link clean.</span>
        </div>
        <button
          onClick={onTriggerDiagnostic}
          className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Test Alert Pipeline</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-400">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>Active Interruption Alerts ({alerts.length})</span>
        </span>
        <button
          onClick={onClearAll}
          className="text-slate-400 hover:text-slate-200 text-[11px] font-normal lowercase cursor-pointer"
        >
          Clear all alerts
        </button>
      </div>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 animate-fade-in ${
            alert.severity === 'high'
              ? 'bg-rose-950/60 border-rose-800 text-rose-200'
              : 'bg-amber-950/60 border-amber-800 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="min-w-0">
              <h5 className="font-bold text-sm text-white">{alert.message}</h5>
              <p className="text-xs text-slate-300 mt-0.5">{alert.recommendedAction}</p>
              <span className="text-[10px] opacity-75 font-mono mt-1 block">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
