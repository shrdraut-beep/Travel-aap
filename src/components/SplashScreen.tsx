import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  logoUrl?: string;
  wallpaperUrl?: string;
  lang?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  logoUrl = '/logo.svg',
  wallpaperUrl = '/screenshot-desktop.png',
  lang = 'mr'
}) => {
  // Stage 1: Pure White background + Central Logo (0s -> 1.8s)
  // Stage 2: Main App Wallpaper + Floating Vibrant Blue Loader (1.8s -> 3.8s)
  const [stage, setStage] = useState<1 | 2>(1);
  const [progress, setProgress] = useState(0);
  const [currentLogo, setCurrentLogo] = useState(logoUrl);
  const [currentWallpaper, setCurrentWallpaper] = useState(wallpaperUrl);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Image fallback preloading
  useEffect(() => {
    const imgLogo = new Image();
    imgLogo.src = logoUrl;
    imgLogo.onerror = () => setCurrentLogo('/icon-192.png');

    const imgWallpaper = new Image();
    imgWallpaper.src = wallpaperUrl;
    imgWallpaper.onerror = () => setCurrentWallpaper('/wallpaper.jpeg');
  }, [logoUrl, wallpaperUrl]);

  // Single-Stage Sequence Timers - RUNS STRICTLY ONCE ON MOUNT (No Double-Loading)
  useEffect(() => {
    // Stage 1 (White background with Logo) for 1.8 seconds
    const stageTimer = setTimeout(() => {
      setStage(2);
    }, 1800);

    // Complete whole splash sequence at 3.8 seconds
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 3800);

    return () => {
      clearTimeout(stageTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  // Smooth linear progress bar during Stage 2
  useEffect(() => {
    if (stage === 2) {
      const startTime = Date.now();
      const duration = 1900; // Fill in 1.9 seconds
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden font-sans select-none bg-white">
      {/* LAYER 1: Main App Wallpaper (Revealed in Stage 2) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: `url('${currentWallpaper}')` }}
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* LAYER 2: Floating Vibrant Blue Loader over Wallpaper (Stage 2) */}
      {stage === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-xs sm:max-w-sm w-full bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl shadow-blue-900/10 space-y-5"
        >
          {/* Logo icon inside clean light floating pill */}
          <div className="w-16 h-16 p-2 rounded-2xl bg-white shadow-md border border-blue-100 flex items-center justify-center">
            <img
              src={currentLogo}
              alt="Pravas Wataghati Logo"
              className="w-full h-full object-contain rounded-xl"
              onError={() => setCurrentLogo('/icon-192.png')}
            />
          </div>

          {/* Blue Loader Spinner & Status Text */}
          <div className="flex items-center gap-3 text-slate-900 font-black text-base tracking-tight">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 shrink-0" />
            <span className="text-slate-900 font-extrabold tracking-tight">
              {lang === 'mr' ? 'अ‍ॅप सुरू होत आहे...' : 'Loading App...'}
            </span>
          </div>

          {/* Vibrant Blue Progress Bar */}
          <div className="w-full space-y-2.5">
            <div className="w-full h-3.5 bg-blue-50 rounded-full overflow-hidden p-0.5 border border-blue-200/80 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-75 ease-linear shadow-sm shadow-blue-500/40"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className="flex items-center gap-1.5 text-[11px] text-blue-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                {lang === 'mr' ? 'तयार होत आहे' : 'Preparing'}
              </span>
              <span className="font-extrabold text-blue-600 font-mono text-sm">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* LAYER 3: Stage 1 Pure White Background Overlay with Centered Logo */}
      <AnimatePresence>
        {stage === 1 && (
          <motion.div
            key="stage1-white-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <div className="p-4 rounded-3xl bg-white shadow-2xl border border-slate-100 mb-6 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl blur-md opacity-20" />
                <img
                  src={currentLogo}
                  alt="Pravas Wataghati Logo"
                  className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-2xl"
                  referrerPolicy="no-referrer"
                  onError={() => setCurrentLogo('/icon-192.png')}
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {lang === 'mr' ? 'प्रवास वाटाघाटी' : 'Pravas Wataghati'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-blue-600 mt-2 tracking-wide uppercase">
                {lang === 'mr' ? 'सहल नियोजक आणि हिशोब व्यवस्थापन' : 'Trip Planner & Expense Manager'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



