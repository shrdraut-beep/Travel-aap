import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { BookingItemPayload } from '../../pages/CheckoutPage';

interface OrderReviewPageProps {
  item: BookingItemPayload;
  grandTotal: number;
  onProceed: () => void;
  onCancel: () => void;
}

export const OrderReviewPage: React.FC<OrderReviewPageProps> = ({ item, grandTotal, onProceed, onCancel }) => {
  const [consents, setConsents] = useState({ terms: false, privacy: false, refund: false });
  const [error, setError] = useState<string | null>(null);

  const allChecked = consents.terms && consents.privacy && consents.refund;

  const handleProceed = () => {
    if (!allChecked) {
      setError("You must accept all terms and policies to proceed with the booking.");
      return;
    }
    setError(null);
    onProceed();
  };

  return (
    <motion.div 
      className="h-screen bg-transparent flex flex-col "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between">
        <span className="font-bold text-lg text-slate-800">Order Review & Legal Consent</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-200">
          <h2 className="font-black text-slate-900 mb-4">Booking Summary</h2>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">{item.title}</span>
            <span className="font-bold text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-200 space-y-4">
          <h2 className="font-black text-slate-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            Mandatory Consents
          </h2>
          {([
            { key: 'terms', label: 'I accept the Terms & Conditions.' },
            { key: 'privacy', label: 'I accept the Privacy Policy.' },
            { key: 'refund', label: 'I have read and agree to the strict Refund & Cancellation Policy.' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents[key]}
                onChange={(e) => setConsents(prev => ({ ...prev, [key]: e.target.checked }))}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-[16px] border border-red-200 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 font-bold text-slate-700 hover:bg-slate-100 rounded-[16px] transition-colors"
        >
          Cancel Order
        </button>
        <button
          onClick={handleProceed}
          className="flex-1 py-3 font-bold bg-sky-600 text-white hover:bg-sky-700 rounded-[16px] transition-colors shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-sky-200"
        >
          Proceed to Pay securely
        </button>
      </div>
    </motion.div>
  );
};
