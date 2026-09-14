#!/bin/bash
mkdir -p src/locales

cat << 'JSON_EOF' > src/locales/en.json
{
  "translation": {
    "welcome": "Welcome to RouTripO",
    "search_flights": "Flights",
    "search_hotels": "Hotels",
    "search_buses": "Buses",
    "search_cabs": "Cabs",
    "search_holidays": "Holidays",
    "book_now": "Book Now",
    "language": "Language",
    "home": "Home",
    "trips": "My Trips",
    "explore": "Explore",
    "offers": "Offers",
    "wallet": "Wallet",
    "social": "Social",
    "account": "Account"
  }
}
JSON_EOF

cat << 'JSON_EOF' > src/locales/mr.json
{
  "translation": {
    "welcome": "RouTripO मध्ये आपले स्वागत आहे",
    "search_flights": "विमाने",
    "search_hotels": "हॉटेल्स",
    "search_buses": "बस",
    "search_cabs": "कॅब",
    "search_holidays": "सुट्ट्या",
    "book_now": "आत्ता बुक करा",
    "language": "भाषा",
    "home": "मुख्य पृष्ठ",
    "trips": "माझ्या ट्रिप्स",
    "explore": "एक्सप्लोर",
    "offers": "ऑफर",
    "wallet": "पाकीट",
    "social": "सोशल",
    "account": "खाते"
  }
}
JSON_EOF

cat << 'TS_EOF' > src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import mrTranslation from './locales/mr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { ...enTranslation },
      mr: { ...mrTranslation },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
TS_EOF

cat << 'TS_EOF' > src/components/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  return (
    <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1.5 shadow-sm border border-slate-200">
      <Globe className="w-4 h-4 text-slate-500" />
      <select 
        onChange={(e) => i18n.changeLanguage(e.target.value)} 
        value={i18n.language || 'en'}
        className="bg-transparent text-[13px] font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none pr-4"
        style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.1rem top 50%', backgroundSize: '0.65rem auto' }}
      >
        <option value="en">Eng</option>
        <option value="mr">मराठी</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
TS_EOF

# Modify main.tsx
sed -i 's/import \.\/index\.css;/import ".\/index.css";\nimport ".\/i18n";/' src/main.tsx

