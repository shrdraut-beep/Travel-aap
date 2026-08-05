import { safeStorage } from '../utils/storage';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

export type Language = 'en' | 'mr' | 'hi' | 'gu' | 'ta' | 'te' | 'kn' | 'bn' | 'pa' | 'ml' | 'es' | 'fr' | 'de' | 'ja' | string;

interface LanguageContextType {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  setLang: (lang: Language) => void;
  currentAppLanguage: string;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_NAMES: Record<string, string> = {
  mr: 'मराठी (गावठी मोड 🚩)',
  en: 'English (Nawab Mode 🎩)',
  hi: 'हिंदी (भाईगिरी मोड 💪)',
  gu: 'ગુજરાતી (Bapu Mode 👓)',
  ta: 'தமிழ் (Thalaiva Mode 🕶️)',
  te: 'తెలుగు (Mass Mode ⚡)',
  kn: 'ಕನ್ನಡ (Boss Mode 👑)',
  bn: 'বাংলা (Roshogolla Mode 🍯)',
  pa: 'ਪੰਜਾਬੀ (Swagger Mode 👳)',
  ml: 'മലയാളം (Mallu Mode 🌴)',
  or: 'ଓଡ଼ିଆ (Utkala Mode 🛕)',
  as: 'অসমীয়া (Bihu Mode 🪕)',
  ur: 'اردو (Tehzeeb Mode 📜)',
  es: 'Español (Amigo Mode 🌮)',
  fr: 'Français (Oui Oui Mode 🥖)',
  de: 'Deutsch (Pro Mode 🍺)',
  ja: '日本語 (Anime Mode 🥷)',
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pravas_language') as Language) || 'mr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pravas_language', lang);
    localStorage.setItem('pravas_language_selected', 'true');
  };

  const currentAppLanguage = LANGUAGE_NAMES[language] || 'Marathi';

  const t = (key: string): string => {
    if (!key) return '';
    const dict = (translations as any)[language];
    if (dict && dict[key] !== undefined) return dict[key];

    // Fallback order: English -> Marathi -> Cleaned Key string
    const enVal = (translations as any)['en']?.[key];
    if (enVal !== undefined) return enVal;

    const mrVal = (translations as any)['mr']?.[key];
    if (mrVal !== undefined) return mrVal;

    // Clean up raw developer keys (e.g. BOOKINGSTAB -> Bookings, memoriesTab -> Memories)
    let cleaned = key.replace(/(Tab|Key|_TAB|_KEY)$/i, '');
    cleaned = cleaned.replace(/([A-Z])/g, ' $1').trim();
    if (cleaned.length > 0) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        lang: language, 
        setLanguage, 
        setLang: setLanguage, 
        currentAppLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

