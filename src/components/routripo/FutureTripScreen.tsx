import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { FutureTripModal } from '../modals/FutureTripModal';

export const FutureTripScreen: React.FC<{ onBack: () => void; lang?: 'en' | 'mr' }> = ({ onBack, lang = 'en' }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-[Inter] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <FutureTripModal 
          isOpen={true} 
          onClose={onBack} 
          lang={lang} 
          onAlert={(msg) => alert(msg)} 
          onManualEntry={() => {}} 
          isFullPage={true}
        />
      </div>
    </div>
  );
};
