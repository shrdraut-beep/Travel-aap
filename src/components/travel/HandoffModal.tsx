import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ExternalLink, Compass as Sparkles, X } from 'lucide-react';
import { generateEarnKaroLink } from './config';

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

  if (!isOpen) return null;

  const targetUrl = partnerUrl && partnerUrl !== '#' ? partnerUrl : 'https://bitli.in/1HdfW4l';

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600" />

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
            <div className="absolute inset-0 rounded-full border-4 border-amber-100 border-t-orange-500 animate-spin" />
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
              {countdown}s
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Verified Partner + EarnKaro
          </span>

          <h3 className="font-black text-slate-900 text-lg leading-snug px-2">
            {lang === 'mr' 
              ? 'सुरक्षित बुकिंगसाठी आमच्या विश्वासू भागीदाराकडे पुनर्निर्देशित करत आहे...' 
              : 'Redirecting to our trusted partner for secure booking...'}
          </h3>

          {itemTitle && (
            <p className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl max-w-xs mx-auto truncate">
              {itemTitle}
            </p>
          )}

          <p className="text-xs font-semibold text-slate-500 leading-relaxed px-2 pt-1">
            {lang === 'mr'
              ? 'तुम्हाला EarnKaro द्वारे सर्वोत्तम कॅशबॅक आणि सुरक्षित बुकिंग पोर्टलवर पाठवले जात आहे.'
              : 'You are being routed to our verified partner portal with EarnKaro link protection.'}
          </p>
        </div>

        {/* Direct Link Fallback */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
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
    </div>
  );
};
