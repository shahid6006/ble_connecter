import React, { useState, useEffect } from 'react';
import {
  Activity,
  Headphones,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText,
} from 'lucide-react';
import { ConnectionOperationStatus, BluetoothCapabilities } from '../../types/bluetooth';
import { Card } from '../common/Card';
import { AudioRoutingTester } from './AudioRoutingTester';
import { storageService, ConnectionLogEntry } from '../../services/storage/indexedDbService';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

interface LiveMonitorProps {
  status: ConnectionOperationStatus;
  capabilities: BluetoothCapabilities | null;
  volumePercent: number;
  onVolumeChange: (vol: number) => void;
  onCancelOperation: () => void;
  onOpenTroubleshoot: () => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  status,
  capabilities,
  volumePercent,
  onVolumeChange,
  onCancelOperation,
  onOpenTroubleshoot,
}) => {
  const [logs, setLogs] = useState<ConnectionLogEntry[]>([]);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  const fetchLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const recent = await storageService.getRecentLogs(15);
      setLogs(recent);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [status.lastStatusChange]);

  const handleOpenAndroidSettings = () => {
    audioVerifier.openSystemBluetoothSettings();
  };

  const getStatusDisplay = () => {
    switch (status.state) {
      case 'connected':
        return {
          title: 'GATT Connection Verified',
          desc: 'Active BLE GATT connection to authorized peripheral. Hardware communication link open.',
          color: 'text-emerald-400',
          border: 'border-emerald-800/80',
          bg: 'bg-emerald-950/30',
        };
      case 'connecting':
        return {
          title: `Reconnecting (Attempt ${status.attemptCount} of ${status.maxAttempts})`,
          desc: `Exponential backoff: waiting ${status.retryDelayMs / 1000}s between retries to avoid flooding the BLE controller.`,
          color: 'text-amber-400',
          border: 'border-amber-800/80',
          bg: 'bg-amber-950/30',
        };
      case 'discovering':
        return {
          title: 'Browser Device Chooser Open',
          desc: 'Awaiting student confirmation in native browser Bluetooth dialog.',
          color: 'text-cyan-400',
          border: 'border-cyan-800/80',
          bg: 'bg-cyan-950/30',
        };
      case 'permission-denied':
        return {
          title: 'Permission Denied',
          desc: 'Browser permission was rejected or policy-restricted.',
          color: 'text-rose-400',
          border: 'border-rose-800/80',
          bg: 'bg-rose-950/30',
        };
      case 'unsupported':
        return {
          title: 'Unsupported Browser Context',
          desc: 'Current browser engine does not expose Web Bluetooth APIs.',
          color: 'text-rose-400',
          border: 'border-rose-800/80',
          bg: 'bg-rose-950/30',
        };
      case 'error':
        return {
          title: 'Connection Fault',
          desc: status.lastError || 'An error occurred during communication.',
          color: 'text-rose-400',
          border: 'border-rose-800/80',
          bg: 'bg-rose-950/30',
        };
      default:
        return {
          title: 'Idle / Ready',
          desc: 'No active connection operation in progress.',
          color: 'text-slate-300',
          border: 'border-slate-800',
          bg: 'bg-slate-900',
        };
    }
  };

  const cur = getStatusDisplay();

  return (
    <div className="space-y-6">
      {/* Top Status Overview */}
      <div className={`rounded-2xl border p-5 md:p-6 shadow-xl ${cur.bg} ${cur.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${cur.color} bg-current animate-pulse`} />
              <h3 className={`text-lg md:text-xl font-bold ${cur.color}`}>{cur.title}</h3>
            </div>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              {cur.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {status.state === 'connecting' && (
              <button
                onClick={onCancelOperation}
                className="px-4 py-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                Abort Retries
              </button>
            )}

            <button
              onClick={handleOpenAndroidSettings}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Android Settings</span>
            </button>
          </div>
        </div>

        {status.troubleshootingTip && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Troubleshooting Suggestion:</span>{' '}
              {status.troubleshootingTip}
            </div>
          </div>
        )}
      </div>

      {/* Audio Routing Probe */}
      <AudioRoutingTester
        volumePercent={volumePercent}
        onVolumeChange={onVolumeChange}
      />

      {/* Event Audit Trail */}
      <Card>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-200">
              Bluetooth & Routing Audit Trail (On-Device Storage)
            </h4>
          </div>
          <button
            onClick={fetchLogs}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingLogs ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center italic">
              No recent Bluetooth activity recorded yet.
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        log.type === 'connect'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.type === 'error'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : log.type === 'disconnect'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="font-semibold text-slate-200 truncate">
                      {log.message}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                      {log.details}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
