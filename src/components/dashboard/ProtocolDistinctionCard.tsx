import React, { useState } from 'react';
import { Shield, Layers, HelpCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../common/Card';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

export const ProtocolDistinctionCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const layers = [
    {
      num: '1',
      title: 'Bluetooth Device Discovery',
      scope: 'Browser & Web Bluetooth',
      supported: true,
      desc: 'Browsers open a secure user-initiated chooser dialog to grant explicit permission for nearby BLE peripherals. Browsers strictly block silent background enumeration to protect user privacy.',
    },
    {
      num: '2',
      title: 'BLE GATT Connectivity',
      scope: 'Browser Web Bluetooth',
      supported: true,
      desc: 'Connects to Generic Attribute (GATT) profiles like Battery Service (0x180F) or Device Information (0x180A) on supported wireless peripherals.',
    },
    {
      num: '3',
      title: 'Classic Bluetooth (BR/EDR)',
      scope: 'Host OS Bluetooth Stack',
      supported: false,
      desc: 'High-bandwidth legacy radio used by standard wireless headphones. Web browsers cannot directly initiate, pair, or disconnect Classic Bluetooth links.',
    },
    {
      num: '4',
      title: 'OS Bluetooth Pairing & Bonding',
      scope: 'Android / iOS / OS Kernel',
      supported: false,
      desc: 'Cryptographic link-key bonding stored at the OS level. Handled exclusively in Android Settings or iOS Settings, never inside a web page.',
    },
    {
      num: '5',
      title: 'A2DP Audio Playback Routing',
      scope: 'OS Audio Framework (AudioTrack/CoreAudio)',
      supported: false,
      desc: 'Advanced Audio Distribution Profile streams music/podcasts. The OS decides whether audio routes to the phone speaker, USB-C, or Bluetooth headset.',
    },
    {
      num: '6',
      title: 'AVRCP Media Control',
      scope: 'Media Session API & OS',
      supported: true,
      desc: 'Audio/Video Remote Control Profile (play, pause, track skip from earbud taps). Handled in the browser via standard Web Media Session API!',
    },
  ];

  const handleOpenSettings = () => {
    audioVerifier.openSystemBluetoothSettings();
  };

  return (
    <Card className="border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <span>Bluetooth Architecture & Browser Security Scope</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                W3C Web Bluetooth Spec
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Understanding why websites cannot hijack connections or kick other phones off your earbuds.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium p-1 cursor-pointer"
        >
          <span>{isExpanded ? 'Collapse' : 'Inspect 6 Layers'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {layers.map((layer) => (
              <div
                key={layer.num}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">
                      {layer.num}. {layer.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        layer.supported
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {layer.supported ? 'Web Supported' : 'OS Kernel Only'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-1">{layer.desc}</p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-cyan-400/80">
                  Authority: {layer.scope}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                For Classic Bluetooth audio pairing or recovering an earbud from a distant dorm laptop, launch the Android system Bluetooth panel.
              </p>
            </div>
            <button
              onClick={handleOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shrink-0 cursor-pointer transition"
            >
              <span>Open Android Settings</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
