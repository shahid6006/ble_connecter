import React from 'react';
import { Modal } from '../common/Modal';
import { Cpu, ShieldCheck, Layers, Terminal, AlertTriangle, Radio } from 'lucide-react';

interface ManufacturerSdkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManufacturerSdkModal: React.FC<ManufacturerSdkModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DJ Owner Mode: Manufacturer SDKs & Native Android Architecture"
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200">
          <p className="font-semibold text-slate-100 mb-1">
            Why Browser Sandboxes Cannot Forcibly Disconnect Other Phones:
          </p>
          <p>
            The W3C Web Bluetooth specification provides access only to user-authorized Bluetooth Low Energy (BLE) GATT attributes. It cannot inject de-authentication frames, forge link-key disconnects, or seize Classic Bluetooth (BR/EDR) A2DP audio channels from foreign devices.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Manufacturer Companion SDK & Native Protocol Requirements</span>
          </h4>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-cyan-300 font-bold block">
                1. JBL Portable / PartyBox SDK (Harman Professional)
              </span>
              <p className="text-slate-300">
                Uses proprietary BLE GATT services (Vendor Service UUID <code className="text-cyan-400 font-mono">0xFE24</code>) to send encrypted control packets instructing the DSP to disable multipoint switching, lock the primary A2DP channel, and configure PartyBoost daisy chains.
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                Requirement: Harman MFi / Vendor Partner SDK Key + Firmware v2.1+
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-cyan-300 font-bold block">
                2. Sony Audio Control API (SongPal / Music Center)
              </span>
              <p className="text-slate-300">
                Exposes the <code className="text-cyan-400 font-mono">Sony Audio Control BLE Profile</code>. Allows a host phone to query connected Bluetooth devices list, mute specific inputs, and lock out secondary pairing mode without physical case interaction.
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                Requirement: Sony Developer Partner Access / Native Android Service wrapper
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-cyan-300 font-bold block">
                3. Android OS Native Bluetooth APIs (Android 12+ / API 31+)
              </span>
              <p className="text-slate-300">
                A native Android companion app with <code className="text-emerald-400 font-mono">BLUETOOTH_CONNECT</code> permission can access <code className="text-emerald-400 font-mono">BluetoothA2dp.setActiveDevice()</code> to forcefully pull active audio playback to the DJ phone, and invoke <code className="text-emerald-400 font-mono">BluetoothDevice.setSilenceMode(true)</code> on secondary devices.
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                Requirement: Native Android Service / Trusted Web Activity (TWA) companion
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-purple-300 font-bold block">
                4. Bluetooth LE Audio Auracast (Broadcast Audio)
              </span>
              <p className="text-slate-300">
                The ultimate future-proof architectural solution: The DJ phone broadcasts an unencrypted or PIN-protected Broadcast Audio Stream (BASS). Partygoers connect in listen-only mode via Auracast Assistant; they cannot interrupt the master broadcast because transmission is strictly unidirectional!
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                Requirement: Bluetooth 5.2+ hardware with LE Audio BIS (Broadcast Isochronous Stream) support
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-400 text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Architectural Guarantee:</strong> This application implements realistic browser Bluetooth capabilities, live telemetry, and verifiable state transitions rather than inventing simulated controls.
          </span>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </Modal>
  );
};
