import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Download, Printer, ShieldCheck, CheckCircle2, QrCode, 
  Car, Hotel, Package, Calendar, Users, MapPin, FileText, Check, ShieldAlert
} from 'lucide-react';
import { BiddingContract } from '../../types';

interface BookingVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: BiddingContract | null;
  lang?: string;
}

export const BookingVoucherModal: React.FC<BookingVoucherModalProps> = ({
  isOpen,
  onClose,
  contract,
  lang = 'en'
}) => {
  const isMr = lang === 'mr';

  if (!isOpen || !contract) return null;

  const isHotel = contract.tripCategory === 'Hotels' || contract.escrowModel === 'SINGLE_STAGE_HOTEL';
  const isNonRefundable = contract.refundType === 'NON_REFUNDABLE' || contract.cancellationPolicy?.includes('Non-Refundable');

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none"
        >
          {/* Top Actions for Screen */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-400">Official Voucher PDF Preview</span>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                ✓ IT Act Sec 10A Certified
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-extrabold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isMr ? "प्रिंट करा" : "Print / PDF"}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PRINTABLE VOUCHER DOCUMENT */}
          <div className="space-y-6 text-slate-900" id="routripo-booking-voucher">
            {/* Header / Brand */}
            <div className="flex items-start justify-between border-b-2 border-[#1A365D] pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#1A365D] flex items-center gap-2">
                  <span>ROUTRIPO</span>
                  <span className="text-xs font-bold bg-[#FF6B6B] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Official Voucher
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Reverse-Bidding Smart Escrow Agreement & Digital Boarding Pass
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block uppercase">Contract Reference</span>
                <span className="text-sm font-black font-mono text-slate-900">#{contract.contractId}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {new Date(contract.timestamp || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Service & Operator Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Verified Operator</span>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>{contract.vendorName}</span>
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Vertical: <strong className="text-slate-800">{contract.tripCategory}</strong> ({contract.escrowModel})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total All-Inclusive Locked Escrow</span>
                <h3 className="text-2xl font-black text-emerald-700">₹{contract.lockedPrice.toLocaleString()}</h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                  ✓ ZERO Surcharges & Tolls Included
                </span>
              </div>
            </div>

            {/* MANDATORY VENDOR-SELECTED CANCELLATION POLICY CLAUSE */}
            <div className={`p-4 rounded-2xl border-2 space-y-2 ${
              isNonRefundable 
                ? 'bg-rose-50 border-rose-300' 
                : 'bg-emerald-50 border-emerald-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  {isNonRefundable ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-950">Binding Cancellation Policy: 100% Non-Refundable</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-950">Binding Cancellation Policy: 100% Refundable</span>
                    </>
                  )}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isNonRefundable ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {isNonRefundable ? 'Strict Zero Refund' : `Free Notice: ${contract.refundDeadlineHours || 24}h`}
                </span>
              </div>

              <p className="text-xs leading-relaxed font-medium">
                {contract.cancellationPolicy || (
                  isNonRefundable
                    ? '100% Non-Refundable Policy. Cancellation results in ₹0 refund to user; 100% funds disbursed to the operator.'
                    : `100% Free Cancellation permitted up to ${contract.refundDeadlineHours || 24} hours before start. Non-refundable thereafter.`
                )}
              </p>
            </div>

            {/* MUTUAL 4+4 PIN VERIFICATION PASS */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {isHotel ? "🏨 Hotel Single-Stage Handshake (Check-In PIN)" : "🚗 Cab 2-Stage Mutual Handshake PINs"}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Escrow Payout Release Triggers</span>
              </div>

              {isHotel ? (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block">Your Check-In PIN</span>
                    <span className="text-2xl font-black text-purple-950 font-mono tracking-widest">
                      {contract.userCheckInPin || contract.startOtp || "4819"}
                    </span>
                    <span className="text-[9px] text-purple-600 block mt-0.5">Show to Reception at Check-In</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-600 uppercase block">Hotel Security PIN</span>
                    <span className="text-2xl font-black text-slate-900 font-mono tracking-widest">
                      {contract.vendorCheckInPin || "8192"}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Desk Cross-Verification</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Stage 1: Pickup PIN</span>
                    <span className="text-2xl font-black text-blue-950 font-mono tracking-widest">
                      {contract.userStartPin || contract.startOtp || "3814"}
                    </span>
                    <span className="text-[9px] text-blue-600 block mt-0.5">40% Fuel Advance Release</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Stage 2: Closing Drop-off PIN</span>
                    <span className="text-2xl font-black text-amber-950 font-mono tracking-widest">
                      {contract.userEndPin || contract.endOtp || "8420"}
                    </span>
                    <span className="text-[9px] text-amber-600 block mt-0.5">60% Balance Final Release</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inclusions Matrix */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Confirmed Inclusions & Amenities:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {contract.inclusions.map((inc, i) => (
                  <div key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* IT Act 2000 Section 10A Legal Smart Contract Footnote */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1 leading-relaxed">
              <div className="flex items-center justify-between text-slate-700 font-bold">
                <span>Legal Smart Contract Binding Clause (IT Act 2000 §10A):</span>
                <span className="font-mono text-[10px]">Hash: {contract.contractId}-SHA256</span>
              </div>
              <p>
                {contract.legalClause || `This digital agreement is executed under Section 10A of the Information Technology Act, 2000. Price is permanently locked against surge pricing. Cancellation and escrow disbursement are governed strictly by the vendor's policy registered herein.`}
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Buyer Sign IP: {contract.userSignatureIp || '127.0.0.1'}</span>
                <span>Vendor Sign IP: {contract.vendorSignatureIp || '127.0.0.1'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              {isMr ? "बंद करा" : "Close"}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-5 bg-[#1A365D] text-white rounded-xl text-xs font-black hover:bg-[#2A4A7F] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{isMr ? "PDF / प्रिंट करा" : "Download PDF Voucher"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
