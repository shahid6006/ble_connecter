import React from 'react';
import { Modal } from '../common/Modal';
import { NATIVE_BRIDGE_DOCUMENTATION } from '../../services/android/nativeBridgeDocs';
import { ShieldCheck, Layers, Terminal, AlertTriangle } from 'lucide-react';

interface NativeBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeBridgeModal: React.FC<NativeBridgeModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Native Android Companion Bridge Architecture"
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200">
          <p className="font-medium">{NATIVE_BRIDGE_DOCUMENTATION.summary}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Native Android Bluetooth Subsystems & Web Parity</span>
          </h4>
          <div className="space-y-2.5">
            {NATIVE_BRIDGE_DOCUMENTATION.keyAndroidComponents.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold">{item.component}</span>
                </div>
                <p className="text-slate-300">{item.purpose}</p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex flex-col gap-0.5">
                  <span className="font-mono text-emerald-400">Permissions: {item.requiredPermissions.join(', ')}</span>
                  <span className="text-amber-300/90">Web Context: {item.webParity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security, Privacy & Architectural Truths</span>
          </h4>
          <ul className="space-y-1.5 list-disc pl-4 text-slate-400 text-[11px]">
            {NATIVE_BRIDGE_DOCUMENTATION.securityAndPermissionTruths.map((truth, idx) => (
              <li key={idx} className="leading-relaxed">
                {truth}
              </li>
            ))}
          </ul>
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
