import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, Check, ArrowRight, Lock, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { createPortal } from 'react-dom';

interface IntentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (tokenInvoiceId: string) => void;
  dailyFreeUsed: number;
  lang?: string;
}

export const IntentPaymentModal: React.FC<IntentPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  dailyFreeUsed = 2,
  lang = 'en'
}) => {
  const isMr = lang === 'mr';
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  const baseFee = 29.00;
  const gstRate = 0.18;
  const gstAmount = Number((baseFee * gstRate).toFixed(2));
  const totalAmount = Number((baseFee + gstAmount).toFixed(2));

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const invoiceRef = `INV-TOKEN-${Math.floor(100000 + Math.random() * 900000)}`;
      onPaymentSuccess(invoiceRef);
    }, 1200);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="premium-card max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[20px] bg-[var(--premium-pink)]/10 text-premium-pink flex items-center justify-center font-black">
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isMr ? "उच्च-हेतू बोली टोकन" : "High-Intent Bid Token"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isMr ? "दैनिक २ विनामूल्य विनंत्या वापरल्या गेल्या आहेत" : `Daily Free Quota: ${dailyFreeUsed}/2 Used`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase bg-premium-sky-soft text-premium-sky-deep px-2 py-0.5 rounded-full">
              100% Refundable
            </span>
          </div>

          {/* Refundable Notice Banner */}
          <div className="p-3.5 bg-premium-sky-soft border border-premium-sky-deep rounded-[20px] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-premium-sky-deep">
              <ShieldCheck className="w-4 h-4 text-premium-sky-deep shrink-0" />
              <span>{isMr ? "१००% बुकिंग रकमेतून वजा होईल!" : "100% Adjusted in Final Booking!"}</span>
            </div>
            <p className="text-[11px] text-premium-sky-deep/80 leading-relaxed font-medium">
              {isMr 
                ? "कोणत्याही हॉटेल/कॅबचा सौदा निश्चित करताच हे ₹२९/- थेट तुमच्या अंतिम बिलातून कमी केले जातील."
                : "This ₹29 token confirms your genuine request and is automatically deducted from your final checkout amount."}
            </p>
          </div>

          {/* Price Breakdown with GST */}
          <div className="bg-transparent rounded-[20px] p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{isMr ? "बोली शोध शुल्क (Base Token)" : "Search Request Token"}</span>
              <span className="font-bold text-slate-900">₹{baseFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>GST (18% Statutory Tax)</span>
              <span className="font-bold text-slate-900">₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
              <span>{isMr ? "एकूण देय रक्कम" : "Total Payable"}</span>
              <span className="text-base text-premium-sky-deep">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {isMr ? "पेमेंट पर्याय निवडा:" : "Select Payment Mode:"}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI / GPay' },
                { id: 'CARD', label: 'Debit/Credit' },
                { id: 'NETBANKING', label: 'NetBanking' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedGateway(m.id as any)}
                  className={`py-2 px-2 rounded-[16px] text-xs font-bold text-center border transition-all cursor-pointer ${
                    selectedGateway === m.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-transparent'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-[20px] text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
            >
              {isMr ? "रद्द करा" : "Cancel"}
            </button>

            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="flex-2 py-3 bg-[#1A365D] hover:bg-[#2A4A7F] text-white rounded-[20px] text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isMr ? "प्रक्रिया सुरू आहे..." : "Processing Token..."}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isMr ? `₹${totalAmount} भरा आणि विनंती पाठवा` : `Pay ₹${totalAmount} & Post Bid`}</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              🔒 256-Bit Encrypted Payment • GST Invoice Generated Instantly
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
