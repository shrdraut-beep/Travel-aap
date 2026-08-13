import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { FutureTripModal } from '../modals/FutureTripModal';

export const FutureTripScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full bg-slate-50 font-[Inter] overflow-hidden flex flex-col">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-100">
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Smart Trip Planner</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <FutureTripModal 
          isOpen={true} 
          onClose={onBack} 
          lang="en" 
          onAlert={(msg) => alert(msg)} 
          onManualEntry={() => {}} 
        />
      </div>
    </div>
  );
};
