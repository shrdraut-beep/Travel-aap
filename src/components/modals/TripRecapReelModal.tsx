import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2, Zap, Film, Video, Play, Music, Flame } from 'lucide-react';

export type ReelStyle = 'atrangee' | 'aesthetic';

interface TripRecapReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (style: ReelStyle) => void;
  lang?: string;
  themeColor?: string;
}

export const TripRecapReelModal: React.FC<TripRecapReelModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lang = 'mr',
  themeColor = '#6366f1'
}) => {
  const [selectedStyle, setSelectedStyle] = useState<ReelStyle>('atrangee');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReelStyle, setGeneratedReelStyle] = useState<ReelStyle | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedReelStyle(selectedStyle);
      onSubmit(selectedStyle);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200/80 relative overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Top Decorative Header */}
          <div 
            className="absolute top-0 left-0 right-0 h-3"
            style={{ background: `linear-gradient(90deg, ${themeColor}, #ec4899, #8b5cf6)` }}
          />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!isGenerating && !generatedReelStyle && (
            <div className="space-y-6 pt-2">
              {/* Heading */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-black text-[11px] uppercase tracking-wider">
                  <Film className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'सहलीची रील (TRIP RECAP REEL)' : 'Trip Recap Reel'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                  {lang === 'mr' ? 'अहो, ट्रिप तर संपली! रील कसली बनवायची?' : "Hey, Trip's over! What kind of Reel to make?"}
                </h2>
                <p className="text-xs font-bold text-slate-500">
                  {lang === 'mr' ? 'तुमच्या आठवणींसाठी एक खास स्टाईल निवडा' : 'Choose a unique vibe for your travel recap reel'}
                </p>
              </div>

              {/* Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Atrangee Style */}
                <div
                  onClick={() => setSelectedStyle('atrangee')}
                  className={`relative p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    selectedStyle === 'atrangee'
                      ? 'border-amber-500 bg-amber-50/60 shadow-xl shadow-amber-500/10 scale-[1.02]'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {selectedStyle === 'atrangee' && (
                    <div className="absolute top-3 right-3 text-amber-600">
                      <CheckCircle2 className="w-6 h-6 fill-amber-500 text-white" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                      🤪
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                        STYLE 1
                      </span>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        {lang === 'mr' ? 'अतरंगी आठवणी' : 'Quirky Memories'}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-600 leading-relaxed bg-white/80 p-3 rounded-2xl border border-amber-200/50">
                    {lang === 'mr' ? '"वेडीवाकडी, फास्ट आणि एकदम मज्जा!"' : '"Crazy, fast, and pure fun!"'}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{lang === 'mr' ? 'फास्ट कट + मजेशीर मोमेंट्स' : 'Fast cuts + Hilarious moments'}</span>
                  </div>
                </div>

                {/* Option 2: Aesthetic Style */}
                <div
                  onClick={() => setSelectedStyle('aesthetic')}
                  className={`relative p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    selectedStyle === 'aesthetic'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {selectedStyle === 'aesthetic' && (
                    <div className="absolute top-3 right-3 text-indigo-600">
                      <CheckCircle2 className="w-6 h-6 fill-indigo-600 text-white" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30">
                      ✨
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                        STYLE 2
                      </span>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        {lang === 'mr' ? 'अनमोल आठवणी' : 'Memorable Memories'}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-600 leading-relaxed bg-white/80 p-3 rounded-2xl border border-indigo-200/50">
                    {lang === 'mr' ? '"शांत, सुंदर आणि एस्थेटिक!"' : '"Calm, beautiful, and aesthetic!"'}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                    <span>{lang === 'mr' ? 'स्लो म्‍यूझिक + सिनेमाटिक व्ह्यू' : 'Slow music + Cinematic visuals'}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 px-6 rounded-2xl text-white font-black text-sm uppercase tracking-wider shadow-xl transition-all hover:opacity-95 active:scale-98 flex items-center justify-center gap-2"
                style={{
                  background: selectedStyle === 'atrangee'
                    ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                }}
              >
                <Video className="w-5 h-5" />
                <span>{lang === 'mr' ? 'रील तयार करा!' : 'Create Reel!'}</span>
              </button>
            </div>
          )}

          {/* Generating Loading State */}
          {isGenerating && (
            <div className="py-12 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: selectedStyle === 'atrangee' ? '#f59e0b' : '#6366f1' }}
                />
                <div 
                  className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl text-white"
                  style={{ 
                    background: selectedStyle === 'atrangee' 
                      ? 'linear-gradient(135deg, #f59e0b, #ef4444)' 
                      : 'linear-gradient(135deg, #6366f1, #a855f7)' 
                  }}
                >
                  {selectedStyle === 'atrangee' ? '🤪' : '✨'}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  {lang === 'mr' ? 'रील तयार होत आहे...' : 'Creating Recap Reel...'}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  {selectedStyle === 'atrangee'
                    ? (lang === 'mr' ? 'अतरंगी आठवणी गोळा केल्या जात आहेत 🎬🔥' : 'Gathering quirky memories 🎬🔥')
                    : (lang === 'mr' ? 'एस्थेटिक आठवणी एकत्र जोडल्या जात आहेत 🌸🎶' : 'Blending aesthetic memories 🌸🎶')}
                </p>
              </div>
            </div>
          )}

          {/* Reel Success Preview State */}
          {generatedReelStyle && (
            <div className="space-y-5 pt-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[11px] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'mr' ? 'रील तयार झाली!' : 'Reel Created!'}</span>
              </div>

              <div className="relative aspect-[9/14] w-48 mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 group">
                <div className={`w-full h-full object-cover ${generatedReelStyle === 'atrangee' ? 'bg-gradient-to-br from-fuchsia-500 to-cyan-500' : 'bg-gradient-to-br from-amber-200 to-orange-400'}`} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/50 shadow-xl">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-left text-white space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-amber-300 block">
                    {generatedReelStyle === 'atrangee' ? '🤪 अतरंगी आठवणी' : '✨ अनमोल आठवणी'}
                  </span>
                  <p className="text-[11px] font-bold truncate">
                    {generatedReelStyle === 'atrangee'
                      ? 'वेडीवाकडी, फास्ट आणि एकदम मज्जा!'
                      : 'शांत, सुंदर आणि एस्थेटिक!'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGeneratedReelStyle(null);
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:bg-slate-800"
              >
                {lang === 'mr' ? 'सोशल फीडमध्ये पहा' : 'View in Social Feed'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
