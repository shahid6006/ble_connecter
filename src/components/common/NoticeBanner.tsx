import React from 'react';
import { AlertCircle, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface NoticeBannerProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  details?: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  type = 'info',
  title,
  message,
  details,
  onDismiss,
  action,
}) => {
  const styles = {
    info: {
      bg: 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200',
      icon: <Info className="h-5 w-5 text-cyan-400 shrink-0" />,
      btn: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
    },
    error: {
      bg: 'bg-rose-950/40 border-rose-800/60 text-rose-200',
      icon: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
      btn: 'bg-rose-600 hover:bg-rose-500 text-white',
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={`relative rounded-xl border p-3.5 md:p-4 text-sm flex gap-3 items-start transition-all ${current.bg}`}
    >
      <div className="pt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-slate-100 mb-0.5">{title}</h4>}
        <p className="leading-relaxed opacity-95">{message}</p>
        {details && (
          <p className="mt-1 text-xs opacity-75 font-mono break-all">{details}</p>
        )}
        {action && (
          <div className="mt-2.5">
            <button
              onClick={action.onClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${current.btn}`}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 cursor-pointer"
          aria-label="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
