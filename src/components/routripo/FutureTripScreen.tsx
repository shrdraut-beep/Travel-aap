import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { FutureTripModal } from '../modals/FutureTripModal';

export const FutureTripScreen: React.FC<{ onBack: () => void; lang?: 'en' | 'mr'; onManualEntry?: () => void }> = ({ onBack, lang = 'en', onManualEntry }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerAlert = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative">
      {/* Premium In-App Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-11/12 max-w-md bg-rose-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-rose-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="w-5 h-5 shrink-0 text-white" />
            <p className="text-xs font-bold leading-tight line-clamp-2">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <FutureTripModal 
          isOpen={true} 
          onClose={onBack} 
          lang={lang} 
          onAlert={triggerAlert} 
          onManualEntry={onManualEntry || (() => {})} 
          isFullPage={true}
        />
      </div>
    </div>
  );
};
