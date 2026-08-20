// src/components/security/SecurityThreatModal.tsx
import React from 'react';
import { ShieldAlert, AlertTriangle, XCircle, Lock } from 'lucide-react';
import { terminateAppDueToTampering } from '../../security/rasp';

interface SecurityThreatModalProps {
  isOpen: boolean;
  threats: string[];
  onDismiss?: () => void;
}

export const SecurityThreatModal: React.FC<SecurityThreatModalProps> = ({
  isOpen,
  threats,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1E3D] text-white border-2 border-rose-600 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-rose-400 block">
              RASP Security Alert
            </span>
            <h3 className="text-lg font-black text-white">Device Integrity Warning</h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          RouTripO's anti-tamper security engine has detected potential system modification or instrumentation tools running in this environment:
        </p>

        <div className="bg-[#071527] p-3.5 rounded-2xl border border-rose-500/30 space-y-2">
          {threats.map((threat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{threat}</span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-white/5 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Payment transactions and sensitive bookings are locked for your security.</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => terminateAppDueToTampering(threats[0] || 'Integrity Violation')}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <XCircle className="w-4 h-4" />
            <span>Exit Application</span>
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Continue Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
