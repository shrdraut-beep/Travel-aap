import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Check, Search, Bot } from 'lucide-react';
import { parseExpenseNotification } from '../../utils/expenseParser';
import { Expense } from '../../types';

interface SmartExpenseScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDetectedExpense: (expense: Partial<Expense>) => void;
  lang: string;
  themeColor: string;
}

export const SmartExpenseScannerModal: React.FC<SmartExpenseScannerModalProps> = ({ 
  isOpen, onClose, onAddDetectedExpense, lang, themeColor 
}) => {
  const [text, setText] = useState('');
  const [detected, setDetected] = useState<any>(null);

  const handleScan = () => {
    // In a real mobile app, this text would come directly from the Notification Listener service.
    const result = parseExpenseNotification(text, ['pune', 'mumbai', 'goa', 'hotel', 'flight']);
    if (result.amount && result.isPayment) {
      setDetected(result);
    } else {
      alert(lang === 'mr' ? 'कोणताही खर्च आढळला नाही!' : 'No expense detected in text!');
    }
  };

  const handleSimulate = () => {
    setText("Paid ₹850 for Hotel Booking via GPay");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="p-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-[20px]" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {lang === 'mr' ? 'स्मार्ट SMS स्कॅनर' : 'Smart SMS Scanner'}
              </h2>
              <p className="text-sm text-slate-500">
                {lang === 'mr' ? 'नोटिफिकेशनमधून खर्च शोधा' : 'Detect expenses from notifications'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {lang === 'mr' ? 'SMS किंवा नोटिफिकेशन पेस्ट करा:' : 'Paste SMS or Notification:'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Paid ₹500 to Swiggy via GPay"
                className="w-full h-24 p-3 rounded-[16px] border-2 border-slate-200 focus:border-premium-violet focus:ring-0 resize-none font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSimulate}
                className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-[16px] text-xs uppercase tracking-wider hover:bg-slate-200"
              >
                {lang === 'mr' ? 'उदा. तपासा' : 'Try Example'}
              </button>
              <button
                onClick={handleScan}
                className="flex-[2] py-2 text-white font-bold rounded-[16px] text-xs uppercase tracking-wider shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] active:scale-95 transition-all"
                style={{ backgroundColor: themeColor }}
              >
                {lang === 'mr' ? 'स्कॅन करा' : 'Scan'}
              </button>
            </div>

            <AnimatePresence>
              {detected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 rounded-[20px] border-2 border-pink-500/20 bg-pink-50"
                >
                  <p className="text-sm font-bold text-pink-800 mb-3">
                    {lang === 'mr' 
                      ? `प्रवासाचा खर्च ₹${detected.amount} आढळला. बजेटमध्ये जोडू का?` 
                      : `Travel expense of ₹${detected.amount} detected. Add to trip budget?`}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetected(null)}
                      className="flex-1 py-2 bg-white text-slate-600 border border-slate-200 font-bold rounded-[16px] text-xs uppercase hover:bg-transparent"
                    >
                      {lang === 'mr' ? 'नको' : 'Ignore'}
                    </button>
                    <button
                      onClick={() => {
                        onAddDetectedExpense({
                          amount: detected.amount,
                          title: text.substring(0, 30) + '...',
                          category: detected.suggestedCategory as any,
                          date: new Date().toISOString()
                        });
                        onClose();
                      }}
                      className="flex-1 py-2 bg-pink-600 text-white font-bold rounded-[16px] text-xs uppercase shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] hover:bg-pink-700"
                    >
                      {lang === 'mr' ? 'हो, जोडा' : 'Yes, Add'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
