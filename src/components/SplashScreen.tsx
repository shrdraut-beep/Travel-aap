import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  logoUrl?: string;
  wallpaperUrl?: string;
  lang?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  logoUrl = '/logobg.png',
  wallpaperUrl = '/wallpaper.png',
  lang = 'mr'
}) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0 -> 1 after 2 seconds
    const timer1 = setTimeout(() => setPhase(1), 2000);
    // Phase 1 -> 2 after 5 seconds total
    const timer2 = setTimeout(() => setPhase(2), 5000);
    // Complete after 6 seconds total
    const timer3 = setTimeout(onComplete, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${wallpaperUrl}')` }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.2 }}
        transition={{ duration: 10, ease: 'easeInOut' }}
      />
      
      <div className="absolute top-16 inset-x-0 flex justify-center z-10">
        <img
          src={logoUrl}
          alt="Logo"
          className="h-20 object-contain"
        />
      </div>

      <div className="absolute bottom-20 inset-x-0 flex justify-center z-10">
        {phase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"
          />
        )}
        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-5"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-12 h-12 bg-white/90 rounded-full shadow-lg" />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};



