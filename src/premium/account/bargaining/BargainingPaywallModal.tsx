import { SubPageHeader } from "../ui";
import React, { useState } from 'react';
import { Lock, Sparkles, ShieldCheck, Zap, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { initiateBargainMicroPayment } from '../../../utils/razorpay';
import {
  unlockAdditionalBiddingRequest,
  getCustomBiddingRateLimit,
  formatBiddingResetCountdown
} from './BargainingRateLimiter';

interface BargainingPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const BargainingPaywallModal: React.FC<BargainingPaywallModalProps> = ({
  isOpen,
  onClose,
  onUnlocked
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const state = getCustomBiddingRateLimit();

  if (!isOpen) return null;

  const handlePayUnlock = async () => {
    setLoading(true);
    initiateBargainMicroPayment(
      29,
      'custom_trip_unlock',
      (response) => {
        setLoading(false);
        setPaymentDone(true);
        unlockAdditionalBiddingRequest();
        setTimeout(() => {
          setPaymentDone(false);
          onUnlocked();
          onClose();
        }, 1200);
      },
      (error) => {
        setLoading(false);
        alert(typeof error === 'string' ? error : 'Payment was not completed. Please retry.');
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Unified Brand Ocean SubPageHeader with Curved Bottom */}
        <SubPageHeader
          title="Daily Limit Reached"
          subtitle="Pay ₹29 to submit another custom offer"
          badge="24-Hour Limit"
          onClose={onClose}
        />

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {paymentDone ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-[16px] font-black text-slate-900">Payment Successful!</h4>
              <p className="text-[12px] text-slate-500">
                1 Additional Custom Offer unlocked. Redirecting to submission...
              </p>
            </div>
          ) : (
            <>
              {/* Reset Timer Info */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Free Quota Naturally Resets In:</span>
                <span className="font-mono font-black text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  {formatBiddingResetCountdown(state.resetTimestamp)}
                </span>
              </div>

              {/* What is included */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Unlocked Offer Benefits:
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Zap className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span><strong>Instant Operator Broadcast:</strong> Dispatches your offer to 20+ verified transport & hotel vendors.</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    <span><strong>100% Escrow Protected:</strong> Guaranteed zero hidden surcharges and sealed sealed pricing.</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Sparkles className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    <span><strong>Live 15-Minute Auction:</strong> Watch local operators outbid each other in real-time.</span>
                  </div>
                </div>
              </div>

              {/* Price Row & Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Micro-transaction Fee</span>
                  <span className="text-[20px] font-black text-slate-900 font-mono">₹29</span>
                  <span className="text-[10px] text-slate-500 ml-1">incl. taxes</span>
                </div>

                <button
                  type="button"
                  onClick={handlePayUnlock}
                  disabled={loading}
                  className="px-5 py-3 rounded-2xl premium-gradient-pink hover:opacity-95 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Opening Razorpay...</span>
                  ) : (
                    <>
                      <span>Pay ₹29 & Submit Offer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400 pt-1">
                Secured via Razorpay 256-bit encryption · Immediate unlock
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
