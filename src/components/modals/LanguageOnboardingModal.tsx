import { ScrollView } from '../ScrollView';
import { safeStorage } from '../../utils/storage';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Compass as  Compass, Navigation } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { createPortal } from 'react-dom';

export const LANGUAGE_LIST = [
  { code: 'mr', name: 'मराठी', vibe: 'गावठी मोड 🚩', flag: '🚩' },
  { code: 'en', name: 'English', vibe: 'Nawab Mode 🎩', flag: '🎩' },
  { code: 'hi', name: 'हिंदी', vibe: 'भाईगिरी मोड 💪', flag: '💪' },
  { code: 'gu', name: 'ગુજરાતી', vibe: 'Bapu Mode 👓', flag: '👓' },
  { code: 'ta', name: 'தமிழ்', vibe: 'Thalaiva Mode 🕶️', flag: '🕶️' },
  { code: 'te', name: 'తెలుగు', vibe: 'Mass Mode ⚡', flag: '⚡' },
  { code: 'kn', name: 'ಕನ್ನಡ', vibe: 'Boss Mode 👑', flag: '👑' },
  { code: 'bn', name: 'বাংলা', vibe: 'Roshogolla Mode 🍯', flag: '🍯' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', vibe: 'Swagger Mode 👳', flag: '👳' },
  { code: 'ml', name: 'മലയാളം', vibe: 'Mallu Mode 🌴', flag: '🌴' },
  { code: 'or', name: 'ଓଡ଼ିଆ', vibe: 'Utkala Mode 🛕', flag: '🛕' },
  { code: 'as', name: 'অসমীয়া', vibe: 'Bihu Mode 🪕', flag: '🪕' },
  { code: 'ur', name: 'اردو', vibe: 'Tehzeeb Mode 📜', flag: '📜' },
  { code: 'es', name: 'Español', vibe: 'Amigo Mode 🌮', flag: '🌮' },
  { code: 'fr', name: 'Français', vibe: 'Oui Oui Mode 🥖', flag: '🥖' },
  { code: 'de', name: 'Deutsch', vibe: 'Pro Mode 🍺', flag: '🍺' },
  { code: 'ja', name: '日本語', vibe: 'Anime Mode 🥷', flag: '🥷' },
];

interface LanguageOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageOnboardingModal: React.FC<LanguageOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { lang, setLang } = useLanguage();
  const [selected, setSelected] = useState<string>(lang || 'mr');

  if (!isOpen) return null;

  const handleConfirm = () => {
    setLang(selected);
    localStorage.setItem('routripo_language_selected', 'true');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="overflow-y-auto fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md    ">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl premium-card shadow-2xl overflow-hidden border border-premium-pink my-8 flex flex-col max-h-[85vh]"
        >
          {/* Header Banner */}
          <div className="relative premium-gradient-pink p-6 text-white text-center overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Globe className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                <Compass className="w-8 h-8 text-orange-100 animate-pulse" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-extrabold uppercase tracking-widest text-orange-100 mb-2">
                <span>🤖 Per-App Language Preferences</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
                राऊट्रिपो 🚩
              </h2>
              <p className="text-sm font-semibold text-orange-100 mt-1 max-w-md">
                सरकास्टिक व गावठी/स्ट्रीट-स्टाईल व्हॉईस मोड / Sarcastic & Street Voice Vibe
              </p>
            </div>
          </div>

          {/* Language Options Grid */}
          <div className="overflow-y-auto p-5 max-h-[60vh]  space-y-2   ">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              उपलब्ध भाषा / Available Languages (14+)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {LANGUAGE_LIST.map((item) => {
                const isSelected = selected === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => setSelected(item.code)}
                    className={`flex items-center justify-between p-3.5 rounded-[20px] border-2 transition-all text-left ${
                      isSelected
                        ? 'border-premium-pink bg-premium-pink-soft/80 text-[var(--premium-pink)] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] ring-2 ring-orange-500/20'
                        : 'border-slate-100 bg-transparent/60 hover:bg-slate-100/80 text-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <div className="font-extrabold text-sm leading-tight">{item.name}</div>
                        <div className="text-xs font-semibold text-premium-pink">{item.vibe}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[var(--premium-pink)] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-5 bg-transparent border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-500">
              {selected === 'mr' ? 'भाषा नंतर सेटिंग्जमधूनही बदलता येईल' : 'Can also be changed anytime from Settings'}
            </div>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 rounded-[20px] premium-gradient-pink text-white font-black text-sm shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>{selected === 'mr' ? 'प्रवास सुरू करा 🚀' : 'Start Journey 🚀'}</span>
              <Navigation className="w-4 h-4 fill-white/20" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
