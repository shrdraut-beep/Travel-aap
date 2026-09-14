import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  QrCode,
  Copy,
  Check,
  Phone,
  Calendar,
  MapPin,
  Car,
  Hotel,
  Package,
  CreditCard,
  Lock,
  Sparkles,
  Printer,
  Download,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { BargainingTrip, VendorBidOffer } from './types';

interface AcceptLockFlowViewProps {
  trip: BargainingTrip;
  offer: VendorBidOffer;
  onBack: () => void;
  onComplete: () => void;
}

export const AcceptLockFlowView: React.FC<AcceptLockFlowViewProps> = ({
  trip,
  offer,
  onBack,
  onComplete
}) => {
  const [step, setStep] = useState<'compare' | 'payment' | 'confirmed'>('compare');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Generated Contract & Security OTP
  const contractId = `CON-${trip.id.replace('REQ-', '')}-${offer.id.replace('BID-', '')}`;
  const checkInOtp = '8429'; // 4-digit mutual handshake PIN
  const completionOtp = '5519';

  const handleProceedToPayment = () => {
    if (!agreeTerms) return;
    setStep('payment');
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('confirmed');
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={step === 'confirmed' ? onComplete : onBack}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[15px] font-black text-slate-900">
                {step === 'compare' && 'Demand vs. Offer Comparison'}
                {step === 'payment' && 'Secure Escrow Payment'}
                {step === 'confirmed' && 'Deal Locked & Voucher Generated'}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {step === 'confirmed' ? offer.realAgencyName : offer.maskedPartnerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
            <span>Escrow Protected</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* STEP 1: COMPARISON (Requirement 5: Vendor Offer vs User Demand - Unfulfilled = RED, Fulfilled = GREEN) */}
        {step === 'compare' && (
          <div className="space-y-4">
            {/* Header Info */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                    Target: ₹{trip.targetBudget.toLocaleString('en-IN')}
                  </span>
                  <h2 className="text-[18px] font-black text-slate-900 mt-1">
                    {offer.vehicleOrRoomTitle}
                  </h2>
                  <p className="text-[12px] text-slate-500 font-medium">
                    Offered by <span className="font-bold text-slate-800">{offer.maskedPartnerName}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Locked Quote
                  </p>
                  <p className="text-[22px] font-black text-pink-600 tracking-tight">
                    ₹{offer.totalPrice.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    All-inclusive (GST & Tolls)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-[12px] text-slate-700 font-medium">
                <span>📍 {trip.route}</span>
                <span>📅 {trip.dates}</span>
              </div>
            </div>

            {/* Requirement 5: Comparison Matrix (Unfulfilled = RED, Fulfilled = GREEN) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-[14px] font-black text-slate-900">
                  Demand vs. Offer Verification
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  {offer.fulfilledInclusions.length} Fulfilled · {offer.unfulfilledInclusions.length} Unfulfilled
                </span>
              </div>

              <div className="space-y-2">
                {trip.demands.map(demand => {
                  const isFulfilled = offer.fulfilledInclusions.includes(demand.name);

                  return (
                    <div
                      key={demand.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isFulfilled
                          ? 'bg-pink-50/70 border-pink-300/80 text-pink-950'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="mt-0.5 shrink-0">
                          {isFulfilled ? (
                            <CheckCircle2 className="w-5 h-5 text-pink-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-400" />
                          )}
                        </span>
                        <div>
                          <p className="text-[13px] font-black tracking-tight leading-snug">
                            {demand.name}
                          </p>
                          <p className="text-[11px] mt-0.5 font-medium opacity-80">
                            {isFulfilled
                              ? 'Fulfilled by vendor quote at no extra cost'
                              : 'Unfulfilled — Excluded or requires separate surcharge'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isFulfilled
                            ? 'bg-pink-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isFulfilled ? 'FULFILLED' : 'UNFULFILLED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms & Conditions Checkbox (Requirement 5) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded-md text-pink-600 focus:ring-pink-500 border-slate-300"
                />
                <div className="text-[12px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-900">
                    I accept the RoutTripo 100% Escrow Protection Terms & Conditions.
                  </span>{' '}
                  Payment is held securely in escrow and only released to the vendor upon successful trip
                  verification via mutual OTP handshake. Free cancellation policy: {offer.cancellationPolicy}
                </div>
              </label>

              <button
                type="button"
                disabled={!agreeTerms}
                onClick={handleProceedToPayment}
                className={`w-full h-12 rounded-2xl font-black text-[14px] shadow-md flex items-center justify-center gap-2 transition-all ${
                  agreeTerms
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg active:scale-98 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Continue to Escrow Payment (₹{offer.totalPrice.toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT (Requirement 5) */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-[16px] font-black text-slate-900">
                    Escrow Security Deposit
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    Funds remain protected until you verify the pickup OTP
                  </p>
                </div>
                <span className="text-[20px] font-black text-pink-600">
                  ₹{offer.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Payment Option
                </label>
                {[
                  { id: 'upi', label: 'Instant UPI (Google Pay, PhonePe, Paytm, BHIM)', fee: 'Free' },
                  { id: 'card', label: 'Credit / Debit Card (Visa, Mastercard, RuPay)', fee: 'Free' },
                  { id: 'netbanking', label: 'Net Banking (All Major Indian Banks)', fee: 'Free' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === opt.id
                        ? 'border-pink-500 bg-pink-50/50 text-pink-950 font-bold ring-2 ring-pink-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-pink-600" />
                      <span className="text-[13px]">{opt.label}</span>
                    </div>
                    <span className="text-[11px] text-pink-600 font-bold">{opt.fee}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-2.5 text-[11px] text-sky-900 font-medium">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>RoutTripo SafeLock Promise:</strong> If the vehicle or room does not match the
                  specs confirmed here, get a 100% immediate escrow refund with our one-click guarantee.
                </span>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecutePayment}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-[14px] shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Locking Escrow & Securing Deal...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{offer.totalPrice.toLocaleString('en-IN')} & Lock Deal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMED VOUCHER & OTP DISPLAY (Requirement 5) */}
        {step === 'confirmed' && (
          <div className="space-y-4">
            {/* Voucher Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-pink-500 shadow-xl space-y-4 text-center">
              <div className="inline-flex p-3 rounded-full bg-pink-100 text-pink-600">
                <CheckCircle2 className="w-8 h-8 stroke-3" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-pink-700 bg-pink-50 px-3 py-1 rounded-full">
                  Deal Locked · Contract Active
                </span>
                <h2 className="text-[20px] font-black text-slate-900 mt-2">
                  Trip Confirmed & Escrow Held
                </h2>
                <p className="text-[12px] text-slate-500 font-mono mt-1">
                  Contract ID: {contractId}
                </p>
              </div>

              {/* Requirement 5: Mutual Handshake PIN / OTP Display */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 text-center space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                  Your Mutual Handshake Check-In / Pickup PIN
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-[32px] font-black tracking-widest text-slate-950 bg-white px-5 py-1.5 rounded-2xl border border-amber-300 shadow-inner">
                    {checkInOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(checkInOtp)}
                    className="p-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors"
                    title="Copy PIN"
                  >
                    {copiedOtp ? <Check className="w-5 h-5 text-pink-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 font-medium max-w-xs mx-auto">
                  Share this 4-digit PIN with the driver / hotel front desk <strong>only when you arrive</strong> to verify handover!
                </p>
              </div>

              {/* Requirement 9: Real Vendor Details UNMASKED post-payment */}
              <div className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Verified Vendor Details (Unlocked)
                  </span>
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
                    Direct Contact Active
                  </span>
                </div>
                <p className="text-[15px] font-black text-slate-900">
                  {offer.realAgencyName}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-pink-600" />
                      <span>{offer.realPhone}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ✉️ {offer.realEmail}
                    </p>
                  </div>
                  <a
                    href={`tel:${offer.realPhone}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-bold shadow-xs hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>
              </div>

              {/* Voucher Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onComplete}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-sky-600 to-pink-600 text-white font-black text-[13px] shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Return to Bargaining</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
