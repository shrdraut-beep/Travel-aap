import { OptimizeRouteButton } from "../OptimizeRouteButton";
import { NearbyUtilitiesModal } from "../modals/NearbyUtilitiesModal";
import { FlightTrackerWidget } from "../FlightTrackerWidget";
import { WikipediaSnippet } from "../WikipediaSnippet";
import { TimepassGame } from './TimepassGame';
import React from 'react';
import {  motion, AnimatePresence } from 'framer-motion';
import { Plus, Compass, MapPin, ChevronRight, Music, Camera, ExternalLink, Play, Trash2, Clock, Ticket, Hotel, TreePalm, Sparkles, RefreshCw, MessageSquareQuote, Info, TrendingUp, AlertTriangle, Milestone, Train, Share2, Check, CheckCircle2, Navigation, Fuel, Calculator, X, ChevronDown, ChevronUp, FileText, Stethoscope, Shirt, Smartphone, Package, List, CalendarDays, Users } from 'lucide-react';
import { TripPlan, TripGroup, PackingItem, PackingCategory } from '../../types';
import Markdown from 'react-markdown';
import { BudgetDashboardModal } from '../modals/BudgetDashboardModal';
import { PrimaryButton } from '../common/PrimaryButton';
import { CalendarView } from './CalendarView';
import { WeatherWidget } from '../WeatherWidget';
import { ItineraryCard } from '../ItineraryCard';

const TripMap = React.lazy(() => import('../map/TripMap').then(m => ({ default: m.TripMap })));

const HARDCODED_PACKING_CATEGORIES = (lang: string): PackingCategory[] => {
  const isMr = lang === 'mr';
  return [
    {
      id: 'cat_docs',
      name: isMr ? 'महत्त्वाची कागदपत्रे (Documents)' : 'Important Documents',
      items: [
        { id: 'doc_1', name: isMr ? 'ओळखपत्र (आधार कार्ड / पॅन कार्ड / मतदान कार्ड)' : 'ID Proof (Aadhaar / PAN / Voter ID)', isChecked: false, essential: true },
        { id: 'doc_2', name: isMr ? 'ड्रायव्हिंग लायसन्स' : 'Driving License', isChecked: false, essential: true },
        { id: 'doc_3', name: isMr ? 'प्रवासाची तिकिटे (विमान / ट्रेन / बस)' : 'Travel Tickets (Flight / Train / Bus)', isChecked: false, essential: true },
        { id: 'doc_4', name: isMr ? 'हॉटेल बुकिंग कन्फर्मेशन' : 'Hotel Booking Confirmation', isChecked: false, essential: true },
        { id: 'doc_5', name: isMr ? 'पासपोर्ट आणि व्हिसा' : 'Passport & Visa', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_medicines',
      name: isMr ? 'औषधे आणि प्रथमोपचार (Medicines & First Aid)' : 'Medicines & First Aid',
      items: [
        { id: 'med_1', name: isMr ? 'नियमित औषधे (बीपी, शुगर इ.)' : 'Regular Medicines (BP, Sugar, etc.)', isChecked: false, essential: true },
        { id: 'med_2', name: isMr ? 'डोकेदुखी आणि ताप (पॅरासिटामॉल)' : 'Headache & Fever (Paracetamol)', isChecked: false, essential: true },
        { id: 'med_3', name: isMr ? 'ॲसिडिटी आणि गॅसची औषधे' : 'Acidity & Gas Relief', isChecked: false, essential: false },
        { id: 'med_4', name: isMr ? 'उलटी आणि मळमळ थांबवण्याची औषधे' : 'Motion Sickness / Nausea Relief', isChecked: false, essential: false },
        { id: 'med_5', name: isMr ? 'बँड-एड आणि अँटीसेप्टिक मलम' : 'Band-Aid & Antiseptic Ointment', isChecked: false, essential: true },
        { id: 'med_6', name: isMr ? 'ओआरएस (ORS) किंवा इलेक्ट्रॉल' : 'ORS / Electral Powder', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_clothing',
      name: isMr ? 'कपडे आणि पादत्राणे (Clothing & Footwear)' : 'Clothing & Footwear',
      items: [
        { id: 'cloth_1', name: isMr ? 'टी-शर्ट्स आणि टॉप्स' : 'T-Shirts & Tops', isChecked: false, essential: true },
        { id: 'cloth_2', name: isMr ? 'पँट्स / जीन्स / ट्रॅक पँट्स' : 'Pants / Jeans / Track Pants', isChecked: false, essential: true },
        { id: 'cloth_3', name: isMr ? 'अंडरवेअर / इनरवियर' : 'Underwear / Innerwear', isChecked: false, essential: true },
        { id: 'cloth_4', name: isMr ? 'रात्रीचे आरामदायक कपडे (Nightwear)' : 'Comfortable Nightwear', isChecked: false, essential: false },
        { id: 'cloth_5', name: isMr ? 'स्वेटर किंवा जॅकेट' : 'Sweater or Jacket', isChecked: false, essential: false },
        { id: 'cloth_6', name: isMr ? 'चालण्यासाठी शूज (ट्रेकिंग/स्पोर्ट)' : 'Walking Shoes (Trekking / Sports)', isChecked: false, essential: true },
        { id: 'cloth_7', name: isMr ? 'स्लीपर्स किंवा सँडल्स' : 'Slippers or Sandals', isChecked: false, essential: false },
        { id: 'cloth_8', name: isMr ? 'मोजे (Socks)' : 'Socks', isChecked: false, essential: true },
      ]
    },
    {
      id: 'cat_electronics',
      name: isMr ? 'इलेक्ट्रॉनिक्स (Electronics)' : 'Electronics',
      items: [
        { id: 'elec_1', name: isMr ? 'मोबाईल आणि चार्जर' : 'Mobile & Charger', isChecked: false, essential: true },
        { id: 'elec_2', name: isMr ? 'पॉवर बँक' : 'Power Bank', isChecked: false, essential: true },
        { id: 'elec_3', name: isMr ? 'इअरफोन्स / हेडफोन्स' : 'Earphones / Headphones', isChecked: false, essential: false },
        { id: 'elec_4', name: isMr ? 'कॅमेरा आणि अतिरिक्त बॅटरी' : 'Camera & Extra Battery', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_toiletries',
      name: isMr ? 'आवश्यक वस्तू व टॉयलेटरीज (Essentials & Toiletries)' : 'Essentials & Toiletries',
      items: [
        { id: 'ess_1', name: isMr ? 'पाण्याची बाटली' : 'Water Bottle', isChecked: false, essential: true },
        { id: 'ess_2', name: isMr ? 'गॉगल आणि टोपी' : 'Goggles & Cap/Hat', isChecked: false, essential: false },
        { id: 'ess_3', name: isMr ? 'छत्री किंवा रेनकोट' : 'Umbrella or Raincoat', isChecked: false, essential: false },
        { id: 'ess_4', name: isMr ? 'टूथब्रश आणि टूथपेस्ट' : 'Toothbrush & Toothpaste', isChecked: false, essential: true },
        { id: 'ess_5', name: isMr ? 'साबण, फेस वॉश आणि शाम्पू' : 'Soap, Face Wash & Shampoo', isChecked: false, essential: true },
        { id: 'ess_6', name: isMr ? 'मॉइश्चरायझर आणि सनस्क्रीन' : 'Moisturizer & Sunscreen', isChecked: false, essential: false },
        { id: 'ess_7', name: isMr ? 'सॅनिटायझर आणि वेट वाईप्स' : 'Sanitizer & Wet Wipes', isChecked: false, essential: true },
      ]
    }
  ];
};

interface PlannerViewProps {
  itinerary: TripPlan[];
  trip: TripGroup;
  userId: string;
  onAddPlan: () => void;
  onAddDeposit?: () => void;
  onGenerateAI: (type: 'pre' | 'post') => void;
  isAIGenerating: boolean;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  activeSubTab: string;
  onSubTabChange: (tab: string) => void;
  onOpenFuelCalculator?: () => void;
  onAddPlaylistItem?: (title: string, url: string, artist?: string, thumbnailUrl?: string) => void;
  onRemovePlaylistItem?: (id: string) => void;
  onAddGalleryItem?: (imageUrl: string) => void;
  onNavigate?: (tab: string) => void;
  onUpdateTrip?: (trip: TripGroup) => void;
  isSharingLocation?: boolean;
  onToggleLocationShare?: (sharing: boolean) => void;
  themeColor?: string;
  isTripCompleted?: boolean;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ 
  itinerary, 
  trip, 
  userId, 
  onAddPlan, 
  onAddDeposit, 
  onGenerateAI, 
  isAIGenerating, 
  lang, 
  t, 
  currencySymbol, 
  activeSubTab, 
  onSubTabChange, 
  onOpenFuelCalculator, 
  onAddPlaylistItem, 
  onRemovePlaylistItem, 
  onAddGalleryItem, 
  onNavigate, 
  onUpdateTrip, 
  isSharingLocation, 
  onToggleLocationShare,
  themeColor: propThemeColor,
  isTripCompleted 
}) => {
  const [showBudgetModal, setShowBudgetModal] = React.useState(false);
  const [isFabOpen, setIsFabOpen] = React.useState(false);
  const [songTitle, setSongTitle] = React.useState('');
  const [isSearchingSong, setIsSearchingSong] = React.useState(false);
  const [songSearchError, setSongSearchError] = React.useState<string | null>(null);
  const [playlist, setPlaylist] = React.useState(trip.playlist || []);
  const [showPlaylistAdd, setShowPlaylistAdd] = React.useState(false);
  const themeColor = trip.themeColor || '#6366f1';

  const handleSaveSong = async () => {
    if (!songTitle.trim()) return;
    setIsSearchingSong(true);
    setSongSearchError(null);

    try {
      let songData: any = null;

      // 1. Try direct saavn.dev open-source API
      try {
        const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(songTitle.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success !== false && data.data?.results?.length > 0) {
            const first = data.data.results[0];
            const downloadArr = first.downloadUrl || first.download_url || [];
            const audioUrl = downloadArr.length > 0 ? downloadArr[downloadArr.length - 1]?.url : '';
            const imageArr = first.image || [];
            const image = imageArr.length > 0 ? (imageArr[2]?.url || imageArr[imageArr.length - 1]?.url || imageArr[0]?.url) : '';
            const title = first.name || first.title || songTitle.trim();

            if (audioUrl) {
              songData = { id: first.id || String(Date.now()), title, image, audioUrl, addedBy: 'You' };
            }
          }
        }
      } catch (e) {
        console.warn("saavn.dev client fetch failed, trying proxy...", e);
      }

      // 2. Fallback to /api/search-songs if saavn.dev failed or was blocked
      if (!songData) {
        try {
          const res = await fetch(`/api/search-songs?query=${encodeURIComponent(songTitle.trim())}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.data?.results?.length > 0) {
              const first = data.data.results[0];
              const downloadArr = first.downloadUrl || [];
              const audioUrl = downloadArr.length > 0 ? downloadArr[downloadArr.length - 1]?.url : '';
              const imageArr = first.image || [];
              const image = imageArr.length > 0 ? (imageArr[2]?.url || imageArr[imageArr.length - 1]?.url || imageArr[0]?.url) : '';
              const title = first.name || first.title || songTitle.trim();
              if (audioUrl) {
                songData = { id: first.id || String(Date.now()), title, image, audioUrl, addedBy: 'You' };
              }
            }
          }
        } catch (e) {
          console.warn("Proxy search failed", e);
        }
      }

      if (songData) {
        const updatedPlaylist = [...playlist, songData];
        setPlaylist(updatedPlaylist);
        if (onAddPlaylistItem) {
          onAddPlaylistItem(songData.title, songData.audioUrl, undefined, songData.image);
        }
        setSongTitle('');
        setSongSearchError(null);
        setShowPlaylistAdd(false);
      } else {
        const err = lang === 'mr' ? 'गाणे सापडले नाही, कृपया दुसरे नाव वापरून पहा.' : 'Song not found, please try another title.';
        setSongSearchError(err);
      }
    } catch (err) {
      const errMessage = lang === 'mr' ? 'गाणे सापडले नाही, कृपया दुसरे नाव वापरून पहा.' : 'Song not found, please try another title.';
      setSongSearchError(errMessage);
    } finally {
      setIsSearchingSong(false);
    }
  };


  React.useEffect(() => {
    if (trip.playlist) {
      setPlaylist(trip.playlist);
    }
  }, [trip.playlist]);

  const [newItemName, setNewItemName] = React.useState('');
  const [showCopied, setShowCopied] = React.useState(false);
  const [itineraryViewMode, setItineraryViewMode] = React.useState<'list' | 'calendar'>('list');

  const [newFriendName, setNewFriendName] = React.useState('');
  const [friends, setFriends] = React.useState<{id: string, name: string}[]>(trip.friends || []);

  const [newDocName, setNewDocName] = React.useState('');
  const [documents, setDocuments] = React.useState<{id: string, name: string}[]>(trip.documents || []);

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    const updated = [...friends, { id: 'fr_' + Date.now(), name: newFriendName.trim() }];
    setFriends(updated);
    setNewFriendName('');
    if (onUpdateTrip) onUpdateTrip({ ...trip, friends: updated });
  };

  const handleRemoveFriend = (id: string) => {
    const updated = friends.filter(f => f.id !== id);
    setFriends(updated);
    if (onUpdateTrip) onUpdateTrip({ ...trip, friends: updated });
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    const updated = [...documents, { id: 'doc_' + Date.now(), name: newDocName.trim() }];
    setDocuments(updated);
    setNewDocName('');
    if (onUpdateTrip) onUpdateTrip({ ...trip, documents: updated });
  };

  const handleRemoveDocument = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    if (onUpdateTrip) onUpdateTrip({ ...trip, documents: updated });
  };

  const [localGallery, setLocalGallery] = React.useState<any[]>(() => {
    return [...(trip.gallery || []), ...(trip.memories || [])];
  });
  const [showNearbyModal, setShowNearbyModal] = React.useState(false);

  React.useEffect(() => {
    setLocalGallery([...(trip.gallery || []), ...(trip.memories || [])]);
  }, [trip.gallery, trip.memories]);

  const handleDeletePhoto = (targetIdx: number) => {
    setLocalGallery(prev => prev.filter((_, idx) => idx !== targetIdx));
  };

  const packingCategories: PackingCategory[] = React.useMemo(() => {
    if (trip.detailedPackingList && trip.detailedPackingList.length >= 5) {
      return trip.detailedPackingList;
    }
    return HARDCODED_PACKING_CATEGORIES(lang);
  }, [trip.detailedPackingList, lang]);

  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    HARDCODED_PACKING_CATEGORIES(lang).forEach(cat => {
      initial[cat.id] = true;
    });
    return initial;
  });

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const packingProgress = React.useMemo(() => {
    const allItems = packingCategories.flatMap(cat => cat.items);
    if (allItems.length === 0) return 0;
    const checked = allItems.filter(i => i.isChecked).length;
    return Math.round((checked / allItems.length) * 100);
  }, [packingCategories]);

  const handleToggleDetailedItem = (catId: string, itemId: string) => {
    if (!onUpdateTrip) return;
    const currentList = trip.detailedPackingList && trip.detailedPackingList.length >= 5 
      ? trip.detailedPackingList 
      : HARDCODED_PACKING_CATEGORIES(lang);

    const updated = currentList.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, isChecked: !item.isChecked } : item)
        };
      }
      return cat;
    });
    onUpdateTrip({ ...trip, detailedPackingList: updated });
  };

  const generateDetailedPackingList = () => {
    if (!onUpdateTrip) return;
    onUpdateTrip({ ...trip, detailedPackingList: HARDCODED_PACKING_CATEGORIES(lang) });
  };

  const sortedItinerary = [...(itinerary || [])].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const forecastBudget = React.useMemo(() => {
    if (!trip) return null;
    const budget = trip.totalBudget || (trip.members || []).reduce((sum, m) => sum + m.totalDeposited, 0);
    if (budget === 0 || (trip.expenses || []).length === 0) return null;

    const fixedCategories = ['hotels', 'transport', 'traveling', 'fuel', 'highway'];
    
    let totalFixed = 0;
    let totalVariable = 0;

    (trip.expenses || []).forEach(e => {
      if (fixedCategories.includes(e.category)) {
        totalFixed += e.amount;
      } else {
        totalVariable += e.amount;
      }
    });

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const now = new Date();
    if (now < start || now > end) return null;

    const totalDurationMs = end.getTime() - start.getTime();
    const passedDurationMs = now.getTime() - start.getTime();
    const remainingDurationMs = totalDurationMs - passedDurationMs;

    const effectiveTotalMs = totalDurationMs === 0 ? 24 * 60 * 60 * 1000 : totalDurationMs;
    
    if (effectiveTotalMs <= 0 || passedDurationMs <= 0) return null;

    const passedDays = passedDurationMs / (1000 * 60 * 60 * 24);
    const remainingDays = remainingDurationMs / (1000 * 60 * 60 * 24);
    
    const dailyRunRate = totalVariable / passedDays;
    const expectedRemainingVariableCost = dailyRunRate * remainingDays;
    
    const projectedSpend = totalFixed + totalVariable + expectedRemainingVariableCost;
    const isOverBudget = projectedSpend > budget;

    return {
      projectedSpend,
      budget,
      isOverBudget,
      progressRatio: passedDurationMs / effectiveTotalMs,
      currentBurnRate: dailyRunRate,
    };
  }, [trip]);

  const getIcon = (plan: TripPlan) => {
    const titleLower = (plan.title || "").toLowerCase();
    const detailLower = (plan.detail || "").toLowerCase();
    
    const isTrain = titleLower.includes('train') || titleLower.includes('rail') || titleLower.includes('express') || titleLower.includes('irctc') || titleLower.includes('railway') || titleLower.includes('station') || detailLower.includes('train') || detailLower.includes('railway');
    const isRoadOrMilestone = titleLower.includes('road') || titleLower.includes('drive') || titleLower.includes('car') || titleLower.includes('taxi') || titleLower.includes('bus') || titleLower.includes('highway') || titleLower.includes('toll') || titleLower.includes('km') || titleLower.includes('milestone') || titleLower.includes('travel') || titleLower.includes('way') || titleLower.includes('route');

    if (isTrain) return <Train className="w-5 h-5 text-emerald" />;
    if (isRoadOrMilestone) return <Milestone className="w-5 h-5 text-emerald animate-pulse" />;

    switch (plan.type) {
      case 'ticket': return <Ticket className="w-5 h-5 text-coral" />;
      case 'hotel': return <Hotel className="w-5 h-5 text-coral" />;
      case 'activity': return <TreePalm className="w-5 h-5 text-emerald" />;
      default: return <Clock className="w-5 h-5 text-emerald" />;
    }
  };

  return (
    <div className="px-5 py-2 space-y-6 min-h-screen">
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-tight text-center">{lang === 'mr' ? 'प्रवास नियोजन' : 'Trip Planner'}</h2>
          </div>
        </div>

        <PrimaryButton 
          onClick={() => setShowBudgetModal(true)}
          icon={TrendingUp}
          label={lang === 'mr' ? 'बजेट आणि प्रत्यक्ष खर्च' : 'Budget vs Actual Expenses'}
          fullWidth
        />

        <BudgetDashboardModal 
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          trip={trip}
          lang={lang}
        />

        <div className="flex p-1.5 bg-white backdrop-blur-md rounded-[24px] w-full border border-slate-200/50 shadow-sm overflow-x-auto scrollbar-hide gap-1">
           <button 
             onClick={() => onSubTabChange('itinerary')}
             className={`flex-1 min-w-[85px] py-3 px-2 rounded-[18px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${activeSubTab === 'itinerary' ? 'text-white shadow-lg' : 'text-slate-800 hover:bg-slate-200/50'}`}
             style={activeSubTab === 'itinerary' ? { backgroundColor: themeColor } : {}}
           >
             <Clock className="w-3.5 h-3.5" />
             {lang === 'mr' ? 'नियोजन' : 'Schedule'}
           </button>
           <button 
             onClick={() => onSubTabChange('prep')}
             className={`flex-1 min-w-[85px] py-3 px-2 rounded-[18px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${activeSubTab === 'prep' || activeSubTab === 'packing' ? 'text-white shadow-lg' : 'text-slate-800 hover:bg-slate-200/50'}`}
             style={activeSubTab === 'prep' || activeSubTab === 'packing' ? { backgroundColor: themeColor } : {}}
           >
             <List className="w-3.5 h-3.5" />
             {lang === 'mr' ? 'तयारी' : 'Prep'}
           </button>
           <button 
             onClick={() => onSubTabChange('fun')}
             className={`flex-1 min-w-[100px] py-3 px-2 rounded-[18px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${activeSubTab === 'fun' || activeSubTab === 'playlist' ? 'text-white shadow-lg' : 'text-slate-800 hover:bg-slate-200/50'}`}
             style={activeSubTab === 'fun' || activeSubTab === 'playlist' ? { backgroundColor: themeColor } : {}}
           >
             <Sparkles className="w-3.5 h-3.5" />
             {lang === 'mr' ? 'मनोरंजन' : 'Fun'}
           </button>
           <button 
             onClick={() => onSubTabChange('tracking_guide')}
             className={`flex-1 min-w-[110px] py-3 px-2 rounded-[18px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${activeSubTab === 'tracking_guide' ? 'text-white shadow-lg' : 'text-slate-800 hover:bg-slate-200/50'}`}
             style={activeSubTab === 'tracking_guide' ? { backgroundColor: themeColor } : {}}
           >
             <Compass className="w-3.5 h-3.5" />
             {lang === 'mr' ? 'ट्रॅकिंग व गाईड' : 'Tracking & Guide'}
           </button>
           <button 
             onClick={() => onSubTabChange('map')}
             className={`flex-1 min-w-[90px] py-3 px-2 rounded-[18px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${activeSubTab === 'map' ? 'text-white shadow-lg' : 'text-slate-800 hover:bg-slate-200/50'}`}
             style={activeSubTab === 'map' ? { backgroundColor: themeColor } : {}}
           >
             <Navigation className="w-3.5 h-3.5" />
             {lang === 'mr' ? 'दोस्त नकाशा' : 'Find Friends'}
           </button>
        </div>
      </div>



      {activeSubTab === 'itinerary' && forecastBudget && (
        <div className="mb-6">
          <div className="bg-white backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-slate-200/50 relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              {lang === 'mr' ? 'बजेट अंदाज' : 'Budget Forecast'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'mr' ? 'अपेक्षित खर्च' : 'Projected Total'}
                </p>
                <p className={`text-2xl font-black`} style={{ color: forecastBudget.isOverBudget ? '#f43f5e' : themeColor }}>
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(Math.round(forecastBudget.projectedSpend))}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'mr' ? 'सध्याचा वेग' : 'Current Burn Rate'}
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(Math.round(forecastBudget.currentBurnRate))}/d
                </p>
              </div>
            </div>
            {forecastBudget.isOverBudget && (
              <div className="mt-4 p-3 bg-rose-50/50 rounded-xl flex items-start gap-3 border border-rose-100/50 relative z-10">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-700 leading-snug">
                  {lang === 'mr' 
                    ? `बजेट ${currencySymbol}${new Intl.NumberFormat('en-IN').format(Math.round(forecastBudget.projectedSpend - forecastBudget.budget))} ने ओलांडले जाईल.`
                    : `Budget exceeded by ${currencySymbol}${new Intl.NumberFormat('en-IN').format(Math.round(forecastBudget.projectedSpend - forecastBudget.budget))}.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative space-y-6">
        {/* ITINERARY & SCHEDULE TAB */}
        {activeSubTab === 'itinerary' && (
          <>
            {isTripCompleted && (
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-3 text-slate-500 shadow-inner mb-4">
                <Info className="w-5 h-5" />
                <p className="text-sm font-bold tracking-tight">
                  This trip is completed. Smart features are disabled to save resources.
                </p>
              </div>
            )}

            {/* TOGGLE VIEW CONTROLLER */}
            <div className="flex items-center justify-between bg-white backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-sm mb-4">
              <button
                type="button"
                onClick={() => setItineraryViewMode('list')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  itineraryViewMode === 'list'
                    ? 'bg-emerald text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="w-4 h-4" />
                <span>{lang === 'mr' ? 'Smart लिस्ट व्ह्यू (List)' : 'Smart List View'}</span>
              </button>

              <button
                type="button"
                onClick={() => setItineraryViewMode('calendar')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  itineraryViewMode === 'calendar'
                    ? 'bg-emerald text-white shadow-md font-black'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>{lang === 'mr' ? 'कॅलेंडर व्ह्यू (Grid)' : 'Calendar View'}</span>
              </button>
            </div>

            {itineraryViewMode === 'calendar' ? (
              <CalendarView
                trip={trip}
                itinerary={itinerary}
                lang={lang}
                currencySymbol={currencySymbol}
                onUpdateTrip={onUpdateTrip}
                onAddPlan={onAddPlan}
              />
            ) : (
              <>
                
                <div className="absolute left-[31px] top-[140px] bottom-24 w-1 bg-slate-200/40 rounded-full hidden" />

                {(itinerary || []).length === 0 ? (
                  <div className="bg-white backdrop-blur-md rounded-[32px] border border-slate-200/50 p-12 text-center space-y-5 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
                      <Compass className="w-10 h-10 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-800 font-bold text-lg">{lang === 'mr' ? 'अजून काहीही नाही' : 'No plans yet'}</p>
                      <p className="text-slate-700 text-sm font-medium px-6">{t('noPlans')}</p>
                    </div>
                    <button 
                      onClick={onAddPlan}
                      className="px-6 py-3.5 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                      style={{ backgroundColor: themeColor }}
                    >
                      {t('addPlan')}
                    </button>
                  </div>
                ) : (
                  sortedItinerary.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative flex"
                    >
                      <div className={`flex-1 w-full ${
                        plan.id.includes('ai') 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-orange-500/20' 
                          : [
                              'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-blue-500/20',
                              'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-purple-500/20',
                              'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20',
                              'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-rose-500/20',
                              'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-indigo-500/20'
                            ][idx % 5]
                      } rounded-[28px] p-5 shadow-lg space-y-3 active:scale-[0.99] transition-all`}>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold uppercase tracking-widest flex items-center gap-1.5 ${plan.id.includes('ai') ? 'text-white/90' : 'text-white/90'}`}>
                                <Clock className="w-3 h-3" />
                                {new Date(plan.datetime).toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}
                                {' • '}
                                {new Date(plan.datetime).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <h4 className="text-[17px] font-bold text-white tracking-tight drop-shadow-sm">{plan.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {plan.cost && plan.cost > 0 && (
                              <span className="text-[15px] font-black text-slate-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm">
                                {currencySymbol}{plan.cost}
                              </span>
                            )}
                            <div className="flex items-center justify-center w-7 h-7 bg-white/20 backdrop-blur-md rounded-full shadow-sm border border-white/30" title={plan.bookingRef || (!plan.id.includes('ai') && new Date(plan.datetime).getTime() < new Date().getTime()) ? 'Confirmed' : 'Pending'}>
                              {plan.bookingRef || (!plan.id.includes('ai') && new Date(plan.datetime).getTime() < new Date().getTime()) ? (
                                <CheckCircle2 className="w-4 h-4 text-green-300 drop-shadow-sm" />
                              ) : (
                                <Clock className="w-4 h-4 text-white drop-shadow-sm" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`text-base sm:text-lg font-bold leading-relaxed prose prose-base sm:prose-lg max-w-none mt-1 text-white/95`}>
                          <ItineraryCard 
                            plan={plan} 
                            transportMode={trip.transportMode} 
                            dayNumber={Math.floor((new Date(plan.datetime).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                            totalDays={Math.floor((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                            city={plan.location?.name}
                          />
                        </div>
                        {plan.id.includes('ai') && <WikipediaSnippet query={plan.title} lang={lang} />}
                        {plan.bookingRef && (
                          <div className="pt-1">
                            <span className="px-2.5 py-1 bg-white/20 text-white text-sm font-bold rounded-lg uppercase tracking-widest backdrop-blur-sm border border-white/30">{lang === 'mr' ? 'बुकिंग ID' : 'REF'}: {plan.bookingRef}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Agoda Image Banner */}
                <div className="mt-8 mb-6 flex justify-center w-full p-2">
                  <a 
                    href="https://www.agoda.com/partners/partnersearch.aspx?pcs=10&cid=1969781&hl=en-us&hid=25963734" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block transition-transform duration-300 hover:scale-105"
                  >
                    <img 
                      src="https://pix8.agoda.net/hotelImages/18952579/0/48512318c6f01ac53d2b7d9556d9b37c.jpg?ca=28&ce=0&s=240x180" 
                      srcSet="https://pix8.agoda.net/hotelImages/18952579/0/48512318c6f01ac53d2b7d9556d9b37c.jpg?ca=28&ce=0&s=240x180 1x, https://pix8.agoda.net/hotelImages/18952579/0/48512318c6f01ac53d2b7d9556d9b37c.jpg?ca=28&ce=0&s=480x360 2x" 
                      alt="Agoda वर सर्वोत्तम हॉटेल बुक करा" 
                      className="rounded-xl shadow-lg border border-gray-200"
                    />
                  </a>
                </div>
              </>
            )}
          </>
        )}

        
        {/* PREP TAB (तयारी) */}
        {(activeSubTab === 'prep' || activeSubTab === 'packing') && (
          <div className="space-y-6 relative z-10">
            {/* Relocated Fuel & Toll Calculator Button inside Prep */}
            {onOpenFuelCalculator && (
              <div className="bg-gradient-to-r from-emerald to-emerald-600 rounded-[24px] p-4 text-white shadow-xl flex items-center justify-between border border-emerald/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                    <Fuel className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm leading-tight truncate">
                      {lang === 'mr' ? 'पेट्रोल आणि टोल हिशोब' : 'Fuel & Toll Calculator'}
                    </h4>
                    <p className="text-xs text-white/80 font-medium truncate">
                      {lang === 'mr' ? 'मायलेज व टोलचा अचूक खर्च काढा' : 'Calculate journey fuel & toll charges'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenFuelCalculator}
                  className="px-4 py-2.5 bg-white text-emerald rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-white/90 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  {lang === 'mr' ? 'हिशोब करा' : 'Calculate'}
                </button>
              </div>
            )}

            {/* Travel Companions (सोबतचे प्रवासी) */}
            <div className="bg-white backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-slate-200/50 space-y-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald" />
                {lang === 'mr' ? 'सोबतचे प्रवासी (Travel Companions)' : 'Travel Companions'}
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'mr' ? "मित्राचे नाव (उदा. अनिकेत)" : "Friend's Name (e.g. Aniket)"}
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald/20"
                />
                <button
                  onClick={handleAddFriend}
                  disabled={!newFriendName.trim()}
                  className="px-5 py-2.5 bg-emerald text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-all shadow-sm shrink-0"
                >
                  {lang === 'mr' ? 'जोडा' : 'Add'}
                </button>
              </div>

              {friends.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald/5 text-emerald rounded-lg text-sm font-bold border border-emerald/10">
                      <span>{friend.name}</span>
                      <button onClick={() => handleRemoveFriend(friend.id)} className="p-0.5 hover:bg-emerald/10 rounded-full transition-colors ml-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                  <p className="text-sm font-bold text-slate-500">{lang === 'mr' ? 'अद्याप कोणतीही माहिती नाही' : 'No companions added'}</p>
                </div>
              )}
            </div>

            {/* Document Wallet (डॉक्युमेंट वॉलेट) */}
            <div className="bg-white backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-slate-200/50 space-y-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                {lang === 'mr' ? 'डॉक्युमेंट वॉलेट (उदा. तिकीट, आधार कार्ड)' : 'Document Wallet (e.g. Tickets, ID)'}
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="text"
                  placeholder={lang === 'mr' ? "डॉक्युमेंटचे नाव" : "Document Name"}
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDocument()}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-0"
                />
                <button
                  onClick={handleAddDocument}
                  disabled={!newDocName.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider disabled:opacity-50 transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'डॉक्युमेंट सेव्ह करा' : 'Save Document'}</span>
                </button>
              </div>

              {documents.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm truncate">{doc.name}</span>
                      </div>
                      <button onClick={() => handleRemoveDocument(doc.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0" title={lang === 'mr' ? 'काढून टाका' : 'Delete'}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                  <p className="text-sm font-bold text-slate-500">{lang === 'mr' ? 'अद्याप कोणतीही माहिती नाही' : 'No documents saved'}</p>
                </div>
              )}
            </div>

            {/* Smart Packing Checklist */}
{/* 3. Smart Packing Checklist */}
            <div className="bg-white backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-slate-200/50 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">
                    {lang === 'mr' ? 'पॅकिंग प्रगती' : 'Packing Progress'}
                  </h3>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mt-1">
                    {packingProgress}% {lang === 'mr' ? 'पूर्ण झाले' : 'Completed'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
                  <Check className="w-6 h-6" />
                </div>
              </div>

              <div className="h-3 w-full bg-slate-100/50 rounded-full overflow-hidden border border-slate-200/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${packingProgress}%` }}
                  className="h-full rounded-full shadow-sm"
                  style={{ backgroundColor: themeColor }}
                />
              </div>

              <div className="space-y-6">
                {packingCategories.map(cat => {
                  const isExpanded = expandedCategories[cat.id] !== false;
                  const categoryCheckedCount = cat.items.filter(i => i.isChecked).length;
                  const categoryTotalCount = cat.items.length;

                  let CategoryIcon = Package;
                  if (cat.id.includes('docs')) CategoryIcon = FileText;
                  else if (cat.id.includes('medicines')) CategoryIcon = Stethoscope;
                  else if (cat.id.includes('clothing')) CategoryIcon = Shirt;
                  else if (cat.id.includes('electronics')) CategoryIcon = Smartphone;

                  return (
                    <div key={cat.id} className="border border-slate-200/70 rounded-2xl overflow-hidden bg-slate-50/40">
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpand(cat.id)}
                        className="w-full p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald/5 text-emerald flex items-center justify-center shrink-0">
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              {cat.name}
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {categoryCheckedCount} / {categoryTotalCount} {lang === 'mr' ? 'झाले' : 'packed'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            categoryCheckedCount === categoryTotalCount && categoryTotalCount > 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {categoryCheckedCount === categoryTotalCount && categoryTotalCount > 0
                              ? (lang === 'mr' ? 'पूर्ण' : 'Done')
                              : `${Math.round((categoryCheckedCount / (categoryTotalCount || 1)) * 100)}%`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 pt-1 space-y-2 border-t border-slate-100">
                          {cat.items.map(item => (
                            <button 
                              key={item.id}
                              type="button"
                              onClick={() => handleToggleDetailedItem(cat.id, item.id)}
                              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                item.isChecked 
                                  ? 'bg-emerald-50/40 border-emerald-200/60' 
                                  : 'bg-white border-slate-200/60 hover:border-emerald/30 shadow-2xs active:scale-[0.99]'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${
                                item.isChecked 
                                  ? 'bg-emerald border-emerald text-white' 
                                  : 'border-slate-300 bg-white'
                              }`}>
                                {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className={`flex-1 font-semibold text-xs sm:text-sm ${
                                item.isChecked ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}>
                                {item.name}
                              </span>
                              {item.essential && !item.isChecked && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-coral/10 text-coral rounded-md shrink-0">
                                  {lang === 'mr' ? 'महत्वाचे' : 'Essential'}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button 
                  type="button"
                  onClick={generateDetailedPackingList}
                  className="w-full py-3.5 text-xs font-bold text-slate-700 uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  {lang === 'mr' ? 'पॅकिंग लिस्ट रीसेट करा' : 'Reset Packing List'}
                </button>
              </div>
            </div>

            
          </div>
        )}

        {/* FUN TAB (मनोरंजन) */}
        {(activeSubTab === 'fun' || activeSubTab === 'playlist') && (
          <div className="space-y-6 relative z-10">
            {/* 1. Trip Music Playlist */}
            <div className="bg-white backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-slate-200/50 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald" />
                    {lang === 'mr' ? 'सहलीची गाणी (Playlist)' : 'Trip Music Playlist'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {lang === 'mr' ? 'प्रवासादरम्यान एकत्र ऐकण्यासाठी गाणी जोडा' : 'Add favorite songs for the road trip'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = lang === 'mr' ? 'आपली सहलीची गाणी (Playlist) पहा: ' : 'Check out our trip playlist: ';
                      const url = window.location.href;
                      if (navigator.share) {
                        navigator.share({ title: 'Trip Playlist', text, url }).catch(() => {});
                      } else {
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
                      }
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald/5 hover:bg-emerald/10 text-emerald rounded-2xl flex items-center justify-center transition-all shadow-sm"
                    title={lang === 'mr' ? 'प्लेलिस्ट शेअर करा' : 'Share Playlist'}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowPlaylistAdd(!showPlaylistAdd)}
                    className="px-4 py-2 bg-emerald hover:bg-emerald/90 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald/10 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'mr' ? 'गाणे जोडा' : 'Add Song'}
                  </button>
                </div>
              </div>

              {/* Add Song Form */}
              {showPlaylistAdd && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <input
                    type="text"
                    placeholder={lang === 'mr' ? 'गाण्याचे नाव (उदा. देवा श्री गणेशा)' : 'Song Title (e.g. Deva Shree Ganesha)'}
                    value={songTitle}
                    onChange={(e) => {
                      setSongTitle(e.target.value);
                      if (songSearchError) setSongSearchError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveSong();
                    }}
                    disabled={isSearchingSong}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald/20 disabled:opacity-50"
                  />

                  {songSearchError && (
                    <p className="text-xs font-bold text-coral flex items-center gap-1.5 px-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{songSearchError}</span>
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowPlaylistAdd(false);
                        setSongSearchError(null);
                      }}
                      disabled={isSearchingSong}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase disabled:opacity-50"
                    >
                      {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveSong}
                      disabled={isSearchingSong || !songTitle.trim()}
                      className="px-5 py-2 bg-emerald hover:bg-emerald/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {isSearchingSong ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{lang === 'mr' ? 'गाणे शोधत आहे...' : 'Searching...'}</span>
                        </>
                      ) : (
                        <span>{lang === 'mr' ? 'सेव्ह करा' : 'Save'}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Playlist items */}
              {(!playlist || playlist.length === 0) ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <Music className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'mr' ? 'अद्याप कोणतेही गाणे जोडलेले नाही' : 'No playlist songs added yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {playlist.map((song) => {
                    const audioSrc = song.audioUrl || song.url;
                    const imgSrc = song.image || song.thumbnailUrl;
                    return (
                      <div key={song.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={song.title}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                <Music className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-800 text-sm truncate">{song.title}</h4>
                              <span className="text-[10px] text-slate-400 font-bold block truncate">
                                {song.addedBy ? `Added by ${song.addedBy}` : (lang === 'mr' ? 'सहलीचे गाणे' : 'Trip Song')}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setPlaylist(playlist.filter(s => s.id !== song.id));
                              if (onRemovePlaylistItem) {
                                onRemovePlaylistItem(song.id);
                              }
                            }}
                            className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
                            title={lang === 'mr' ? 'काढून टाका' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">{lang === 'mr' ? 'काढून टाका' : 'Delete'}</span>
                          </button>
                        </div>

                        {/* Native HTML5 In-App Audio Player */}
                        {audioSrc && audioSrc !== '#' && !audioSrc.includes('youtube.com') ? (
                          <div className="pt-1">
                            <audio
                              controls
                              src={audioSrc}
                              className="w-full h-10 rounded-xl focus:outline-none"
                              controlsList="nodownload"
                            ></audio>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Open Sky Flight Search / Flight Radar */}
            <div className="bg-white backdrop-blur-md rounded-[32px] p-5 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="text-xl">✈️</span>
                <div>
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    {lang === 'mr' ? 'ओपन स्काय फ्लाईट शोध (Open Sky Flight Search)' : 'Open Sky Flight Search'}
                  </h3>
                  <p className="text-[11px] font-bold text-indigo-600">
                    {lang === 'mr' ? 'तयारी व मनोरंजन विभागात लाईव्ह रडार' : 'Live Flight Radar inside Prep & Fun'}
                  </p>
                </div>
              </div>
              <FlightTrackerWidget lang={lang} />
            </div>

            
            {/* Travel Timepass & Games */}
            <TimepassGame trip={trip} lang={lang} />
          </div>
        )}

        {/* TRACKING & GUIDE TAB (ट्रॅकिंग आणि गाईड) */}
        {activeSubTab === 'tracking_guide' && (
          <div className="space-y-6 relative z-10">
            {/* Live Weather Forecast */}
            <div className="bg-white backdrop-blur-md rounded-[32px] p-1 shadow-sm border border-slate-200/50">
              <WeatherWidget 
                forecast={trip.weatherForecast || []} 
                lang={lang} 
                location={trip.name}
                startDate={trip.startDate}
                endDate={trip.endDate}
                onUpdateForecast={(newForecast) => {
                  if (onUpdateTrip) {
                    onUpdateTrip({ ...trip, weatherForecast: newForecast });
                  }
                }}
              />
            </div>

            {/* Find Nearby Utilities Button */}
            <button
              onClick={() => setShowNearbyModal(true)}
              className="w-full bg-emerald/5 border border-emerald/10 text-emerald rounded-2xl p-4 flex items-center justify-between shadow-sm hover:bg-emerald/10 transition-colors active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald/10 text-emerald rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm">{lang === 'mr' ? 'जवळपासच्या सुविधा शोधा' : 'Find Nearby Utilities'}</h4>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-emerald/60">{lang === 'mr' ? 'पेट्रोल पंप, हॉस्पिटल आणि ATM (OSM)' : 'Fuel, Hospitals & ATMs (OSM)'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Route Optimizer */}
            <OptimizeRouteButton 
              itinerary={itinerary} 
              onUpdateItinerary={(newItinerary) => {
                if (onUpdateTrip) onUpdateTrip({ ...trip, itinerary: newItinerary });
              }} 
              lang={lang} 
            />
          </div>
        )}
        
        {activeSubTab === 'map' && (
          <div className="space-y-6 relative z-10">
            <React.Suspense fallback={
              <div className="w-full h-[500px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 border border-slate-200">
                <RefreshCw className="w-8 h-8 text-emerald animate-spin" />
                <p className="text-xs font-bold text-slate-500">
                  {lang === 'mr' ? 'दोस्त नकाशा लोड होत आहे...' : 'Loading Dost Nakasha Map...'}
                </p>
              </div>
            }>
              <TripMap 
                trip={trip} 
                lang={lang} 
                onUpdateTrip={onUpdateTrip}
                userId={userId}
                isSharingLocation={isSharingLocation}
                onToggleLocationShare={onToggleLocationShare}
              />
            </React.Suspense>
          </div>
        )}
      </div>

      {activeSubTab === 'itinerary' && (
        <div className="fixed bottom-[110px] right-[20px] z-50 flex flex-col items-end gap-3">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                className="flex flex-col items-end gap-2.5 mb-1"
              >
                {/* Deposit Money Action */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFabOpen(false);
                    if (onAddDeposit) {
                      onAddDeposit();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-deposit-modal'));
                    }
                  }}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition-all cursor-pointer active:scale-95 border border-slate-700/50"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    {lang === 'mr' ? 'रक्कम जमा करा' : lang === 'hi' ? 'जमा करें' : 'Deposit Money'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    ₹
                  </div>
                </button>

                {/* Add Plan Action */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFabOpen(false);
                    onAddPlan();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald text-white rounded-2xl shadow-xl hover:bg-emerald/90 transition-all cursor-pointer active:scale-95 border border-emerald/20"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {lang === 'mr' ? 'नवीन योजना जोडा' : 'Add Plan'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-16 h-16 text-white rounded-3xl shadow-2xl flex items-center justify-center transition-all cursor-pointer border ${isFabOpen ? 'rotate-45' : ''}`}
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
          >
            <Plus className="w-8 h-8" />
          </motion.button>
        </div>
      )}

      <NearbyUtilitiesModal 
        isOpen={showNearbyModal} 
        onClose={() => setShowNearbyModal(false)} 
        lang={lang} 
      />

    </div>
  );
};
