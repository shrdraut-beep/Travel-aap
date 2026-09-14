import React, { useState, useEffect } from 'react';
import { Wallet, Check, Sparkles } from 'lucide-react';
import { WalletService } from '../../services/WalletService';

export interface WalletPaymentOptionProps {
  currentTotal: number;
  useWallet: boolean;
  onToggle: (use: boolean) => void;
}

export const WalletPaymentOption: React.FC<WalletPaymentOptionProps> = ({
  currentTotal,
  useWallet,
  onToggle
}) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setBalance(WalletService.getBalance());
  }, []);

  if (balance <= 0) return null;

  const maxUsable = Math.min(balance, currentTotal);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>RoutTripo Travel Wallet</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                INSTANT USE
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Available Loyalty & Refund Balance: <strong className="text-slate-800 font-extrabold">₹{balance.toLocaleString('en-IN')}</strong></p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggle(!useWallet)}
        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
          useWallet
            ? 'bg-violet-50/80 border-violet-300 ring-2 ring-violet-500/20 shadow-2xs'
            : 'bg-slate-50/60 border-slate-200 hover:border-violet-200 hover:bg-violet-50/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
              useWallet ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300 bg-white'
            }`}
          >
            {useWallet && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-900 block">
              Redeem ₹{maxUsable.toLocaleString('en-IN')} from RoutTripo Wallet
            </span>
            <span className="text-[11px] text-slate-500">
              Remaining balance of ₹{(balance - maxUsable).toLocaleString('en-IN')} will remain safe in your wallet.
            </span>
          </div>
        </div>

        {useWallet && (
          <span className="text-xs font-black text-violet-700 bg-violet-100/70 px-2.5 py-1 rounded-xl shrink-0">
            -₹{maxUsable.toLocaleString('en-IN')}
          </span>
        )}
      </button>
    </div>
  );
};
