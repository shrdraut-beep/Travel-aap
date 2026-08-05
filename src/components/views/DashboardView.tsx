import { safeStorage } from '../../utils/storage';
import { searchYouTube } from '../../services/api/youtubeService';
import { HolidayAlertWidget } from "../HolidayAlertWidget";
import { CurrencyWidget } from "../CurrencyWidget";
import { useAuthStore } from '../../store/useAuthStore';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Gamepad2, Receipt, TrendingDown, Clock, ChevronRight, PieChart as PieChartIcon, BarChart as BarChartIcon, ShieldCheck, AlertTriangle, Users, Share2, Siren, Music, Camera, Plus, ExternalLink, Play, Pause, Trash2, Car, Plane, MapPin, Ticket, FileText, Globe, Languages, Mic, Sparkles, Zap, CheckCircle2, AlertCircle, X, AlertOctagon, RefreshCw, Copy, Check, Hotel, Bus, Calendar, Navigation, Fuel, Calculator, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TripGroup, Expense, TripPlan, Poll, SOSAlert, PlaylistItem, TripMemory, TransportMode, ProactiveSuggestion, SavedTicket } from '../../types';
import { WeatherWidget } from '../WeatherWidget';
import { TripMap } from '../map/TripMap';
import { PollsCard } from '../PollsCard';
import { LiveFlightSearchCard } from '../LiveFlightSearchCard';
import { useMusicPlayer } from '../MusicPlayerContext';
import { notifyEmergencySOS, notifyAIBriefing } from '../../utils/notifications';
import { safeCopyToClipboard, getUniqueMembers } from '../../utils';
import { LiveCountdownBanner } from '../LiveCountdownBanner';
import { TripAwardsBanner } from '../TripAwardsBanner';
import { TimepassGame } from './TimepassGame';
import { BookingsView } from './BookingsView';
import { PreTripPlanner } from '../PreTripPlanner';

interface DashboardViewProps {
  trip: TripGroup;
  lang: string;
  userId: string;
  t: (key: string) => string;
  currencySymbol: string;
  poolBalance: number;
  onNavigate: (tab: string) => void;
  onVote: (pollId: string, optionId: string) => void;
  onCreatePoll: (question: string, options: string[]) => void;
  onClosePoll: (pollId: string) => void;
  onSOS: (lat: number, lng: number) => void;
  onAddPlaylistItem: (title: string, url: string, artist?: string, thumbnailUrl?: string) => void;
  onRemovePlaylistItem: (id: string) => void;
  onAddGalleryItem: (imageUrl: string) => void;
  onUpdateTrip: (trip: TripGroup) => void;
  onShowRecap?: () => void;
  onPublish?: () => void;
  themeColor?: string;
  onShowToast?: (message: string, type?: 'success' | 'alert') => void;
  onOpenFuelCalculator?: () => void;
  onAddDeposit?: () => void;
  onGenerateAI?: (type: 'pre' | 'post') => void;
  isAIGenerating?: boolean;
  isTripCompleted?: boolean;
}

const Speedometer = ({ percent, color, lang, t, size = 'normal', isDarkCard = false }: { percent: number, color: string, lang: string, t: (k: string) => string, size?: 'normal' | 'compact', isDarkCard?: boolean }) => {
  const isCompact = size === 'compact';
  const radius = isCompact ? 42 : 60;
  const strokeWidth = isCompact ? 8 : 10;
  const viewBoxSize = isCompact ? 104 : 160;
  const center = viewBoxSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <svg className={`${isCompact ? 'w-28 h-28' : 'w-40 h-40'} transform -rotate-90`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={isDarkCard ? "text-white/20" : "text-slate-100"}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className={`${isCompact ? 'text-xl font-black' : 'text-2xl font-black'} ${isDarkCard ? 'text-white drop-shadow-sm' : 'text-slate-800'} leading-none`}>{Math.round(percent)}%</span>
        <span className={`${isCompact ? 'text-[10px]' : 'text-sm'} font-bold ${isDarkCard ? 'text-purple-200' : 'text-slate-600'} uppercase tracking-widest mt-0.5`}>{t('used')}</span>
      </div>
    </div>
  );
};

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const RoadTripHub = ({ trip, lang, currency, t }: { trip: TripGroup, lang: string, currency: string, t: (k: string) => string }) => {
  const [distance, setDistance] = useState('');
  const [mileage, setMileage] = useState('15');
  const [fuelPrice, setFuelPrice] = useState('105');
  
  const d = parseFloat(distance) || 0;
  const m = parseFloat(mileage) || 1;
  const f = parseFloat(fuelPrice) || 0;
  const totalCost = (d / m) * f;

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center text-coral">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">{t('roadTripHub')}</h3>
          <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">{t('fuelAndTolls')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">{t('distanceKmShort')}</label>
          <input 
            type="number" 
            value={distance} 
            onChange={(e) => setDistance(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
            placeholder="500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">{t('avgMileage')}</label>
          <input 
            type="number" 
            value={mileage} 
            onChange={(e) => setMileage(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
            placeholder="15"
          />
        </div>
      </div>

      {totalCost > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-coral rounded-2xl text-white flex justify-between items-center"
        >
          <div>
            <p className="text-sm font-black uppercase tracking-widest opacity-100">{t('estimatedFuelCost')}</p>
            <p className="text-xl font-black">{currency}{totalCost.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </motion.div>
      )}

      <div className="pt-2">
        <p className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 ml-1">{t('suggestedDhabas')}</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['Highway Treat', 'Vithal Kamat', 'Hotel Kinara'].map((dhaba) => (
            <div key={dhaba} className="flex-shrink-0 px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 border border-slate-100">
              {dhaba}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AirTripHub = ({ trip, onUpdateTrip, lang }: { trip: TripGroup, onUpdateTrip: (t: TripGroup) => void, lang: string }) => {
  const [pnr, setPnr] = useState(trip.pnrNumber || '');
  const [checkInUrl, setCheckInUrl] = useState(trip.webCheckInLink || '');

  const saveDetails = () => {
    onUpdateTrip({ ...trip, pnrNumber: pnr, webCheckInLink: checkInUrl });
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
          <Plane className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">{lang === 'mr' ? 'विमान प्रवास हब' : 'Air Travel Hub'}</h3>
          <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">{lang === 'mr' ? 'पीएनआर आणि चेक-इन' : 'PNR & Check-in'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">PNR Number</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={pnr} 
              onChange={(e) => setPnr(e.target.value)}
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald uppercase"
              placeholder="ABCD12"
            />
            <button 
              onClick={saveDetails}
              className="px-4 bg-emerald text-white rounded-xl font-bold text-sm"
            >
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a 
            href={checkInUrl || `https://www.google.com/search?q=${pnr}+web+check-in`} 
            target="_blank" 
            rel="noreferrer"
            className="p-4 bg-slate-900 rounded-2xl text-white flex flex-col gap-2"
          >
            <Globe className="w-5 h-5 text-emerald" />
            <span className="text-sm font-bold leading-tight">{lang === 'mr' ? 'वेब चेक-इन' : 'Web Check-in'}</span>
          </a>
          <div className="p-4 bg-emerald/10 rounded-2xl text-emerald flex flex-col gap-2 border border-emerald/20 cursor-pointer">
            <Ticket className="w-5 h-5" />
            <span className="text-sm font-bold leading-tight">{lang === 'mr' ? 'बोर्डिंग पास' : 'Boarding Pass'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const VoiceTranslator = ({ lang }: { lang: string }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceText, setSourceText] = useState('');

  const handleTranslate = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.start();
    setIsTranslating(true);

    recognition.onresult = async (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setSourceText(speechToText);
      
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: speechToText, 
            targetLang: lang === 'mr' ? 'English' : 'Marathi',
            context: 'A tourist asking for directions or help'
          })
        });
        const data = await res.json();
        if (data.translation) {
          setTranslatedText(data.translation);
          const utterance = new SpeechSynthesisUtterance(data.translation);
          utterance.lang = lang === 'mr' ? 'en-US' : 'mr-IN';
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsTranslating(false);
      }
    };

    recognition.onerror = () => setIsTranslating(false);
    recognition.onend = () => setIsTranslating(false);
  };

  return (
    <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black">{lang === 'mr' ? 'स्थानिक भाषा AI' : 'Local Lingo'}</h3>
            <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{lang === 'mr' ? 'थेट भाषांतर' : 'Live Translation'}</p>
          </div>
        </div>
        <button 
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isTranslating ? 'bg-rose-500 animate-pulse' : 'bg-emerald-600 shadow-lg shadow-emerald-600/30'}`}
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {sourceText && (
        <div className="space-y-3">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm font-black uppercase tracking-widest text-white/40 mb-1">{lang === 'mr' ? 'तुम्ही बोललात' : 'You Said'}</p>
            <p className="text-sm font-bold">{sourceText}</p>
          </div>
          {translatedText && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-emerald-600 rounded-2xl"
            >
              <p className="text-sm font-black uppercase tracking-widest text-white mb-1">{lang === 'mr' ? 'भाषांतर' : 'Translation'}</p>
              <p className="text-sm font-black">{translatedText}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  trip, lang, userId, t, currencySymbol, poolBalance, onNavigate, onVote, onCreatePoll, onClosePoll, onSOS, onAddPlaylistItem, onRemovePlaylistItem, onAddGalleryItem, onUpdateTrip, onShowRecap, onPublish, onShowToast, onOpenFuelCalculator, onAddDeposit, themeColor = '#6366f1', onGenerateAI, isAIGenerating = false, isTripCompleted = false
}) => {
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleClickCount, setSettleClickCount] = useState(0);
  const { currentUser } = useAuthStore();
  
  const handleSettleClick = () => {
    if (settleClickCount < 2) {
      setSettleClickCount(prev => prev + 1);
    } else {
      setShowSettleModal(false);
      handleEndTrip();
    }
  };

  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [showPlaylistAdd, setShowPlaylistAdd] = useState(false);
  const [countryInfo, setCountryInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchCountry() {
      try {
        const dest = (trip as any).destination || trip.name;
        const freeUtils = await import('../../services/api/freeUtils');
        const geocode = await freeUtils.geocodeDestination(dest);
        if (geocode && geocode.country) {
          const cInfo = await freeUtils.getCountryDetails(geocode.country);
          if (cInfo) setCountryInfo(cInfo);
        }
      } catch (err) {
        console.error("Country fetch error:", err);
      }
    }
    fetchCountry();
  }, [trip.name, (trip as any).destination]);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const activeThemeColor = themeColor || trip.themeColor || '#6366f1';
  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'itinerary' | 'bookings' | 'playlist' | 'checklist' | 'timepass'>('expenses');
  const [bookingSubTab, setBookingSubTab] = useState<'flights' | 'deals'>('flights');

  const handleInviteFriends = async () => {
    const shareTitle = "Join my trip!";
    const shareText = lang === 'mr' 
      ? "हे बघ! मी एका भारी सहलीचे नियोजन करत आहे! मी आमचे प्लॅनिंग, खर्च आणि संगीताची प्लेलिस्ट या ॲपवर जोडली आहे. आमच्या सहलीच्या ग्रुपमध्ये सामील होण्यासाठी खालील लिंकवर टॅप करा:" 
      : "Hey! I'm planning an epic trip! I've added the itinerary, expenses, and our music playlist on this app. Tap the link to join my trip group:";
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        if (onShowToast) {
          onShowToast(lang === 'mr' ? 'आमंत्रण यशस्वीरीत्या शेअर केले!' : 'Invitation shared successfully!', 'success');
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard(shareText + "\n" + shareUrl);
        }
      }
    } else {
      copyToClipboard(shareText + "\n" + shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    const success = await safeCopyToClipboard(text);
    if (success) {
      if (onShowToast) {
        onShowToast(
          lang === 'mr' 
            ? 'आमंत्रण संदेश कॉपी केला! व्हॉट्सॲप किंवा इतर ठिकाणी पाठवा।' 
            : 'Invitation copied to clipboard! Paste it to WhatsApp or other apps.', 
          'success'
        );
      }
    } else {
      if (onShowToast) {
        onShowToast(lang === 'mr' ? 'कॉपी करणे अपयशी झाले' : 'Failed to copy to clipboard', 'alert');
      }
    }
  };

  // Ticket Wallet states & handlers
  const [ticketType, setTicketType] = useState<'Flight' | 'Train' | 'Hotel' | 'Other'>('Flight');
  const [pnrNumber, setPnrNumber] = useState('');
  const [ticketNotes, setTicketNotes] = useState('');
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrNumber.trim()) {
      if (onShowToast) {
        onShowToast(lang === 'mr' ? 'कृपया पीएनआर नंबर टाका!' : 'Please enter PNR/Confirmation number!', 'alert');
      }
      return;
    }

    const newTicket: SavedTicket = {
      id: Math.random().toString(36).substr(2, 9),
      type: ticketType,
      pnr: pnrNumber.trim().toUpperCase(),
      notes: ticketNotes.trim(),
      addedBy: userId,
      timestamp: new Date().toISOString()
    };

    const updatedTickets = [...(trip.savedTickets || []), newTicket];
    onUpdateTrip({ ...trip, savedTickets: updatedTickets });
    
    // Reset form
    setPnrNumber('');
    setTicketNotes('');
    setShowAddTicket(false);

    if (onShowToast) {
      onShowToast(lang === 'mr' ? 'तिकीट यशस्वीरित्या सेव्ह केले!' : 'Ticket saved successfully!', 'success');
    }
  };

  const handleRemoveTicket = (ticketId: string) => {
    const updatedTickets = (trip.savedTickets || []).filter(t => t.id !== ticketId);
    onUpdateTrip({ ...trip, savedTickets: updatedTickets });
    if (onShowToast) {
      onShowToast(lang === 'mr' ? 'तिकीट काढून टाकले!' : 'Ticket removed!', 'success');
    }
  };

  const handleCopyPnr = async (pnr: string, id: string) => {
    await safeCopyToClipboard(pnr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onShowToast) {
      onShowToast(lang === 'mr' ? 'पीएनआर कॉपी केला!' : 'PNR copied to clipboard!', 'success');
    }
  };

  const updateAlertsCache = async (enabled: boolean, status?: string) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('pravas-wataghati-v6');
        const response = new Response(JSON.stringify({ alerts_enabled: enabled, tripStatus: status }));
        await cache.put('/alerts_enabled.json', response);
      } catch (err) {
        console.error('Error updating alerts cache:', err);
      }
    }
  };

  const handleEndTrip = async () => {
    const updatedTrip = { ...trip, status: 'SETTLED' as const };
    onUpdateTrip(updatedTrip);
    if (onNavigate) onNavigate('trips-list');

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.pushManager) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
          }
        }
      } catch (err) {
        console.error('Error unsubscribing from push notifications:', err);
      }
    }

    localStorage.setItem('alerts_enabled', 'false');
    await updateAlertsCache(false, 'SETTLED');

    if (onShowToast) {
      onShowToast(lang === 'mr' ? 'सहल पूर्ण झाली आणि अलर्ट अक्षम केले गेले!' : 'Trip ended and alerts disabled!', 'success');
    }
  };

  const handleReopenTrip = async () => {
    const updatedTrip = { ...trip, status: 'ACTIVE' as const };
    onUpdateTrip(updatedTrip);

    localStorage.setItem('alerts_enabled', 'true');
    await updateAlertsCache(true, 'ACTIVE');

    if (onShowToast) {
      onShowToast(lang === 'mr' ? 'सहल पुन्हा सुरू झाली!' : 'Trip reopened!', 'success');
    }
  };

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const handleTestEmergencyPush = () => {
    if (trip.status === 'SETTLED') {
      if (onShowToast) {
        onShowToast("Alerts are disabled for settled trips", "alert");
      }
      return;
    }

    const senderName = trip.members[0]?.name || 'सहकारी (Member)';
    notifyEmergencySOS(senderName, lang);

    if (onShowToast) {
      onShowToast(lang === 'mr' ? "🚨 आणीबाणी (SOS) पुश अलर्ट पाठवला!" : "🚨 Emergency SOS Push Alert Triggered!", "alert");
    }

    onSOS(18.9712, 72.8197);
    setShowEmergencyModal(true);
  };

  const generateDetailedPackingList = () => {
    if (!trip.detailedPackingList || trip.detailedPackingList.length === 0) {
      const isCold = (trip.weatherForecast || []).some(f => f.temp < 15);
      const isBeach = trip.name.toLowerCase().includes('beach') || trip.name.toLowerCase().includes('ratnagiri') || trip.name.toLowerCase().includes('goa');
      const isCity = trip.name.toLowerCase().includes('delhi') || trip.name.toLowerCase().includes('mumbai') || trip.name.toLowerCase().includes('bangalore');

      const categories: any[] = [
        {
          id: 'clothing',
          name: lang === 'mr' ? 'कपडे (Clothing)' : 'Clothing',
          items: [
            { id: 'c1', name: lang === 'mr' ? 'अंडरवेअर (७ जोड्या)' : 'Underwear (7 pairs)', isChecked: false, essential: true },
            { id: 'c2', name: lang === 'mr' ? 'टी-शर्ट्स' : 'T-shirts', isChecked: false, essential: true },
            { id: 'c3', name: lang === 'mr' ? 'पँट्स/जीन्स' : 'Pants/Jeans', isChecked: false, essential: true },
          ]
        },
        {
          id: 'electronics',
          name: lang === 'mr' ? 'इलेक्ट्रॉनिक्स (Electronics)' : 'Electronics',
          items: [
            { id: 'e1', name: lang === 'mr' ? 'फोन चार्जर' : 'Phone Charger', isChecked: false, essential: true },
            { id: 'e2', name: lang === 'mr' ? 'पॉवर बँक' : 'Power Bank', isChecked: false, essential: true },
          ]
        },
        {
          id: 'toiletries',
          name: lang === 'mr' ? 'टॉयलेटरीज (Toiletries)' : 'Toiletries',
          items: [
            { id: 't1', name: lang === 'mr' ? 'टूथब्रश आणि पेस्ट' : 'Toothbrush & Paste', isChecked: false, essential: true },
            { id: 't2', name: lang === 'mr' ? 'साबण/फेसवॉश' : 'Soap/Facewash', isChecked: false, essential: true },
          ]
        },
        {
          id: 'docs',
          name: lang === 'mr' ? 'दस्तऐवज (Documents)' : 'Documents',
          items: [
            { id: 'd1', name: lang === 'mr' ? 'आधार कार्ड' : 'Aadhar Card', isChecked: false, essential: true },
            { id: 'd2', name: lang === 'mr' ? 'तिकिटे (Print/PDF)' : 'Tickets (Print/PDF)', isChecked: false, essential: true },
          ]
        }
      ];

      if (isCold) categories[0].items.push({ id: 'c4', name: lang === 'mr' ? 'जॅकेट/स्वेटर' : 'Jacket/Sweater', isChecked: false, essential: true });
      if (isBeach) {
        categories[0].items.push({ id: 'c5', name: lang === 'mr' ? 'शॉर्ट्स/सनग्लासेस' : 'Shorts/Sunglasses', isChecked: false });
        categories[2].items.push({ id: 't3', name: lang === 'mr' ? 'सनस्क्रीन' : 'Sunscreen', isChecked: false });
      }
      if (isCity) categories[0].items.push({ id: 'c6', name: lang === 'mr' ? 'फॉर्मल कपडे' : 'Formal Wear', isChecked: false });

      onUpdateTrip({ ...trip, detailedPackingList: categories });
    }
  };

  useEffect(() => {
    if (activeSubTab === 'checklist') {
      generateDetailedPackingList();
    }
  }, [activeSubTab]);

  const handleToggleDetailedItem = (catId: string, itemId: string) => {
    if (!trip.detailedPackingList) return;
    const newCategories = trip.detailedPackingList.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, isChecked: !item.isChecked } : item)
        };
      }
      return cat;
    });
    onUpdateTrip({ ...trip, detailedPackingList: newCategories });
  };


  // Trip Manager Live Advisory Chat states
  const [selectedAlert, setSelectedAlert] = useState<ProactiveSuggestion | null>(null);
  
  useEffect(() => {
    if (selectedAlert) {
      window.dispatchEvent(new CustomEvent('hide-ai-fab'));
    } else {
      window.dispatchEvent(new CustomEvent('show-ai-fab'));
    }
  }, [selectedAlert]);

  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Live Song Search states
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [songSearchResults, setSongSearchResults] = useState<any[]>([]);
  const [isSearchingSongs, setIsSearchingSongs] = useState(false);
  const [showManualPlaylistAdd, setShowManualPlaylistAdd] = useState(false);

  useEffect(() => {
    if (!songSearchQuery.trim()) {
      setSongSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingSongs(true);
      try {
        const response = await fetch(`/api/search-music?q=${encodeURIComponent(songSearchQuery)}`);
        const data = await response.json();
        if (data && Array.isArray(data.results)) {
          setSongSearchResults(data.results.map((r: any) => ({
            trackId: r.id,
            trackName: r.title,
            artistName: r.artist,
            previewUrl: r.audioUrl,
            trackViewUrl: r.sourceUrl,
            artworkUrl100: r.artworkUrl
          })));
        }
      } catch (err) {
        console.warn("Error searching music via API:", err);
      } finally {
        setIsSearchingSongs(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [songSearchQuery]);

  useEffect(() => {
    if (selectedAlert) {
      setChatHistory([
        {
          role: 'model',
          text: selectedAlert.message
        }
      ]);
    } else {
      setChatHistory([]);
    }
    setChatMessage('');
  }, [selectedAlert]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSendingMessage]);


  const [morningBriefingText, setMorningBriefingText] = useState('');

  const handleOpenAIManagerDirectly = async () => {
    let briefingText = morningBriefingText;
    if (!briefingText) {
      const bookings = { 
        flights: trip.itinerary?.filter(i => i.type === 'ticket' && i.title.toLowerCase().includes('flight')) || [], 
        hotels: trip.itinerary?.filter(i => i.type === 'hotel') || [], 
        trains: trip.itinerary?.filter(i => i.type === 'ticket' && i.title.toLowerCase().includes('train')) || [], 
        itinerary: trip.itinerary || [] 
      };
      const currentHour = new Date().getHours();
      let timeOfDay = 'morning';
      if (currentHour >= 11 && currentHour < 16) timeOfDay = 'afternoon';
      else if (currentHour >= 16 && currentHour < 20) timeOfDay = 'evening';
      else if (currentHour >= 20 || currentHour < 6) timeOfDay = 'night';

      const url = '/api/trip-manager-briefing';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: trip.name,
            timeOfDay,
            bookings,
            weather: trip.weatherForecast || [],
            lang
          })
        });
        if (res.status === 429) {
          console.error("API Rate Limit Hit for:", url);
        }
        const data = await res.json();
        if (data.success && data.text) {
          briefingText = data.text;
          setMorningBriefingText(data.text);
        }
      } catch (e) {
        console.error("API Rate Limit Hit for:", url, e);
      }
    }

    const defaultBriefing: ProactiveSuggestion = {
      id: 'morning-briefing',
      title: lang === 'mr' ? '☀️ आजचे मॉर्निंग ब्रीफिंग व ट्रिप मॅनेजर' : lang === 'hi' ? '☀️ आज का मॉर्निंग ब्रीफिंग और मैनेजर' : "☀️ Today's Morning Briefing & Trip Manager",
      message: briefingText || (lang === 'mr' ? `नमस्कार! मी तुमचा ट्रिप मॅनेजर आहे...` : `Hello! I am your Trip Manager...`),
      type: 'itinerary'
    };
    setSelectedAlert(defaultBriefing);
  };

  const sendChatMessage = async (overrideMsg?: string) => {
    const textToSend = (overrideMsg || chatMessage).trim();
    if (!textToSend || !selectedAlert) return;
    
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsSendingMessage(true);

    try {
      const res = await fetch('/api/trip-manager-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip: {
            name: trip.name,
            totalBudget: trip.totalBudget,
            expenses: trip.expenses,
            itinerary: trip.itinerary,
            aiPlan: trip.aiPlan,
            members: trip.members,
            startDate: trip.startDate,
            endDate: trip.endDate
          },
          alert: selectedAlert,
          history: chatHistory,
          message: textToSend,
          lang
        })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setChatHistory(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'model', text: lang === 'mr' ? 'मला प्रतिसाद देण्यास अडचण येत आहे. कृपया पुन्हा प्रयत्न करा.' : 'Sorry, I ran into an error. Please try again.' }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'model', text: lang === 'mr' ? 'कनेक्टिव्हिटी त्रुटी. कृपया पुन्हा प्रयत्न करा.' : 'Connection error. Please try again.' }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [trip.id]);

  const fetchSuggestions = async () => {
    setIsFetchingSuggestions(true);
    const fallbackList: ProactiveSuggestion[] = [];

    try {
      const res = await fetch('/api/trip-manager-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip: {
            name: trip.name,
            startDate: trip.startDate,
            endDate: trip.endDate,
            totalBudget: trip.totalBudget,
            expenses: trip.expenses,
            itinerary: trip.itinerary
          },
          weather: trip.weatherForecast,
          lang,
          currentDateTime: new Date().toISOString()
        })
      });
      if (!res.ok) {
        setSuggestions(fallbackList);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions.map((s: any) => ({
          ...s,
          title: typeof s.title === 'string' ? s.title : (s.title ? JSON.stringify(s.title) : 'Suggestion'),
          message: typeof s.message === 'string' ? s.message : (typeof s.description === 'string' ? s.description : (s.message || s.description ? JSON.stringify(s.message || s.description) : ''))
        })));
      } else {
        setSuggestions(fallbackList);
      }
    } catch (err) {
      setSuggestions(fallbackList);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: ProactiveSuggestion) => {
    if (suggestion.actionData) {
      const newItinerary = [...(trip.itinerary || []), { ...suggestion.actionData, id: Math.random().toString(36).substr(2, 9) }];
      onUpdateTrip({ ...trip, itinerary: newItinerary });
      // Remove the applied suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    }
  };

  const expenses = trip.expenses || [];
  const plans = trip.itinerary || [];

  const totalDeposited = Math.max(
    (trip.deposits || []).reduce((sum, d) => sum + d.amount, 0),
    (trip.members || []).reduce((sum, m) => sum + (m.totalDeposited || 0), 0)
  );
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  let budgetBase = 0;
  if (trip.calculationMode === 'admin_pooled') {
    budgetBase = totalDeposited;
  } else {
    budgetBase = trip.totalBudget || totalDeposited || 0;
  }
  const remainingBudget = budgetBase - totalSpent;
  const percentSpent = budgetBase > 0 ? (totalSpent / budgetBase) * 100 : 0;

  // Category breakdown for chart
  const categories = Array.from(new Set((expenses || []).map(e => e.category)));
  const chartData = categories.map(cat => ({
    name: cat,
    value: (expenses || []).filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).sort((a, b) => b.value - a.value);

  // Next planned activity
  const now = new Date();
  const nextPlan = (plans || [])
    .filter(p => new Date(p.datetime) >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-xl">
          <p className="text-sm font-black uppercase tracking-wider text-slate-800 mb-1">{payload[0].name}</p>
          <p className="text-sm font-black text-slate-800">{currencySymbol}{new Intl.NumberFormat('en-IN').format(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 w-full">
      <div className="px-5 pt-3 flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-between w-full">
          <button 
            onClick={() => onNavigate('trips-list')}
            className="px-4 py-2 bg-white backdrop-blur-md text-slate-800 rounded-xl flex items-center gap-2 border border-slate-200/50 shadow-sm active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span className="text-sm font-bold uppercase tracking-widest">{lang === 'mr' ? 'सहली' : 'Trips'}</span>
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{trip.name}</h1>
            <button 
              type="button"
              onClick={handleInviteFriends}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200/80 rounded-xl shadow-xs active:scale-90 transition-all shrink-0 cursor-pointer"
              title={lang === 'mr' ? 'सहलीची माहिती शेअर करा' : 'Share Trip'}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          {countryInfo && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm font-semibold text-slate-600 bg-slate-100/60 px-3 py-1.5 rounded-full border border-slate-200/50">
              <span className="text-lg leading-none">{countryInfo.flag}</span>
              <span>{countryInfo.name}</span>
              {countryInfo.currencies && (
                <span className="text-slate-400 border-l border-slate-300 pl-2 ml-1">
                  {Object.values(countryInfo.currencies).map((c: any) => c.symbol).join(', ')}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="w-full">
          <HolidayAlertWidget startDate={trip.startDate} endDate={trip.endDate} lang={lang} />
        </div>

        {trip.defaultCurrency && trip.defaultCurrency !== 'INR' && (
          <div className="w-full">
            <CurrencyWidget currencyCode={trip.defaultCurrency} lang={lang} />
          </div>
        )}

        {/* TWO-COLUMN GRID LAYOUT (LEFT: INCOME & BALANCE | RIGHT: EXPENSE & PERCENTAGE) */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1 mb-3">
          {/* LEFT COLUMN: INCOME & BALANCE */}
          <div className="flex flex-col gap-2">
            {/* TOP: GREEN TOTAL DEPOSIT CARD */}
            <div className="bg-gradient-to-br from-emerald to-emerald-700 rounded-[20px] p-3 text-white shadow-md border border-emerald/30 flex flex-col justify-between h-36">
              <div className="flex items-start gap-1.5 text-white/80 h-8">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-[10px] font-black uppercase tracking-wider leading-tight line-clamp-2">
                  {lang === 'mr' ? 'एकूण जमा / बजेट' : lang === 'hi' ? 'कुल जमा / बजट' : 'Total Budget'}
                </span>
              </div>
              <div className="flex-grow flex items-center">
                <p className="text-2xl font-black tracking-tight">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(budgetBase)}
                </p>
              </div>
              <div className="pt-2 border-t border-white/20 h-8 flex items-center">
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-tight opacity-90 truncate">
                  {lang === 'mr' ? 'सहल बजेट' : 'Trip Budget'}
                </p>
              </div>
            </div>

            {/* BOTTOM: TOTAL BALANCE DETAILS CARD - VIBRANT ROYAL BLUE GRADIENT */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[20px] p-3 text-white shadow-lg border border-emerald/30 flex flex-col justify-between h-36">
              <div className="flex items-start gap-1.5 text-white/80 h-8">
                <Wallet className="w-4 h-4 shrink-0 text-white/80 mt-0.5" />
                <span className="text-[10px] font-black uppercase tracking-wider leading-tight line-clamp-2">
                  {lang === 'mr' ? 'एकूण शिल्लक' : lang === 'hi' ? 'कुल शेष' : 'Total Balance'}
                </span>
              </div>
              <div className="flex-grow flex items-center">
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(remainingBudget)}
                </p>
              </div>
              <div className="pt-2 border-t border-white/20 h-8 flex items-center">
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-tight opacity-95 truncate">
                  {lang === 'mr' ? 'उपलब्ध शिल्लक' : 'Available balance'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EXPENSE & PERCENTAGE */}
          <div className="flex flex-col gap-2">
            {/* TOP: RED TOTAL EXPENSE CARD */}
            <div className="bg-gradient-to-br from-coral to-coral-700 rounded-[20px] p-3 text-white shadow-md border border-coral/30 flex flex-col justify-between h-36">
              <div className="flex items-start gap-1.5 text-white/80 h-8">
                <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-[10px] font-black uppercase tracking-wider leading-tight line-clamp-2">
                  {lang === 'mr' ? 'एकूण खर्च' : lang === 'hi' ? 'कुल खर्च' : 'Total Expense'}
                </span>
              </div>
              <div className="flex-grow flex items-center">
                <p className="text-2xl font-black tracking-tight">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(totalSpent)}
                </p>
              </div>
              <div className="pt-2 border-t border-white/20 h-8 flex items-center">
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-tight opacity-90 truncate">
                  {lang === 'mr' ? 'आत्तापर्यंतचा खर्च' : 'Spent so far'}
                </p>
              </div>
            </div>

            {/* BOTTOM: CIRCULAR PROGRESS BAR (EXPENSE PERCENTAGE) CARD - VIBRANT PURPLE/VIOLET GRADIENT */}
            <div className="bg-gradient-to-br from-coral-600 via-coral-700 to-rose-800 rounded-[20px] p-3 text-white shadow-lg border border-coral/30 flex flex-col items-center text-center justify-between h-36">
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/80 leading-tight line-clamp-2">
                  {lang === 'mr' ? 'खर्चाची टक्केवारी' : 'Expense Ratio'}
                </span>
              </div>
              <div className="flex-grow flex items-center justify-center w-full py-1">
                <Speedometer
                  percent={percentSpent}
                  color={percentSpent > 80 ? '#fb7185' : '#38bdf8'}
                  lang={lang}
                  t={t}
                  size="compact"
                  isDarkCard={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH WARNING ALERT AT BOTTOM */}
        <div className="w-full mb-3">
          {percentSpent > 80 ? (
            <div className="bg-coral/10 text-coral p-3.5 rounded-2xl flex items-center justify-center gap-2.5 border border-coral/20 shadow-xs animate-bounce">
              <AlertTriangle className="w-5 h-5 shrink-0 text-coral" />
              <p className="text-xs sm:text-sm font-extrabold leading-tight uppercase tracking-wider text-center">
                {lang === 'mr' ? 'खर्च कमी करा! बजेट संपत आले आहे!' : lang === 'hi' ? 'धीमे हो जाओ! बजट कम हो रहा है!' : 'Slow down! Budget is running low!'}
              </p>
            </div>
          ) : (
            <div className="w-full bg-emerald-50/90 text-emerald-800 p-3 rounded-2xl flex items-center justify-center gap-2 border border-emerald-200/80 shadow-xs">
              <p className="text-xs font-extrabold uppercase tracking-wider text-center">
                {lang === 'mr' ? 'हळूहळू खर्च करा! बजेट सुरक्षित आहे.' : 'Spending looking good! Budget is safe.'}
              </p>
            </div>
          )}
        </div>

        {/* PROMINENT PRIMARY ACTION BUTTONS: ADD EXPENSE & ADD DEPOSIT */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full mt-1">
          <button 
            onClick={() => onNavigate('expenses')}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-xs font-black uppercase tracking-tight truncate">
              {lang === 'mr' ? 'खर्च जोडा' : 'Add Expense'}
            </span>
          </button>

          <button 
            onClick={() => {
              if (onAddDeposit) onAddDeposit();
              else window.dispatchEvent(new CustomEvent('open-deposit-modal'));
            }}
            className="flex items-center justify-center gap-2 p-3 bg-emerald hover:bg-emerald/90 text-white rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black uppercase tracking-tight truncate">
              {lang === 'mr' ? 'जमा करा' : lang === 'hi' ? 'जमा करें' : 'Add Deposit'}
            </span>
          </button>

          {trip.status !== 'SETTLED' ? (
            (currentUser?.id === trip.adminId) && <button 
              onClick={() => { setSettleClickCount(0); setShowSettleModal(true); }}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-3 bg-coral hover:bg-coral/90 text-white rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer font-extrabold"
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-tight truncate">
                {t('settleTrip')}
              </span>
            </button>
          ) : (
            <button 
              onClick={handleReopenTrip}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-2xl shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-tight truncate">
                {t('reopenTrip')}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Upgraded Proactive Trip Manager Suggestions - PERSISTENT HEADER & SMOOTH CONTENT */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-coral rounded-full animate-ping" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">{t('aiTripManager')}</h3>
            </div>
            <button 
              onClick={handleOpenAIManagerDirectly}
              className="px-3 py-1.5 bg-gradient-to-r from-coral to-coral-600 hover:from-coral-700 hover:to-coral-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white/20" />
              <span>{lang === 'mr' ? 'मॅनेजरशी चर्चा करा' : lang === 'hi' ? 'मैनेजर से बात करें' : 'Chat with Manager'}</span>
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {isFetchingSuggestions ? (
              <motion.div 
                key="loading-suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald/5 rounded-[24px] border-2 border-emerald/10 p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald text-white flex items-center justify-center shadow-md shadow-emerald/20">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {lang === 'mr' ? 'आजचे मॉर्निंग ब्रीफिंग' : 'Today\'s Morning Briefing'}
                    </h4>
                    <p className="text-xs text-emerald font-semibold mt-0.5 animate-pulse">
                      {lang === 'mr' ? 'ब्रीफिंग तयार करत आहे...' : 'Generating morning briefing...'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : suggestions.length > 0 ? (
              <motion.div 
                key="suggestions-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedAlert(suggestion)}
                    className="relative group overflow-hidden bg-white rounded-[24px] border-2 border-slate-200 hover:border-emerald/30 shadow-xl p-4 flex gap-4 cursor-pointer transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${
                      suggestion.type === 'budget' ? 'bg-coral/10 text-coral' :
                      suggestion.type === 'weather' ? 'bg-emerald/10 text-emerald' :
                      'bg-emerald/10 text-emerald'
                    }`}>
                      {suggestion.type === 'budget' ? <Wallet className="w-6 h-6" /> :
                       suggestion.type === 'weather' ? <AlertTriangle className="w-6 h-6" /> :
                       <Sparkles className="w-6 h-6" />}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="text-sm font-black text-slate-800 leading-tight mb-1">{typeof suggestion.title === "string" ? suggestion.title : JSON.stringify(suggestion.title)}</h4>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed mb-2">{typeof suggestion.message === "string" ? suggestion.message : JSON.stringify(suggestion.message)}</p>
                      
                      {suggestion.actionData && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            applySuggestion(suggestion);
                          }}
                          className="w-full py-2.5 bg-coral text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-coral/10 mb-2"
                        >
                          <Zap className="w-3.5 h-3.5 text-white" />
                          {suggestion.actionLabel || (lang === 'mr' ? 'लागू करा' : 'Apply')}
                        </button>
                      )}

                      <div className="text-xs font-bold text-emerald flex items-center gap-1 uppercase tracking-wider">
                        <span>💬 {lang === 'mr' ? 'मॅनेजरशी चर्चा करा' : 'Chat with Manager'}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                      }}
                      className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty-briefing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={handleOpenAIManagerDirectly}
                className="bg-coral/5 rounded-[24px] border-2 border-coral/20 p-4 flex items-center justify-between cursor-pointer hover:border-coral/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-coral text-white flex items-center justify-center shadow-md shadow-coral/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {lang === 'mr' ? 'आजचे मॉर्निंग ब्रीफिंग व ट्रिप असिस्टंट' : lang === 'hi' ? 'आज का मॉर्निंग ब्रीफिंग और मैनेजर' : 'Daily Morning Briefing & Manager'}
                    </h4>
                    <p className="text-xs text-coral font-semibold mt-0.5">
                      {morningBriefingText || (lang === 'mr' ? 'ब्रीफिंग तयार आहे - क्लिक करा' : 'Briefing ready - Tap to view')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-coral" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Trip Countdown Banner */}
        
        
        {/* Trip Awards Banner */}
        <TripAwardsBanner trip={trip} lang={lang} />

        {/* Member Avatars Row - Always visible at top */}
        <div className="bg-white backdrop-blur-md rounded-[24px] p-5 border border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Users className="w-4 h-4" style={{ color: themeColor }} />
              <span className="text-sm font-bold uppercase tracking-widest">{lang === 'mr' ? 'सहभागी' : 'Members'}</span>
            </div>

          </div>
          <div className="flex -space-x-2 overflow-hidden">
            {getUniqueMembers(trip.members || []).map((member, i) => (
              <div 
                key={`${member.id}-${i}`}
                className="w-11 h-11 rounded-2xl border-[3px] border-white flex items-center justify-center text-sm font-black text-white shadow-sm overflow-hidden"
                style={{ backgroundColor: member.avatar ? 'transparent' : member.color, zIndex: 10 - i }}
              >
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Re-designed Tabs Section */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 snap-start shrink-0 ${
              activeSubTab === 'expenses'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {lang === 'mr' ? 'हिशोब आणि तोडगा' : 'Expenses & Settled'}
          </button>
          
          <button
            onClick={() => setActiveSubTab('itinerary')}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 snap-start shrink-0 ${
              activeSubTab === 'itinerary'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {lang === 'mr' ? 'नियोजन' : 'Itinerary'}
          </button>

          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 snap-start shrink-0 ${
              activeSubTab === 'bookings'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm'
            }`}
          >
            <Ticket className="w-4 h-4" />
            {lang === 'mr' ? 'बुकिंग्ज' : 'Bookings'}
          </button>

          <button
            onClick={() => setActiveSubTab('playlist')}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 snap-start shrink-0 ${
              activeSubTab === 'playlist'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm'
            }`}
          >
            <Music className="w-4 h-4" />
            {lang === 'mr' ? 'प्लेलिस्ट' : 'Playlist'}
          </button>
          
          <button
            onClick={() => setActiveSubTab('timepass')}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 snap-start shrink-0 ${
              activeSubTab === 'timepass'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-purple-500" />
            {lang === 'mr' ? 'टाईमपास' : 'Timepass'}
          </button>

          <button
            onClick={() => setActiveSubTab('checklist')}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 snap-start shrink-0 ${
              activeSubTab === 'checklist'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('smartChecklist')}
          </button>
        </div>

        {/* Weather Alerts - NEW Section */}
        {activeSubTab === 'itinerary' && (() => {
          const alerts = (trip.weatherForecast || []).filter(f => 
            f.condition.toLowerCase().includes('rain') || 
            f.condition.toLowerCase().includes('storm') || 
            f.temp >= 35
          );

          if (alerts.length === 0) return null;

          const isHeat = alerts.some(f => f.temp >= 35);
          const isRain = alerts.some(f => f.condition.toLowerCase().includes('rain') || f.condition.toLowerCase().includes('storm'));

          return (
            <div className="bg-coral/10 rounded-2xl p-5 border border-coral/20 shadow-sm space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center shadow-lg shadow-coral/20">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                    {lang === 'mr' ? 'हवामान सतर्कता' : 'Weather Alert'}
                  </h3>
                  <p className="text-sm font-bold text-coral/60 mt-1 uppercase tracking-wider">
                    {lang === 'mr' ? 'सावधान राहा' : 'Stay Alert'}
                  </p>
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-coral/20">
                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                  {lang === 'mr' 
                    ? `तुमच्या सहली दरम्यान ${isHeat ? 'अतिउष्णता' : ''}${isHeat && isRain ? ' आणि ' : ''}${isRain ? 'मुसळधार पाऊस' : ''} पडण्याची शक्यता आहे. कृपया नियोजन त्याप्रमाणे करा.`
                    : `Severe weather detected: ${isHeat ? 'Extreme Heat' : ''}${isHeat && isRain ? ' & ' : ''}${isRain ? 'Heavy Rain/Storm' : ''} forecast during your trip. Please plan accordingly.`}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Dynamic Travel Hub (Smart Dashboard) */}
        {activeSubTab === 'bookings' && (
          <div className="space-y-4">
            {!trip.transportMode ? (
              <div className="bg-white backdrop-blur-md rounded-[24px] p-6 border border-slate-200/50 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{lang === 'mr' ? 'प्रवासाचे माध्यम निवडा' : 'Select Transport Mode'}</h3>
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-widest leading-none">{lang === 'mr' ? 'तुमचा डॅशबोर्ड सानुकूलित करा' : 'Customize your dashboard'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onUpdateTrip({ ...trip, transportMode: 'road' })}
                    className="p-4 bg-emerald/5 rounded-2xl border border-emerald/10 text-emerald flex flex-col items-center gap-2 active:scale-95 transition-all"
                  >
                    <Car className="w-6 h-6" />
                    <span className="text-sm font-black uppercase tracking-widest">{t('road')}</span>
                  </button>
                  <button 
                    onClick={() => onUpdateTrip({ ...trip, transportMode: 'air' })}
                    className="p-4 bg-emerald/5 rounded-2xl border border-emerald/10 text-emerald flex flex-col items-center gap-2 active:scale-95 transition-all"
                  >
                    <Plane className="w-6 h-6" />
                    <span className="text-sm font-black uppercase tracking-widest">{t('air')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {trip.transportMode === 'road' && <RoadTripHub trip={trip} lang={lang} currency={currencySymbol} t={t} />}
                {trip.transportMode === 'air' && <AirTripHub trip={trip} onUpdateTrip={onUpdateTrip} lang={lang} />}
                <button 
                  onClick={() => onUpdateTrip({ ...trip, transportMode: undefined })}
                  className="w-full py-2 text-sm font-black text-slate-800 uppercase tracking-[0.3em] hover:text-slate-800 transition-colors"
                >
                  {t('changeTransportMode')}
                </button>
              </>
            )}
          </div>
        )}

        {/* Local Lingo (Voice Translator) */}
        {activeSubTab === 'playlist' && <VoiceTranslator lang={lang} />}

        {/* SOS Alerts Notification */}
        {activeSubTab === 'itinerary' && (trip.sosAlerts || []).filter(a => !a.isResolved).map(alert => (
          <motion.div 
            key={alert.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-coral text-white p-5 rounded-[28px] shadow-2xl flex flex-col gap-3 border-4 border-white"
          >
            <div className="flex items-center gap-3">
              <Siren className="w-8 h-8 animate-pulse" />
              <div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-80">{t('emergencyAlert')}</p>
                <p className="text-xl font-black">{alert.memberName} {t('needsHelp')}</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('map')}
              className="w-full py-3 bg-white text-coral rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg"
            >
              {t('viewOnMap')}
            </button>
          </motion.div>
        ))}

        {/* Collaborative Playlist Section */}
        {activeSubTab === 'playlist' && (
          <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-5 border border-slate-200/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Music className="w-4 h-4" style={{ color: themeColor }} />
                <span className="text-sm font-bold uppercase tracking-widest">{t('tripPlaylist')}</span>
              </div>
              <button 
                onClick={() => {
                  setShowPlaylistAdd(!showPlaylistAdd);
                  // Clear search on toggle
                  setSongSearchQuery('');
                  setSongSearchResults([]);
                }}
                className={`p-2 rounded-xl transition-all border shadow-sm ${showPlaylistAdd ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900 border-slate-400'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showPlaylistAdd && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 p-4 bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-200/50 relative"
              >
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={t('searchSongPlaceholder')}
                    value={songSearchQuery}
                    onChange={(e) => setSongSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-coral/20"
                  />
                  {isSearchingSongs && (
                    <div className="absolute right-3 top-3">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  )}

                  {/* Autocomplete Dropdown UI */}
                  {(songSearchResults.length > 0 || isSearchingSongs) && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl divide-y divide-slate-100 flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
                      {songSearchResults.map((result: any) => (
                        <button
                          key={result.trackId || `${result.trackName}-${result.artistName}`}
                          onClick={() => {
                            onAddPlaylistItem(result.trackName, result.previewUrl || result.trackViewUrl, result.artistName, result.artworkUrl100);
                            setSongSearchQuery('');
                            setSongSearchResults([]);
                            setShowPlaylistAdd(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-coral/5 cursor-pointer text-left w-full transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <img 
                            src={result.artworkUrl100 || ''} 
                            alt={result.trackName} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{result.trackName}</p>
                            <p className="text-xs font-bold text-slate-500 truncate">{result.artistName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggle manual fallback button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowManualPlaylistAdd(!showManualPlaylistAdd)}
                    className="text-xs font-bold text-coral hover:text-coral/80 transition-colors uppercase tracking-wider"
                  >
                    {showManualPlaylistAdd 
                      ? t('goBackToSearch')
                      : t('addUrlManually')
                    }
                  </button>
                </div>

                {/* Manual mode inputs */}
                {showManualPlaylistAdd && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/50 animate-fade-in">
                    <input 
                      type="text" 
                      placeholder={t('songTitlePlaceholder')}
                      value={playlistTitle}
                      onChange={(e) => setPlaylistTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-coral/20"
                    />
                    <input 
                      type="text" 
                      placeholder="Spotify/YouTube URL..."
                      value={playlistUrl}
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-coral/20"
                    />
                    <button 
                      onClick={() => {
                        if (playlistTitle && playlistUrl) {
                          onAddPlaylistItem(playlistTitle, playlistUrl);
                          setPlaylistTitle('');
                          setPlaylistUrl('');
                          setShowPlaylistAdd(false);
                          setShowManualPlaylistAdd(false);
                        }
                      }}
                      className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg"
                    >
                      {t('addToPlaylist')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            <div className="space-y-2">
              {(trip.playlist || []).length > 0 ? (
                (trip.playlist || []).map((item) => (
                  <div key={typeof item?.id === 'string' || typeof item?.id === 'number' ? String(item.id) : Math.random()} className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-md rounded-[20px] border border-white/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item?.thumbnailUrl && typeof item.thumbnailUrl === 'string' ? (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={typeof item?.title === 'string' ? item.title : 'Thumbnail'} 
                          className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center shrink-0 shadow-inner">
                          <Music className="w-5 h-5 text-coral animate-pulse" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">
                          {item?.title && (typeof item.title === 'string' || typeof item.title === 'number') ? String(item.title) : 'Unknown Title'}
                        </p>
                        <p className="text-xs font-bold text-slate-500 truncate mt-0.5">
                          {item?.artist && (typeof item.artist === 'string' || typeof item.artist === 'number') 
                            ? String(item.artist) 
                            : ((typeof item?.url === 'string' && item.url.includes('spotify.com')) ? 'Spotify' : (typeof item?.url === 'string' && (item.url.includes('youtube.com') || item.url.includes('youtu.be')) ? 'YouTube' : 'Web Link'))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (currentTrack?.id === item?.id) {
                            togglePlay();
                          } else {
                            playTrack(item, trip.playlist || []);
                          }
                        }}
                        className={`p-2.5 rounded-full transition-all active:scale-95 flex items-center justify-center shadow-sm cursor-pointer ${
                          currentTrack?.id === item?.id 
                            ? 'bg-coral text-white animate-pulse' 
                            : 'bg-coral/10 hover:bg-coral text-coral hover:text-white'
                        }`}
                      >
                        {currentTrack?.id === item?.id && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </motion.button>
                      {item?.addedBy === userId && (
                        <button 
                          onClick={() => item?.id && onRemovePlaylistItem(String(item.id))} 
                          className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200/50">
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                    {t('noMusicShared')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timepass Tab */}
        {activeSubTab === 'timepass' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <TimepassGame trip={trip} lang={lang} />
          </div>
        )}

        {/* Smart Checklist Tab */}
        {activeSubTab === 'checklist' && (
          <div className="bg-white rounded-[24px] p-5 border border-slate-200/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4" style={{ color: themeColor }} />
                <span className="text-sm font-bold uppercase tracking-widest">{t('smartChecklist')}</span>
              </div>
              <button 
                onClick={generateDetailedPackingList}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {lang === 'mr' ? 'रीफ्रेश' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-6 mt-4">
              {trip.detailedPackingList && trip.detailedPackingList.length > 0 ? (
                trip.detailedPackingList.map((cat: any) => (
                  <div key={cat.id} className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{cat.name}</h4>
                    <div className="space-y-2">
                      {cat.items.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => handleToggleDetailedItem(cat.id, item.id)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${item.isChecked ? 'bg-slate-50/50 border-slate-100 opacity-70' : 'bg-white border-slate-200 shadow-sm active:scale-[0.98]'}`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${item.isChecked ? 'bg-emerald border-emerald text-white' : 'border-slate-300 bg-white'}`}>
                            {item.isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`flex-1 font-bold text-sm ${item.isChecked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {item.name}
                          </span>
                          {item.essential && !item.isChecked && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-coral/10 text-coral rounded-lg">
                              {lang === 'mr' ? 'अत्यावश्यक' : lang === 'hi' ? 'जरूरी' : 'Essential'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">{t('smartChecklist')}</p>
                  <p className="text-xs text-slate-500 font-medium">{lang === 'mr' ? 'तुमची यादी तयार करत आहे...' : lang === 'hi' ? 'आपकी सूची तैयार कर रहा है...' : 'Generating your dynamic list...'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Polling System & Next Plan - Itinerary Tab */}
        {activeSubTab === 'itinerary' && (
          <>
            {/* Polling System - NEW SECTION */}
            <PollsCard 
              trip={trip} 
              lang={lang} 
              userId={userId} 
              onVote={onVote} 
              onCreatePoll={onCreatePoll} 
              onClosePoll={onClosePoll} 
            />

            {/* Next Plan Card */}
            {nextPlan && (
              <div 
                onClick={() => onNavigate('planner')}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald/5 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-emerald" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">{t('nextPlan')}</p>
                    <p className="text-lg font-black text-slate-800 tracking-tight">{nextPlan.title}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </div>
            )}
          </>
        )}

        {/* Ticket Wallet & PNR Manager - Labeled "🎟️ Bookings & Deals" */}
        {activeSubTab === 'bookings' && (
          <div className="space-y-4">
            {/* Booking Inner Sub-Tabs Header */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 backdrop-blur rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setBookingSubTab('flights')}
                className={`flex-1 py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  bookingSubTab === 'flights'
                    ? 'bg-white text-emerald shadow-sm border border-slate-200/80 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plane className="w-4 h-4 text-emerald" />
                <span>{t('searchLiveFlights') || (lang === 'mr' ? 'विमान शोध (Live)' : 'Search Live Flights')}</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingSubTab('deals')}
                className={`flex-1 py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  bookingSubTab === 'deals'
                    ? 'bg-white text-emerald shadow-sm border border-slate-200/80 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Ticket className="w-4 h-4 text-emerald" />
                <span>{lang === 'mr' ? 'ऑफर्स आणि वॉलेट' : 'Partner Deals & Wallet'}</span>
              </button>
            </div>

            {/* Inner SubTab 1: Live Flight Search Engine (Duffel API) */}
            {bookingSubTab === 'flights' && (
              <LiveFlightSearchCard
                lang={lang}
                t={t}
                currencySymbol={currencySymbol}
                themeColor={themeColor}
                defaultDestination={(trip as any).destination || trip.name || 'DEL'}
              />
            )}

            {/* Inner SubTab 2: Partner Deals & Ticket Wallet */}
            {bookingSubTab === 'deals' && (
              <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/50 shadow-sm space-y-5">
                {/* Main Title & Header */}
                <div className="flex items-center gap-2" style={{ color: '#10b981' }}>
                  <Ticket className="w-5 h-5" />
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">
                    {t('bookingsAndDeals')}
                  </h3>
                </div>

          {/* Section 1: Main Booking Integration */}
          <div className="space-y-3">
             <button
               onClick={() => setShowBookings(!showBookings)}
               className="w-full py-4 bg-emerald hover:bg-emerald/90 text-white rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
             >
               {showBookings ? (lang === 'mr' ? 'बुकिंग विंडो लपवा' : 'Hide Booking Window') : (lang === 'mr' ? '✈️ तिकीट आणि हॉटेल बुकिंग करा' : '✈️ Book Flights & Hotels')}
             </button>

             {showBookings && (
               <div className="mt-4 -mx-5 sm:mx-0">
                  <BookingsView 
                    trip={trip as any} 
                    lang={lang} 
                    t={t} 
                    currencySymbol={currencySymbol} 
                    themeColor={themeColor} 
                    onUpdateTrip={onUpdateTrip} 
                  />
               </div>
             )}
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Section 2: Ticket Wallet / PNR Manager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {t('personalWallet')}
                </span>
                <h4 className="text-sm font-black text-slate-800 tracking-tight">
                  {t('manualTicketWallet')}
                </h4>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddTicket(!showAddTicket)}
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center"
              >
                <Plus className={`w-4 h-4 transition-transform duration-300 ${showAddTicket ? 'rotate-45' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {showAddTicket && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTicket(e);
                  }}
                  className="overflow-hidden space-y-3 p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-inner"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('bookingType')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Flight', 'Train', 'Hotel', 'Other'] as const).map((type) => {
                        const isSelected = ticketType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setTicketType(type)}
                            className={`py-2 px-1 text-xs font-black uppercase tracking-wider rounded-xl border transition-all text-center ${
                              isSelected 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {type === 'Flight' && '✈️ ' + t('flight')}
                            {type === 'Train' && '🚂 ' + t('train')}
                            {type === 'Hotel' && '🏨 ' + t('hotel')}
                            {type === 'Other' && '🎟️ ' + t('other')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t('pnrNumber')}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={t('pnrPlaceholder')}
                      value={pnrNumber}
                      onChange={(e) => setPnrNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono tracking-widest text-center uppercase outline-none focus:ring-2 focus:ring-emerald/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t('detailsNotesOptional')}
                    </label>
                    <input 
                      type="text"
                      placeholder={t('pnrDetailsPlaceholder')}
                      value={ticketNotes}
                      onChange={(e) => setTicketNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald/20"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
                      style={{ backgroundColor: themeColor }}
                    >
                      {t('saveTicket')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTicket(false)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200/50 hover:bg-slate-200 transition-all"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {(trip.savedTickets || []).length > 0 ? (
                (trip.savedTickets || []).map((ticket) => {
                  const isCopied = copiedId === ticket.id;
                  return (
                    <div 
                      key={ticket.id} 
                      className="flex items-center justify-between p-3.5 bg-white/80 rounded-[20px] border border-slate-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          ticket.type === 'Flight' ? 'bg-emerald/10 text-emerald border border-emerald/20' :
                          ticket.type === 'Train' ? 'bg-emerald/10 text-emerald border border-emerald/20' :
                          ticket.type === 'Hotel' ? 'bg-emerald/10 text-emerald border border-emerald/20' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {ticket.type === 'Flight' && <Plane className="w-5 h-5" />}
                          {ticket.type === 'Train' && <Car className="w-5 h-5" />}
                          {ticket.type === 'Hotel' && <MapPin className="w-5 h-5" />}
                          {ticket.type === 'Other' && <Ticket className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              {ticket.type === 'Flight' && t('flight')}
                              {ticket.type === 'Train' && t('train')}
                              {ticket.type === 'Hotel' && t('hotel')}
                              {ticket.type === 'Other' && t('other')}
                            </span>
                          </div>
                          <p className="text-base font-black font-mono tracking-widest text-slate-800 truncate select-all">
                            {ticket.pnr}
                          </p>
                          {ticket.notes && (
                            <p className="text-xs font-bold text-slate-500 truncate mt-0.5">
                              {ticket.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button 
                          onClick={() => handleCopyPnr(ticket.pnr, ticket.id)}
                          className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center border shadow-sm ${
                            isCopied 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                          title={t('copyPnr')}
                        >
                          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleRemoveTicket(ticket.id)} 
                          className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title={t('deleteTicket')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 px-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    {lang === 'mr' 
                      ? 'अजून कोणतेही तिकीट सेव्ह केलेले नाही. प्रवासाच्या दिवशी झटपट प्रवेशासाठी तुमचे पीएनआर येथे जोडा.'
                      : 'No tickets saved yet. Add your PNRs here for quick copy on the day of the trip.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Legal Compliance Disclaimer */}
          <div className="pt-6 border-t border-slate-200/40 text-center">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 leading-relaxed max-w-lg mx-auto">
              Disclaimer: All bookings are managed securely by our trusted third-party partners. We do not process payments and are not legally responsible for cancellations, refunds, or any service-related issues.
            </p>
          </div>
        </div>
      )}
    </div>
  )}

        {/* Chart Section */}
        {activeSubTab === 'expenses' && chartData.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2" style={{ color: themeColor }}>
                {chartType === 'pie' ? <PieChartIcon className="w-5 h-5" /> : <BarChartIcon className="w-5 h-5" />}
                <span className="text-sm font-bold uppercase tracking-wide">{t('expenseBreakdown')}</span>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-3 py-1 text-sm font-bold uppercase rounded-lg transition-all ${chartType === 'pie' ? 'bg-white shadow-sm' : 'text-slate-800 hover:text-slate-700'}`}
                  style={chartType === 'pie' ? { color: themeColor } : {}}
                >
                  {t('pie')}
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-sm font-bold uppercase rounded-lg transition-all ${chartType === 'bar' ? 'bg-white shadow-sm' : 'text-slate-800 hover:text-slate-700'}`}
                  style={chartType === 'bar' ? { color: themeColor } : {}}
                >
                  {t('bar')}
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value, entry, index) => (
                        <span className="text-sm font-bold text-slate-800 uppercase">{value}</span>
                      )}
                    />
                  </PieChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => `${value}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weather Forecast - Moved to Bottom */}
        <div className="bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
          <WeatherWidget 
            forecast={trip.weatherForecast || []} 
            lang={lang} 
            location={trip.name}
            startDate={trip.startDate}
            endDate={trip.endDate}
          />
        </div>
      </div>

      {/* Trip Manager Live Advisory Chat Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            {/* Backdrop click closes modal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setSelectedAlert(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col h-[88vh] sm:h-[80vh] shadow-2xl z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center shrink-0 border-b border-indigo-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/25 rounded-2xl flex items-center justify-center border border-indigo-400/30 shadow-inner">
                    <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider leading-none flex items-center gap-2">
                      <span>{t('aiTripManager')}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-full border border-emerald-400/30">LIVE</span>
                    </h3>
                    <p className="text-[11px] font-bold text-slate-300 tracking-wide mt-1">
                      {lang === 'mr' ? `२४/७ ट्रिप असिस्टंट (${trip.name})` : lang === 'hi' ? `२४/७ ट्रिप असिस्टेंट (${trip.name})` : `24/7 Trip Advisory (${trip.name})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Context Alert / Daily Briefing Header Banner */}
              <div className="px-4 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center gap-2 shrink-0">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider leading-none">
                    {lang === 'mr' ? 'आजचे ब्रीफिंग व संदर्भातील माहिती:' : lang === 'hi' ? 'आज का ब्रीफिंग और संदर्भ:' : 'Context Alert / Morning Briefing:'}
                  </p>
                  <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">
                    {typeof selectedAlert.title === "string" ? selectedAlert.title : JSON.stringify(selectedAlert.title)}
                  </p>
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 pb-[30px] [&::-webkit-scrollbar]:hidden">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-center gap-3 flex-row">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold shadow-xs leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none font-bold'
                            : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-sm'
                        }`}
                      >
                        {typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text)}
                      </div>
                    </div>
                  </div>
                ))}

                {isSendingMessage && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs font-bold text-slate-600 shadow-xs flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span>{lang === 'mr' ? 'मॅनेजर उत्तर तयार करत आहे...' : lang === 'hi' ? 'मैनेजर जवाब तैयार कर रहा है...' : 'Manager is processing...'}</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* CLICKABLE DYNAMIC SUGGESTION CHIPS */}
              <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60 overflow-x-auto flex gap-2 scrollbar-hide shrink-0">
                {(lang === 'mr' ? [
                  { label: '💎 जवळपासची गुपित ठिकाणे', prompt: `💎 ${trip.name} जवळील प्रसिद्ध गुप्त / अनपेक्षित प्रेक्षणीय स्थळे कोणती आहेत?` },
                  { label: '🍲 प्रसिद्ध स्थानिक खाद्यपदार्थ', prompt: `🍲 ${trip.name} मध्ये कोणते प्रसिद्ध स्थानिक खाद्यपदार्थ आणि हॉटेल्स आहेत?` },
                  { label: '⚠️ सुरक्षेच्या टिप्स', prompt: `⚠️ ${trip.name} प्रवासासाठी महत्त्वाच्या सुरक्षेच्या आणि स्थानिक प्रवास टिप्स द्या.` },
                  { label: '🌦️ आजचे हवामान व नियोजन', prompt: `🌦️ आजचे हवामान कसे आहे आणि आम्ही पुढील काय नियोजन करावे?` }
                ] : lang === 'hi' ? [
                  { label: '💎 पास के गुप्त पर्यटन स्थल', prompt: `💎 ${trip.name} के पास कौन से गुप्त/अनोखे पर्यटन स्थल हैं?` },
                  { label: '🍲 प्रसिद्ध स्थानीय व्यंजन', prompt: `🍲 ${trip.name} में प्रसिद्ध स्थानीय व्यंजन और खाने की जगहें कौन सी हैं?` },
                  { label: '⚠️ सुरक्षा के उपयोगी सुझाव', prompt: `⚠️ ${trip.name} यात्रा के लिए सुरक्षा और सावधानियों की सूची दें.` },
                  { label: '🌦️ मौसम और आज का प्लान', prompt: `🌦️ आज का मौसम कैसा है और हमारा अगला प्लान क्या होना चाहिए?` }
                ] : [
                  { label: '💎 Show Hidden Gems nearby', prompt: `💎 What are the best off-beat hidden gems near ${trip.name}?` },
                  { label: '🍲 Best Local Food & Eats', prompt: `🍲 What iconic local delicacies and food spots should we try in ${trip.name}?` },
                  { label: '⚠️ Safety & Local Tips', prompt: `⚠️ Give me key safety advice and transport tips for ${trip.name}.` },
                  { label: '🌦️ Weather & Today Schedule', prompt: `🌦️ What is today's weather advisory and schedule guidance?` }
                ]).map((chip, idx) => (
                  <button
                    key={idx}
                    disabled={isSendingMessage}
                    onClick={() => sendChatMessage(chip.prompt)}
                    className="flex-shrink-0 px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 hover:border-emerald-400 rounded-full text-xs font-black transition-all shadow-2xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Message Text Input Area */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex gap-2 sm:gap-3 items-center shrink-0">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendChatMessage();
                  }}
                  disabled={isSendingMessage}
                  placeholder={lang === 'mr' ? 'मॅनेजरला प्रश्न विचारा / चर्चा करा...' : lang === 'hi' ? 'मैनेजर से सवाल पूछें...' : 'Ask Manager anything...'}
                  className="flex-1 px-4 py-3 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button
                  onClick={() => sendChatMessage()}
                  disabled={isSendingMessage || !chatMessage.trim()}
                  className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency Assistance Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowEmergencyModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4 border-2 border-rose-500 max-h-[85vh]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center animate-pulse">
                    <Siren className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{t('emergencyAssistance')}</h3>
                    <p className="text-sm font-bold text-slate-500">{lang === 'mr' ? 'जवळची मदत त्वरित शोधा' : lang === 'hi' ? 'तुरंत नज़दीकी मदद खोजें' : 'Find help nearby immediately'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <a 
                  href="https://www.google.com/maps/search/Hospitals+near+me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl hover:bg-rose-100 transition-colors active:scale-95"
                >
                  <span className="text-2xl">🏥</span>
                  <span className="font-bold text-rose-700 uppercase tracking-widest text-sm">{t('nearbyHospitals')}</span>
                </a>
                <a 
                  href="https://www.google.com/maps/search/Police+Stations+near+me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-colors active:scale-95"
                >
                  <span className="text-2xl">🚓</span>
                  <span className="font-bold text-emerald-700 uppercase tracking-widest text-sm">{t('nearbyPolice')}</span>
                </a>
                <a 
                  href="https://www.google.com/maps/search/Garages+near+me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-4 bg-slate-100 border border-slate-200 rounded-2xl hover:bg-slate-200 transition-colors active:scale-95"
                >
                  <span className="text-2xl">🛠️</span>
                  <span className="font-bold text-slate-700 uppercase tracking-widest text-sm">{t('nearbyGarages')}</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}

        {showSettleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button 
                onClick={() => {
                  setShowSettleModal(false);
                  setSettleClickCount(0);
                }}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 pt-10 text-center">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-rose-600" />
                </div>
                
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  {lang === 'mr' ? 'सहल सेटल करा?' : 'Settle This Trip?'}
                </h3>
                <p className="text-slate-600 mb-8 text-sm">
                  {lang === 'mr' 
                    ? 'ही कृती परत घेता येणार नाही. सर्व खर्च आणि हिशोब लॉक केले जातील.' 
                    : 'This action is irreversible. All expenses and deposits will be locked permanently.'}
                </p>

                <button 
                  onClick={handleSettleClick}
                  className={`w-full py-4 rounded-2xl font-black tracking-wider uppercase text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    settleClickCount === 0 ? 'bg-rose-500 hover:bg-rose-600' : 
                    settleClickCount === 1 ? 'bg-rose-600 hover:bg-rose-700' : 
                    'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {settleClickCount === 0 
                    ? (lang === 'mr' ? 'पुष्टी करा' : 'Confirm Settlement') 
                    : settleClickCount === 1 
                      ? (lang === 'mr' ? 'तुम्हाला खात्री आहे?' : 'Are You Sure?') 
                      : (lang === 'mr' ? 'अंतिम पुष्टी' : 'Final Confirmation!')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
