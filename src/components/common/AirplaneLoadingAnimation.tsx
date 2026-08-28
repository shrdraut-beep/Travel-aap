import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Compass, ShieldCheck } from 'lucide-react';

interface AirplaneLoadingAnimationProps {
  originCode?: string;
  destCode?: string;
  message?: string;
}

export const AirplaneLoadingAnimation: React.FC<AirplaneLoadingAnimationProps> = ({
  originCode = 'DEL',
  destCode = 'BOM',
  message = 'Searching live flights across 500+ airlines...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-lg mx-auto">
      {/* Radar & Runway Atmosphere */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Pulsing Radar Waves */}
        <motion.div
          animate={{ scale: [0.8, 1.5, 2], opacity: [0.6, 0.25, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-[#e11d48]/15 pointer-events-none"
        />
        <motion.div
          animate={{ scale: [0.8, 1.3, 1.8], opacity: [0.8, 0.35, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
          className="absolute inset-4 rounded-full bg-[#e11d48]/20 pointer-events-none"
        />

        {/* Circular Compass Flight Path Orbit */}
        <div className="w-44 h-44 rounded-full border-2 border-dashed border-slate-300 relative flex items-center justify-center bg-white/80 backdrop-blur-xs shadow-lg">
          
          {/* Origin & Destination Nodes */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            {originCode}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#e11d48] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            {destCode}
          </div>

          {/* Orbiting Jet */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute w-full h-full flex items-center justify-start p-1 pointer-events-none"
          >
            <div className="bg-[#e11d48] text-white p-2.5 rounded-full shadow-md -rotate-45 transform">
              <Plane className="w-5 h-5 fill-current" />
            </div>
          </motion.div>

          {/* Center Brand Core */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e11d48] to-[#5C0A2D] text-white flex flex-col items-center justify-center shadow-md p-1">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[8px] font-extrabold tracking-wider uppercase mt-0.5">ROUTRIPO</span>
          </div>
        </div>

        {/* Animated Flight Altitude Line */}
        <motion.div
          animate={{ x: [-30, 30, -30] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Real-time GDS Live</span>
        </motion.div>
      </div>

      {/* Dynamic Flight Steps */}
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-lg font-black text-slate-900">Fetching Best Flight Deals</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
          {message}
        </p>

        {/* Step Progression Tickers */}
        <div className="flex items-center justify-center gap-4 pt-3 text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1 text-[#e11d48]">
            <ShieldCheck className="w-3.5 h-3.5" /> Price Locked
          </span>
          <span className="text-slate-300">•</span>
          <span>Zero Markups</span>
          <span className="text-slate-300">•</span>
          <span>Official Airlines</span>
        </div>
      </div>
    </div>
  );
};
