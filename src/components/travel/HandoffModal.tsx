import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ExternalLink, Compass as  X } from 'lucide-react';
import { FullScreenPortal } from '../../common/FullScreenPortal';

interface HandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerUrl: string;
  itemTitle?: string;
  lang?: string;
}

export const HandoffModal: React.FC<HandoffModalProps> = ({
  isOpen,
  onClose,
  partnerUrl,
  itemTitle,
  lang = 'mr',
}) => {
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(2);
      return;
    }

    setCountdown(2);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const destinationUrl = partnerUrl && partnerUrl !== '#' ? partnerUrl : 'https://bitli.in/1HdfW4l';
          window.open(destinationUrl, '_blank', 'noopener,noreferrer');
          setTimeout(() => onClose(), 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, partnerUrl, onClose]);


  const targetUrl = partnerUrl && partnerUrl !== '#' ? partnerUrl : 'https://bitli.in/1HdfW4l';

  return (
    <FullScreenPortal isOpen={isOpen} layer="modal" onBackdropClick={onClose} backdropClassName="flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-orange-500 to-pink-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Spinner Icon */}
        <div className="pt-2">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)]">
              {countdown}s
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-premium-pink-soft border border-premium-pink text-premium-pink rounded-full text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-premium-pink" />
            Verified Partner
          </span>

          <h3 className="font-black text-slate-900 text-lg leading-snug px-2">
            {lang === 'mr' 
              ? 'सुरक्षित बुकिंगसाठी आमच्या विश्वासू भागीदाराकडे पुनर्निर्देशित करत आहे...' 
              : 'Redirecting to our trusted partner for secure booking...'}
          </h3>

          {itemTitle && (
            <p className="text-xs font-extrabold text-premium-violet bg-premium-violet-soft px-3 py-1.5 rounded-[16px] max-w-xs mx-auto truncate">
              {itemTitle}
            </p>
          )}

          <p className="text-xs font-semibold text-slate-500 leading-relaxed px-2 pt-1">
            {lang === 'mr'
              ? 'तुम्हाला सर्वोत्तम दरात थेट सुरक्षित बुकिंग पोर्टलवर पाठवले जात आहे.'
              : 'You are being routed to our verified partner portal with secure direct booking.'}
          </p>
        </div>

        {/* Direct Link Fallback */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-[20px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>{lang === 'mr' ? 'आत्ताच जा (Direct Open)' : 'Redirect Now'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-extrabold text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
          </button>
        </div>
      </div>
    </FullScreenPortal>
  );
};
