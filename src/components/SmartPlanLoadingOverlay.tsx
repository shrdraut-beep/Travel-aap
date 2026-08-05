import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
               <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Loader2 className="w-8 h-8 animate-spin" />
               </div>
               <h2 className="text-2xl font-black text-slate-800">
                 {lang === 'mr' ? 'स्मार्ट प्लॅन तयार होत आहे...' : 'Generating Smart Plan...'}
               </h2>
               <p className="text-slate-500 font-medium text-sm">
                 {lang === 'mr' ? 'कृपया थोडा वेळ प्रतीक्षा करा, आम्ही तुमच्यासाठी सर्वोत्तम ट्रिप प्लॅन तयार करत आहोत.' : 'Please wait while we craft the perfect itinerary for you.'}
               </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
               {steps.map((step) => (
                  <div key={step.id} className={`flex items-center gap-3 ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'} transition-opacity duration-300`}>
                     {step.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                     {step.status === 'loading' && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />}
                     {step.status === 'error' && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                     {step.status === 'pending' && <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                     
                     <span className={`text-sm font-bold ${step.status === 'loading' ? 'text-indigo-600' : step.status === 'error' ? 'text-rose-600' : 'text-slate-700'}`}>
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
