import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Copy, Send, ShieldCheck, QrCode, 
  Wallet, Camera, Users, Calendar, Heart, Image as ImageIcon,
  Globe, Coins, Bell, Siren, Workflow, Lock, Headphones,
  Star, Share2, ArrowRight, Upload, Plus, AlertCircle, AlertTriangle,
  FileText, CheckCircle2, IndianRupee, Tag, Gavel, Ticket, MessageCircle, MessageSquare, RefreshCw, Car, Hotel, Package
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../components/booking/useCurrency';
import { checkCustomBiddingAllowance, recordCustomBiddingSubmission } from '../account/bargaining/BargainingRateLimiter';
import { BargainingPaywallModal } from '../account/bargaining/BargainingPaywallModal';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const PremiumModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-[480px]'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className={`premium-root relative w-full ${maxWidth} max-h-[90vh] overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="premium-sky-panel shrink-0 px-5 py-4 text-white relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-[18px] font-bold tracking-tight text-white leading-tight">{title}</h3>
                {subtitle && <p className="text-[12px] font-medium text-white/90 mt-1 leading-snug">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5 space-y-4 max-h-[calc(90vh-90px)]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* 1. Bargain New Request Modal */
export const BargainNewRequestModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit?: (data: any) => void }> = ({
  isOpen, onClose, onSubmit
}) => {
  const [submitted, setSubmitted] = useState(false);
  
  // Detailed form state matching UserBiddingScreen
  const [tripCategory, setTripCategory] = useState<'Hotels' | 'Cabs' | 'Packages'>('Cabs');
  const [origin, setOrigin] = useState('Mumbai');
  const [destination, setDestination] = useState('Goa');
  const [startDate, setStartDate] = useState('2026-09-11');
  const [endDate, setEndDate] = useState('2026-09-14');
  const [paxCount, setPaxCount] = useState<number>(4);
  const [vehicleClass, setVehicleClass] = useState('Maruti Ertiga / 7-Seater AC');
  const [propertyType, setPropertyType] = useState('Deluxe AC Room');
  const [tripTheme, setTripTheme] = useState('Standard (3-Star + Sedan)');
  const [customBudget, setCustomBudget] = useState<number>(8500);
  const [notes, setNotes] = useState('');
  
  const [requestedInclusions, setRequestedInclusions] = useState<string[]>([
    'Toll, Border & State Taxes Included',
    'Driver Night Allowance Included'
  ]);

  const defaultOptions: Record<'Hotels' | 'Cabs' | 'Packages', string[]> = {
    Cabs: [
      'Toll, Border & State Taxes Included',
      'Driver Night Allowance Included',
      '24x7 Dual Zone AC Running',
      'Sightseeing Points Included',
      'Airport / Doorstep Pickup & Drop',
      'Roof Carrier / Large Boot for Luggage',
      'Bluetooth / Music System',
      'Clean & Sanitized Vehicle',
      'Zero Surcharge Guarantee'
    ],
    Hotels: [
      'Complimentary Buffet Breakfast',
      'Swimming Pool Access',
      'Gym & Spa Access',
      'Early Check-in / Late Checkout',
      'Balcony with Scenic View',
      'Free High-Speed WiFi & Parking',
      'Daily Room Service & Housekeeping',
      'Welcome Drink on Arrival',
      'King Size Bed',
      'Air Conditioning',
      'Zero Surcharge Guarantee'
    ],
    Packages: [
      'Dedicated AC Chauffeur Vehicle',
      'Deluxe 3-Star or 4-Star Stay',
      'All Breakfast & Dinner Meals',
      'VIP Sightseeing & Guided Tour Entry',
      'All State Tolls & Parking Charges',
      'Airport / Railway Station Transfers',
      '24x7 Trip Manager Support',
      'No Hidden Charges',
      'Zero Surcharge Guarantee'
    ]
  };

  const { language } = useLanguage();
  const isMr = language === 'mr';

  const toggleInclusion = (inc: string) => {
    setRequestedInclusions(prev => 
      prev.includes(inc) ? prev.filter(i => i !== inc) : [...prev, inc]
    );
  };

  const [showPaywall, setShowPaywall] = useState(false);
  const allowance = checkCustomBiddingAllowance();

  const handleBroadcast = () => {
    setSubmitted(true);
    recordCustomBiddingSubmission();
    setTimeout(() => {
      onSubmit?.({ origin, destination, startDate, endDate, paxCount, customBudget });
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAllowance = checkCustomBiddingAllowance();
    if (!currentAllowance.allowed) {
      setShowPaywall(true);
      return;
    }
    handleBroadcast();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 text-white px-5 py-5 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start gap-3">
          <div className="flex-1">
            <h2 className="text-[18px] sm:text-[20px] font-bold leading-tight mb-1.5">
              {isMr ? "नवीन ऑफर सादर करा" : "Make an Offer"}
            </h2>
            <p className="text-sky-100 text-[12px] sm:text-[13px] leading-snug pr-2">
              {isMr 
                ? `स्थानिक पडताळणीकृत ऑपरेटर्सकडून थेट सर्वोत्तम दर मिळवा (${allowance.remaining} शिल्लक)`
                : `Submit your preferred budget & get private operator quotes (${allowance.remaining} of ${allowance.totalAllowed} free today)`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex shrink-0 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 bg-white rounded-t-3xl -mt-6 relative z-20">
        {submitted ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-20 w-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-[20px] font-bold text-slate-900">{isMr ? "ऑफर सादर झाली!" : "Offer Submitted!"}</h4>
            <p className="text-[14px] text-slate-500 max-w-xs mx-auto">{isMr ? "तुमची ऑफर पडताळणीकृत ट्रॅव्हल ऑपरेटर्सना पाठवली गेली आहे. लवकरच तुम्हाला कस्टम कोट्स मिळतील." : "Your offer has been submitted to verified travel operators. You will receive custom quotes soon."}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-2.5">
                {isMr ? "सेवा प्रकार निवडा:" : "Select Service Vertical:"}
              </label>
              <div className="flex gap-2">
                {(['Cabs', 'Hotels', 'Packages'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setTripCategory(cat);
                      setRequestedInclusions(defaultOptions[cat].slice(0, 3));
                    }}
                    className={`flex-1 py-3 rounded-2xl font-bold text-[13px] flex flex-col items-center justify-center gap-1.5 transition-all border ${
                      tripCategory === cat
                        ? 'bg-[#1A365D] border-[#1A365D] text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'Cabs' && <img src="/icons/cabs.png" alt="Cabs" className="w-9 h-9 object-contain drop-shadow-md" />}
                    {cat === 'Hotels' && <img src="/icons/hotel.png" alt="Hotels" className="w-9 h-9 object-contain drop-shadow-md" />}
                    {cat === 'Packages' && <img src="/icons/holiday.png" alt="Packages" className="w-9 h-9 object-contain drop-shadow-md" />}
                    <span>{cat === 'Cabs' ? (isMr ? 'टॅक्सी' : 'Cab & Taxi') : cat === 'Hotels' ? (isMr ? 'हॉटेल' : 'Hotel Stay') : (isMr ? 'पॅकेज' : 'Full Package')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Route Info */}
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                  {isMr ? "सुरुवात (Origin):" : "Origin City:"}
                </label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] transition-all"
                />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                  {isMr ? "ठिकाण (Destination):" : "Destination:"}
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Goa"
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] transition-all"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                  {isMr ? "प्रवासाची तारीख (Start Date):" : "Start Date:"}
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] transition-all"
                />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                  {isMr ? "परतीची तारीख (End Date):" : "End Date:"}
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] transition-all"
                />
              </div>
            </div>

            {/* Travellers */}
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                {isMr ? "प्रवासी संख्या (Passengers):" : "Passenger Count:"}
              </label>
              <div className="flex items-center justify-between border border-slate-200 rounded-xl px-2 py-2 bg-white">
                <button type="button" onClick={() => setPaxCount(Math.max(1, paxCount - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100">
                  <span className="text-lg font-bold">-</span>
                </button>
                <span className="font-bold text-[14px]">{paxCount} {isMr ? "व्यक्ती" : "Pax"}</span>
                <button type="button" onClick={() => setPaxCount(paxCount + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100">
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>
            
            {/* Preferred Vehicle / Hotel / Package */}
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                {tripCategory === 'Cabs' ? (isMr ? "गाडीचा प्रकार:" : "Preferred Vehicle:") :
                 tripCategory === 'Hotels' ? (isMr ? "हॉटेल श्रेणी:" : "Property Quality:") :
                 (isMr ? "पॅकेज थीम:" : "Tour Theme:")}
              </label>
              <div className="relative">
                {tripCategory === 'Cabs' && (
                  <select
                    value={vehicleClass}
                    onChange={e => setVehicleClass(e.target.value)}
                    className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] transition-all appearance-none"
                  >
                    <option value="Sedan (Dzire / Etios AC)">Sedan (Dzire / Etios AC)</option>
                    <option value="Maruti Ertiga / 7-Seater AC">Maruti Ertiga / 7-Seater AC</option>
                    <option value="Toyota Innova Crysta">Toyota Innova Crysta Premium</option>
                    <option value="Tempo Traveller (13/17 Seater)">Tempo Traveller (13/17 Seater)</option>
                  </select>
                )}
                {tripCategory === 'Hotels' && (
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] transition-all appearance-none"
                  >
                    <option value="Deluxe AC Room">Deluxe AC Room</option>
                    <option value="Premium Suite">Premium Suite</option>
                    <option value="Standard Non-AC">Standard Non-AC</option>
                    <option value="Villa / Resort">Villa / Resort</option>
                  </select>
                )}
                {tripCategory === 'Packages' && (
                  <select
                    value={tripTheme}
                    onChange={e => setTripTheme(e.target.value)}
                    className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] transition-all appearance-none"
                  >
                    <option value="Standard (3-Star + Sedan)">Standard (3-Star + Sedan)</option>
                    <option value="Premium (4-Star + SUV)">Premium (4-Star + SUV)</option>
                    <option value="Luxury (5-Star + Premium SUV)">Luxury (5-Star + Premium SUV)</option>
                  </select>
                )}
                <div className="absolute right-4 top-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Requested Inclusions Checklist */}
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-2.5">
                {isMr ? "अपेक्षित समाविष्ट बाबी (Inclusions):" : "Requested Inclusions Checklist:"}
              </label>
              <div className="flex flex-wrap gap-2">
                {defaultOptions[tripCategory].map(inc => {
                  const selected = requestedInclusions.includes(inc);
                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => toggleInclusion(inc)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold transition-all border ${
                        selected
                          ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                          : 'bg-slate-100 border-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {selected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>{inc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                {isMr ? "विशेष सूचना / टीप (पर्यायी):" : "Special Instructions / Notes (Optional):"}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={isMr ? "उदा. पहाटे ५ वाजता पिकअप, लहान बाळ सोबत आहे, इत्यादी." : "e.g. Need early morning pickup, clean large boot space..."}
                className="w-full px-4 py-3 text-[13px] font-medium border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D]"
              />
            </div>

            {/* Target Budget */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-bold text-slate-800">
                  {isMr ? "तुमचे एकूण अपेक्षित बजेट (₹):" : "Your Proposed Budget (₹):"}
                </label>
                <span className="text-[12px] text-slate-500 font-medium">
                  All-Inclusive
                </span>
              </div>
              <div className="relative">
                <span className="text-slate-800 font-bold absolute left-4 top-3 text-[16px]">₹</span>
                <input
                  type="number"
                  required
                  step="500"
                  value={customBudget}
                  onChange={e => setCustomBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-3 text-[16px] font-bold text-slate-900 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D]"
                />
              </div>
            </div>
            
            {/* Some extra padding for the absolute bottom button */}
            <div className="h-4"></div>
          </form>
        )}
      </div>

      {/* Fixed Bottom Action */}
      {!submitted && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-safe-bottom z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleSubmit}
            className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[15px] font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isMr ? 'ऑफर सादर करा' : 'Submit Your Offer'}</span>
          </button>
        </div>
      )}

      <BargainingPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlocked={() => {
          setShowPaywall(false);
          handleBroadcast();
        }}
      />
    </div>
  );
};
/* 2. Bargain Live Chat Modal with Full Negotiation & Escrow */
export interface BargainChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: {
    id?: string;
    title?: string;
    route?: string;
    agentName?: string;
    budget?: string;
    best?: string;
  };
  onDealConfirmed?: (deal: any) => void;
  onOpenVouchers?: () => void;
}

export const BargainChatModal: React.FC<BargainChatModalProps> = ({
  isOpen,
  onClose,
  deal,
  onDealConfirmed,
  onOpenVouchers
}) => {
  const agentName = deal?.agentName || "Sai Holidays (SuperAgent)";
  const routeTitle = deal?.route || "Pune → Goa · 4 nights · 5 travellers";
  const initialBest = deal?.best || "₹36,800";

  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: 'agent' | 'user';
    text: string;
    time: string;
    offer?: { price: string; code: string; perks?: string };
  }>>([
    {
      id: 1,
      sender: 'agent',
      text: `Hello! I am managing your custom offer for "${routeTitle}". We can offer our Premium Package at ${initialBest} with Deluxe AC stay and airport pickup included.`,
      time: '10:14 AM'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Can you include complimentary breakfast for everyone or reduce the price slightly?',
      time: '10:16 AM'
    },
    {
      id: 3,
      sender: 'agent',
      text: `Yes, we have revised the deal! We can do ₹35,800 with daily buffet breakfast + free airport pickup included.`,
      time: '10:18 AM',
      offer: { price: '₹35,800', code: 'OFFER-772', perks: 'Buffet Breakfast + Free Cab Transfer' }
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lockedDeal, setLockedDeal] = useState<{ price: string; code: string } | null>(null);

  const quickPrompts = [
    { label: "Can you do ₹34,500?", text: "Can you do ₹34,500? I am ready to lock immediately." },
    { label: "Free breakfast?", text: "Can you include complimentary breakfast for all travellers?" },
    { label: "Cab pickup included?", text: "Does this quote include airport pickup and drop-off?" },
    { label: "Best final price?", text: "What is your absolute best final discount for today?" }
  ];

  const handleSend = (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText) return;

    const userMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: messageText, time: 'Just now' }
    ]);
    if (!textToSend) setInput('');

    // Simulated Smart Agent Bargaining Response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const lower = messageText.toLowerCase();
      let replyText = "";
      let revisedOffer: { price: string; code: string; perks?: string } | undefined = undefined;

      if (lower.includes("34,500") || lower.includes("34500") || lower.includes("discount") || lower.includes("best final")) {
        replyText = "We spoke with our resort manager. Since you are booking with RoutTripo Escrow, we can offer our lowest bottom quote at ₹35,000 as our final best price!";
        revisedOffer = { price: "₹35,000", code: "FINAL-DEAL-88", perks: "Best Guaranteed Price + Breakfast Included" };
      } else if (lower.includes("breakfast")) {
        replyText = "Yes, absolutely! We have bundled complimentary chef-prepared morning breakfast for all 5 guests at no extra charge.";
        revisedOffer = { price: "₹35,500", code: "BFAST-INCL", perks: "Daily Breakfast Included" };
      } else if (lower.includes("pickup") || lower.includes("cab")) {
        replyText = "Yes! Sanitized AC Innova pickup and drop from airport/station is 100% included in this proposal.";
        revisedOffer = { price: "₹35,800", code: "CAB-INCL", perks: "Free Airport Pickup & Drop" };
      } else {
        replyText = "Thank you for the message! We are happy to accommodate your request. Here is our best competitive offer for this booking:";
        revisedOffer = { price: "₹35,200", code: "VIP-ROUTRIPO", perks: "100% Escrow Protected + Instant Confirmation" };
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: replyText,
          time: 'Just now',
          offer: revisedOffer
        }
      ]);
    }, 850);
  };

  const handleAcceptDeal = (offer: { price: string; code: string; perks?: string }) => {
    setLockedDeal(offer);
    if (onDealConfirmed) {
      onDealConfirmed({
        ...deal,
        best: offer.price,
        status: "Confirmed"
      });
    }
  };

  return (
    <PremiumModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={agentName}
      subtitle={routeTitle}
      maxWidth="max-w-[500px]"
    >
      <div className="flex flex-col h-[460px]">
        {/* Deal Header Info */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-premium-violet-soft text-premium-violet flex items-center justify-center font-bold">
              <Gavel className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[12px] font-bold text-slate-800">Live Agent Negotiation</p>
              <p className="text-[10px] text-pink-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" /> Verified SuperAgent · Escrow Safe
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Current Quote</p>
            <p className="text-[14px] font-black text-premium-violet">{lockedDeal ? lockedDeal.price : initialBest}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[13px] font-medium leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                }`}
              >
                {m.text}

                {/* Offer Card in chat */}
                {m.offer && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/80">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Agent Bid</span>
                        <span className="font-black text-[16px] text-pink-600">{m.offer.price}</span>
                        {m.offer.perks && (
                          <span className="block text-[10px] font-semibold text-pink-700">{m.offer.perks}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptDeal(m.offer!)}
                        className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold rounded-xl shadow-sm active:scale-95 transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Lock</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 px-1">{m.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-500 font-medium">Agent is typing counter offer...</span>
            </div>
          )}

          {lockedDeal && (
            <div className="bg-pink-50 border border-pink-300 p-3.5 rounded-2xl text-center space-y-2 animate-in fade-in">
              <div className="flex items-center justify-center gap-1.5 text-pink-800 font-black text-[13px]">
                <ShieldCheck className="w-4 h-4 text-pink-600" />
                <span>Deal Confirmed at {lockedDeal.price}!</span>
              </div>
              <p className="text-[11px] text-pink-700">
                Payment held safely in RoutTripo Escrow. Your official booking pass and verification OTP (8429) have been generated.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenVouchers) onOpenVouchers();
                }}
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white text-[12px] font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>View Voucher & Verification OTP</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Bargaining Prompts */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 pt-1 border-t border-slate-100 no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p.text)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your counter offer (e.g. ₹34,500)..."
            className="flex-1 h-10 px-3.5 rounded-full border border-slate-200 text-[13px] focus:border-slate-800 outline-none"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center active:scale-95 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </PremiumModalWrapper>
  );
};

/* 3. Vouchers & Digital Pass Modal */
export const VouchersModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1800);
  };

  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title="Confirmed Travel Pass & Voucher" subtitle="Official QR voucher with verification OTP">
      <div className="premium-card p-5 border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--premium-violet)]">Flight + Hotel Pass</span>
            <h4 className="text-[16px] font-bold text-[var(--premium-ink)]">Pune ➔ Goa Weekend</h4>
          </div>
          <span className="px-2.5 py-1 bg-pink-100 text-pink-800 text-[11px] font-black rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Confirmed
          </span>
        </div>
        <div className="flex items-center justify-center py-2">
          <div className="p-3.5 bg-white border-2 border-slate-900 rounded-2xl shadow-sm text-center">
            <QrCode className="h-28 w-28 text-slate-900 mx-auto" />
            <p className="text-[10px] font-bold text-slate-400 mt-1">Scan at Check-in</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
          <div className="border-r border-slate-200">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Verification OTP</span>
            <span className="text-[22px] font-black tracking-widest text-pink-600">8429</span>
            <span className="block text-[9px] text-slate-500 font-medium">Share with verified driver/hotel</span>
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Booking ID</span>
            <span className="text-[14px] font-bold text-slate-900">RTO-GOA-9912</span>
            <span className="block text-[9px] text-pink-600 font-bold">100% Escrow Protected</span>
          </div>
        </div>

        {downloaded ? (
          <div className="py-2.5 text-center bg-pink-100 text-pink-900 font-bold text-[13px] rounded-full flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-pink-700" />
            <span>PDF Ticket Voucher Downloaded!</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDownload}
            className="w-full h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-98 transition shadow-sm"
          >
            <FileText className="h-4 w-4" /> Download PDF Ticket Voucher
          </button>
        )}
      </div>
    </PremiumModalWrapper>
  );
};

/* 3.1 Secret Vendor Offers Modal */
export const SecretOffersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (deal?: any) => void;
  onOpenVouchers?: () => void;
}> = ({ isOpen, onClose, onOpenChat, onOpenVouchers }) => {
  const [claimedId, setClaimedId] = useState<string | null>(null);

  const SECRET_DEALS = [
    {
      id: "SEC-01",
      title: "Goa Luxury Beachside Villa (4 BHK)",
      route: "Calangute, North Goa · Private Pool + Chef",
      agent: "Sai Holidays Goa (SuperAgent)",
      regularPrice: "₹48,000",
      secretPrice: "₹31,200",
      discount: "35% OFF",
      badge: "Exclusive Secret Rate",
      perks: "Free Airport Cab + Daily Breakfast"
    },
    {
      id: "SEC-02",
      title: "Pune ➔ Mahabaleshwar AC Innova Roundtrip",
      route: "Pune ⇄ Mahabaleshwar · 3 Days Private Cab",
      agent: "Sahyadri Verified Cabs",
      regularPrice: "₹13,500",
      secretPrice: "₹9,200",
      discount: "32% OFF",
      badge: "Return Fare Discount",
      perks: "All Tolls Included + Zero Cancellation"
    },
    {
      id: "SEC-03",
      title: "Nashik ➔ Shirdi VIP Darshan & 4-Star Stay",
      route: "Shirdi · 2 Nights Deluxe Room + Priority Pass",
      agent: "Kashi Yatra Pilgrimage",
      regularPrice: "₹16,000",
      secretPrice: "₹11,200",
      discount: "30% OFF",
      badge: "Direct Agent Deal",
      perks: "Buffet Dinner + VIP Temple Escort"
    }
  ];

  return (
    <PremiumModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Secret Vendor Unlisted Offers"
      subtitle="Private discounts from verified agents hidden from public search"
      maxWidth="max-w-[500px]"
    >
      <div className="space-y-3.5 pb-2">
        <div className="bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-200/80 rounded-2xl p-3 flex items-start gap-3">
          <img src="/icons/secret.png" alt="Secret Offers" className="w-9 h-9 object-contain shrink-0" />
          <div className="text-[11px] text-slate-700 leading-relaxed">
            <span className="font-bold text-pink-700 block text-[12px]">Why are these offers "Secret"?</span>
            Verified agents and luxury hotels release last-minute vacant inventory at 30% to 40% unlisted discounts exclusively for RoutTripo users. You can claim or negotiate directly.
          </div>
        </div>

        {SECRET_DEALS.map((deal) => (
          <div key={deal.id} className="premium-card p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 text-[10px] font-black uppercase tracking-wider mb-1">
                  {deal.badge} · {deal.discount}
                </span>
                <h4 className="text-[14px] font-bold text-slate-900">{deal.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{deal.route}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] line-through text-slate-400 block">{deal.regularPrice}</span>
                <span className="text-[17px] font-black text-pink-600">{deal.secretPrice}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-pink-700 font-bold bg-pink-50/60 px-3 py-1.5 rounded-xl">
              <span>🏆 By {deal.agent}</span>
              <span>✓ {deal.perks}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setClaimedId(deal.id);
                  setTimeout(() => {
                    onClose();
                    if (onOpenVouchers) onOpenVouchers();
                  }, 1200);
                }}
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-[12px] rounded-xl active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{claimedId === deal.id ? "Deal Locked!" : "Claim Secret Deal"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenChat) {
                    onOpenChat({
                      title: deal.title,
                      route: deal.route,
                      agentName: deal.agent,
                      best: deal.secretPrice
                    });
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[12px] rounded-xl active:scale-95 transition flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Bargain More</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </PremiumModalWrapper>
  );
};

/* 4. RoutTripo Wallet Modal */
export const WalletModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState(4250);
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('1000');

  const handleAdd = () => {
    setAdding(true);
    setTimeout(() => {
      setBalance(b => b + Number(amount));
      setAdding(false);
      alert(`₹${amount} added successfully via UPI!`);
    }, 800);
  };

  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title="RoutTripo Travel Wallet" subtitle="Instant refunds, 1-tap checkout & booking cashback">
      <div className="space-y-4">
        <div className="premium-gradient-pink p-5 rounded-3xl text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Available Balance</span>
            <h3 className="text-[32px] font-black pt-1 leading-none">₹{balance.toLocaleString('en-IN')}</h3>
            <p className="text-[12px] text-white/85 pt-1 font-medium">Auto-credited ₹250 cashback from your last booking</p>
          </div>
          <img src="/icons/routripo_wallet.png" alt="Wallet" className="w-12 h-12 object-contain shrink-0 drop-shadow-md" />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Quick Top Up via UPI</label>
          <div className="flex gap-2">
            {['500', '1000', '2000', '5000'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`flex-1 py-2 rounded-xl text-[12px] font-bold border transition ${
                  amount === val 
                    ? 'border-[var(--premium-violet)] bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                +₹{val}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="w-full h-11 mt-2 rounded-full bg-[var(--premium-violet)] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <Wallet className="h-4 w-4" /> {adding ? 'Processing...' : `Add ₹${amount} to Wallet`}
          </button>
        </div>

        <div className="pt-2">
          <span className="block text-[12px] font-bold text-[var(--premium-ink)] mb-2">Recent Passbook Ledger</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-transparent rounded-2xl">
              <div>
                <p className="text-[13px] font-bold text-[var(--premium-ink)]">Booking Cashback</p>
                <p className="text-[11px] text-slate-400">Flight 6E-729</p>
              </div>
              <span className="text-[14px] font-bold text-premium-sky-deep">+₹250</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-transparent rounded-2xl">
              <div>
                <p className="text-[13px] font-bold text-[var(--premium-ink)]">Trip Hotel Deposit</p>
                <p className="text-[11px] text-slate-400">Goa Villa Escrow</p>
              </div>
              <span className="text-[14px] font-bold text-rose-500">-₹2,000</span>
            </div>
          </div>
        </div>
      </div>
    </PremiumModalWrapper>
  );
};

/* 5. Smart OCR Bill Scanner Modal */
export const BillScannerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedResult({
        merchant: "Fisherman's Wharf Beach Restaurant",
        total: 2840,
        category: "Food & Dining",
        date: "Today, 1:45 PM",
        items: ["Seafood Platter - ₹1,400", "Fresh Juice (x4) - ₹640", "Garlic Bread & Dips - ₹480", "Service GST - ₹320"]
      });
    }, 1600);
  };

  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title="Smart Receipt & Bill OCR" subtitle="Scan any food or travel bill to log & split automatically">
      {scannedResult ? (
        <div className="space-y-3">
          <div className="p-4 bg-premium-sky-soft rounded-2xl border border-premium-sky-deep text-center">
            <span className="text-[11px] font-bold text-premium-sky-deep uppercase">Receipt Processed Successfully</span>
            <h4 className="text-[18px] font-extrabold text-[var(--premium-ink)] mt-0.5">{scannedResult.merchant}</h4>
            <p className="text-[24px] font-black text-[var(--premium-violet)] mt-1">₹{scannedResult.total}</p>
          </div>
          <div className="bg-transparent p-3 rounded-2xl space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Extracted Line Items</span>
            {scannedResult.items.map((it: string, idx: number) => (
              <div key={idx} className="text-[12px] font-medium text-slate-700 flex justify-between">
                <span>{it.split(' - ')[0]}</span>
                <span className="font-bold">{it.split(' - ')[1]}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              alert('Expense logged into your group trip balance!');
              onClose();
            }}
            className="w-full h-11 rounded-full bg-[var(--premium-violet)] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <Check className="h-4 w-4" /> Add to Trip Expenses
          </button>
        </div>
      ) : (
        <div className="py-6 text-center space-y-4">
          <div className="relative mx-auto h-40 w-40 rounded-3xl border-2 border-dashed border-[var(--premium-violet)] bg-[var(--premium-violet-soft)] flex flex-col items-center justify-center overflow-hidden">
            {scanning ? (
              <motion.div
                animate={{ y: [-60, 60, -60] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-0 h-1 bg-[var(--premium-pink)] shadow-lg shadow-pink-500/50"
              />
            ) : null}
            <Camera className="h-12 w-12 text-[var(--premium-violet)]" />
            <span className="text-[11px] font-bold text-[var(--premium-violet)] mt-2">
              {scanning ? 'Analyzing Bill...' : 'Align Bill in Frame'}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 max-w-xs mx-auto">Take a photo of physical restaurant, fuel, or hotel receipt to automatically extract totals and tax breakdown.</p>
          <button
            type="button"
            onClick={simulateScan}
            disabled={scanning}
            className="premium-gradient-pink w-full h-11 rounded-full text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <Camera className="h-4 w-4" /> {scanning ? 'Scanning...' : 'Capture & Extract Receipt'}
          </button>
        </div>
      )}
    </PremiumModalWrapper>
  );
};

/* 6. Travel Calendar Modal */
export const TravelCalendarModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title="28-Day Travel Calendar" subtitle="Your unified flight, stay & transport schedule">
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 font-bold text-[14px] text-[var(--premium-ink)]">
          <span>October 2026</span>
          <span className="text-[12px] text-[var(--premium-violet)]">3 Trips Scheduled</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[11px] font-bold text-slate-400 py-1">{d}</span>
          ))}
          {days.map((d) => {
            const isTrip = [12, 13, 14, 15, 24, 25].includes(d);
            return (
              <div
                key={d}
                className={`h-10 rounded-xl flex flex-col items-center justify-center text-[12px] font-bold transition ${
                  isTrip
                    ? 'bg-[var(--premium-violet)] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{d}</span>
                {isTrip && <span className="h-1 w-1 rounded-full bg-[var(--premium-pink)]" />}
              </div>
            );
          })}
        </div>
        <div className="p-3.5 bg-transparent rounded-2xl space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[var(--premium-violet)]" />
            <div className="flex-1 text-[12px] font-bold text-[var(--premium-ink)]">12-15 Oct · Goa Beach Leisure Trip</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[var(--premium-pink)]" />
            <div className="flex-1 text-[12px] font-bold text-[var(--premium-ink)]">24-25 Oct · Manali Mountain Retreat</div>
          </div>
        </div>
      </div>
    </PremiumModalWrapper>
  );
};

/* 7. Language Selector Modal */
export const LanguageModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { lang, setLang } = useLanguage();
  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title="Choose App Language" subtitle="App content will translate immediately">
      <div className="space-y-2">
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => {
              setLang(l.code as any);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
              lang === l.code
                ? 'border-[var(--premium-violet)] bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]'
                : 'border-slate-100 hover:bg-transparent text-slate-800'
            }`}
          >
            <div>
              <span className="block text-[14px] font-bold">{l.name}</span>
              <span className="text-[12px] text-slate-500 font-medium">{l.native}</span>
            </div>
            {lang === l.code && <Check className="h-5 w-5 text-[var(--premium-violet)]" />}
          </button>
        ))}
      </div>
    </PremiumModalWrapper>
  );
};

/* 8. Currency Selector Modal */
export const CurrencyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currency, setCurrency } = useCurrency();
  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  ];

  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title="Select Preferred Currency" subtitle="All booking fares and price quotes will auto-convert">
      <div className="space-y-2">
        {currencies.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => {
              setCurrency(c.code as any);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
              currency === c.code
                ? 'border-[var(--premium-violet)] bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]'
                : 'border-slate-100 hover:bg-transparent text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[15px] text-[var(--premium-ink)]">
                {c.symbol}
              </span>
              <div>
                <span className="block text-[14px] font-bold">{c.name}</span>
                <span className="text-[12px] text-slate-500 font-medium">{c.code}</span>
              </div>
            </div>
            {currency === c.code && <Check className="h-5 w-5 text-[var(--premium-violet)]" />}
          </button>
        ))}
      </div>
    </PremiumModalWrapper>
  );
};

/* 9. Offer Detail / Coupon Modal */
export const OfferDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; offer: any }> = ({
  isOpen, onClose, offer
}) => {
  const [copied, setCopied] = useState(false);
  if (!offer) return null;

  const copy = () => {
    navigator.clipboard?.writeText(offer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title="Exclusive Travel Offer" subtitle={offer.title}>
      <div className="space-y-4">
        <div className="p-4 bg-[var(--premium-pink-soft)] rounded-3xl border border-pink-100 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-pink)]">Promo Code</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[22px] font-black tracking-widest text-[var(--premium-ink)]">{offer.code}</span>
            <button
              type="button"
              onClick={copy}
              className="p-1.5 rounded-lg bg-white text-[var(--premium-pink)] shadow-sm hover:scale-105 active:scale-95 transition"
            >
              {copied ? <Check className="h-4 w-4 text-premium-sky-deep" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[12px] font-medium text-slate-600 mt-1">{offer.detail}</p>
        </div>

        <div className="space-y-2 text-[12px] text-slate-600 font-medium bg-transparent p-4 rounded-2xl">
          <p className="font-bold text-[13px] text-[var(--premium-ink)] mb-1">Terms & Conditions:</p>
          <p>• Valid across all domestic flights & curated luxury stays.</p>
          <p>• Minimum transaction value ₹3,000.</p>
          <p>• Can be combined with RoutTripo Wallet cashback.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            copy();
            alert(`Code ${offer.code} applied! Proceeding to search.`);
            onClose();
          }}
          className="premium-gradient-pink w-full h-11 rounded-full text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-98 transition shadow-md"
        >
          <Check className="h-4 w-4" /> Apply Code to Next Booking
        </button>
      </div>
    </PremiumModalWrapper>
  );
};

/* 10. Destination Detail Modal */
export const DestinationDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; destination: any; onBook?: () => void }> = ({
  isOpen, onClose, destination, onBook
}) => {
  if (!destination) return null;

  return (
    <PremiumModalWrapper isOpen={isOpen} onClose={onClose} title={`${destination.city}, ${destination.country}`} subtitle={destination.tagline}>
      <div className="space-y-4">
        <div className="h-44 w-full rounded-2xl overflow-hidden relative shadow-sm">
          <img src={destination.image} alt={destination.city} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <div className="text-white">
              <span className="text-[11px] font-bold bg-[var(--premium-violet)] px-2 py-0.5 rounded-full">{destination.nights} Nights Package</span>
              <h3 className="text-[20px] font-extrabold mt-1">Starting from ₹{destination.priceFrom.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-transparent rounded-2xl">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Rating</span>
            <span className="text-[14px] font-bold text-[var(--premium-ink)]">★ {destination.rating} / 5.0</span>
          </div>
          <div className="p-3 bg-transparent rounded-2xl">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Best Season</span>
            <span className="text-[13px] font-bold text-[var(--premium-ink)]">Oct - March</span>
          </div>
          <div className="p-3 bg-transparent rounded-2xl">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Inclusions</span>
            <span className="text-[13px] font-bold text-[var(--premium-ink)]">Stay + Cabs</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onBook?.();
          }}
          className="premium-gradient-pink w-full h-12 rounded-full text-white text-[14px] font-bold flex items-center justify-center gap-2 active:scale-98 transition shadow-lg shadow-pink-500/20"
        >
          Explore Flights & Stays for {destination.city} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </PremiumModalWrapper>
  );
};
