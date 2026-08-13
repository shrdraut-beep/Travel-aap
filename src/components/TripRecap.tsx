import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Share2, Download, X, Sparkles, MapPin, Wallet, Calendar, Music, Instagram, LayoutGrid, Camera } from 'lucide-react';
import { TripGroup, Expense, TripPlan, TripMemory } from '../types';
import { shareAppOnWhatsApp } from '../utils/shareUtils';
import { safeCopyToClipboard } from '../utils';

interface TripRecapProps {
  trip: TripGroup;
  lang: string;
  onClose: () => void;
  currencySymbol: string;
}

export const TripRecap: React.FC<TripRecapProps> = ({ trip, lang, onClose, currencySymbol }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const slideDuration = 4000; // 4 seconds per slide
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const galleryImages = trip.memories || [];
  const memories = trip.memories || [];
  const totalSpent = trip.expenses?.reduce((acc, e) => acc + e.amount, 0) || 0;
  const categories = trip.expenses?.reduce((acc: any, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const topCategory = Object.keys(categories || {}).sort((a, b) => categories[b] - categories[a])[0];

  const shareOnWhatsApp = () => {
    // Budget multiplier logic
    const getMultiplier = (type?: string) => {
      switch (type?.toLowerCase()) {
        case 'adventure': return 1.1;
        case 'religious': return 1.1;
        case 'family': return 1.2;
        case 'friends': return 1.0;
        default: return 1.0;
      }
    };

    const multiplier = getMultiplier(trip.tripType as string | undefined);
    const finalBudget = Math.round(totalSpent * multiplier);

    let shareText = `*स्मार्ट प्रवास आराखडा: ${trip.name}* 🚀\n\n`;
    shareText += `📅 तारीख: ${trip.startDate || 'N/A'} - ${trip.endDate || 'N/A'}\n`;
    shareText += `👥 प्रवास प्रकार: ${trip.tripType || 'N/A'}\n`;
    shareText += `🚗 प्रवासाचे साधन: ${trip.transportMode || 'N/A'}\n`;
    shareText += `💰 एकूण अंदाजे खर्च: ₹${new Intl.NumberFormat('en-IN').format(finalBudget)}\n\n`;
    
    shareText += `*सविस्तर नियोजन:*\n`;

    // Group itinerary items
    const hotels = trip.itinerary.filter(item => item.type === 'hotel');
    const spots = trip.itinerary.filter(item => item.type === 'activity');
    const others = trip.itinerary.filter(item => item.type !== 'hotel' && item.type !== 'activity');

    if (hotels.length > 0) {
      shareText += `\n🏨 *हॉटेल्स:*\n`;
      hotels.forEach(hotel => shareText += `- ${hotel.title}: ${hotel.detail}\n`);
    }

    if (spots.length > 0) {
      shareText += `\n📍 *पर्यटन स्थळे:*\n`;
      spots.forEach(spot => shareText += `- ${spot.title}: ${spot.detail}\n`);
    }

    if (others.length > 0) {
      shareText += `\n📝 *इतर नियोजन:*\n`;
      others.forEach(item => shareText += `- ${item.title}: ${item.detail}\n`);
    }

    if (trip.expenses && trip.expenses.length > 0) {
      shareText += `\n💸 *खर्च तपशील:*\n`;
      trip.expenses.forEach(expense => shareText += `- ${expense.title}: ₹${expense.amount}\n`);
    }

    if (trip.aiPlan) {
      shareText += `\n\n*AI टीप्स:*\n${trip.aiPlan}`;
    }
    
    shareText += `\n\nही सहल Routripo ॲपवर तयार केली आहे!`;
    
    // Structured URL scheme for WhatsApp
    shareAppOnWhatsApp(lang, shareText);
  };

  const slides = [
    {
      id: 'intro',
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-white/20 rounded-[40px] backdrop-blur-xl flex items-center justify-center border border-white/30"
          >
            <Sparkles className="w-16 h-16 text-amber-300" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">
              {trip.name}
            </h2>
            <p className="text-indigo-200 font-black text-sm uppercase tracking-[0.4em]">
              {lang === 'mr' ? 'सहलीची आठवण' : 'The Recap'}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'stats',
      render: () => (
        <div className="flex flex-col justify-center h-full p-10 space-y-8 bg-gradient-to-br from-indigo-600 to-violet-700">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-indigo-100 uppercase tracking-[0.2em]">{lang === 'mr' ? 'हिशोब' : 'The Numbers'}</h3>
            <div className="space-y-1">
              <p className="text-6xl font-black text-white tracking-tighter italic">{currencySymbol}{new Intl.NumberFormat('en-IN').format(totalSpent)}</p>
              <p className="text-indigo-200 font-bold text-sm uppercase tracking-widest">{lang === 'mr' ? 'एकूण खर्च' : lang === 'hi' ? 'कुल खर्च' : 'Total Spent'}</p>
            </div>
          </div>
          
          <div className="p-6 bg-white/10 rounded-[32px] backdrop-blur-md border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-indigo-200 uppercase tracking-widest">{lang === 'mr' ? 'सर्वात जास्त खर्च' : 'Top Expense'}</p>
                <p className="text-lg font-black text-white uppercase tracking-tight capitalize">{topCategory || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
        id: 'memories',
        render: () => (
          <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              {galleryImages.length > 0 && (
                <img 
                  src={galleryImages[0].imageUrl} 
                  className="w-full h-full object-cover blur-2xl scale-110" 
                  alt="Background"
                />
              )}
            </div>
            
            <div className="relative z-10 flex flex-col justify-center h-full p-10 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-indigo-200 uppercase tracking-[0.2em]">{lang === 'mr' ? 'आठवणी' : 'Snapshots'}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1 no-scrollbar flex-1 pb-[30px]">
                  {galleryImages.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="aspect-square bg-white p-1.5 rounded-2xl shadow-xl overflow-hidden group hover:scale-105 transition-transform"
                    >
                      <img src={img.imageUrl} className="w-full h-full object-cover rounded-xl" alt="Memory" />
                    </motion.div>
                  ))}
                  {galleryImages.length === 0 && (
                    <div className="col-span-2 aspect-video bg-white/10 rounded-[32px] flex items-center justify-center border border-dashed border-white/30">
                      <Camera className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-indigo-600 rounded-[32px] shadow-2xl shadow-indigo-900/50">
                <p className="text-white font-black text-lg italic tracking-tight leading-tight">
                  {memories.length > 0 ? memories[0].caption : (lang === 'mr' ? 'काय ती मजा आली!' : 'What a trip!')}
                </p>
                <p className="text-indigo-200 font-bold text-sm mt-2 uppercase tracking-widest">— {trip.name}</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'outro',
        render: () => (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-8 bg-slate-950">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-40 h-40 bg-white p-2 rounded-[48px] relative z-10"
              >
                <img 
                    src="/icon.svg" 
                    className="w-full h-full rounded-[40px] object-cover" 
                    alt="Logo"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/icon.svg'; }}
                />
              </motion.div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">{lang === 'mr' ? 'पुन्हा भेटूया!' : 'Until next time!'}</h2>
              <p className="text-slate-800 font-bold text-sm uppercase tracking-widest">{lang === 'mr' ? 'राऊट्रिपो सोबत' : 'With Routripo'}</p>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-3 pt-10">
              <button onClick={shareOnWhatsApp} className="flex flex-col items-center gap-2 p-4 bg-indigo-600 rounded-[24px] active:scale-95 transition-all">
                <Share2 className="w-6 h-6 text-white" />
                <span className="text-sm font-black text-white uppercase">Share</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-[24px] active:scale-95 transition-all border border-white/10">
                <Instagram className="w-6 h-6 text-white" />
                <span className="text-sm font-black text-white uppercase">Story</span>
              </button>
            </div>
          </div>
        )
      }
  ];

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / slideDuration) * 100;
      
      if (newProgress >= 100) {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(prev => prev + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
          setProgress(100);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      } else {
        setProgress(newProgress);
      }
    }, 16);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSlide, isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 md:p-10"
    >
      <div className="relative w-full max-w-md aspect-[9/16] bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/10">
        {/* Progress Bars */}
        <div className="absolute top-6 left-6 right-6 z-50 flex gap-1.5">
          {slides.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: `${idx < currentSlide ? 100 : idx === currentSlide ? progress : 0}%` 
                }}
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="absolute top-12 left-6 right-6 z-50 flex justify-between items-center">
            <button 
                onClick={onClose}
                className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:text-white"
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
            </div>
        </div>

        {/* Slide Content */}
        <div className="h-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slides[currentSlide].id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full"
                >
                    {slides[currentSlide].render()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Navigation Overlays */}
        <div className="absolute inset-y-20 left-0 w-1/3 z-40" onClick={() => {
            if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
                setProgress(0);
            }
        }} />
        <div className="absolute inset-y-20 right-0 w-1/3 z-40" onClick={() => {
            if (currentSlide < slides.length - 1) {
                setCurrentSlide(currentSlide + 1);
                setProgress(0);
            }
        }} />
      </div>
    </motion.div>
  );
};
