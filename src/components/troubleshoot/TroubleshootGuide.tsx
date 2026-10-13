import React, { useState } from 'react';
import {
  LifeBuoy,
  Laptop,
  Radio,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../common/Card';
import { ManufacturerCheatSheet } from './ManufacturerCheatSheet';
import { audioVerifier } from '../../services/bluetooth/audioVerifier';

interface TroubleshootGuideProps {
  initialBrand?: string;
}

export const TroubleshootGuide: React.FC<TroubleshootGuideProps> = ({
  initialBrand,
}) => {
  const [openSection, setOpenSection] = useState<string>('dorm');

  const handleOpenSettings = () => {
    audioVerifier.openSystemBluetoothSettings();
  };

  const sections = [
    {
      id: 'dorm',
      icon: Laptop,
      title: 'Earbuds Connected to Wrong Phone or Dorm Laptop',
      badge: 'Most Common Library Issue',
      color: 'text-amber-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Bluetooth earbuds remember their last paired hosts. When you open your charging case in the library, your earbuds will automatically handshake with whatever device in range has Bluetooth enabled—frequently a roommate’s laptop in your dorm room, a tablet in your backpack, or a friend’s computer across the library desk.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider block text-[11px]">
              How to Reclaim Your Connection:
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Force Hardware Pairing Mode:</strong> Put earbuds back in the charging case with the lid open, and press & hold the case button for 3–5 seconds until the LED pulses white/blue. This forcibly detaches the secondary host and opens pairing for your phone.
              </li>
              <li>
                <strong>Turn Off Secondary Bluetooth:</strong> If your own laptop is in your backpack, toggle Bluetooth off or put it into Sleep mode.
              </li>
              <li>
                <strong>Audio Focus Steal:</strong> On your Android phone, go to Bluetooth Settings and tap your earbuds. Many modern headphones (Sony, Bose, Samsung) will disconnect from the idle device if you manually request connection.
              </li>
            </ul>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              <strong>Ethical Notice:</strong> A web application cannot remotely terminate another student’s Bluetooth connection without access to the device or the earbud’s physical controls.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'multipoint',
      icon: Radio,
      title: 'Multipoint Connection Stalls & Audio Freezes',
      badge: 'Dual-Device Switching',
      color: 'text-cyan-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Bluetooth Multipoint allows two devices (e.g. phone + laptop) to connect at the same time. However, audio streams do NOT mix simultaneously:
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Media vs Call Priority:</strong> Phone calls (HFP) always supersede music/video (A2DP). If an app on device A keeps an open audio channel (like a video player or social media tab), device B cannot start streaming.
              </li>
              <li>
                <strong>Fix:</strong> Pause any audio or video tabs on your laptop or secondary phone. Wait 3 seconds, then press play on your primary phone.
              </li>
              <li>
                <strong>Companion App Check:</strong> Check your manufacturer app (Sony Headphones Connect, Bose Music, Jabra Sound+) to see which 2 devices are currently occupying the multipoint slots.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'interference',
      icon: WifiOff,
      title: 'Library 2.4 GHz Radio Frequency Congestion & Stutter',
      badge: 'Signal Dropouts',
      color: 'text-purple-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            University libraries are RF-dense environments. Bluetooth operates on the 2.402–2.480 GHz ISM band, exactly sharing spectrum with hundreds of student laptops, campus Wi-Fi access points, and wireless mice.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Change Codec Priority:</strong> In the manufacturer app or Android Developer Options, switch Bluetooth Audio Codec from LDAC (990 kbps) to AAC or SBC (Priority on Stable Connection). LDAC stutters easily under campus RF congestion.
              </li>
              <li>
                <strong>Keep Phone in Direct Line of Sight:</strong> Place your phone on the study desk instead of buried inside a thick backpack or back pocket.
              </li>
              <li>
                <strong>Re-seat in Case:</strong> Put both earbuds back into the case for 5 seconds to reset clock synchronization between the Left and Right buds.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-cyan-400" />
            <span>Library Bluetooth Troubleshooting Assistant</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
            Detailed, step-by-step guidance for student connection collisions, stale dorm pairings, and multipoint audio routing.
          </p>
        </div>

        <button
          onClick={handleOpenSettings}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition cursor-pointer self-start md:self-auto"
        >
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          <span>Launch Android Bluetooth Settings</span>
        </button>
      </div>

      {/* Accordion FAQ / Troubleshooting sections */}
      <div className="space-y-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isOpen = openSection === sec.id;
          return (
            <Card key={sec.id} className="p-0 overflow-hidden">
              <button
                onClick={() => setOpenSection(isOpen ? '' : sec.id)}
                className="w-full p-4 md:p-5 flex items-center justify-between gap-3 text-left transition hover:bg-slate-800/40 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    <Icon className={`w-5 h-5 ${sec.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm md:text-base font-bold text-white truncate">
                        {sec.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {sec.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="p-4 md:p-5 pt-0 border-t border-slate-800/60 bg-slate-950/40 animate-fade-in">
                  {sec.content}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Manufacturer Hardware Cheat Sheet */}
      <ManufacturerCheatSheet initialBrand={initialBrand} />
    </div>
  );
};
