import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LANGUAGE_OPTIONS = [
  { code: 'mr', label: 'मराठी', vibe: 'गावठी मोड 🚩', flag: '🚩' },
  { code: 'en', label: 'English', vibe: 'Nawab Mode 🎩', flag: '🎩' },
  { code: 'hi', label: 'हिंदी', vibe: 'भाईगिरी मोड 💪', flag: '💪' },
  { code: 'gu', label: 'ગુજરાતી', vibe: 'Bapu Mode 👓', flag: '👓' },
  { code: 'ta', label: 'தமிழ்', vibe: 'Thalaiva Mode 🕶️', flag: '🕶️' },
  { code: 'te', label: 'తెలుగు', vibe: 'Mass Mode ⚡', flag: '⚡' },
  { code: 'kn', label: 'ಕನ್ನಡ', vibe: 'Boss Mode 👑', flag: '👑' },
  { code: 'bn', label: 'বাংলা', vibe: 'Roshogolla Mode 🍯', flag: '🍯' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', vibe: 'Swagger Mode 👳', flag: '👳' },
  { code: 'ml', label: 'മലയാളം', vibe: 'Mallu Mode 🌴', flag: '🌴' },
  { code: 'es', label: 'Español', vibe: 'Amigo Mode 🌮', flag: '🌮' },
  { code: 'fr', label: 'Français', vibe: 'Oui Oui Mode 🥖', flag: '🥖' },
  { code: 'de', label: 'Deutsch', vibe: 'Pro Mode 🍺', flag: '🍺' },
  { code: 'ja', label: '日本語', vibe: 'Anime Mode 🥷', flag: '🥷' },
];

export const QuirkyLanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl px-2.5 py-1 transition-all active:scale-95 shadow-2xs">
        <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0 mr-1.5" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-transparent text-[11px] font-black text-slate-800 outline-none cursor-pointer appearance-none pr-3"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label} ({opt.vibe})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-1.5 text-[9px] text-slate-500 font-bold">
          ▼
        </div>
      </div>
    </div>
  );
};
