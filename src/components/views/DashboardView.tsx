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
import * as freeUtils from '../../services/api/freeUtils';
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
        const cache = await caches.open('routripo-wataghati-v6');
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
    <>
      <div className="space-y-5 w-full">
      {trip.destination && (
        <div className="px-5">
                  </div>
      )}
      
      
      {countryInfo && (
        <div className="px-5 flex items-center justify-center gap-2 mt-2 text-sm font-semibold text-slate-600 bg-slate-100/60 px-3 py-1.5 rounded-full border border-slate-200/50">
          <span className="text-lg leading-none">{countryInfo.flag}</span>
          <span>{countryInfo.name}</span>
          {countryInfo.currencies && (
            <span className="text-slate-400 border-l border-slate-300 pl-2 ml-1">
              {Object.values(countryInfo.currencies).map((c: any) => c.symbol).join(', ')}
            </span>
          )}
        </div>
      )}

        <div className="w-full">
          <HolidayAlertWidget startDate={trip.startDate} endDate={trip.endDate} lang={lang} />
        </div>

        {trip.defaultCurrency && trip.defaultCurrency !== 'INR' && (
          <div className="w-full">
            <CurrencyWidget currencyCode={trip.defaultCurrency} lang={lang} />
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

        

      
        {/* Playlist UI */}
        <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-5 border border-slate-200/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <Music className="w-4 h-4" style={{ color: themeColor }} />
              <span className="text-sm font-bold uppercase tracking-widest">{t('tripPlaylist')}</span>
            </div>
            <button 
              onClick={() => {
                setShowPlaylistAdd(!showPlaylistAdd);
                setPlaylistUrl('');
                setPlaylistTitle('');
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
                    <button onClick={() => { window.open(item.url, '_blank'); }} className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-600"><Play className="w-3.5 h-3.5" /></button>
                    {item?.addedBy === userId && (
                      <button onClick={() => onRemovePlaylistItem(item.id)} className="p-2.5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
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
      </AnimatePresence>

      <AnimatePresence>
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
    </>
  );
};
