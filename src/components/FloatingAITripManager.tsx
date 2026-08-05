import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Sparkles, X, ChevronLeft, MessageSquare, Zap, 
  Languages, Mic, Volume2, Copy, Check, Plane, Fuel, FileText, Share2, ArrowRightLeft 
} from 'lucide-react';
import { TripGroup } from '../types';
import { AIChatAssistant } from './AIChatAssistant';

interface FloatingAITripManagerProps {
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  isHidden?: boolean;
  onAddExpense?: () => void;
  onSearchFlights?: () => void;
  onOpenFuelCalculator?: () => void;
  onInviteWhatsApp?: () => void;
  onAddItineraryPlan?: () => void;
  onAddMember?: () => void;
  onExportPDF?: () => void;
}

// Dedicated Travel Translator view component
const AITranslatorView: React.FC<{ 
  lang: string; 
  t: (k: string) => string;
  botProfile: any;
}> = ({ lang, t, botProfile }) => {
  const isMr = lang === 'mr';
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);

  const availableLanguages: Record<string, string> = {
    'mr': 'Marathi (मराठी)',
    'en': 'English',
    'hi': 'Hindi (हिंदी)',
    'gu': 'Gujarati (ગુજરાતી)',
    'ta': 'Tamil (தமிழ்)',
    'te': 'Telugu (తెలుగు)',
    'kn': 'Kannada (ಕನ್ನಡ)',
    'bn': 'Bengali (বাংলা)',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
  };

  const currentTargetLangName = availableLanguages[lang] || 'English';
  const currentTargetLangCode = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';

  const handleSpeak = (str: string, langCode: string) => {
    if (!str) return;
    const utterance = new SpeechSynthesisUtterance(str);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
  };

  const handleTranslate = async (textToTranslate?: string) => {
    const textToUse = textToTranslate || inputText;
    if (!textToUse.trim()) return;

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToUse,
          targetLang: currentTargetLangName,
          context: 'Traveler asking for help or conversation during a trip. Detect source language automatically.'
        })
      });
      const data = await res.json();
      if (data.translation) {
        setTranslatedText(data.translation);
        handleSpeak(data.translation, currentTargetLangCode);
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMicListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isMr ? "या ब्राऊझरमध्ये व्हॉईस इनपुट सपोर्ट उपलब्ध नाही." : "Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    // Do not set recognition.lang to let it auto-detect based on device/browser setting
    recognition.start();
    setIsListening(true);

    recognition.onresult = async (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputText(speechToText);
      setIsListening(false);
      handleTranslate(speechToText);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPhrases = isMr ? [
    { label: 'हॉटेल कुठे आहे?', val: 'हॉटेल कुठे आहे?' },
    { label: 'याची किंमत किती?', val: 'या वस्तूची किंमत किती आहे?' },
    { label: 'जवळचे बस स्टँड/स्टेशन', val: 'जवळपासचे बस स्टँड किंवा रेल्वे स्टेशन कुठे आहे?' },
    { label: 'मला मदत हवी आहे', val: 'कृपया मला मदत करा, मी रस्ता भरकटलो आहे.' }
  ] : [
    { label: 'Where is the hotel?', val: 'Where is the hotel located?' },
    { label: 'How much does this cost?', val: 'How much does this item cost?' },
    { label: 'Where is nearest station?', val: 'Where is the nearest bus or train station?' },
    { label: 'I need help', val: 'Excuse me, I need some help please.' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto p-3 sm:p-4 gap-3 flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
            🌐
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider">
              {isMr ? 'स्थानिक भाषांतरकार' : 'Live Travel Translator'}
            </h4>
            <p className="text-[11px] text-teal-100 font-medium">
              {isMr ? 'कोणत्याही भाषेत बोला किंवा टाईप करा' : 'Speak or type in any local language'}
            </p>
          </div>
        </div>
        <div className="text-2xl">{botProfile.emoji}</div>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
          <span>{isMr ? 'स्वयंचलित भाषा ओळख' : 'Auto-detect Source Language'}</span>
          <button
            onClick={handleMicListen}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
              isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {isListening ? (isMr ? 'ऐकत आहे...' : 'Listening...') : (isMr ? 'बोलून सांगा' : 'Speak')}
          </button>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isMr ? 'इथे मजकूर लिहा किंवा वरील मायक्रोफोनवर क्लिक करून बोला...' : 'Type text or click mic to speak...'}
          className="w-full h-20 bg-slate-50 text-slate-900 text-sm font-semibold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
        />

        <div className="flex justify-end gap-2">
          {inputText && (
            <button
              onClick={() => handleSpeak(inputText, 'en-US')} // Fallback for input speak if needed, maybe not ideal, but keeps button
              title={isMr ? 'ऐका' : 'Listen'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleTranslate()}
            disabled={isTranslating || !inputText.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            {isTranslating ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {isMr ? 'भाषांतर होत आहे...' : 'Translating...'}
              </>
            ) : (
              <>
                <Languages className="w-3.5 h-3.5" />
                {isMr ? 'भाषांतर करा' : 'Translate'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Translation Box */}
      {translatedText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-3.5 shadow-md border border-teal-700/50 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between text-xs font-black text-teal-300">
            <span>{currentTargetLangName} ({isMr ? 'भाषांतरित परिणाम' : 'Translation Output'})</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSpeak(translatedText, currentTargetLangCode)}
                title={isMr ? 'आवाज ऐका' : 'Pronounce out loud'}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-teal-200 rounded-lg transition-all"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                title={isMr ? 'कॉपी करा' : 'Copy'}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-teal-200 rounded-lg transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-base font-black text-white leading-relaxed">
            {translatedText}
          </p>
        </motion.div>
      )}

      {/* Quick Phrases Suggestions */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200">
        <h5 className="text-[11px] font-black uppercase text-slate-400 mb-2 tracking-wider">
          {isMr ? '⚡ त्वरित उपयुक्त वाक्ये' : '⚡ Quick Travel Phrases'}
        </h5>
        <div className="grid grid-cols-2 gap-1.5">
          {quickPhrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(phrase.val);
                handleTranslate(phrase.val);
              }}
              className="p-2 text-left bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-900 transition-all truncate"
            >
              {phrase.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FloatingAITripManager: React.FC<FloatingAITripManagerProps> = ({
  trip,
  lang,
  t,
  currencySymbol,
  isHidden = false,
  onAddExpense,
  onSearchFlights,
  onOpenFuelCalculator,
  onInviteWhatsApp,
  onAddItineraryPlan,
  onAddMember,
  onExportPDF
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'hub' | 'chat' | 'translator'>('hub');
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('male');

  const getBotProfile = (l: string, g: 'male' | 'female') => {
    switch (l) {
      case 'mr': return { name: g === 'male' ? 'तात्या विंचू (Tatya Vinchu)' : 'मावशी (Mavshi)', gradient: 'from-orange-500 to-red-600', emoji: g === 'male' ? '🧔🏽‍♂️' : '🥻', greeting: 'ओम फट् स्वाहा! मी तुमचा Smart प्रवास वाटाघाटी मित्र तात्या विंचू आहे 🚩.' };
      case 'en': return { name: g === 'male' ? 'Lord Alfred' : 'Lady Victoria', gradient: 'from-slate-700 to-black', emoji: g === 'male' ? '🎩' : '👒', greeting: 'Greetings! I am your Elite Trip Manager.' };
      case 'hi': return { name: g === 'male' ? 'मुन्ना भाई' : 'सर्किट की बहन', gradient: 'from-yellow-500 to-orange-600', emoji: g === 'male' ? '💪🏽' : '👸🏽', greeting: 'नमस्ते भिडू! मैं तेरा Smart ट्रैवल पार्टनर हूँ 💪.' };
      case 'gu': return { name: g === 'male' ? 'જીગ્નેશ ભાઈ' : 'દયા બેન', gradient: 'from-green-500 to-emerald-700', emoji: g === 'male' ? '🤓' : '💃🏽', greeting: 'કેમ છો! I am your Bapu Mode travel guide.' };
      case 'ta': return { name: g === 'male' ? 'Thalaiva' : 'Thalaivi', gradient: 'from-yellow-600 to-red-600', emoji: g === 'male' ? '😎' : '👸🏾', greeting: 'Vanakkam! Ready for a mass trip?' };
      case 'te': return { name: g === 'male' ? 'Pushpa' : 'Devasena', gradient: 'from-red-600 to-rose-800', emoji: g === 'male' ? '⚡' : '🔥', greeting: 'Namaskaram! Let us plan a blockbuster trip.' };
      case 'kn': return { name: g === 'male' ? 'Boss Rocky' : 'Radhika', gradient: 'from-yellow-400 to-amber-600', emoji: g === 'male' ? '👑' : '👸', greeting: 'Namaskara! Boss mode activated.' };
      case 'bn': return { name: g === 'male' ? 'Babu Moshai' : 'Boudi', gradient: 'from-red-500 to-pink-600', emoji: g === 'male' ? '🍯' : '🌸', greeting: 'Nomoshkar! Sweet trips await.' };
      case 'pa': return { name: g === 'male' ? 'Paaji' : 'Soniye', gradient: 'from-orange-400 to-yellow-500', emoji: g === 'male' ? '👳‍♂️' : '💃', greeting: 'Sat Sri Akal! Swagger mode on.' };
      case 'ml': return { name: g === 'male' ? 'Chettan' : 'Chechi', gradient: 'from-green-600 to-teal-800', emoji: g === 'male' ? '🌴' : '🥻', greeting: 'Namaskaram! Adipoli trip planner ready.' };
      case 'es': return { name: g === 'male' ? 'Don' : 'Señorita', gradient: 'from-red-500 to-orange-500', emoji: g === 'male' ? '🌮' : '💃', greeting: '¡Hola Amigo! Ready for a fiesta?' };
      case 'fr': return { name: g === 'male' ? 'Monsieur' : 'Madame', gradient: 'from-blue-500 to-indigo-700', emoji: g === 'male' ? '🥖' : '🍷', greeting: 'Bonjour! Ready for an elegant journey?' };
      case 'de': return { name: g === 'male' ? 'Herr' : 'Frau', gradient: 'from-yellow-500 to-red-600', emoji: g === 'male' ? '🍺' : '🥨', greeting: 'Guten Tag! Precision planning engaged.' };
      case 'ja': return { name: g === 'male' ? 'Sensei' : 'Sakura', gradient: 'from-pink-500 to-rose-600', emoji: g === 'male' ? '🥷' : '🌸', greeting: 'Konnichiwa! Anime mode on.' };
      default: return { name: 'Trip Manager', gradient: 'from-indigo-600 to-violet-600', emoji: '🤖', greeting: 'Hello! I am your Trip Manager.' };
    }
  };

  const botProfile = getBotProfile(lang, avatarGender);
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setActiveView('hub');
      setIsOpen(true);
    };
    const handleHide = () => setIsTemporarilyHidden(true);
    const handleShow = () => setIsTemporarilyHidden(false);

    window.addEventListener('open-ai-manager', handleOpen);
    window.addEventListener('hide-ai-fab', handleHide);
    window.addEventListener('show-ai-fab', handleShow);

    return () => {
      window.removeEventListener('open-ai-manager', handleOpen);
      window.removeEventListener('hide-ai-fab', handleHide);
      window.removeEventListener('show-ai-fab', handleShow);
    };
  }, []);

  const isMr = lang === 'mr';

  return (
    <>
      {/* Seamless Floating Avatar Button (NO BORDER, ring-0, shadow-none, bg-transparent) */}
      {!isOpen && !isHidden && !isTemporarilyHidden && (
        <motion.div
          drag
          dragConstraints={{ left: -20, right: 200, top: -500, bottom: 20 }}
          dragElastic={0.1}
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 left-4 sm:left-6 z-[9990] cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <button
            type="button"
            onClick={() => {
              setActiveView('hub');
              setIsOpen(true);
            }}
            aria-label={isMr ? 'Smart प्रवास निवड हब' : 'Smart Trip Selection Board'}
            className="w-14 h-14 rounded-full bg-transparent border-none ring-0 shadow-none flex items-center justify-center relative transition-all duration-300 group cursor-pointer"
          >
            <div className="relative w-13 h-13 flex items-center justify-center rounded-full bg-slate-900/10 backdrop-blur-xs">
              <span className="text-3xl filter drop-shadow-md select-none group-hover:scale-110 transition-transform">
                {botProfile.emoji}
              </span>
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse drop-shadow-sm" />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Hub / Modal / Selection Board */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-lg h-[85vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className={`p-3.5 sm:p-4 bg-gradient-to-r ${botProfile.gradient} text-white flex items-center justify-between shrink-0 shadow-md`}>
                <div className="flex items-center gap-2.5">
                  {activeView !== 'hub' && (
                    <button
                      onClick={() => setActiveView('hub')}
                      title={isMr ? 'मागे जा' : 'Back to Hub'}
                      className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all mr-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 relative text-2xl">
                    {botProfile.emoji}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-white">
                        {botProfile.name}
                      </h3>
                    </div>
                    <p className="text-[10px] text-white/80 font-semibold truncate">
                      {activeView === 'hub' 
                        ? (isMr ? 'Smart निवड बोर्ड' : 'Smart Selection Board')
                        : activeView === 'chat'
                        ? (isMr ? 'चॅट सहाय्यक' : 'Chat Assistant')
                        : (isMr ? 'Smart थेट भाषांतरकार' : 'Travel Translator')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-black/20 rounded-xl p-1 shadow-inner border border-white/10 hidden sm:flex">
                    <button
                      onClick={() => setAvatarGender('male')}
                      className={`px-2 py-1 text-[10px] uppercase font-black rounded-lg transition-all ${
                        avatarGender === 'male' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setAvatarGender('female')}
                      className={`px-2 py-1 text-[10px] uppercase font-black rounded-lg transition-all ${
                        avatarGender === 'female' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body View Switching */}
              <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
                {activeView === 'hub' && (
                  <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col justify-between gap-4 pb-[30px] [&::-webkit-scrollbar]:hidden">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-indigo-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="relative z-10 flex items-center gap-3">
                        <span className="text-4xl p-2 bg-white/10 rounded-2xl backdrop-blur-md shrink-0">
                          {botProfile.emoji}
                        </span>
                        <div>
                          <h4 className="text-base font-black text-white leading-tight">
                            {botProfile.greeting}
                          </h4>
                          <p className="text-xs text-indigo-200 font-medium mt-1">
                            {isMr ? 'खालीलपैकी पर्याय निवडा:' : 'Choose how you would like to interact:'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Main Selection Buttons (a) Chat (b) Smart Translator */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Option A: Chat */}
                      <button
                        onClick={() => setActiveView('chat')}
                        className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left border border-indigo-400/30 flex items-center justify-between cursor-pointer overflow-hidden"
                      >
                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-white group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-base text-white">
                                {isMr ? '1. चॅट (Chat)' : '1. Chat Assistant'}
                              </h3>
                              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full">
                                {isMr ? 'स्मार्ट' : 'Smart'}
                              </span>
                            </div>
                            <p className="text-xs text-indigo-100 font-medium mt-0.5 leading-snug">
                              {isMr 
                                ? 'सहलीबद्दल प्रश्न विचारणे, खर्च हिशोब, ठिकाणे व शिफारसी शोधा' 
                                : 'Ask trip queries, calculate expenses, discover places & itinerary'}
                            </p>
                          </div>
                        </div>
                        <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform shrink-0 ml-2" />
                      </button>

                      {/* Option B: Smart Translator */}
                      <button
                        onClick={() => setActiveView('translator')}
                        className="group relative bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white p-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left border border-teal-400/30 flex items-center justify-between cursor-pointer overflow-hidden"
                      >
                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-white group-hover:scale-110 transition-transform">
                            <Languages className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-base text-white">
                                {isMr ? '2. भाषांतरकार (Smart Translator)' : '2. Travel Translator'}
                              </h3>
                              <span className="px-2 py-0.5 bg-emerald-300 text-slate-950 text-[10px] font-black uppercase rounded-full">
                                {isMr ? 'थेट व्हॉईस' : 'Live Voice'}
                              </span>
                            </div>
                            <p className="text-xs text-teal-100 font-medium mt-0.5 leading-snug">
                              {isMr 
                                ? 'स्थानिक भाषेत थेट बोलून इंग्रजी, मराठी, हिंदी किंवा 10+ भाषांमध्ये भाषांतर करा' 
                                : 'Speak or type for real-time translation across 10+ regional languages'}
                            </p>
                          </div>
                        </div>
                        <Mic className="w-5 h-5 text-teal-200 group-hover:scale-110 transition-transform shrink-0 ml-2" />
                      </button>
                    </div>

                    {/* Quick Trip Tools Section */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                      <p className="text-[11px] font-black uppercase text-slate-400 mb-2.5 tracking-wider">
                        {isMr ? '⚡ त्वरित सहल टूलकिट (Quick Shortcuts)' : '⚡ Quick Shortcuts'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {onSearchFlights && (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onSearchFlights();
                            }}
                            className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-900 transition-all text-left"
                          >
                            <Plane className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="truncate">{isMr ? 'विमान/रेल्वे बुकिंग' : 'Flights & Trains'}</span>
                          </button>
                        )}

                        {onOpenFuelCalculator && (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onOpenFuelCalculator();
                            }}
                            className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 transition-all text-left"
                          >
                            <Fuel className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="truncate">{isMr ? 'इंधन कॅल्क्युलेटर' : 'Fuel Calculator'}</span>
                          </button>
                        )}


                        {onInviteWhatsApp && (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onInviteWhatsApp();
                            }}
                            className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-teal-900 transition-all text-left"
                          >
                            <Share2 className="w-4 h-4 text-teal-600 shrink-0" />
                            <span className="truncate">{isMr ? 'मित्र निमंत्रित करा' : 'Invite Friends'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeView === 'chat' && (
                  <div className="flex-1 overflow-hidden p-2">
                    <AIChatAssistant
                      avatarGender={avatarGender}
                      setAvatarGender={setAvatarGender}
                      botProfile={botProfile}
                      trip={trip}
                      lang={lang}
                      t={t}
                      currencySymbol={currencySymbol}
                      onAddExpense={onAddExpense}
                      onSearchFlights={onSearchFlights}
                      onOpenFuelCalculator={onOpenFuelCalculator}
                      onInviteWhatsApp={onInviteWhatsApp}
                      onAddItineraryPlan={onAddItineraryPlan}
                      onAddMember={onAddMember}
                    />
                  </div>
                )}

                {activeView === 'translator' && (
                  <AITranslatorView
                    lang={lang}
                    t={t}
                    botProfile={botProfile}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
