import { ScrollView } from '../ScrollView';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Check, Lock, Shield, MapPin, Database, Award, Code, ChevronRight } from 'lucide-react';
import { privacyTranslations } from '../../data/privacyTranslations';

interface PrivacyAndCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export const PrivacyAndCreditsModal: React.FC<PrivacyAndCreditsModalProps> = ({ isOpen, onClose, lang }) => {
  // Use selected language or fallback to 'en'
  const t = privacyTranslations[lang] || privacyTranslations['en'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-6 pb-20 sm:pb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex-none p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {t.title}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-indigo-600 mt-1">
                  {t.effectiveDate}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto   p-5 sm:p-8 space-y-8 scrollbar-hide text-slate-700 bg-white  ">
            
            {/* Welcome */}
            <div className="text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {t.welcome}
            </div>

            {/* DPDPA 2023 Indian Legal Compliance Banner */}
            <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-black text-xs uppercase tracking-wider text-emerald-900">
                  {lang === 'mr' ? '🇮🇳 डीपीडीपीए २०२३ अनुपालन हमी' : lang === 'hi' ? '🇮🇳 डीपीडीपीए २०२३ अनुपालन गारंटी' : '🇮🇳 DPDPA 2023 Compliance Guarantee'}
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-emerald-900">
                {lang === 'mr' 
                  ? 'Routripo हे भारतीय युजर्सच्या वैयक्तिक डेटा संरक्षणासाठी "Digital Personal Data Protection Act, 2023 (DPDPA 2023)" च्या सर्व नियमांचे काटेकोरपणे पालन करते. आम्ही तुमच्या पूर्व-संमतीशिवाय (Explicit Consent) कोणताही वैयक्तिक डेटा साठवत किंवा प्रोसेस करत नाही, आणि युझरला त्याचा सर्व डेटा केव्हाही डिलीट (Erase) करण्याचा पूर्ण अधिकार देतो.'
                  : lang === 'hi'
                  ? 'Routripo भारतीय उपयोगकर्ताओं के व्यक्तिगत डेटा की सुरक्षा के लिए "Digital Personal Data Protection Act, 2023 (DPDPA 2023)" के सभी नियमों का कड़ाई से पालन करता है। हम आपकी पूर्व-सहमति (Explicit Consent) के बिना कोई व्यक्तिगत डेटा एकत्र या प्रोसेस नहीं करते हैं, और आपको अपना डेटा कभी भी हटाने (Erase) का पूर्ण अधिकार प्रदान करते हैं।'
                  : 'Routripo strictly complies with the Digital Personal Data Protection Act, 2023 (DPDPA 2023) of India. We do not process, store, or share any personal data without your explicit prior consent, and respect your right to seek complete erasure of your data at any time.'
                }
              </p>
            </div>

            {/* 1. Information We Collect */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                {t.h1}
              </h2>
              <p className="text-sm font-medium">{t.p1}</p>
              <ul className="space-y-2 text-sm pl-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{t.l1_1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{t.l1_2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{t.l1_3}</span>
                </li>
              </ul>
            </section>

            {/* 1. Age Eligibility */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                {t.h1}
              </h2>
              <p className="text-sm font-medium">{t.p1}</p>
              <ul className="space-y-2 text-sm pl-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{t.l1_1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{t.l1_2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{t.l1_3}</span>
                </li>
              </ul>
            </section>

            {/* 2. Zero-Trust Envelope Encryption & Security */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                {t.h2}
              </h2>
              <p className="text-sm font-medium">{t.p2}</p>
              <ul className="space-y-2 text-sm pl-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t.l2_1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t.l2_2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t.l2_3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t.l2_4}</span>
                </li>
              </ul>
            </section>

            {/* 3. Smart Expense & Kharch Manager Clauses */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {t.h3}
              </h2>
              <p className="text-sm font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">{t.p3}</p>
              <ul className="space-y-2 text-sm pl-2 mt-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.l3_1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.l3_2}</span>
                </li>
              </ul>
            </section>

            {/* 4. AI Planner & Booking Facilitation */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                {t.h4}
              </h2>
              <p className="text-sm font-medium">{t.p4}</p>
              <ul className="space-y-2 text-sm pl-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{t.l4_1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{t.l4_2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{t.l4_3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{t.l4_4}</span>
                </li>
              </ul>
            </section>

            {/* 5. Data Storage & Usage */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                {t.h5}
              </h2>
              <p className="text-sm font-medium">{t.p5}</p>
              <ul className="space-y-2 text-sm pl-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{t.l5_1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{t.l5_2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{t.l5_3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{t.l5_4}</span>
                </li>
              </ul>
            </section>

            {/* 6. Device Permissions */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" />
                {t.h6}
              </h2>
              <p className="text-sm font-medium">{t.p6}</p>
              <ul className="space-y-2 text-sm pl-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{t.l6_1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{t.l6_2}</span>
                </li>
              </ul>
            </section>

            {/* 7, 8, 9. Other Clauses */}
            <section className="space-y-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <h2 className="text-base font-black text-slate-900">{t.h7}</h2>
                <p className="text-sm font-medium">{t.p7}</p>
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-black text-slate-900">{t.h8}</h2>
                <p className="text-sm font-medium">{t.p8}</p>
                <ul className="space-y-2 text-sm pl-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t.l8_1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t.l8_2}</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-black text-slate-900">{t.h9}</h2>
                <p className="text-sm font-medium">{t.p9}</p>
              </div>
            </section>

            {/* 10. Contact Us */}
            <section className="space-y-3 pb-4">
              <h2 className="text-lg font-black text-slate-900">{t.h10}</h2>
              <p className="text-sm font-medium">{t.p10}</p>
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <span className="font-bold text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm inline-block">
                  {t.contactEmail}
                </span>
              </div>
            </section>
          </div>

          {/* Sticky Footer */}
          <div className="flex-none p-4 sm:p-5 bg-white border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {t.closeBtn}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
