import { ScrollView } from '../ScrollView';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../QuirkyLanguageSelector';

interface InitialLanguageModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const InitialLanguageModal: React.FC<InitialLanguageModalProps> = ({ isOpen, onContinue }) => {
  const { lang, setLang } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[28px] p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Globe className="w-8 h-8 text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Language</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Choose your preferred vibe before we begin!
                </p>
              </div>

              <div className="overflow-y-auto w-full space-y-2 max-h-[40vh]  pr-2 custom-scrollbar   ">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => setLang(opt.code)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                      lang === opt.code
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.flag}</span>
                      <div className="text-left">
                        <div className={`font-black ${lang === opt.code ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {opt.label}
                        </div>
                        <div className={`text-[10px] font-bold ${lang === opt.code ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {opt.vibe}
                        </div>
                      </div>
                    </div>
                    {lang === opt.code && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={onContinue}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
              >
                <span>Start Tour</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
