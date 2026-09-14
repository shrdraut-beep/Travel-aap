import React, { useState } from 'react';
import { 
  Share2, Copy, Check, Calendar, MapPin, DollarSign, Hotel, Users, Phone, Compass as  X, Printer, ShieldCheck 
} from 'lucide-react';
import { TripGroup } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { safeCopyToClipboard } from '../../utils';

interface TripShareCardModalProps {
  trip: TripGroup;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'alert') => void;
}

export const TripShareCardModal: React.FC<TripShareCardModalProps> = ({
  trip,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const itinerary = trip.itinerary || [];
  const members = trip.members || [];
  const totalBudget = trip.totalBudget || 15000;

  const generateWhatsAppText = () => {
    let text = `🌟 *${trip.name || 'आमची ट्रिप'} - संपूर्ण प्रवास माहिती (RoutTripo)* 🌟\n\n`;
    text += `📍 *डेस्टिनेशन:* ${trip.destination || 'गोवा'}\n`;
    text += `📅 *तारीख:* ${trip.startDate || '2026-10-20'} ते ${trip.endDate || '2026-10-24'}\n`;
    text += `👥 *एकूण सदस्य:* ${members.length || 4} जण\n`;
    text += `💰 *अंदाजित बजेट:* ₹${new Intl.NumberFormat('en-IN').format(totalBudget)}\n\n`;

    text += `🗓️ *दैनिक प्रवास आराखडा (Day-wise Itinerary):*\n`;
    if (itinerary.length > 0) {
      itinerary.slice(0, 6).forEach((item, idx) => {
        text += `• *दिवस ${idx + 1}:* ${item.title} (${item.travelTime || '10:00 AM'}) - ${item.exactLocation || ''}\n`;
      });
    } else {
      text += `• दिवस १: आगमन आणि हॉटेल चेक-इन\n• दिवस २: प्रसिद्ध पर्यटन स्थळे व प्रेक्षणीय ठिकाणे\n• दिवस ३: बीच / निसर्ग सफारी आणि खरेदी\n• दिवस ४: सुरक्षित परतीचा प्रवास\n`;
    }

    text += `\n🚨 *आपत्कालीन हेल्पलाइन (SOS):* 112 / RoutTripo Support\n`;
    text += `📲 *RoutTripo Travel App द्वारे व्युत्पन्न केले.*`;
    return text;
  };

  const handleCopyText = async () => {
    const text = generateWhatsAppText();
    const ok = await safeCopyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onShowToast) {
        onShowToast(isMr ? 'WhatsApp ट्रिप माहिती कॉपी केली!' : 'Trip card copied to clipboard!', 'success');
      }
    }
  };

  const handleNativeShare = () => {
    const text = generateWhatsAppText();
    if (navigator.share) {
      navigator.share({
        title: trip.name || 'Trip Itinerary',
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[16px] bg-premium-violet-soft text-premium-violet flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {isMr ? 'ट्रिप समरी कार्ड आणि शेअर' : 'Trip Summary Card & Export'}
              </h3>
              <span className="text-[9px] font-black uppercase text-premium-violet">FloatTrip Card</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* The Visual Trip Card */}
        <div className="bg-gradient-to-br from-slate-900 via-pink-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-premium-violet/30 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-violet-soft0/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-premium-violet-soft block">
                OFFICIAL TRIP ITINERARY
              </span>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {trip.name || 'Goa Group Trip 2026'}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-[16px] bg-premium-sky-soft0/20 text-pink-300 border border-premium-sky-deep/30 text-[10px] font-black uppercase">
              CONFIRMED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/10 relative z-10">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMr ? 'डेस्टिनेशन' : 'DESTINATION'}
              </span>
              <span className="font-black text-white block mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                {trip.destination || 'Goa, India'}
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMr ? 'तारीख' : 'DATES'}
              </span>
              <span className="font-black text-white block mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-400" />
                {trip.startDate ? `${trip.startDate}` : 'Oct 20 - 24'}
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMr ? 'सदस्य संख्या' : 'MEMBERS'}
              </span>
              <span className="font-black text-white block mt-0.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-premium-pink" />
                {members.length || 4} Travelers
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMr ? 'एकूण बजेट' : 'TOTAL BUDGET'}
              </span>
              <span className="font-black text-pink-300 block mt-0.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-premium-sky-deep" />
                ₹{new Intl.NumberFormat('en-IN').format(totalBudget)}
              </span>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-1.5 relative z-10">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              {isMr ? 'महत्त्वाचे थांबे' : 'ITINERARY STOPS'}
            </span>
            <div className="space-y-1">
              {(itinerary.length > 0 ? itinerary.slice(0, 3) : [
                { id: '1', title: 'Day 1: Arrival & Calangute Beach Sunset' },
                { id: '2', title: 'Day 2: Fort Aguada & Water Sports' },
                { id: '3', title: 'Day 3: Dudhsagar Waterfalls Tour' },
              ]).map((item, i) => (
                <div key={item.id || i} className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[16px] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-premium-sky-deep" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (isMr ? 'कॉपी झाले!' : 'Copied!') : (isMr ? 'मजकूर कॉपी करा' : 'Copy Text')}</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2.5 bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] text-white rounded-[16px] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{isMr ? 'WhatsApp वर पाठवा' : 'WhatsApp Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
