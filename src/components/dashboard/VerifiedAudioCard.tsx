import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldCheck, Check, Radio, Play } from 'lucide-react';
import { Card } from '../common/Card';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';
import { AudioOutputDeviceInfo } from '../../types/bluetooth';

interface VerifiedAudioCardProps {
  volumePercent: number;
  onVolumeChange: (vol: number) => void;
}

export const VerifiedAudioCard: React.FC<VerifiedAudioCardProps> = ({
  volumePercent,
  onVolumeChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<'left' | 'right' | 'both' | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioOutputDeviceInfo[]>([]);
  const [lastTestedChannel, setLastTestedChannel] = useState<string | null>(null);

  useEffect(() => {
    audioVerifier.getAudioOutputDevices().then(setAudioDevices);
  }, []);

  const handleTest = async (channel: 'left' | 'right' | 'both') => {
    setIsPlaying(channel);
    setLastTestedChannel(channel);
    try {
      await audioVerifier.playTestTone(channel, volumePercent);
    } finally {
      setIsPlaying(null);
    }
  };

  return (
    <Card glow={isPlaying !== null}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Library Silent Audio Probe</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Volume Guard Protected
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Plays a discreet, low-gain chime to confirm audio is reaching your earbuds before you start studying.
            </p>
          </div>
        </div>

        {/* Volume Guard Slider */}
        <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
          <span className="text-xs font-mono text-cyan-400 font-semibold">{volumePercent}% Gain</span>
          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={volumePercent}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title="Volume ceiling (capped at 40% for library safety)"
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <button
          onClick={() => handleTest('left')}
          disabled={isPlaying !== null}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
            isPlaying === 'left'
              ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider">Left Ear</span>
          <span className="text-[11px] text-slate-400 mt-0.5">440 Hz Ping</span>
        </button>

        <button
          onClick={() => handleTest('both')}
          disabled={isPlaying !== null}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
            isPlaying === 'both'
              ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Stereo Center</span>
          <span className="text-[11px] text-slate-400 mt-0.5">523 Hz Chime</span>
        </button>

        <button
          onClick={() => handleTest('right')}
          disabled={isPlaying !== null}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
            isPlaying === 'right'
              ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider">Right Ear</span>
          <span className="text-[11px] text-slate-400 mt-0.5">660 Hz Ping</span>
        </button>
      </div>

      {/* Audio Output Sink status */}
      <div className="text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {audioDevices.length > 0
              ? `Detected ${audioDevices.length} audio sink(s)`
              : 'Active Audio Routing: Managed by Operating System'}
          </span>
        </div>
        {lastTestedChannel && (
          <span className="text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Last test sent to {lastTestedChannel.toUpperCase()} channel
          </span>
        )}
      </div>
    </Card>
  );
};
