import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Camera, Instagram, MapPin, Calendar, Wallet } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { getHtml2CanvasOptions, ensureContainerImagesReady } from '../utils/exportUtils';
import { TripGroup } from '../types';
import { getCurrencySymbol } from '../utils';

interface StoryExportProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripGroup | null;
  lang: string;
}

export const StoryExport: React.FC<StoryExportProps> = ({ isOpen, onClose, trip, lang }) => {
  const storyRef = React.useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
      await ensureContainerImagesReady(storyRef.current);
      const canvas = await html2canvas(storyRef.current, getHtml2CanvasOptions({
        scale: 3, // High quality
        backgroundColor: null,
      }));
      const link = document.createElement('a');
      link.download = `${trip.name.replace(/\s+/g, '_')}_story.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate story', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !trip) return null;

  const totalSpent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const currency = getCurrencySymbol(trip.defaultCurrency);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm flex flex-col gap-6 max-h-[85vh]"
        >
          {/* Story Canvas (Hidden or Styled for Display) */}
          <div 
            className="rounded-3xl overflow-hidden shadow-2xl ring-1 aspect-[9/16] relative" 
            ref={storyRef}
            style={{ 
              backgroundColor: '#0f172a',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Background Image/Pattern */}
            <div 
              className="absolute inset-0 opacity-40 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
              style={{ backgroundImage: `url(${trip.wallpaperUrl || ''})` }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-b" 
              style={{ 
                backgroundImage: 'linear-gradient(to bottom, rgba(8, 10, 52, 0.8), transparent, #080a34)'
              }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              {/* Header */}
              <div className="space-y-4">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Camera className="w-3 h-3 text-teal-400" />
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Trip Recap</span>
                </div>
                <h1 className="text-4xl font-black text-white leading-none tracking-tighter uppercase break-words">
                  {trip.name}
                </h1>
                <div className="flex items-center gap-3 text-indigo-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold">{new Date(trip.startDate).toLocaleDateString(lang === 'mr' ? 'mr-IN-u-nu-latn' : lang === 'hi' ? 'hi-IN-u-nu-latn' : 'en-IN')}</span>
                </div>
              </div>

              {/* Middle Stats */}
              <div className="space-y-6">
                <div 
                  className="p-6 rounded-3xl border space-y-4"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(20, 184, 166, 0.2)' }}
                    >
                      <Wallet className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <p 
                        className="text-sm font-black uppercase tracking-widest"
                        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >{lang === 'mr' ? 'एकूण खर्च' : lang === 'hi' ? 'कुल खर्च' : 'Total Spent'}</p>
                      <p className="text-2xl font-black text-white">{currency}{new Intl.NumberFormat('en-IN').format(totalSpent)}</p>
                    </div>
                  </div>
                  
                  <div className="h-px w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                    >
                      <MapPin className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p 
                        className="text-sm font-black uppercase tracking-widest"
                        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >Destinations</p>
                      <p className="text-xl font-black text-white">{trip.itinerary.length} Spots Explored</p>
                    </div>
                  </div>
                </div>

                {/* Member Circles */}
                <div className="flex -space-x-3">
                  {trip.members.map((m, i) => (
                    <div 
                      key={`${m.id}-${i}`} 
                      className="w-12 h-12 rounded-full border-4 overflow-hidden shadow-lg"
                      style={{ 
                        zIndex: 10 - i,
                        borderColor: '#0f172a'
                      }}
                    >
                      {m.avatar ? (
                        <img src={m.avatar} alt="" crossOrigin="anonymous" loading="eager" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: m.color }}>
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                  <div 
                    className="w-12 h-12 rounded-full border-4 flex items-center justify-center text-sm font-black text-white z-0"
                    style={{ 
                      borderColor: '#0f172a',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px)'
                    }}
                  >
                    +{trip.members.length}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center rotate-3 shadow-lg shadow-teal-500/50">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  <span 
                    className="text-sm font-black uppercase tracking-[0.3em]"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >Routripo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
              {lang === 'mr' ? 'बंद करा' : 'Close'}
            </button>
            <button 
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-[2] py-4 bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-100"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {lang === 'mr' ? 'डाऊनलोड करा' : 'Download Story'}
                </>
              )}
            </button>
          </div>

          <p className="text-center text-white/40 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <Instagram className="w-3 h-3" />
            Optimized for Instagram Stories
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
