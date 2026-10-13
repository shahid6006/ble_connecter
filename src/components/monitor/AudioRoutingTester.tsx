import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../common/Card';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';
import { AudioOutputDeviceInfo } from '../../types/bluetooth';

interface AudioRoutingTesterProps {
  volumePercent: number;
  onVolumeChange: (vol: number) => void;
}

export const AudioRoutingTester: React.FC<AudioRoutingTesterProps> = ({
  volumePercent,
  onVolumeChange,
}) => {
  const [activeChannel, setActiveChannel] = useState<'left' | 'right' | 'both' | null>(null);
  const [deviceList, setDeviceList] = useState<AudioOutputDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');
  const [testLog, setTestLog] = useState<Array<{ id: string; msg: string; time: string }>>([]);

  useEffect(() => {
    refreshDevices();
  }, []);

  const refreshDevices = async () => {
    const list = await audioVerifier.getAudioOutputDevices();
    setDeviceList(list);
  };

  const runTest = async (channel: 'left' | 'right' | 'both') => {
    setActiveChannel(channel);
    try {
      await audioVerifier.playTestTone(channel, volumePercent);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTestLog((prev) => [
        {
          id: Math.random().toString(),
          msg: `Auditory test tone sent to ${channel.toUpperCase()} ear (${volumePercent}% library-safe gain)`,
          time: timeStr,
        },
        ...prev.slice(0, 4),
      ]);
    } finally {
      setActiveChannel(null);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <span>Audio Sink Routing Verifier</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Confirm audio routing to earbud hardware before unpausing lectures or study tracks.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span className="text-xs font-mono text-cyan-400 font-bold">{volumePercent}% Gain</span>
          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={volumePercent}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Interactive Sound Pad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Left Earbud Check
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Sends isolated 440 Hz sine tone to Left stereo channel.
            </p>
          </div>
          <button
            onClick={() => runTest('left')}
            disabled={activeChannel !== null}
            className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeChannel === 'left'
                ? 'bg-cyan-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Play Left Ping</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Binaural Center Chime
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Sends balanced 523 Hz C5 chime equally to both channels.
            </p>
          </div>
          <button
            onClick={() => runTest('both')}
            disabled={activeChannel !== null}
            className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeChannel === 'both'
                ? 'bg-cyan-600 text-white animate-pulse'
                : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Play Stereo Chime</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Right Earbud Check
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Sends isolated 660 Hz sine tone to Right stereo channel.
            </p>
          </div>
          <button
            onClick={() => runTest('right')}
            disabled={activeChannel !== null}
            className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeChannel === 'right'
                ? 'bg-cyan-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Play Right Ping</span>
          </button>
        </div>
      </div>

      {/* Discovered Audio Output Sinks */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">System Audio Sink Status</span>
          </div>
          <button
            onClick={refreshDevices}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {deviceList.length > 0 ? (
          <div className="space-y-1 mt-2">
            {deviceList.map((d, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      d.isBluetoothProbable ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                  />
                  <span className="truncate font-mono text-slate-300">{d.label}</span>
                </div>
                {d.isBluetoothProbable && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Bluetooth Sink
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Audio output labels are governed by browser media permissions. Playing test tones routes through the active OS default output.
          </p>
        )}
      </div>

      {/* Recent Test Log */}
      {testLog.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Recent Routing Probes
          </span>
          <div className="space-y-1">
            {testLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-[11px] text-slate-400 font-mono py-0.5 border-b border-slate-900"
              >
                <span className="text-slate-300">{log.msg}</span>
                <span className="text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
