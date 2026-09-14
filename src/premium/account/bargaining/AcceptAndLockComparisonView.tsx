import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCheck,
  Key,
  Lock,
  Printer,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import { BargainingRequest, VendorBid } from './BargainingTypes';
import { generateDemandComparison } from './BargainingInventoryData';

interface AcceptAndLockComparisonViewProps {
  request: BargainingRequest;
  bid: VendorBid;
  onBack: () => void;
  onPaymentSuccess: (confirmedBid: VendorBid) => void;
  lang?: string;
}

export const AcceptAndLockComparisonView: React.FC<AcceptAndLockComparisonViewProps> = ({
  request,
  bid,
  onBack,
  onPaymentSuccess,
  lang = 'en'
}) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [phase, setPhase] = useState<'compare' | 'payment' | 'confirmed'>('compare');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Generate comparison items (Fulfilled = Green, Unfulfilled = Red)
  const comparisonItems = generateDemandComparison(request.userDemands, bid);

  // Fixed OTP / PINs for the mutual handshake
  const contractId = `CTR-${request.id.replace('REQ-', '')}-${Date.now().toString().slice(-4)}`;
  const startOtp = '8429';

  const handleStartPayment = () => {
    if (!hasAcceptedTerms) return;
    setPhase('payment');
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPhase('confirmed');
      onPaymentSuccess(bid);
    }, 1800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-bold text-[13px] px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{phase === 'confirmed' ? 'Done' : 'Back'}</span>
          </button>

          <div className="text-center min-w-0 flex-1">
            <h1 className="text-[15px] font-black text-slate-900 truncate">
              {phase === 'confirmed'
                ? 'Escrow Contract & Booking Voucher'
                : 'Demand vs. Offer Audit'}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 truncate">
              {request.id} · {bid.maskedName}
            </p>
          </div>

          <span className="shrink-0 text-[10px] font-black bg-pink-100 text-pink-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
            100% Escrow
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* PHASE 1: COMPARISON VIEW (Vendor Offer vs. User Demand) */}
        {phase === 'compare' && (
          <>
            {/* Guarantee Callout */}
            <div className="bg-gradient-to-r from-rose-900 to-pink-900 text-white p-4 rounded-3xl shadow-sm space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-300" />
                <h3 className="text-[14px] font-black text-white">
                  Pre-Lock Transparent Demand Audit
                </h3>
              </div>
              <p className="text-[12px] text-rose-100 leading-snug">
                Review what is included in this quote against your posted demands. Items highlighted in Pink are legally binding under the escrow contract.
              </p>
            </div>

            {/* Requirement 5: Dedicated comparison table (Unfulfilled = RED, Fulfilled = GREEN) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-500">
                <span>Your Demand</span>
                <span>Vendor Offer Status</span>
              </div>

              <div className="divide-y divide-slate-100">
                {comparisonItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 transition-colors ${
                      item.isFulfilled ? 'bg-rose-50/40' : 'bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {item.isFulfilled ? (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                              <X className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                          <p className="text-[13px] font-black text-slate-900 leading-tight">
                            {item.userDemand}
                          </p>
                        </div>
                        <p
                          className={`text-[12px] pl-6 font-medium ${
                            item.isFulfilled ? 'text-rose-800 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          {item.vendorOffer}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          item.isFulfilled
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {item.isFulfilled ? 'Fulfilled' : 'Unfulfilled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 shadow-xs">
              <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-wider text-slate-400">
                Financial Breakdown & Escrow Deposit
              </h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-slate-600">
                  <span>Vendor Service Base Rate:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{bid.basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Applicable GST / State Taxes (5%):</span>
                  <span className="font-semibold text-slate-800">
                    ₹{bid.taxes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>RoutTripo Escrow Guarantee Protection:</span>
                  <span className="font-bold text-rose-600">FREE (0% Surcharge)</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                  <span className="text-[14px] font-black text-slate-900">Total Escrow Amount:</span>
                  <span className="text-[22px] font-black text-rose-600">
                    ₹{bid.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Requirement 5: Terms & Conditions Checkbox */}
            <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAcceptedTerms}
                  onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-[12px] text-slate-700 font-medium leading-snug">
                  I agree to the <strong>Reverse-Bidding Smart Escrow Terms</strong>, Anti-Leakage
                  Rules, and Zero-Surcharge Guarantee. Funds will be held securely in escrow and only
                  released upon mutual handshake OTP exchange.
                </span>
              </label>
            </div>

            {/* Accept & Proceed to Payment Button */}
            <button
              type="button"
              disabled={!hasAcceptedTerms}
              onClick={handleStartPayment}
              className={`w-full py-4 rounded-2xl text-[15px] font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                hasAcceptedTerms
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Escrow Deposit (₹{bid.totalPrice.toLocaleString()})</span>
            </button>
          </>
        )}

        {/* PHASE 2: PAYMENT PROCESSING PAGE */}
        {phase === 'payment' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-[18px] font-black text-slate-900">Secure Escrow Checkout</h3>
              <p className="text-[12px] text-slate-500 max-w-sm mx-auto">
                Depositing ₹{bid.totalPrice.toLocaleString()} into Escrow Vault for trip #{request.id}.
                Amount is only disbursed to operator after trip validation.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Payment Channel
              </span>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center font-bold text-pink-700 text-xs">
                    UPI
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">Instant UPI / QR Code</p>
                    <p className="text-[11px] text-slate-400">GPay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleExecutePayment}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-[15px] rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locking Escrow & Securing Deal...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Authorize Deposit of ₹{bid.totalPrice.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* PHASE 3: CONFIRMED CONTRACT, VOUCHER & OTP DISPLAY (Requirement 5) */}
        {phase === 'confirmed' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Success Hero Banner */}
            <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-lg text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-[20px] font-black">Deal Locked in Escrow!</h2>
              <p className="text-[12px] text-rose-100 max-w-md mx-auto">
                Your booking is 100% confirmed. Real vendor details are now officially unmasked below.
              </p>
            </div>

            {/* Requirement 5 & 9: Real Vendor Details Unmasked + Contract Info */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Official Operator Assigned
                  </span>
                  <h3 className="text-[16px] font-black text-slate-900">{bid.realName}</h3>
                  <p className="text-[11px] text-rose-600 font-bold">
                    Formerly: {bid.maskedName} (Verified Partner)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    Contract ID
                  </span>
                  <span className="text-[13px] font-mono font-black text-slate-900">{contractId}</span>
                </div>
              </div>

              {/* Requirement: Mutual Handshake Security START OTP Only */}
              <div className="bg-gradient-to-r from-slate-900 to-pink-950 text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-orange-400" />
                    <span className="text-[12px] font-black uppercase tracking-wider text-orange-300">
                      Trip Start Security OTP
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                    Official Passcode
                  </span>
                </div>

                {/* Single START OTP Box */}
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-center max-w-sm mx-auto">
                  <span className="text-[11px] text-slate-300 font-medium block">
                    Your Trip Start / Pickup OTP
                  </span>
                  <span className="text-[36px] font-black tracking-widest text-orange-300 font-mono block my-1">
                    {startOtp}
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Share this 4-digit code with your verified operator/driver upon arrival to start the trip.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(`Trip Start OTP: ${startOtp}`)}
                  className="w-full py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-[12px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedOtp ? 'OTP Copied to Clipboard!' : 'Copy Start OTP'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="py-3 premium-gradient-pink hover:opacity-95 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Return to Offers</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
