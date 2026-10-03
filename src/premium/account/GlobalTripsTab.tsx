import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Briefcase, MapPin, Calendar, Users, ArrowRight, Wallet, 
  Search, Sparkles, Tag, Copy, Check, Clock, 
  Flame, CheckCircle2, ChevronRight, X,
  Upload, Calculator, Trash2, Plane, TrainFront, Car, Bus,
  Compass, FileText, CheckSquare, Layers, AlertCircle, Info,
  Loader2, ArrowLeftRight, ExternalLink, ShieldCheck, HeartHandshake, UserPlus
} from 'lucide-react';
import { useTripContext } from '../../context/TripContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlobalBrandHeader } from '../../components/common/GlobalBrandHeader';
import { SmartBudgetModal } from '../../components/modals/SmartBudgetModal';
import { TripGroup, CalculationMode, TripPlan, Member } from '../../types';

// Popular Destinations presets from FutureTripModal
const POPULAR_DESTINATIONS = [
  { name: 'Goa', emoji: '🌴' },
  { name: 'Manali', emoji: '🏔️' },
  { name: 'Mahabaleshwar', emoji: '🍓' },
  { name: 'Udaipur', emoji: '🏰' },
  { name: 'Kerala', emoji: '🚣' },
  { name: 'Lonavala', emoji: '⛰️' },
  { name: 'Kashmir', emoji: '❄️' },
  { name: 'Varanasi', emoji: '🛕' },
];

// Preset Template Itineraries from FutureTripModal
const PROMPT_PRESETS = [
  { label: '🌴 3-Day Goa Beach & Sunset', dest: 'Goa', days: '3', type: 'leisure', transport: 'flight', budget: '25000' },
  { label: '🍓 Weekend Mahabaleshwar', dest: 'Mahabaleshwar', days: '2', type: 'family', transport: 'car', budget: '12000' },
  { label: '🏔️ Manali Adventure & Snow', dest: 'Manali', days: '5', type: 'adventure', transport: 'bus', budget: '28000' },
  { label: '🛕 Varanasi Ghats & Heritage', dest: 'Varanasi', days: '3', type: 'pilgrimage', transport: 'train', budget: '15000' },
];

const TRANSPORT_OPTIONS = [
  { id: 'flight', labelMr: 'विमान (Flight)', labelEn: 'Flight', icon: Plane, emoji: '✈️' },
  { id: 'train', labelMr: 'रेल्वे (Train)', labelEn: 'Train', icon: TrainFront, emoji: '🚂' },
  { id: 'car', labelMr: 'कॅब / गाडी (Cab)', labelEn: 'Cab / Car', icon: Car, emoji: '🚗' },
  { id: 'bus', labelMr: 'बस (Bus)', labelEn: 'Bus', icon: Bus, emoji: '🚌' },
];

const TRIP_TYPES = [
  { id: 'leisure', labelMr: '🌴 सुट्टी / पर्यटन', labelEn: '🌴 Vacation' },
  { id: 'adventure', labelMr: '🏔️ ट्रेकिंग / साहस', labelEn: '🏔️ Adventure' },
  { id: 'pilgrimage', labelMr: '🛕 धार्मिक दर्शन', labelEn: '🛕 Pilgrimage' },
  { id: 'family', labelMr: '👨‍👩‍👧‍👦 कौटुंबिक सहल', labelEn: '👨‍👩‍👧‍👦 Family' },
  { id: 'friends', labelMr: '👥 मित्र परिवार', labelEn: '👥 Friends' },
  { id: 'couple', labelMr: '👩‍❤️‍👨 कपल्स ट्रिप', labelEn: '👩‍❤️‍👨 Couple' },
  { id: 'solo', labelMr: '👤 सोलो प्रवास', labelEn: '👤 Solo' },
];

interface SmartViaRoute {
  id: string;
  nameMr: string;
  nameEn: string;
  descMr: string;
  descEn: string;
}

const getSmartViaRoutes = (dep: string, dest: string): SmartViaRoute[] => {
  const d = (dep || '').toLowerCase().trim();
  const t = (dest || '').toLowerCase().trim();

  // Pune <-> Ratnagiri
  if ((d.includes('pune') || d.includes('पुणे')) && (t.includes('ratnagiri') || t.includes('रत्नागिरी'))) {
    return [
      { id: 'Karad', nameMr: 'कराड मार्गे (आंबा घाट)', nameEn: 'Via Karad (Amba Ghat)', descMr: 'पुणे-सातारा-कराड-मलकापूर (~३३५ किमी)', descEn: 'Pune-Satara-Karad-Amba Ghat (~335 km)' },
      { id: 'Tamhini Ghat', nameMr: 'ताम्हिणी घाट मार्गे (माणगाव)', nameEn: 'Via Tamhini Ghat (Scenic)', descMr: 'ताम्हिणी-माणगाव-चिपळूण (~३१० किमी)', descEn: 'Tamhini-Mangaon-Chiplun (~310 km)' },
      { id: 'Mumbai', nameMr: 'मुंबई / पनवेल मार्गे (NH 66)', nameEn: 'Via Mumbai / Panvel (NH 66)', descMr: 'द्रुतगती महामार्ग + कोकण हायवे (~४६० किमी)', descEn: 'Expressway + Coastal NH 66 (~460 km)' },
    ];
  }

  // Mumbai <-> Goa
  if ((d.includes('mumbai') || d.includes('मुंबई')) && (t.includes('goa') || t.includes('गोवा'))) {
    return [
      { id: 'Pune-Kolhapur', nameMr: 'पुणे-कोल्हापूर-बेळगाव मार्गे (NH 48)', nameEn: 'Via Pune-Kolhapur (NH 48)', descMr: '४-लेन महामार्ग, वेगवान प्रवास (~५९० किमी)', descEn: '4-Lane Express Highway (~590 km)' },
      { id: 'Chiplun-Ratnagiri', nameMr: 'चिपळूण-रत्नागिरी सागरी महामार्ग (NH 66)', nameEn: 'Via Chiplun-Ratnagiri (NH 66)', descMr: 'सागरी महामार्ग निसर्ग दर्शन (~५५० किमी)', descEn: 'Scenic Konkan Coastal Route (~550 km)' },
    ];
  }

  // Pune <-> Goa
  if ((d.includes('pune') || d.includes('पुणे')) && (t.includes('goa') || t.includes('गोवा'))) {
    return [
      { id: 'Kolhapur-Belagavi', nameMr: 'कोल्हापूर-बेळगाव-चोरला घाट मार्गे', nameEn: 'Via Kolhapur-Belagavi', descMr: 'सर्वोत्तम स्मूथ ४-लेन रस्ता (~४५० किमी)', descEn: 'Smoothest 4-lane Highway (~450 km)' },
      { id: 'Amboli Ghat', nameMr: 'आंबोली घाट मार्गे (सावंतवाडी)', nameEn: 'Via Amboli Ghat (Scenic)', descMr: 'निसर्गरम्य धबधबे व घाट (~४४० किमी)', descEn: 'Scenic Waterfalls & Ghat (~440 km)' },
      { id: 'Karad-Ratnagiri', nameMr: 'कराड-रत्नागिरी कोकण किनारा मार्गे', nameEn: 'Via Karad-Ratnagiri Coastal', descMr: 'आंबा घाट व कोकण दर्शन (~४९० किमी)', descEn: 'Amba Ghat & Coastal Sightseeing' },
    ];
  }

  // Mumbai <-> Mahabaleshwar
  if ((d.includes('mumbai') || d.includes('मुंबई')) && (t.includes('mahabaleshwar') || t.includes('महाबळेश्वर'))) {
    return [
      { id: 'Pune-Wai', nameMr: 'पुणे-वाई मार्गे (एक्स्प्रेसवे)', nameEn: 'Via Pune-Wai (Expressway)', descMr: 'सुलभ व वेगवान प्रवास (~२६० किमी)', descEn: 'Fast & Easy via Expressway (~260 km)' },
      { id: 'Poladpur Ghat', nameMr: 'पोलादपूर घाट मार्गे (NH 66)', nameEn: 'Via Poladpur Ghat (Scenic)', descMr: 'पेण-महाड-पोलादपूर निसर्गरम्य (~२२० किमी)', descEn: 'Pen-Mahad-Poladpur Route (~220 km)' },
    ];
  }

  // Pune <-> Shirdi
  if ((d.includes('pune') || d.includes('पुणे')) && (t.includes('shirdi') || t.includes('शिर्डी'))) {
    return [
      { id: 'Sangamner', nameMr: 'संगमनेर मार्गे (नाशिक हायवे)', nameEn: 'Via Sangamner (Nashik Hwy)', descMr: 'चाकण-नारायणगाव-संगमनेर (~२०० किमी)', descEn: 'Chakan-Sangamner Route (~200 km)' },
      { id: 'Ahmednagar', nameMr: 'अहमदनगर मार्गे', nameEn: 'Via Ahmednagar', descMr: 'शिकापूर-अहमदनगर-राहुरी (~२०५ किमी)', descEn: 'Shikrapur-Ahmednagar (~205 km)' },
    ];
  }

  return [];
};

interface AdminAd {
  id: string;
  badge: string;
  titleMr: string;
  titleEn: string;
  descMr: string;
  descEn: string;
  tag: string;
  ctaTextMr: string;
  ctaTextEn: string;
  link?: string;
  accent: 'rose' | 'emerald' | 'sky' | 'amber';
}

interface AdminCoupon {
  id: string;
  code: string;
  discount: string;
  titleMr: string;
  titleEn: string;
  descMr: string;
  descEn: string;
  expiry: string;
}

const DEFAULT_ADS: AdminAd[] = [
  {
    id: 'ad-1',
    badge: 'प्रायोजित डील (Featured Deal)',
    titleMr: 'हॉटेल आणि होमस्टेवर २५% थेट सवलत',
    titleEn: 'Direct 25% Off on Hotels & Homestays',
    descMr: 'कोकण, गोवा आणि महाबळेश्वरच्या अधिकृत पार्टनर रिसॉर्ट्सवर सर्वोत्तम बचत.',
    descEn: 'Save big on certified partner resorts in Konkan, Goa and Mahabaleshwar.',
    tag: 'सीमित ऑफर',
    ctaTextMr: 'ऑफर पाहा',
    ctaTextEn: 'View Deal',
    accent: 'rose'
  },
  {
    id: 'ad-2',
    badge: 'प्रवास सुविधा (Self Drive / Cabs)',
    titleMr: 'झूमकार व सेल्फ-ड्राईव्ह गाड्यांवर १५% कॅशबॅक',
    titleEn: '15% Cashback on Self-Drive Rentals & Cabs',
    descMr: 'पुणे, मुंबई आणि कोल्हापूरमधून सवलतीत सुरक्षित गाड्या बुक करा.',
    descEn: 'Book safe, sanitized self-drive cars from Pune, Mumbai and Kolhapur.',
    tag: 'पार्टनर डिस्काउंट',
    ctaTextMr: 'गाडी निवडा',
    ctaTextEn: 'Choose Car',
    accent: 'sky'
  }
];

const DEFAULT_COUPONS: AdminCoupon[] = [
  {
    id: 'c-1',
    code: 'ROUTRIPO500',
    discount: '₹५०० सूट',
    titleMr: 'पहिल्या सहल नियोजनावर ₹५०० सूट',
    titleEn: '₹500 Off on First Group Trip Booking',
    descMr: 'कमीत कमी ₹५००० च्या एकूण सहल बुकिंगवर लागू.',
    descEn: 'Applicable on total trip bookings above ₹5,000.',
    expiry: '३१ ऑक्टोबर २०२६'
  },
  {
    id: 'c-2',
    code: 'KONKANFEAST',
    discount: '१५% सूट',
    titleMr: 'कोकण खाद्यसंस्कृती आणि स्टे वर १५% ऑफ',
    titleEn: '15% Off on Konkan Authentic Cuisine & Stays',
    descMr: 'रत्नागिरी व सिंधुदुर्गमधील निवडक रेस्टॉरंट्स व होमस्टेवर.',
    descEn: 'On select verified homestays & restaurants in Ratnagiri & Sindhudurg.',
    expiry: '१५ नोव्हेंबर २०२६'
  }
];

export interface GlobalTripsTabProps {
  onCreateTrip?: () => void;
  onOpenAiPlanner?: () => void;
  onEnterTrip?: () => void;
  onOpenProfile?: () => void;
  onOpenSos?: () => void;
}

export const GlobalTripsTab: React.FC<GlobalTripsTabProps> = ({
  onCreateTrip,
  onOpenAiPlanner,
  onEnterTrip,
  onOpenProfile,
  onOpenSos
}) => {
  const { trips, activeTrip, setActiveTrip, addNewTrip, updateActiveTrip, deleteTrip } = useTripContext();
  const { lang } = useLanguage();

  // Filter tabs: 'all' | 'UPCOMING' | 'ONGOING' | 'COMPLETED'
  const [filterTab, setFilterTab] = useState<'all' | 'UPCOMING' | 'ONGOING' | 'COMPLETED'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAiModal, setShowAiModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showAdminAdModal, setShowAdminAdModal] = useState(false);
  const [showAdminCouponModal, setShowAdminCouponModal] = useState(false);
  const [showSmartBudget, setShowSmartBudget] = useState(false);
  const [smartBudgetSource, setSmartBudgetSource] = useState<'ai' | 'manual'>('manual');

  // Copy notification & Toast
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Ads & Coupons from localStorage
  const [ads, setAds] = useState<AdminAd[]>(() => {
    try {
      const saved = localStorage.getItem('routripo_admin_ads');
      return saved ? JSON.parse(saved) : DEFAULT_ADS;
    } catch {
      return DEFAULT_ADS;
    }
  });

  const [coupons, setCoupons] = useState<AdminCoupon[]>(() => {
    try {
      const saved = localStorage.getItem('routripo_admin_coupons');
      return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('routripo_admin_ads', JSON.stringify(ads));
    } catch (e) {
      console.error(e);
    }
  }, [ads]);

  useEffect(() => {
    try {
      localStorage.setItem('routripo_admin_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  // AI Pre-Trip Planner State
  const [aiDep, setAiDep] = useState('Pune');
  const [aiDest, setAiDest] = useState('Goa');
  const [aiVia, setAiVia] = useState('');
  const [aiDays, setAiDays] = useState('3');
  const [aiPersons, setAiPersons] = useState('2');
  const [aiTripType, setAiTripType] = useState('leisure');
  const [aiTransport, setAiTransport] = useState('flight');
  const [aiBudget, setAiBudget] = useState('18000');
  const [aiStartDate, setAiStartDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [aiLoadingStep, setAiLoadingStep] = useState<string | null>(null);
  const [aiPreviewPlan, setAiPreviewPlan] = useState<any>(null);

  const smartViaRoutes = useMemo(() => getSmartViaRoutes(aiDep, aiDest), [aiDep, aiDest]);

  // Manual Trip Planner State
  const [manName, setManName] = useState('');
  const [manDestination, setManDestination] = useState('');
  const [manStartDate, setManStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [manEndDate, setManEndDate] = useState(new Date(Date.now() + 86400000 * 4).toISOString().substring(0, 10));
  const [manTripType, setManTripType] = useState('friends');
  const [manCalcMode, setManCalcMode] = useState<CalculationMode>('admin_pooled');
  const [manTotalBudget, setManTotalBudget] = useState('15000');
  const [manMembers, setManMembers] = useState<{ name: string; deposit: string; upiId: string; isAdmin: boolean }[]>([
    { name: 'प्रवास प्रमुख (Admin)', deposit: '2000', upiId: 'admin@okaxis', isAdmin: true },
    { name: 'सचिन (Sachin)', deposit: '2000', upiId: 'sachin@okhdfc', isAdmin: false },
    { name: 'रोहन (Rohan)', deposit: '2000', upiId: 'rohan@icici', isAdmin: false }
  ]);

  // New Ad Form State
  const [newAdBadge, setNewAdBadge] = useState('खास सवलत');
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdTag, setNewAdTag] = useState('वेबसाइट स्पेशल');
  const [newAdCta, setNewAdCta] = useState('आता बुक करा');
  const [newAdAccent, setNewAdAccent] = useState<'rose' | 'emerald' | 'sky' | 'amber'>('rose');

  // New Coupon Form State
  const [newCpnCode, setNewCpnCode] = useState('');
  const [newCpnDiscount, setNewCpnDiscount] = useState('₹५०० सूट');
  const [newCpnTitle, setNewCpnTitle] = useState('');
  const [newCpnDesc, setNewCpnDesc] = useState('');
  const [newCpnExpiry, setNewCpnExpiry] = useState('३० नोव्हेंबर २०२६');

  // Filtered trips computation
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Status filter
      if (filterTab !== 'all') {
        const tripStatus = trip.status || 'ACTIVE';
        if (filterTab === 'UPCOMING' && tripStatus !== 'PLANNED') return false;
        if (filterTab === 'ONGOING' && tripStatus !== 'ACTIVE') return false;
        if (filterTab === 'COMPLETED' && tripStatus !== 'COMPLETED' && tripStatus !== 'SETTLED') return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = trip.name.toLowerCase().includes(q);
        const matchesDest = trip.destination.toLowerCase().includes(q);
        if (!matchesName && !matchesDest) return false;
      }
      return true;
    });
  }, [trips, filterTab, searchQuery]);

  // Counts for tabs
  const upcomingCount = useMemo(() => trips.filter(t => t.status === 'PLANNED').length, [trips]);
  const ongoingCount = useMemo(() => trips.filter(t => (t.status || 'ACTIVE') === 'ACTIVE').length, [trips]);
  const completedCount = useMemo(() => trips.filter(t => t.status === 'COMPLETED' || t.status === 'SETTLED').length, [trips]);

  // Copy code handler
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(lang === 'mr' ? `कूपन कोड "${code}" कॉपी केला!` : `Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // AI Preset apply
  const handleApplyPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    setAiDest(preset.dest);
    setAiVia('');
    setAiDays(preset.days);
    setAiTripType(preset.type);
    setAiTransport(preset.transport);
    setAiBudget(preset.budget);
  };

  // AI Plan Generation execution
  const executeGenerateAiTrip = async () => {
    if (!aiDest.trim()) {
      showToast(lang === 'mr' ? 'कृपया गंतव्य स्थान टाका' : 'Please enter destination');
      return;
    }

    setAiLoadingStep(lang === 'mr' ? '📍 अंतर, मार्ग आणि वेळ मोजत आहे...' : '📍 Calculating route & travel time...');
    setAiPreviewPlan(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      setAiLoadingStep(aiTransport === 'train'
        ? (lang === 'mr' ? '🚂 IRCTC रेल्वे मार्ग व आरक्षण तपासत आहे...' : '🚂 Checking IRCTC trains & bookings...')
        : aiTransport === 'flight'
        ? (lang === 'mr' ? '✈️ थेट विमान उड्डाणे आणि दर तपासत आहे...' : '✈️ Checking flight schedules & fares...')
        : (lang === 'mr' ? '🚗 महामार्ग, घाट रस्ते, टोल व इंधन खर्च तपासत आहे...' : '🚗 Checking highways, ghats, tolls & fuel...'));

      await new Promise(r => setTimeout(r, 600));
      setAiLoadingStep(lang === 'mr' ? '✨ सर्वोत्तम प्रेक्षणीय स्थळे व वेळापत्रक आखत आहे...' : '✨ Curating top attractions & schedule...');

      await new Promise(r => setTimeout(r, 500));
      setAiLoadingStep(lang === 'mr' ? '🏨 उत्तम हॉटेल्स व स्थानिक खाद्यसंस्कृती जोडत आहे...' : '🏨 Curating stays & local food experiences...');

      const response = await fetch('/api/generate-future-trip-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: aiDest.trim(),
          departureCity: aiDep.trim(),
          days: parseInt(aiDays) || 3,
          persons: parseInt(aiPersons) || 2,
          budget: parseInt(aiBudget) || 15000,
          tripType: aiTripType,
          transportMode: aiTransport,
          departureDate: aiStartDate,
          viaRoute: aiVia.trim(),
          lang: lang || 'mr'
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      if (data && (data.days || data.itinerary || data.trip_title)) {
        setAiPreviewPlan(data);
      } else {
        throw new Error('Invalid structure');
      }
    } catch (err) {
      console.warn('AI Trip generation fallback to intelligent local builder:', err);
      // Robust offline fallback with authentic spots
      const fallbackDays = parseInt(aiDays) || 3;
      const parsedBudget = parseInt(aiBudget) || 18000;
      const mockDays = [];
      for (let i = 1; i <= fallbackDays; i++) {
        mockDays.push({
          day_number: i,
          title: lang === 'mr' ? `दिवस ${i}: ${aiDest} भ्रमंती व प्रेक्षणीय स्थळे` : `Day ${i}: ${aiDest} Exploration & Sightseeing`,
          morning: [
            { time: '08:30 AM', activity: lang === 'mr' ? 'नाश्ता आणि मुख्य स्थळ भेट' : 'Breakfast & Iconic spot visit', cost: 400, location: `${aiDest} Point 1` }
          ],
          afternoon: [
            { time: '01:00 PM', activity: lang === 'mr' ? 'पारंपरिक स्थानिक जेवण व विश्रांती' : 'Authentic local lunch & relaxation', cost: 650, location: `${aiDest} Central` },
            { time: '03:30 PM', activity: lang === 'mr' ? 'निसर्गरम्य व्ह्यू पॉइंट किंवा बीच/मंदिर दर्शन' : 'Scenic viewpoint / beach / temple', cost: 300, location: `${aiDest} View` }
          ],
          evening: [
            { time: '06:30 PM', activity: lang === 'mr' ? 'सूर्यास्त दर्शन व स्थानिक बाजार खरेदी' : 'Sunset point & local market shopping', cost: 500, location: `${aiDest} Sunset Point` },
            { time: '08:30 PM', activity: lang === 'mr' ? 'हॉटेलवर रात्रीचे जेवण व ग्रुप गप्पा' : 'Dinner & group bonfire/leisure', cost: 800, location: `${aiDest} Stay` }
          ]
        });
      }

      setAiPreviewPlan({
        trip_title: `${aiDep} ते ${aiDest} अविस्मरणीय सहल`,
        destination: aiDest,
        departureCity: aiDep,
        overview: lang === 'mr' 
          ? `${aiDep} ते ${aiDest} दरम्यान ${aiDays} दिवसांची परिपूर्ण ${aiTripType} सहल. सुरक्षित प्रवास आणि उत्तम बजेट व्यवस्थापनासह.`
          : `A well-balanced ${aiDays}-day ${aiTripType} trip from ${aiDep} to ${aiDest} optimized for budget and comfort.`,
        route_info: {
          via: aiVia || (smartViaRoutes.length > 0 ? smartViaRoutes[0].nameMr : 'थेट हायवे मार्ग'),
          distance: `~420 किमी`,
          duration: `~7 तास 30 मिनिटे`
        },
        cost_breakdown: {
          transport: Math.round(parsedBudget * 0.35),
          stay: Math.round(parsedBudget * 0.35),
          food: Math.round(parsedBudget * 0.20),
          activities: Math.round(parsedBudget * 0.10),
          total: parsedBudget
        },
        days: mockDays
      });
    } finally {
      setAiLoadingStep(null);
    }
  };

  // Save AI Plan into Context as an active/planned trip
  const handleSaveAiTripToContext = () => {
    if (!aiPreviewPlan) return;

    const numPersons = parseInt(aiPersons) || 2;
    const initialMembers: Member[] = [];
    const colors = ['#f43f5e', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

    for (let i = 1; i <= numPersons; i++) {
      initialMembers.push({
        id: `m-ai-${Date.now()}-${i}`,
        name: i === 1 ? (lang === 'mr' ? 'मी (Admin)' : 'Me (Admin)') : (lang === 'mr' ? `प्रवासी ${i}` : `Member ${i}`),
        color: colors[(i - 1) % colors.length],
        totalDeposited: 0
      });
    }

    // Convert AI day slots into TripPlan items
    const itineraryItems: TripPlan[] = [];
    if (aiPreviewPlan.days && Array.isArray(aiPreviewPlan.days)) {
      aiPreviewPlan.days.forEach((day: any, dIndex: number) => {
        const slots = [
          ...(day.morning || []),
          ...(day.afternoon || []),
          ...(day.evening || [])
        ];
        slots.forEach((slot: any, sIndex: number) => {
          itineraryItems.push({
            id: `plan-${Date.now()}-${dIndex}-${sIndex}`,
            type: slot.activity?.toLowerCase().includes('hotel') ? 'hotel' : 'activity',
            title: slot.activity || `दिवस ${day.day_number} स्थळ भेट`,
            detail: slot.location ? `ठिकाण: ${slot.location} (वेळ: ${slot.time || 'सकाळी'})` : `वेळ: ${slot.time || 'सकाळी'}`,
            datetime: new Date(Date.now() + 86400000 * (dIndex + 1)).toISOString(),
            cost: slot.cost || 0,
            location: {
              lat: 18.5204 + (dIndex * 0.05),
              lng: 73.8567 + (sIndex * 0.05),
              name: slot.location || aiDest
            },
            exactLocation: slot.location || aiDest,
            realisticCost: slot.cost ? `₹${slot.cost}` : undefined
          });
        });
      });
    }

    const newTrip = addNewTrip({
      name: aiPreviewPlan.trip_title || `${aiDest} सफर`,
      destination: aiDest,
      startDate: aiStartDate,
      endDate: new Date(new Date(aiStartDate).getTime() + (parseInt(aiDays) || 3) * 86400000).toISOString().split('T')[0],
      totalBudget: parseInt(aiBudget) || 18000,
      calculationMode: 'admin_pooled',
      status: 'PLANNED',
      members: initialMembers,
      itinerary: itineraryItems
    });

    setActiveTrip(newTrip);
    setShowAiModal(false);
    setAiPreviewPlan(null);
    showToast(lang === 'mr' ? '✨ AI सहल यशस्वीरित्या तयार करून सेव्ह केली!' : '✨ AI Trip planned & saved successfully!');
  };

  // Manual Trip Form Submission
  const handleCreateManualTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manDestination.trim() && !manName.trim()) {
      showToast(lang === 'mr' ? 'कृपया सहलीचे नाव किंवा ठिकाण प्रविष्ट करा!' : 'Please enter trip name or destination!');
      return;
    }

    const validMembersList = manMembers
      .map(m => ({ ...m, name: m.name.trim() }))
      .filter(m => m.name !== '');

    const finalMembers: Member[] = validMembersList.length > 0
      ? validMembersList.map((m, idx) => ({
          id: `mem-${Date.now()}-${idx}`,
          name: m.name,
          color: ['#f43f5e', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][idx % 5],
          totalDeposited: parseFloat(m.deposit) || 0,
          upiId: m.upiId || undefined
        }))
      : [{ id: `mem-${Date.now()}-0`, name: 'प्रवास प्रतिनिधी (Admin)', color: '#f43f5e', totalDeposited: 0 }];

    const newTrip = addNewTrip({
      name: manName.trim() || `${manDestination.trim()} सहल`,
      destination: manDestination.trim() || manName.trim(),
      startDate: manStartDate,
      endDate: manEndDate,
      calculationMode: manCalcMode,
      totalBudget: parseFloat(manTotalBudget) || 0,
      status: 'ACTIVE',
      members: finalMembers
    });

    setActiveTrip(newTrip);
    setShowManualModal(false);
    showToast(lang === 'mr' ? '🎉 नवीन सहल सुरू झाली आहे!' : '🎉 New trip created & active!');
  };

  // Add Member in Manual Form
  const handleAddMemberRow = () => {
    setManMembers([...manMembers, { name: '', deposit: '0', upiId: '', isAdmin: false }]);
  };

  const handleRemoveMemberRow = (idx: number) => {
    if (manMembers.length > 1) {
      setManMembers(manMembers.filter((_, i) => i !== idx));
    }
  };

  // Add Admin Ad
  const handleSaveAdminAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim()) {
      showToast(lang === 'mr' ? 'शीर्षक टाका' : 'Enter title');
      return;
    }

    const createdAd: AdminAd = {
      id: `ad-${Date.now()}`,
      badge: newAdBadge || 'प्रायोजित',
      titleMr: newAdTitle,
      titleEn: newAdTitle,
      descMr: newAdDesc,
      descEn: newAdDesc,
      tag: newAdTag || 'खास ऑफर',
      ctaTextMr: newAdCta || 'पाहा',
      ctaTextEn: newAdCta || 'View',
      accent: newAdAccent
    };

    setAds([createdAd, ...ads]);
    setShowAdminAdModal(false);
    setNewAdTitle('');
    setNewAdDesc('');
    showToast(lang === 'mr' ? 'नवीन जाहिरात बॅनर जोडला गेला!' : 'New ad banner added!');
  };

  // Add Admin Coupon
  const handleSaveAdminCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCpnCode.trim() || !newCpnTitle.trim()) {
      showToast(lang === 'mr' ? 'कूपन कोड आणि माहिती टाका' : 'Enter coupon code and details');
      return;
    }

    const createdCoupon: AdminCoupon = {
      id: `cpn-${Date.now()}`,
      code: newCpnCode.toUpperCase().trim(),
      discount: newCpnDiscount || 'सवलत',
      titleMr: newCpnTitle,
      titleEn: newCpnTitle,
      descMr: newCpnDesc,
      descEn: newCpnDesc,
      expiry: newCpnExpiry
    };

    setCoupons([createdCoupon, ...coupons]);
    setShowAdminCouponModal(false);
    setNewCpnCode('');
    setNewCpnTitle('');
    setNewCpnDesc('');
    showToast(lang === 'mr' ? 'नवीन कूपन कोड सक्रिय झाला!' : 'New coupon code activated!');
  };

  // Change Trip Status
  const handleCycleStatus = (trip: TripGroup) => {
    const nextStatus = trip.status === 'PLANNED' ? 'ACTIVE' : trip.status === 'ACTIVE' ? 'COMPLETED' : 'PLANNED';
    updateActiveTrip({ ...trip, status: nextStatus });
    showToast(lang === 'mr' ? `सहलीचा दर्जा बदलला: ${nextStatus}` : `Trip status updated to: ${nextStatus}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] bg-slate-900 text-white px-5 py-3 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Global Brand Header with subtitle, theme and badge */}
      <GlobalBrandHeader 
        subtitle={lang === 'mr' ? 'सहलींचे नियोजन व प्रवास तिजोरी' : 'Trip Management & Travel Vault'}
        theme="ocean"
        badge={lang === 'mr' ? 'माझ्या सहली' : 'My Trips'}
        onOpenProfile={onOpenProfile}
      />

      <main className="max-w-6xl mx-auto px-4 pt-4 space-y-6">
        {/* Top Header Card - 100% Light Theme */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'माझ्या सहली' : 'My Trips Vault'}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  {trips.length} {lang === 'mr' ? 'सहली नोंदणीकृत' : 'Total Trips'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {lang === 'mr' ? 'सहलींचे नियोजन व प्रवास तिजोरी' : 'Trip Management & Vault'}
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                {lang === 'mr' 
                  ? 'तुमच्या सर्व आगामी, सुरू असलेल्या आणि पूर्ण झालेल्या सहलींचा हिशोब, मार्ग आणि सदस्यांचे तपशील एकाच ठिकाणी.'
                  : 'Track upcoming journeys, ongoing group expenses, and completed travel vaults seamlessly.'}
              </p>
            </div>

            {/* Quick Primary Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(true);
                  onOpenAiPlanner?.();
                }}
                className="flex-1 sm:flex-none px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'mr' ? 'AI सहल प्लॅनर' : 'AI Pre-Trip Planner'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowManualModal(true);
                  onCreateTrip?.();
                }}
                className="flex-1 sm:flex-none px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-rose-500" />
                <span>{lang === 'mr' ? 'मॅन्युअल सहल जोडा' : 'Manual Trip Planner'}</span>
              </button>
            </div>
          </div>

          {/* Search & Tabs Filter Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === 'mr' ? 'सहल नाव किंवा ठिकाण शोधा...' : 'Search trip name or destination...'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  filterTab === 'all'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{lang === 'mr' ? 'सर्व' : 'All'}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded-full font-extrabold">{trips.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('UPCOMING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  filterTab === 'UPCOMING'
                    ? 'bg-white text-sky-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3 h-3 text-sky-500" />
                <span>{lang === 'mr' ? 'आगामी' : 'Upcoming'}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-sky-50 text-sky-700 rounded-full font-extrabold">{upcomingCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('ONGOING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  filterTab === 'ONGOING'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3 h-3 text-emerald-500" />
                <span>{lang === 'mr' ? 'सुरू असलेल्या' : 'Ongoing'}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded-full font-extrabold">{ongoingCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  filterTab === 'COMPLETED'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-slate-500" />
                <span>{lang === 'mr' ? 'पूर्ण झालेल्या' : 'Completed'}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-extrabold">{completedCount}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 1: Trip Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-rose-500" />
              <span>
                {filterTab === 'all' && (lang === 'mr' ? 'सर्व सहलींची यादी' : 'All Travel Vaults')}
                {filterTab === 'UPCOMING' && (lang === 'mr' ? 'नियोजित व आगामी सहली' : 'Upcoming Planned Journeys')}
                {filterTab === 'ONGOING' && (lang === 'mr' ? 'सध्या सुरू असलेल्या सहली' : 'Active Ongoing Expeditions')}
                {filterTab === 'COMPLETED' && (lang === 'mr' ? 'पूर्ण झालेल्या सहलींचा संग्रह' : 'Completed Journeys Vault')}
              </span>
              <span className="text-xs font-bold text-slate-400">({filteredTrips.length})</span>
            </h2>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-500 rounded-full mx-auto flex items-center justify-center">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === 'mr' ? 'कोणतीही सहल सापडली नाही' : 'No Trips Found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {lang === 'mr' 
                    ? 'या श्रेणीत अद्याप कोणतीही सहल नाही. नवीन सहल सुरू करण्यासाठी वरील बटणावर क्लिक करा.'
                    : 'No trips in this view. Click above to plan with AI or create manually.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'AI प्लॅनर उघडा' : 'Launch AI Planner'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualModal(true)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'नवीन सहल जोडा' : 'Add Manual'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrips.map(trip => {
                const isActive = activeTrip && activeTrip.id === trip.id;
                const status = trip.status || 'ACTIVE';
                const totalExpenses = (trip.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
                const memberCount = (trip.members || []).length;

                return (
                  <div
                    key={trip.id}
                    className={`bg-white border rounded-3xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                      isActive ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          {status === 'PLANNED' && (
                            <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-[11px] font-black uppercase flex items-center gap-1">
                              <Clock className="w-3 h-3 text-sky-500" />
                              {lang === 'mr' ? 'आगामी' : 'Upcoming'}
                            </span>
                          )}
                          {status === 'ACTIVE' && (
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-black uppercase flex items-center gap-1">
                              <Flame className="w-3 h-3 text-emerald-500" />
                              {lang === 'mr' ? 'सुरू आहे' : 'Active'}
                            </span>
                          )}
                          {(status === 'COMPLETED' || status === 'SETTLED') && (
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[11px] font-black uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                              {lang === 'mr' ? 'पूर्ण' : 'Completed'}
                            </span>
                          )}

                          {isActive && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-black">
                              {lang === 'mr' ? 'सध्या निवडलेली' : 'Selected'}
                            </span>
                          )}
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleCycleStatus(trip)}
                          title={lang === 'mr' ? 'स्टेटस बदला' : 'Cycle Status'}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 transition-all"
                        >
                          {lang === 'mr' ? 'स्टेटस बदला' : 'Change Status'}
                        </button>
                      </div>

                      {/* Destination & Name */}
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {trip.name || trip.destination}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{trip.destination}</span>
                      </p>

                      {/* Date & Mode details */}
                      <div className="mt-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {lang === 'mr' ? 'कालावधी' : 'Dates'}
                          </span>
                          <span className="text-slate-800">
                            {trip.startDate} {trip.endDate ? `→ ${trip.endDate}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {lang === 'mr' ? 'सहप्रवासी' : 'Members'}
                          </span>
                          <span className="text-slate-800 font-extrabold">{memberCount} प्रवासी</span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Wallet className="w-3.5 h-3.5 text-slate-400" />
                            {lang === 'mr' ? 'खर्च / अंदाज' : 'Expenses / Budget'}
                          </span>
                          <span className="text-rose-600 font-extrabold">
                            ₹{totalExpenses.toLocaleString('en-IN')} / ₹{(trip.totalBudget || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Calculation Mode Badge */}
                      <div className="mt-2.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                          trip.calculationMode === 'individual_split'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {trip.calculationMode === 'individual_split'
                            ? (lang === 'mr' ? 'वैयक्तिक खर्च विभागणी' : 'Individual Split')
                            : (lang === 'mr' ? 'सेंट्रल ॲडमीन जमा निधी' : 'Admin Pooled Fund')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTrip(trip);
                          onEnterTrip?.();
                          showToast(lang === 'mr' ? `"${trip.name}" सहल सक्रिय झाली!` : `"${trip.name}" opened!`);
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                        }`}
                      >
                        <span>{isActive ? (lang === 'mr' ? 'सध्या सुरू आहे' : 'Currently Active') : (lang === 'mr' ? 'सहल उघडा' : 'Open Trip')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(lang === 'mr' ? 'ही सहल हटवायची आहे का?' : 'Delete this trip?')) {
                            deleteTrip(trip.id);
                            showToast(lang === 'mr' ? 'सहल हटवली गेली' : 'Trip deleted');
                          }
                        }}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title={lang === 'mr' ? 'हटवा' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 2: Admin Promotional Ads & Banners */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>{lang === 'mr' ? 'प्रवास विशेष डील्स व प्रायोजित ऑफर्स' : 'Exclusive Travel Deals & Ads'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'mr' ? 'हॉटेल्स, गाड्या आणि मार्गदर्शकांसाठी खास भागीदार सवलती.' : 'Verified discounts from official travel partners.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminAdModal(true)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'mr' ? '+ जाहिरात जोडा' : '+ Add Ad'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map(ad => (
              <div
                key={ad.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      ad.accent === 'rose'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : ad.accent === 'sky'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : ad.accent === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {ad.badge}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {ad.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {lang === 'mr' ? ad.titleMr : ad.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {lang === 'mr' ? ad.descMr : ad.descEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {lang === 'mr' ? 'व्हेरिफाईड पार्टनर' : 'Verified Partner'}
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast(lang === 'mr' ? 'ऑफर लिंक उघडत आहे...' : 'Opening partner offer...')}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>{lang === 'mr' ? ad.ctaTextMr : ad.ctaTextEn}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Discount Coupon Codes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-500" />
                <span>{lang === 'mr' ? 'कूपन कोड्स व प्रोमो डिस्काउंट्स' : 'Discount Coupons & Promo Codes'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'mr' ? 'सहल बुकिंग आणि हॉटेल खर्चावर तात्काळ सूट मिळवण्यासाठी कोड कॉपी करा.' : 'Copy codes for instant discounts on stays and rentals.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminCouponModal(true)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'mr' ? '+ कूपन कोड जोडा' : '+ Add Coupon'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map(cpn => (
              <div
                key={cpn.id}
                className="bg-white border-2 border-dashed border-rose-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-black">
                      {cpn.discount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {lang === 'mr' ? 'मुदत:' : 'Valid till:'} {cpn.expiry}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">
                    {lang === 'mr' ? cpn.titleMr : cpn.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'mr' ? cpn.descMr : cpn.descEn}
                  </p>
                </div>

                {/* Coupon Code Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-sm tracking-wider text-slate-800">
                    {cpn.code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(cpn.code)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      copiedCode === cpn.code
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {copiedCode === cpn.code ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'कॉपी झाले!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'कोड कॉपी करा' : 'Copy Code'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 1. AI PRE-TRIP PLANNER MODAL (RESTORED COMPLETE ORIGINAL CODE & LOGIC) */}
      {/* ========================================================================= */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {lang === 'mr' ? 'AI सहल प्लॅनर (Smart Itinerary Generator)' : 'AI Pre-Trip Planner'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'mr' ? 'स्मार्ट मार्ग, वेळापत्रक, सर्वोत्तम प्रेक्षणीय स्थळे आणि अचूक बजेट' : 'Intelligent route, schedule, spots & realistic budget'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiPreviewPlan(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
              {/* Popular Destination Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {lang === 'mr' ? 'लोकप्रिय पर्यटन स्थळे (Quick Select)' : 'Popular Destinations'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setAiDest(item.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                        aiDest.toLowerCase() === item.name.toLowerCase()
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ready-made Template Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  {lang === 'mr' ? 'तयार सहल पॅकेजेस (One-Click Presets)' : 'Preset Packages'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROMPT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="p-2.5 bg-white border border-slate-200 hover:border-rose-400 rounded-2xl text-left text-xs font-bold text-slate-800 transition-all flex items-center justify-between"
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-extrabold">₹{p.budget}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Departure & Destination Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === 'mr' ? 'प्रस्थान शहर (Departure City)' : 'Departure City'}
                  </label>
                  <input
                    type="text"
                    value={aiDep}
                    onChange={e => setAiDep(e.target.value)}
                    placeholder="उदा. Pune"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-rose-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === 'mr' ? 'गंतव्य स्थान (Destination)' : 'Destination'}
                  </label>
                  <input
                    type="text"
                    value={aiDest}
                    onChange={e => setAiDest(e.target.value)}
                    placeholder="उदा. Goa"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-rose-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Smart Via Route Options */}
              {smartViaRoutes.length > 0 && (
                <div className="space-y-1.5 p-3.5 bg-white border border-rose-200 rounded-2xl">
                  <label className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-rose-600" />
                    {lang === 'mr' ? 'शिफारस केलेले स्मार्ट मार्ग (Smart Via Routes)' : 'Recommended Smart Via Routes'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {smartViaRoutes.map(route => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => setAiVia(route.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          aiVia === route.id
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">
                          {lang === 'mr' ? route.nameMr : route.nameEn}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${aiVia === route.id ? 'text-rose-100' : 'text-slate-500'}`}>
                          {lang === 'mr' ? route.descMr : route.descEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport Mode Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {lang === 'mr' ? 'प्रवासाचे साधन (Transport Mode)' : 'Transport Mode'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRANSPORT_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAiTransport(opt.id)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          aiTransport === opt.id
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-bold">{lang === 'mr' ? opt.labelMr : opt.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trip Type, Days, Persons, Budget */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === 'mr' ? 'सहल प्रकार' : 'Trip Type'}
                  </label>
                  <select
                    value={aiTripType}
                    onChange={e => setAiTripType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    {TRIP_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{lang === 'mr' ? t.labelMr : t.labelEn}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === 'mr' ? 'दिवस (Days)' : 'Days'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={aiDays}
                    onChange={e => setAiDays(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === 'mr' ? 'सदस्य संख्या' : 'Persons'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={aiPersons}
                    onChange={e => setAiPersons(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      {lang === 'mr' ? 'अंदाज बजेट (₹)' : 'Budget (₹)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSmartBudgetSource('ai');
                        setShowSmartBudget(true);
                      }}
                      className="text-[10px] font-extrabold text-rose-600 hover:underline flex items-center gap-0.5"
                    >
                      <Calculator className="w-2.5 h-2.5" />
                      <span>{lang === 'mr' ? 'स्मार्ट बजेट' : 'Calculator'}</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    value={aiBudget}
                    onChange={e => setAiBudget(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {lang === 'mr' ? 'सुरुवात तारीख (Start Date)' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={aiStartDate}
                  onChange={e => setAiStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              {/* Loading State Banner */}
              {aiLoadingStep && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0 text-rose-600" />
                  <span>{aiLoadingStep}</span>
                </div>
              )}

              {/* AI Generated Preview Itinerary */}
              {aiPreviewPlan && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                        {lang === 'mr' ? '✨ तयार झालेली सहल' : 'Generated Itinerary'}
                      </span>
                      {aiPreviewPlan.route_info && (
                        <span className="text-xs font-bold text-slate-500">
                          {aiPreviewPlan.route_info.distance} • {aiPreviewPlan.route_info.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900">{aiPreviewPlan.trip_title}</h3>
                    <p className="text-xs text-slate-600">{aiPreviewPlan.overview}</p>

                    {/* Cost Breakdown */}
                    {aiPreviewPlan.cost_breakdown && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] text-slate-500 font-bold">{lang === 'mr' ? 'प्रवास' : 'Transport'}</div>
                          <div className="text-xs font-black text-slate-800">₹{aiPreviewPlan.cost_breakdown.transport}</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] text-slate-500 font-bold">{lang === 'mr' ? 'मुक्काम' : 'Stay'}</div>
                          <div className="text-xs font-black text-slate-800">₹{aiPreviewPlan.cost_breakdown.stay}</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] text-slate-500 font-bold">{lang === 'mr' ? 'भोजन' : 'Food'}</div>
                          <div className="text-xs font-black text-slate-800">₹{aiPreviewPlan.cost_breakdown.food}</div>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-xl text-center border border-rose-100">
                          <div className="text-[10px] text-rose-600 font-bold">{lang === 'mr' ? 'एकूण अंदाज' : 'Total'}</div>
                          <div className="text-xs font-black text-rose-700">₹{aiPreviewPlan.cost_breakdown.total}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Day-by-Day Accordion / List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {lang === 'mr' ? 'दिवसनिहाय वेळापत्रक (Day Plan)' : 'Daily Schedule'}
                    </h4>
                    {aiPreviewPlan.days && aiPreviewPlan.days.map((day: any, dIdx: number) => (
                      <div key={dIdx} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
                        <div className="font-extrabold text-xs text-rose-600">
                          {day.title || `Day ${day.day_number}`}
                        </div>
                        <div className="space-y-1.5 pl-2 border-l-2 border-slate-100 text-xs">
                          {[...(day.morning || []), ...(day.afternoon || []), ...(day.evening || [])].map((slot: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-start justify-between text-slate-700 py-0.5">
                              <div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold mr-2">{slot.time}</span>
                                <span className="font-semibold">{slot.activity}</span>
                                {slot.location && (
                                  <span className="text-[10px] text-slate-400 ml-1.5">(@ {slot.location})</span>
                                )}
                              </div>
                              {slot.cost > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-2">₹{slot.cost}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiPreviewPlan(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>

              {!aiPreviewPlan ? (
                <button
                  type="button"
                  disabled={Boolean(aiLoadingStep)}
                  onClick={executeGenerateAiTrip}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'AI प्लॅन तयार करा' : 'Generate AI Plan'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAiTripToContext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'ही सहल सेव्ह करा आणि सुरू करा' : 'Save & Launch Trip'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANUAL TRIP PLANNER PANEL (RESTORED COMPLETE ORIGINAL CODE & LEDGER) */}
      {/* ========================================================================= */}
      {showManualModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {lang === 'mr' ? 'मॅन्युअल सहल प्लॅनर (New Trip Entry)' : 'Manual Trip Planner'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'mr' ? 'सदस्य यादी, आगाऊ जमा रक्कम, हिशोब मोड आणि बजेट' : 'Member ledger, deposits, UPI and calculation split'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateManualTrip} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
                {/* 1. Basic Trip Details */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? '१. सहलीची प्राथमिक माहिती' : '1. Basic Information'}</span>
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === 'mr' ? 'सहलीचे नाव (Trip Name)' : 'Trip Name'}
                      </label>
                      <input
                        type="text"
                        value={manName}
                        onChange={e => setManName(e.target.value)}
                        placeholder="उदा. गोव्याची धमाल सफर २०२६"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === 'mr' ? 'गंतव्य ठिकाण (Destination)' : 'Destination'}
                      </label>
                      <input
                        type="text"
                        value={manDestination}
                        onChange={e => setManDestination(e.target.value)}
                        placeholder="उदा. Goa / Konkan"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{lang === 'mr' ? 'सुरुवात तारीख' : 'Start Date'}</span>
                        </label>
                        <input
                          type="date"
                          value={manStartDate}
                          onChange={e => setManStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{lang === 'mr' ? 'समाप्ती तारीख' : 'End Date'}</span>
                        </label>
                        <input
                          type="date"
                          value={manEndDate}
                          onChange={e => setManEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Calculation Mode & Trip Category */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? '२. खर्च हिशोब मोड व वर्ग' : '2. Split Mode & Category'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManCalcMode('admin_pooled')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        manCalcMode === 'admin_pooled'
                          ? 'bg-rose-50 border-rose-400 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs text-rose-600">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'सेंट्रल ॲडमीन जमा निधी' : 'Admin Pooled Fund'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {lang === 'mr' ? 'सर्व सदस्यांनी जमा केलेल्या रकमेतून ॲडमीन खर्च करतो व शिल्लक परत दिली जाते.' : 'Central common pool where expenses are paid from advance deposits.'}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setManCalcMode('individual_split')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        manCalcMode === 'individual_split'
                          ? 'bg-purple-50 border-purple-400 text-purple-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs text-purple-600">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'वैयक्तिक खर्च विभागणी' : 'Individual Split'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {lang === 'mr' ? 'प्रत्येकाने केलेला खर्च आपापसात वाटला जातो व शेवटी हिशोब सेटल केला जातो.' : 'Direct peer-to-peer split where individuals pay and settle balances.'}
                      </p>
                    </button>
                  </div>

                  {/* Budget & Smart Budget Calculator */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        {lang === 'mr' ? 'एकूण अंदाज बजेट (Total Budget ₹)' : 'Total Budget (₹)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSmartBudgetSource('manual');
                          setShowSmartBudget(true);
                        }}
                        className="text-[11px] font-extrabold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>{lang === 'mr' ? 'स्मार्ट बजेट कॅल्क्युलेटर' : 'Smart Budget Modal'}</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      value={manTotalBudget}
                      onChange={e => setManTotalBudget(e.target.value)}
                      placeholder="15000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* 3. Co-Travellers Ledger (Name, Deposit, UPI) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? '३. सहप्रवासी यादी व आगाऊ जमा निधी' : '3. Co-Travellers Ledger'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddMemberRow}
                      className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>{lang === 'mr' ? '+ सदस्य जोडा' : '+ Add'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {manMembers.map((mem, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-slate-500">#{idx + 1} {mem.isAdmin ? '(Admin)' : ''}</span>
                          {manMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMemberRow(idx)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={mem.name}
                            onChange={e => {
                              const val = e.target.value;
                              setManMembers(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                            }}
                            placeholder={lang === 'mr' ? 'प्रवाशाचे नाव' : 'Member Name'}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none"
                          />

                          <input
                            type="number"
                            value={mem.deposit}
                            onChange={e => {
                              const val = e.target.value;
                              setManMembers(prev => prev.map((m, i) => i === idx ? { ...m, deposit: val } : m));
                            }}
                            placeholder={lang === 'mr' ? 'जमा रक्कम ₹' : 'Deposit ₹'}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none"
                          />

                          <input
                            type="text"
                            value={mem.upiId}
                            onChange={e => {
                              const val = e.target.value;
                              setManMembers(prev => prev.map((m, i) => i === idx ? { ...m, upiId: val } : m));
                            }}
                            placeholder="UPI ID (उदा. abc@okhdfc)"
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-xs font-extrabold text-rose-900">
                    <span>{lang === 'mr' ? 'एकूण प्रवासी:' : 'Total Members:'} {manMembers.length}</span>
                    <span>
                      {lang === 'mr' ? 'एकूण जमा निधी:' : 'Total Advance Fund:'} ₹
                      {manMembers.reduce((sum, m) => sum + (parseFloat(m.deposit) || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'सहल तयार करा व सुरू करा' : 'Create & Launch Trip'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADMIN ADD AD MODAL (LIGHT THEME) */}
      {/* ========================================================================= */}
      {showAdminAdModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-rose-500" />
                <span>{lang === 'mr' ? 'नवीन जाहिरात बॅनर जोडा' : 'Add Admin Ad Banner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdminAdModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminAd} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'बॅज / टॅग' : 'Badge / Label'}
                </label>
                <input
                  type="text"
                  value={newAdBadge}
                  onChange={e => setNewAdBadge(e.target.value)}
                  placeholder="उदा. प्रायोजित ऑफर"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'जाहिरात शीर्षक' : 'Ad Title'}
                </label>
                <input
                  type="text"
                  value={newAdTitle}
                  onChange={e => setNewAdTitle(e.target.value)}
                  placeholder="उदा. रिसॉर्ट स्टे वर ३०% ऑफ"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'तपशील / वर्णन' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={newAdDesc}
                  onChange={e => setNewAdDesc(e.target.value)}
                  placeholder="उदा. मालवण आणि तारकर्लीच्या सर्व बीच रिसॉर्ट्सवर लागू."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'mr' ? 'बटन मजकूर' : 'Button Text'}
                  </label>
                  <input
                    type="text"
                    value={newAdCta}
                    onChange={e => setNewAdCta(e.target.value)}
                    placeholder="उदा. बुक करा"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'mr' ? 'रंग थीम' : 'Accent'}
                  </label>
                  <select
                    value={newAdAccent}
                    onChange={e => setNewAdAccent(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="rose">गुलाबी (Rose)</option>
                    <option value="sky">आकाशी (Sky)</option>
                    <option value="emerald">हिरवा (Emerald)</option>
                    <option value="amber">पिवळा (Amber)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAdModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {lang === 'mr' ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {lang === 'mr' ? 'जाहिरात सेव्ह करा' : 'Save Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN ADD COUPON MODAL (LIGHT THEME) */}
      {/* ========================================================================= */}
      {showAdminCouponModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-500" />
                <span>{lang === 'mr' ? 'नवीन प्रोमो कूपन कोड तयार करा' : 'Create Coupon Code'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdminCouponModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminCoupon} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'mr' ? 'कूपन कोड' : 'Coupon Code'}
                  </label>
                  <input
                    type="text"
                    value={newCpnCode}
                    onChange={e => setNewCpnCode(e.target.value.toUpperCase())}
                    placeholder="उदा. MAHA2026"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'mr' ? 'सवलत (Discount)' : 'Discount Label'}
                  </label>
                  <input
                    type="text"
                    value={newCpnDiscount}
                    onChange={e => setNewCpnDiscount(e.target.value)}
                    placeholder="उदा. ₹५०० सूट किंवा २०%"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'कूपन नाव / ऑफर' : 'Offer Title'}
                </label>
                <input
                  type="text"
                  value={newCpnTitle}
                  onChange={e => setNewCpnTitle(e.target.value)}
                  placeholder="उदा. नवीन ग्रुप सहल बुकिंगवर ₹५०० ऑफ"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'नियम व अटी' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={newCpnDesc}
                  onChange={e => setNewCpnDesc(e.target.value)}
                  placeholder="उदा. किमान ₹३००० च्या एकूण खर्चावर लागू."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'अंतिम मुदत (Expiry)' : 'Valid Till'}
                </label>
                <input
                  type="text"
                  value={newCpnExpiry}
                  onChange={e => setNewCpnExpiry(e.target.value)}
                  placeholder="३० नोव्हेंबर २०२६"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminCouponModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {lang === 'mr' ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {lang === 'mr' ? 'कूपन कोड सेव्ह करा' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SMART BUDGET MODAL (SHARED REAL CALCULATOR) */}
      {/* ========================================================================= */}
      {showSmartBudget && (
        <SmartBudgetModal
          isOpen={showSmartBudget}
          onClose={() => setShowSmartBudget(false)}
          lang={lang || 'mr'}
          destination={smartBudgetSource === 'ai' ? (aiDest || 'Goa') : (manDestination || 'Goa')}
          days={smartBudgetSource === 'ai' ? (parseInt(aiDays) || 3) : 3}
          persons={smartBudgetSource === 'ai' ? (parseInt(aiPersons) || 2) : manMembers.length}
          transportMode={smartBudgetSource === 'ai' ? aiTransport : 'car'}
          onApplyBudget={(total: number) => {
            if (smartBudgetSource === 'ai') {
              setAiBudget(total.toString());
            } else {
              setManTotalBudget(total.toString());
            }
            setShowSmartBudget(false);
            showToast(lang === 'mr' ? `स्मार्ट बजेट ₹${total.toLocaleString('en-IN')} लागू केले!` : `Budget applied: ₹${total.toLocaleString('en-IN')}`);
          }}
        />
      )}
    </div>
  );
};
