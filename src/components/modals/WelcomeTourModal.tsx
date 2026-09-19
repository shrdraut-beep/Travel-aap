import { safeStorage } from '../../utils/storage';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullScreenPortal } from '../common/FullScreenPortal';
import { 
  Compass, 
  MapPin, 
  Receipt, 
  Music, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Compass as  
  ShieldCheck, 
  Users 
} from 'lucide-react';

interface WelcomeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ isOpen, onClose, lang }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isMr = lang === 'mr';

  useEffect(() => {
    // Check if user has already seen or skipped the tutorial
    const hasSeen = localStorage.getItem('hasSeenTutorial') === 'true';
    if (hasSeen && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);


  const handleCompleteOrSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    onClose();
  };

  const steps = [
    {
      title: isMr ? 'राऊट्रिपो मध्ये तुमचे स्वागत आहे! 🚩' : 'Welcome to Routripo! 🚩',
      subtitle: isMr ? 'सहलीचे नियोजन, मित्रांचे लाईव्ह लोकेशन आणि खर्चाचा हिशोब - सर्व एकाच जागी.' : 'All-in-one trip manager, live location tracking, and smart group expenses.',
      icon: Compass,
      color: 'premium-gradient-pink',
      badge: isMr ? '१००% मोफत व सुरक्षित' : '100% Free & Secure',
      highlights: [
        isMr ? 'कोणतेही लपलेले शुल्क नाही, फ्री OpenStreetMap' : 'Zero cost, powered by free OpenStreetMap & OSRM routing',
        isMr ? 'ऑफलाईन सपोर्ट - नेटवर्क नसतानाही हिशोब पहा व नोंदवा' : 'Offline Mode - Works seamlessly even without internet network',
        isMr ? 'मराठी, हिंदी आणि १४+ भाषांमध्ये सहलीची मजा' : 'Supports Marathi, Hindi, English and 14+ Regional Vibes'
      ]
    },
    {
      title: isMr ? 'दोस्त नक्शा (OpenStreetMap Live Location) 📍' : 'Dost Nakasha (Free OpenStreetMap Live Location) 📍',
      subtitle: isMr ? 'मित्रांचे लाईव्ह लोकेशन पाहा आणि OSRM सह ड्रायव्हिंग मार्ग आखा.' : 'Track friends in real-time and view driving routes powered by OSRM.',
      icon: MapPin,
      color: 'premium-gradient',
      badge: isMr ? 'मोफत लोकेशन ट्रॅकिंग' : 'Free Location Tracking',
      highlights: [
        isMr ? 'अचूक आणि सुरक्षित लोकेशन शोध' : 'Accurate and secure location search',
        isMr ? 'आपत्कालीन SOS अलर्ट - मित्रांना लगेच सायरन पाठवा' : 'Emergency SOS broadcast alerts to your group',
        isMr ? 'ड्रायव्हिंग अंतर आणि वेळेचा थेट अंदाज' : 'Live distance and driving time calculations'
      ]
    },
    {
      title: isMr ? 'स्मार्ट ग्रुप हिशोब 💸' : 'Smart Group Expenses 💸',
      subtitle: isMr ? 'स्मार्ट रिसीप्ट स्कॅनर आणि व्हॉईस एंट्री.' : 'Smart Receipt scanner and voice expense input.',
      icon: Receipt,
      color: 'premium-gradient',
      badge: isMr ? 'स्मार्ट स्प्लिट' : 'Smart Split',
      highlights: [
        isMr ? 'प्रत्येकाचा वाटा अचूक मोजा व UPI QR कोडने लगेच सेटल करा' : 'Calculate exact member balances and settle via UPI QR',
        isMr ? 'संगीत प्लेलिस्ट, फ्लाईट ट्रॅकर आणि रस्ता टाईमपास गेम्स' : 'Group Spotify playlists, flight radar & road-trip mini-games',
        isMr ? 'डेटा सुरक्षेची पूर्ण खात्री - आम्ही तुमचा डेटा विकत नाही' : 'Strict data privacy - we never sell your personal data'
      ]
    }
  ];

  const step = steps[currentStep];

  return (
    <FullScreenPortal isOpen={isOpen} layer="modal" onBackdropClick={onClose} backdropClassName="flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[85vh]"
        >
          {/* Header Bar with Prominent SKIP button & CLOSE 'X' icon */}
          <div className={`p-6 text-white bg-gradient-to-r ${step.color} relative overflow-hidden shrink-0`}>
            {/* Top Bar Buttons */}
            <div className="flex items-center justify-between relative z-20 mb-4">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/30">
                {step.badge}
              </span>

              <div className="flex items-center gap-2">
                {/* PROMINENT SKIP BUTTON */}
                <button
                  type="button"
                  id="skip-welcome-tour-btn"
                  onClick={handleCompleteOrSkip}
                  className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-[16px] text-xs font-black uppercase tracking-wider transition-all border border-white/30 cursor-pointer active:scale-95"
                >
                  {isMr ? 'स्किप करा (Skip)' : 'Skip Tour'}
                </button>

                {/* PROMINENT CLOSE 'X' ICON */}
                <button
                  type="button"
                  id="close-welcome-tour-btn"
                  onClick={handleCompleteOrSkip}
                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-[16px] transition-all border border-white/30 cursor-pointer active:scale-95"
                  title={isMr ? 'बंद करा' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Icon & Title */}
            <div className="relative z-10 space-y-2">
              <div className="w-12 h-12 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <step.icon className="w-6 h-6 text-white animate-bounce" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {step.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-white/90 leading-relaxed">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Body Content - Key Highlights */}
          <div className="p-6 space-y-4 bg-transparent/50">
            <div className="space-y-2.5">
              {step.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-[20px] border border-slate-200/80 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-premium-sky-deep shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center items-center gap-2 pt-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentStep === idx ? 'w-8 bg-[var(--premium-violet)]' : 'w-2.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(s => s - 1)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[20px] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isMr ? 'मागे' : 'Back'}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(s => s + 1)}
                className="px-6 py-3 bg-[var(--premium-violet)] hover:bg-premium-violet-soft text-white rounded-[20px] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] shadow-pink-200 transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <span>{isMr ? 'पुढे चला' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteOrSkip}
                className="px-6 py-3 bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] text-white rounded-[20px] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] shadow-pink-200 transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <Compass className="w-4 h-4" />
                <span>{isMr ? 'सुरू करा (Start Using App)' : 'Start Using App'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </FullScreenPortal>
  );
};
