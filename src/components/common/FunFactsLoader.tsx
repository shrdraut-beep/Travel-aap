import React, { useEffect, useState } from 'react';
import { Plane, Compass, MapPin, Coffee, Camera, Palmtree } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FUN_FACTS = [
  "Did you know? The shortest commercial flight in the world lasts just 57 seconds.",
  "Airplanes are designed to withstand lightning strikes.",
  "The longest non-stop flight takes about 19 hours to travel 9,534 miles.",
  "The safest mode of transport in the world is flying.",
  "Tires of an airplane are designed to withstand incredible weight and speed.",
  "Most airplanes are painted white to reflect sunlight and keep the cabin cool.",
  "A commercial aircraft cruises at an altitude of around 35,000 feet.",
  "The tiny hole in airplane windows regulates cabin pressure."
];

const ICONS = [Plane, Compass, MapPin, Coffee, Camera, Palmtree];

export const FunFactsLoader: React.FC = () => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = ICONS[factIndex % ICONS.length];

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
      <div className="relative w-24 h-24">
        {/* Animated outer rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-rose-500"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-4 border-slate-100 border-b-pink-500"
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CurrentIcon className="w-8 h-8 text-[#0B1E3D] animate-pulse" />
        </div>
      </div>

      <div className="h-20 flex flex-col items-center justify-center">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Fetching Best Fares...</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-bold text-slate-500 max-w-[280px]"
          >
            {FUN_FACTS[factIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};
