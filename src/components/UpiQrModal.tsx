import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Copy, Check, Smartphone, ExternalLink, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { Member } from '../types';
import { safeCopyToClipboard } from '../utils';

interface UpiQrModalProps {
  member: Member;
  amount?: number;
  currencySymbol: string;
  lang: string;
  t: (key: string) => string;
  onClose: () => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  member,
  amount,
  currencySymbol,
  lang,
  t,
  onClose
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const upiId = member.upiId || `${member.name.toLowerCase().replace(/\s+/g, '')}@upi`;
  
  // Format standard UPI payment URI
  // e.g. upi://pay?pa=rahul@upi&pn=Rahul&cu=INR&am=500
  let upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(member.name)}&cu=INR`;
  if (amount && amount > 0) {
    upiUri += `&am=${Math.round(amount)}`;
  }

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate UPI QR Code:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri]);

  const handleCopy = async () => {
    await safeCopyToClipboard(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-5 overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[20px] bg-premium-violet-soft text-premium-violet flex items-center justify-center font-black">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-snug">
                  {lang === 'mr' ? 'UPI पेमेंट QR कोड' : 'UPI Payment QR'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400">
                  {lang === 'mr' ? 'स्कॅन करून थेट पैसे पाठवा' : 'Scan to pay member directly'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Member & Amount Header */}
          <div className="flex items-center gap-3 bg-transparent p-3.5 rounded-[20px] border border-slate-100">
            <div
              className="w-12 h-12 rounded-[16px] flex items-center justify-center text-base font-bold text-white shadow-sm shrink-0 overflow-hidden"
              style={{ backgroundColor: member.avatar ? 'transparent' : member.color || '#6366f1' }}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-sm text-slate-900 truncate">{member.name}</h4>
              <p className="text-xs font-bold text-premium-violet truncate font-mono">{upiId}</p>
            </div>
            {amount && amount > 0 ? (
              <div className="text-right shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  {lang === 'mr' ? 'देणे रक्कम' : 'Amount'}
                </span>
                <span className="text-base font-black text-premium-sky-deep font-mono">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(Math.round(amount))}
                </span>
              </div>
            ) : null}
          </div>

          {/* QR Code Canvas Frame */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-3xl border-2 border-premium-violet shadow-inner relative">
            {isGenerating ? (
              <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 text-premium-violet">
                <div className="w-8 h-8 border-3 border-[var(--premium-violet)] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-400">{lang === 'mr' ? 'QR जनरेट होत आहे...' : 'Generating QR...'}</span>
              </div>
            ) : qrDataUrl ? (
              <div className="space-y-2 text-center">
                <img
                  src={qrDataUrl}
                  alt={`UPI QR for ${member.name}`}
                  className="w-56 h-56 object-contain rounded-[16px] mx-auto shadow-sm p-2 bg-white"
                />
                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-premium-sky-deep" />
                  <span>GPay • PhonePe • Paytm • BHIM</span>
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-rose-500 py-10">
                {lang === 'mr' ? 'QR कोड तयार होऊ शकला नाही' : 'Could not generate QR Code'}
              </p>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-[20px] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-premium-sky-deep" />
                  <span className="text-premium-sky-deep">{lang === 'mr' ? 'UPI ID कॉपी झाला!' : 'UPI ID Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>{lang === 'mr' ? 'UPI ID कॉपी करा' : 'Copy UPI VPA'}</span>
                </>
              )}
            </button>

            <a
              href={upiUri}
              className="w-full py-3.5 bg-[var(--premium-violet)] hover:bg-premium-violet-soft text-white rounded-[20px] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-rose-100 active:scale-95 transition-all block text-center"
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'mr' ? 'ॲपद्वारे थेट भरा (Pay via App)' : 'Open UPI App Directly'}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
