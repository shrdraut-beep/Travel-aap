import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, XCircle, Compass } from 'lucide-react';

export interface LoadingStep {
  id: string;
  text: string;
  status: 'pending' | 'loading' | 'success' | 'error';
}

interface SmartPlanLoadingOverlayProps {
  isVisible: boolean;
  steps: LoadingStep[];
  lang: string;
}

export const SmartPlanLoadingOverlay: React.FC<SmartPlanLoadingOverlayProps> = ({ isVisible, steps, lang }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-rose-100 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="text-center space-y-3 relative z-10">
               <div className="w-16 h-16 premium-gradient-pink text-white rounded-[20px] flex items-center justify-center mx-auto shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-rose-500/30 animate-pulse">
                 <Compass className="w-8 h-8 text-premium-pink animate-spin" />
               </div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block mb-1">
                   RoutTripo AI Engine
                 </span>
                 <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                   {lang === 'mr' ? 'स्मार्ट प्लॅन तयार होत आहे...' : 'Generating Smart Plan...'}
                 </h2>
               </div>
               <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                 {lang === 'mr' ? 'कृपया थोडा वेळ प्रतीक्षा करा, आम्ही तुमच्यासाठी सर्वोत्तम ट्रिप प्लॅन तयार करत आहोत.' : 'Please wait while we craft the perfect itinerary for you.'}
               </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 relative z-10">
               {steps.map((step) => (
                  <div key={step.id} className={`flex items-center gap-3 p-2.5 rounded-[16px] transition-all ${step.status === 'loading' ? 'bg-rose-50/80 border border-rose-100' : 'opacity-80'}`}>
                     {step.status === 'success' && <CheckCircle2 className="w-5 h-5 text-premium-sky-deep shrink-0" />}
                     {step.status === 'loading' && <Loader2 className="w-5 h-5 text-rose-600 animate-spin shrink-0" />}
                     {step.status === 'error' && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                     {step.status === 'pending' && <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                     
                     <span className={`text-xs font-bold ${step.status === 'loading' ? 'text-rose-900 font-black' : step.status === 'error' ? 'text-rose-600' : step.status === 'success' ? 'text-slate-900' : 'text-slate-400'}`}>
                       {step.text}
                     </span>
                  </div>
               ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

