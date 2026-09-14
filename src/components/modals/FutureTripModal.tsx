import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Bus, 
  Calendar, 
  Car, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Info,
  DollarSign, 
  FileText, 
  Fuel, 
  Lightbulb, 
  Loader2, 
  MapPin, 
  Navigation, 
  Plane, 
  Share2, 
  ShieldCheck, 
   
  Sun, 
  Tag, 
  Train, 
  TrainFront,
  Users, 
  Utensils, 
  Hotel,
  Landmark,
  Calculator,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { SmartBudgetModal } from './SmartBudgetModal';
import { TripPlannerMapView } from '../map/TripPlannerMapView';
import { getBrochureHeroContent, getSpotsForDay } from '../../utils/touristSpotImages';
import { shareAppOnWhatsApp } from '../../utils/shareUtils';
import { exportElementToPdf } from '../../utils/exportUtils';
import { PDFLayoutWrapper } from '../pdf/PDFLayoutWrapper';

interface FutureTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'mr' | 'hi' | string;
  onAlert: (msg: string) => void;
  onManualEntry: () => void;
  isFullPage?: boolean;
}

const OptimizedImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-200 text-slate-500 ${className}`}>
        <MapPin size={24} />
      </div>
    );
  }
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
      crossOrigin="anonymous"
    />
  );
};

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

const PROMPT_PRESETS = [
  { label: '🌴 3-Day Goa Beach & Sunset', dest: 'Goa', days: '3', type: 'leisure', transport: 'flight' },
  { label: '🍓 Weekend Mahabaleshwar', dest: 'Mahabaleshwar', days: '2', type: 'family', transport: 'car' },
  { label: '🏔️ Manali Adventure & Snow', dest: 'Manali', days: '5', type: 'adventure', transport: 'bus' },
  { label: '🛕 Varanasi Ghats & Heritage', dest: 'Varanasi', days: '3', type: 'pilgrimage', transport: 'train' },
];

const TRANSPORT_OPTIONS = [
  { 
    id: 'flight', 
    labelMr: 'विमान (Flight)', 
    labelEn: 'Flight', 
    icon: Plane, 
    emoji: '✈️'
  },
  { 
    id: 'train', 
    labelMr: 'रेल्वे (Train)', 
    labelEn: 'Train', 
    icon: TrainFront, 
    emoji: '🚂'
  },
  { 
    id: 'car', 
    labelMr: 'कॅब / गाडी (Cab)', 
    labelEn: 'Cab / Car', 
    icon: Car, 
    emoji: '🚗'
  },
  { 
    id: 'bus', 
    labelMr: 'बस (Bus)', 
    labelEn: 'Bus', 
    icon: Bus, 
    emoji: '🚌'
  },
];

const TRIP_TYPES = [
  { id: 'leisure', labelMr: '🌴 पर्यटन (Vacation)', labelEn: '🌴 Vacation' },
  { id: 'adventure', labelMr: '🏔️ ट्रेकिंग (Adventure)', labelEn: '🏔️ Adventure' },
  { id: 'pilgrimage', labelMr: '🛕 धार्मिक (Pilgrimage)', labelEn: '🛕 Pilgrimage' },
  { id: 'family', labelMr: '👨‍👩‍👧‍👦 फॅमिली (Family)', labelEn: '👨‍👩‍👧‍👦 Family' },
  { id: 'friends', labelMr: '👥 फ्रेंड्स (Friends)', labelEn: '👥 Friends' },
  { id: 'couple', labelMr: '👩‍❤️‍👨 कपल्स (Couple)', labelEn: '👩‍❤️‍👨 Couple' },
  { id: 'solo', labelMr: '👤 सोलो (Solo)', labelEn: '👤 Solo' },
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

  // Pune <-> Ratnagiri (The exact use-case requested by user!)
  if ((d.includes('pune') || d.includes('पुणे')) && (t.includes('ratnagiri') || t.includes('रत्नागिरी'))) {
    return [
      { id: 'Mumbai', nameMr: 'मुंबई / पनवेल मार्गे (NH 66)', nameEn: 'Via Mumbai / Panvel (NH 66)', descMr: 'द्रुतगती महामार्ग + कोकण हायवे (~४६० किमी)', descEn: 'Expressway + Coastal NH 66 (~460 km)' },
      { id: 'Karad', nameMr: 'कराड मार्गे (आंबा घाट)', nameEn: 'Via Karad (Amba Ghat)', descMr: 'पुणे-सातारा-कराड-मलकापूर (~३३५ किमी)', descEn: 'Pune-Satara-Karad-Amba Ghat (~335 km)' },
      { id: 'Tamhini Ghat', nameMr: 'ताम्हिणी घाट मार्गे (माणगाव)', nameEn: 'Via Tamhini Ghat (Scenic)', descMr: 'ताम्हिणी-माणगाव-चिपळूण (~३१० किमी)', descEn: 'Tamhini-Mangaon-Chiplun (~310 km)' },
    ];
  }

  // Mumbai <-> Goa
  if ((d.includes('mumbai') || d.includes('मुंबई')) && (t.includes('goa') || t.includes('गोवा'))) {
    return [
      { id: 'Pune-Kolhapur', nameMr: 'पुणे-कोल्हापूर-बेळगाव मार्गे (NH 48)', nameEn: 'Via Pune-Kolhapur (NH 48)', descMr: '४-लेन महामार्ग, वेगवान प्रवास (~५९० किमी)', descEn: '4-Lane Express Highway (~590 km)' },
      { id: 'Chiplun-Ratnagiri', nameMr: 'चिपळूण-रत्नागिरी मार्गे (NH 66)', nameEn: 'Via Chiplun-Ratnagiri (NH 66)', descMr: 'सागरी महामार्ग निसर्ग दर्शन (~५५० किमी)', descEn: 'Scenic Konkan Coastal Route (~550 km)' },
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

export const FutureTripModal: React.FC<FutureTripModalProps> = ({ 
  isOpen, 
  onClose, 
  lang, 
  onAlert, 
  isFullPage = false 
}) => {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('Goa');
  const [viaRoute, setViaRoute] = useState('');
  const [tripType, setTripType] = useState('leisure');
  const [persons, setPersons] = useState('2');
  const [companions, setCompanions] = useState('friends');
  const [transport, setTransport] = useState('flight');
  const [budget, setBudget] = useState('18000');
  const [days, setDays] = useState('3');
  const [departureDate, setDepartureDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [previewPlan, setPreviewPlan] = useState<any>(null);
  const [showSmartBudget, setShowSmartBudget] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<number | 'all'>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showMathBreakdown, setShowMathBreakdown] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const smartViaRoutes = getSmartViaRoutes(departure, destination);

  const handleReset = () => {
    setLocationError(null);
    setPreviewPlan(null);
  };

  const handleModalClose = () => {
    setLocationError(null);
    setPreviewPlan(null);
    onClose();
  };

  const handleApplyPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    setDestination(preset.dest);
    setViaRoute('');
    setDays(preset.days);
    setTripType(preset.type);
    setTransport(preset.transport);
    if (preset.transport === 'flight') setBudget('22000');
    else if (preset.transport === 'car') setBudget('12000');
    else setBudget('8000');
  };

  const handleExportPDF = async () => {
    if (!previewPlan) return;
    setIsExportingPdf(true);
    try {
      const el = document.getElementById('routripo-future-trip-plan-container');
      if (el) {
        const destTitle = (previewPlan.trip_title || destination || 'Trip').replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_');
        await exportElementToPdf(el, `RouTripO_${destTitle}_Itinerary.pdf`);
      } else {
        window.print();
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      onAlert(lang === 'mr' ? 'PDF तयार करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const executeGenerateTripPlan = async (options?: { overrideVia?: string }) => {
    if (!destination.trim()) {
      onAlert(lang === 'mr' ? 'कृपया गंतव्यस्थान प्रविष्ट करा' : 'Please enter destination');
      return;
    }

    const effectiveVia = options && options.overrideVia !== undefined 
      ? options.overrideVia.trim() 
      : viaRoute.trim();

    setLoadingStep(options?.overrideVia !== undefined
      ? (lang === 'mr' ? '⚡ शिफारस केलेल्या वेगवान मार्गाने सहल तयार करत आहे...' : '⚡ Re-generating itinerary with optimal route...')
      : (lang === 'mr' ? '📍 अंतर आणि मार्ग मोजत आहे...' : '📍 Calculating distance and route...'));
    setLocationError(null);
    
    try {
      if (!options?.overrideVia) {
        await new Promise(r => setTimeout(r, 600));
        setLoadingStep(transport === 'train' 
          ? (lang === 'mr' ? '🚂 IRCTC रेल्वे मार्ग व वेळ तपासत आहे...' : '🚂 Checking IRCTC train routes & timings...')
          : transport === 'flight'
          ? (lang === 'mr' ? '✈️ थेट विमान उड्डाणे आणि दर तपासत आहे...' : '✈️ Checking flight schedules & fares...')
          : (lang === 'mr' ? '🚗 हायवे, टोल व इंधन खर्च तपासत आहे...' : '🚗 Checking highways, tolls & fuel costs...'));
          
        await new Promise(r => setTimeout(r, 600));
        setLoadingStep(lang === 'mr' ? '✨ सर्वोत्तम प्रेक्षणीय स्थळे व वेळापत्रक आखत आहे...' : '✨ Selecting top attractions & scheduling...');
          
        await new Promise(r => setTimeout(r, 500));
        setLoadingStep(lang === 'mr' ? '🏨 हॉटेल व प्रामाणिक खाद्यसंस्कृती जोडत आहे...' : '🏨 Curating stays & local food experiences...');
      }
        
      const response = await fetch("/api/generate-future-trip-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure: departure || (lang === 'mr' ? 'मुंबई' : 'Mumbai'),
          destination: destination,
          viaRoute: effectiveVia || undefined,
          tripType,
          persons: Number(persons),
          companions,
          transportMode: transport,
          budget: Number(budget),
          days: Number(days),
          departureDate,
          lang
        })
      });

      const resData = await response.json();
      setLoadingStep(null);

      if (!response.ok || !resData.success) {
        const errorMsg = resData.error || resData.message || (lang === 'mr' ? 'स्थान सापडले नाही. कृपया वैध, वास्तविक शहर किंवा पर्यटन ठिकाण टाका.' : 'Location not found. Please enter a valid, real-world city or destination.');
        if (response.status === 400 || resData.code === 'LOCATION_NOT_FOUND') {
          setLocationError(errorMsg);
        }
        throw new Error(errorMsg);
      }

      setPreviewPlan(resData.data);
    } catch (err: any) {
      setLoadingStep(null);
      onAlert(err.message || 'Something went wrong');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeGenerateTripPlan();
  };

  const handleSwitchToOptimalRoute = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!previewPlan?.optimalRouteSuggestion) return;
    const targetVia = previewPlan.optimalRouteSuggestion.optimalVia !== undefined 
      ? previewPlan.optimalRouteSuggestion.optimalVia 
      : '';
    setViaRoute(targetVia);
    executeGenerateTripPlan({ overrideVia: targetVia });
  };

  const handleConfirmMakeTrip = async () => {
    if (!previewPlan) return;

    const aiPlanObj = typeof previewPlan === 'string' ? previewPlan : JSON.stringify(previewPlan);
    const tripPayload = {
      name: previewPlan.trip_title || destination,
      startDate: departureDate,
      days: Number(days),
      budget: Number(budget),
      transportMode: transport,
      viaRoute: previewPlan.viaRoute || (viaRoute.trim() ? viaRoute.trim() : undefined),
      selectedRoute: previewPlan.selectedRoute || undefined,
      aiPlan: aiPlanObj
    };

    if ((window as any).onConvertSmartTrip) {
      (window as any).onConvertSmartTrip(tripPayload);
    } else if ((window as any).onConvertAITrip) {
      (window as any).onConvertAITrip(tripPayload);
    }
    handleModalClose();
  };

  return (
    <>
      <SmartBudgetModal
        isOpen={showSmartBudget}
        onClose={() => setShowSmartBudget(false)}
        lang={lang}
        destination={destination}
        days={parseInt(days) || 3}
        persons={parseInt(persons) || 2}
        transportMode={transport}
        onApplyBudget={(total) => setBudget(total.toString())}
      />

      <div className={isFullPage ? "premium-root w-full min-h-screen bg-[var(--premium-page)] flex flex-col pb-24" : "premium-root fixed inset-0 z-[100] flex items-center justify-center bg-[var(--premium-ink)]/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto flex-1 pb-[30px]"}>
        <div id="ai-trip-planner-modal" className={isFullPage ? "relative w-full max-w-2xl premium-card shadow-sm border border-slate-100 flex flex-col overflow-hidden my-0 sm:my-3 mx-auto flex-1" : "relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-4"}>
          
          {/* Header - Uniform App Signature Sky Panel Gradient */}
          <header className="premium-gradient px-5 pt-6 pb-6 text-white relative shadow-sm">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Top Row: Back & Status Badges */}
            <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
              <button 
                type="button"
                onClick={previewPlan ? handleReset : handleModalClose}
                disabled={loadingStep !== null}
                className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center gap-1.5 transition-all text-white font-bold text-xs border border-white/30 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
                <span>{lang === 'mr' ? 'मागे' : 'Back'}</span>
              </button>
              

            </div>
            
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 block mb-0.5">
                RouTripO Smart Itinerary Engine
              </span>
              <h1 className="text-[22px] sm:text-[25px] font-bold tracking-tight leading-tight text-white">
                {previewPlan 
                  ? (lang === 'mr' ? 'स्मार्ट प्रवास आराखडा' : 'Your Custom Travel Itinerary') 
                  : (lang === 'mr' ? 'AI स्मार्ट ट्रिप प्लॅनर' : 'AI Smart Travel Planner')
                }
              </h1>
              <p className="text-[12px] text-white/90 font-medium mt-1">
                {previewPlan 
                  ? (lang === 'mr' ? 'सविस्तर दिवस व वेळेनुसार आखलेला प्लॅन तपासा' : 'Review customized day-by-day plan, budget & spots')
                  : (lang === 'mr' ? 'स्थान, बजेट आणि दिवसांनुसार अचूक प्रवास शेड्युल तयार करा' : 'Instant AI curated day-wise itinerary, budget & bookings')
                }
              </p>
            </div>
          </header>

          {/* STEP 2: PREVIEW GENERATED PLAN */}
          {previewPlan ? (
            previewPlan.is_feasible === false || previewPlan.practicality_warning ? (
              /* PRACTICALITY WARNING VIEW */
              <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-[var(--premium-page)]">
                <div className="bg-premium-pink-soft border border-premium-pink rounded-[24px] p-5 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[20px] bg-[var(--premium-pink)] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-orange-200 text-[var(--premium-pink)] rounded-md text-[10px] font-bold uppercase tracking-wider mb-1">
                        {lang === 'mr' ? 'प्रवास कालावधी सल्ला' : 'Travel Distance Advisory'}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--premium-pink)] leading-snug">
                        {previewPlan.practicality_warning?.alert || 'Trip distance requires more days for comfortable travel.'}
                      </h4>
                    </div>
                  </div>

                  {previewPlan.practicality_warning?.detailed_fact && (
                    <p className="text-xs text-slate-700 bg-white/90 p-3 rounded-[16px] border border-premium-pink font-medium">
                      {previewPlan.practicality_warning.detailed_fact}
                    </p>
                  )}
                </div>

                {previewPlan.practicality_warning?.smart_alternatives && (
                  <div className="space-y-2.5">
                    <h5 className="text-xs font-bold text-[var(--premium-ink)] uppercase tracking-wider px-1">
                      {lang === 'mr' ? 'सुचवलेले सोयीस्कर पर्याय:' : 'Feasible Nearby Destinations:'}
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {previewPlan.practicality_warning.smart_alternatives.map((alt: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-[20px] border border-slate-100 flex items-center justify-between gap-2 shadow-xs">
                          <div>
                            <p className="text-[13px] font-bold text-[var(--premium-ink)]">{alt.name}</p>
                            <p className="text-[11px] text-[var(--premium-muted)]">{alt.reason}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDestination(alt.name.split('(')[0].trim());
                              setPreviewPlan(null);
                            }}
                            className="px-3 py-1.5 rounded-[16px] premium-gradient-pink text-white font-bold text-[11px] shrink-0"
                          >
                            Select & Plan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full h-12 rounded-[20px] bg-[var(--premium-ink)] text-white font-bold text-xs uppercase tracking-wider mt-2"
                >
                  Adjust Duration or Destination
                </button>
              </div>
            ) : (
              /* FEASIBLE ITINERARY VIEW */
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 bg-[var(--premium-page)]">
                
                {/* 1. HERO DESTINATION BANNER CARD */}
                {(() => {
                  const itArr = previewPlan.Day_By_Day_Itinerary || previewPlan.itinerary;
                  const planText = Array.isArray(itArr) 
                    ? itArr.map((d: any) => `${d.day_title || ''} ${d.activities_sequence ? d.activities_sequence.join(' ') : (d.morning || '')} ${d.evening || ''}`).join(' ')
                    : '';
                  const heroBanner = getBrochureHeroContent(destination, previewPlan.trip_title || destination, planText, lang === 'mr');
                  
                  return (
                    <div className="rounded-[24px] bg-slate-900 overflow-hidden shadow-sm relative border border-slate-200 text-white min-h-[170px] flex flex-col justify-end p-5">
                      <OptimizedImage 
                        src={heroBanner.url} 
                        alt={heroBanner.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      <div className="relative z-10 space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-widest border border-white/30 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--premium-sky)]" />
                            {destination}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-premium-sky-soft0 text-white font-bold text-[10px] uppercase tracking-widest">
                            Verified AI Plan
                          </span>
                        </div>

                        <h2 className="text-[20px] sm:text-[24px] font-bold text-white leading-tight">
                          {previewPlan.trip_title || destination}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white pt-1">
                          <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-[16px] backdrop-blur-md">
                            <Calendar className="w-3.5 h-3.5 text-premium-pink" />
                            <span>{days} {lang === 'mr' ? 'दिवस' : 'Days'}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-[16px] backdrop-blur-md">
                            <Users className="w-3.5 h-3.5 text-premium-pink" />
                            <span>{persons} Pax</span>
                          </span>
                          <span className="flex items-center gap-1 premium-gradient-pink text-white px-2.5 py-1 rounded-[16px] font-bold shadow-xs">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>₹{Number(budget).toLocaleString('en-IN')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 1.5 SELECTED ROUTE / VIA STRIP */}
                {(previewPlan.Chosen_Route || previewPlan.viaRoute || previewPlan.selectedRoute || viaRoute) && (
                  <div className="p-3.5 rounded-[20px] bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-pink-800 uppercase tracking-wider block">
                          {lang === 'mr' ? '🛣️ निवडलेला पसंतीचा प्रवास मार्ग' : '🛣️ Chosen Travel Route'}
                        </span>
                        <p className="text-xs font-bold text-pink-950 truncate">
                          {previewPlan.Chosen_Route || previewPlan.selectedRoute || `${departure || (lang === 'mr' ? 'मुंबई' : 'Mumbai')} ➔ ${previewPlan.viaRoute || viaRoute} ➔ ${destination}`}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-pink-600 text-white text-[10px] font-bold shrink-0 shadow-2xs">
                      {lang === 'mr' ? 'पसंतीचा मार्ग लागू' : 'Route Applied'}
                    </span>
                  </div>
                )}

                {/* PREFERRED OPTIMAL ROUTE SUGGESTION (RED BANNER - INTERACTIVE) */}
                {previewPlan.optimalRouteSuggestion?.isDifferent && (
                  <div 
                    onClick={handleSwitchToOptimalRoute}
                    className="group p-4 rounded-[20px] bg-rose-50 hover:bg-rose-100/90 border-2 border-rose-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSwitchToOptimalRoute(); }}
                    title={lang === 'mr' ? 'हा शिफारस केलेला वेगवान मार्ग निवडण्यासाठी क्लिक करा' : 'Click to switch to this optimal route'}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:scale-105 transition-transform">
                        <Zap className="w-4.5 h-4.5 text-orange-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1">
                            <span>⚡ {lang === 'mr' ? 'शिफारस केलेला जलद मार्ग' : 'Preferred Route Recommendation'}</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wide">
                            {lang === 'mr' ? 'शिफारस' : 'Optimal Choice'}
                          </span>
                        </div>
                        <p className="text-xs font-black text-rose-950 mt-1">
                          {lang === 'mr' ? previewPlan.optimalRouteSuggestion.messageMr : previewPlan.optimalRouteSuggestion.messageEn}
                        </p>
                        <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                          {lang === 'mr' 
                            ? `हा मार्ग वापरून प्रवास वेळ व अंतर वाचवण्यासाठी या बॅनरवर किंवा बटणावर क्लिक करा.`
                            : `Switch to this highway corridor to save transit hours, reduce fatigue, and lower fuel expenses.`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwitchToOptimalRoute}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-[16px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shrink-0 transition cursor-pointer hover:shadow-md group-hover:scale-102"
                    >
                      <Zap className="w-3.5 h-3.5 text-orange-300" />
                      <span>{lang === 'mr' ? 'या वेगवान मार्गावर स्विच करा ➔' : 'Switch to this optimal route ➔'}</span>
                    </button>
                  </div>
                )}

                {previewPlan.Alternative_Route_Note && (
                  <div className="p-3.5 rounded-[20px] bg-orange-50 border border-orange-200 shadow-xs flex gap-2">
                    <Info className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-orange-900">{previewPlan.Alternative_Route_Note}</p>
                  </div>
                )}

                {/* 2. BUDGET & LOGISTICS STRIP */}
                {previewPlan.totalEstimatedCost && (
                  <div className="p-3.5 rounded-[20px] bg-white border border-slate-100 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="flex items-center gap-1.5 text-[var(--premium-ink)]">
                        <CheckCircle2 className="w-4 h-4 text-premium-sky-deep" />
                        <span>Budget Feasibility</span>
                      </span>
                      <span className="text-[13px] font-bold text-[var(--premium-violet)] bg-[var(--premium-violet-soft)] px-2 py-0.5 rounded-lg">
                        ₹{Number(previewPlan.totalEstimatedCost).toLocaleString('en-IN')} Est.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1 text-[var(--premium-muted)] border-t border-slate-100">
                      {previewPlan.totalDistanceKm && (
                        <div className="flex items-center gap-1 col-span-2 pb-1 border-b border-slate-50">
                          <Navigation className="w-3.5 h-3.5 text-[var(--premium-violet)]" />
                          <span>Distance: <strong className="text-[var(--premium-ink)]">{previewPlan.totalDistanceKm} km</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>{transport === 'flight' ? '✈️' : transport === 'train' ? '🚂' : '🚗'}</span>
                        <span>Transport: <strong className="text-[var(--premium-ink)]">₹{Number(previewPlan.costBreakdown?.travel || 0).toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🏨</span>
                        <span>Stay: <strong className="text-[var(--premium-ink)]">₹{Number(previewPlan.costBreakdown?.stay || 0).toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🍛</span>
                        <span>Food: <strong className="text-[var(--premium-ink)]">₹{Number(previewPlan.costBreakdown?.food || 0).toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🎯</span>
                        <span>Activities: <strong className="text-[var(--premium-ink)]">₹{Number(previewPlan.costBreakdown?.activities || 0).toLocaleString('en-IN')}</strong></span>
                      </div>

                      {/* Granular Mathematical Breakdown Accordion */}
                      {(previewPlan.budget_summary?.transport_breakdown || previewPlan.budget_summary?.hotel_breakdown || previewPlan.budget_summary?.math_summary) && (
                        <div className="col-span-2 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowMathBreakdown(!showMathBreakdown)}
                            className="w-full flex items-center justify-between py-1 text-[11px] font-bold text-[var(--premium-violet)] hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Calculator className="w-3.5 h-3.5" />
                              <span>{lang === 'mr' ? 'अचूक गणितीय बजेट विश्लेषण' : 'Exact Mathematical Budget Breakdown'}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">{showMathBreakdown ? (lang === 'mr' ? 'लपवा ▲' : 'Hide ▲') : (lang === 'mr' ? 'तपशील पहा ▼' : 'View Details ▼')}</span>
                          </button>

                          {showMathBreakdown && (
                            <div className="mt-2 p-2.5 rounded-[14px] bg-slate-50 border border-slate-150 space-y-1.5 text-[10px] text-slate-700">
                              {previewPlan.budget_summary.transport_breakdown && (
                                <div className="flex items-start gap-1.5">
                                  <span className="font-bold text-slate-900 shrink-0">🚗 {lang === 'mr' ? 'प्रवास:' : 'Transit:'}</span>
                                  <span>{previewPlan.budget_summary.transport_breakdown}</span>
                                </div>
                              )}
                              {previewPlan.budget_summary.hotel_breakdown && (
                                <div className="flex items-start gap-1.5">
                                  <span className="font-bold text-slate-900 shrink-0">🏨 {lang === 'mr' ? 'मुक्काम:' : 'Stay:'}</span>
                                  <span>{previewPlan.budget_summary.hotel_breakdown}</span>
                                </div>
                              )}
                              {previewPlan.budget_summary.food_breakdown && (
                                <div className="flex items-start gap-1.5">
                                  <span className="font-bold text-slate-900 shrink-0">🍛 {lang === 'mr' ? 'अन्न:' : 'Dining:'}</span>
                                  <span>{previewPlan.budget_summary.food_breakdown}</span>
                                </div>
                              )}
                              {previewPlan.budget_summary.activities_breakdown && (
                                <div className="flex items-start gap-1.5">
                                  <span className="font-bold text-slate-900 shrink-0">🎯 {lang === 'mr' ? 'पर्यटन पास:' : 'Sightseeing:'}</span>
                                  <span>{previewPlan.budget_summary.activities_breakdown}</span>
                                </div>
                              )}
                              {previewPlan.budget_summary.emergency_buffer && (
                                <div className="flex items-start gap-1.5">
                                  <span className="font-bold text-slate-900 shrink-0">🛡️ {lang === 'mr' ? 'आपत्कालीन राखीव निधी:' : 'Emergency Buffer:'}</span>
                                  <span>₹{Number(previewPlan.budget_summary.emergency_buffer).toLocaleString('en-IN')} (~10% Contingency)</span>
                                </div>
                              )}
                              {previewPlan.budget_summary.math_summary && (
                                <div className="pt-1 border-t border-slate-200 font-semibold text-slate-900 flex items-start gap-1.5">
                                  <span className="text-pink-700 font-bold shrink-0">🧮 {lang === 'mr' ? 'ताळेबंद:' : 'Summary:'}</span>
                                  <span className="text-slate-800">{previewPlan.budget_summary.math_summary}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. WEATHER / PACKING ADVISORY */}
                {previewPlan.weatherPackingTips && (
                  <div className="bg-[var(--premium-sky-soft)] border border-[var(--premium-sky-deep)]/20 rounded-[20px] p-3.5 flex gap-2.5 shadow-xs">
                    <Sun className="w-4 h-4 text-[var(--premium-sky-deep)] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[11px] font-bold text-[var(--premium-ink)] uppercase tracking-wider">
                        {lang === 'mr' ? '🌤️ हवामान व प्रवास टिप्स' : '🌤️ Weather & Packing Tips'}
                      </h5>
                      <p className="text-[11px] font-medium text-slate-700 mt-0.5 leading-relaxed">
                        {previewPlan.weatherPackingTips}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3.5 DYNAMIC ROUTE MAP VISUALIZATION */}
                {previewPlan.routeMapData && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[12px] font-bold text-[var(--premium-ink)] uppercase tracking-wider flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-pink-600" />
                        <span>{lang === 'mr' ? 'प्रवास मार्ग व पर्यटन स्थळे (थेट नकाशा)' : 'Interactive Route & Attraction Map'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200 shadow-2xs">
                        {transport === 'flight' ? '✈️ Air Geodesic Route' : transport === 'train' ? '🚂 Direct Railway Line' : '🛣️ OSRM Road Polyline'}
                      </span>
                    </div>
                    <TripPlannerMapView routeData={previewPlan.routeMapData} lang={lang} />
                  </div>
                )}

                {/* 4. DAY-BY-DAY SCHEDULE TABS */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-bold text-[var(--premium-ink)] uppercase tracking-wider flex items-center gap-1.5 px-1">
                      <Calendar className="w-4 h-4 text-[var(--premium-violet)]" />
                      <span>{lang === 'mr' ? 'दिवसनिहाय वेळापत्रक' : 'Day-by-Day Schedule'}</span>
                    </h3>

                    {(Array.isArray(previewPlan.Day_By_Day_Itinerary) || Array.isArray(previewPlan.itinerary)) && (previewPlan.Day_By_Day_Itinerary || previewPlan.itinerary).length > 1 && (
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                        <button
                          type="button"
                          onClick={() => setSelectedDayTab('all')}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            selectedDayTab === 'all' 
                              ? 'premium-gradient-pink text-white shadow-xs' 
                              : 'bg-white text-[var(--premium-muted)] border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          All
                        </button>
                        {(previewPlan.Day_By_Day_Itinerary || previewPlan.itinerary).map((d: any, i: number) => {
                          const dNum = d.day || i + 1;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedDayTab(dNum)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                                selectedDayTab === dNum 
                                  ? 'premium-gradient-pink text-white shadow-xs' 
                                  : 'bg-white text-[var(--premium-muted)] border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Day {dNum}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CARDS LIST */}
                  {(Array.isArray(previewPlan.Day_By_Day_Itinerary) || Array.isArray(previewPlan.itinerary)) && (previewPlan.Day_By_Day_Itinerary || previewPlan.itinerary)
                    .filter((dayItem: any, idx: number) => {
                      if (selectedDayTab === 'all') return true;
                      const dayNum = dayItem.day || idx + 1;
                      return selectedDayTab === dayNum;
                    })
                    .map((dayItem: any, idx: number) => {
                      const dayNum = dayItem.day || idx + 1;
                      const daySpots = getSpotsForDay(
                        dayNum, 
                        `${dayItem.day_title || ''} ${dayItem.activities_sequence ? dayItem.activities_sequence.join(' ') : (dayItem.morning_9am_to_12pm || '')}`, 
                        destination, 
                        previewPlan.trip_title || destination, 
                        lang === 'mr'
                      );

                      return (
                        <div key={idx} className="premium-card border border-slate-100 shadow-xs overflow-hidden space-y-0">
                          {/* Day Header */}
                          <div className="premium-gradient px-4 py-2.5 text-white font-bold text-[13px] flex items-center justify-between">
                            <span>Day {dayNum}: {dayItem.day_title || `Explore ${destination}`}</span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                              Day {dayNum} of {days}
                            </span>
                          </div>

                          {/* Sightseeing Spot Photos Preview */}
                          {daySpots.length > 0 && (
                            <div className="p-3 bg-[var(--premium-page)] border-b border-slate-100 grid grid-cols-2 gap-2">
                              {daySpots.slice(0, 2).map((sp, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-2 bg-white p-1.5 rounded-[16px] border border-slate-100">
                                  <img 
                                    src={sp.url} 
                                    alt={sp.title} 
                                    crossOrigin="anonymous" 
                                    className="w-11 h-11 rounded-lg object-cover shrink-0" 
                                  />
                                  <div className="overflow-hidden min-w-0">
                                    <span className="text-[11px] font-bold text-[var(--premium-ink)] block truncate">{sp.title}</span>
                                    <span className="text-[9px] text-[var(--premium-violet)] font-semibold truncate block">Must Visit Spot</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Time Slots Schedule */}
                          <div className="p-4 space-y-2.5 text-xs text-slate-700">
                            {/* Realistic Transit Timeline & 8-Hour Overnight Transit Halt Alert */}
                            {dayItem.realistic_transit && (
                              <div className="space-y-1.5">
                                {dayItem.realistic_transit.is_overnight_transit_stay && (
                                  <div className="p-3 rounded-[16px] bg-orange-500/10 border border-orange-500/30 flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider">
                                          {lang === 'mr' ? '🛑 रात्रीचा मुक्काम (Overnight Transit Halt)' : '🛑 Overnight Transit Halt'}
                                        </span>
                                        {dayItem.realistic_transit.transit_halt_location && (
                                          <span className="px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 text-[10px] font-bold">
                                            📍 {dayItem.realistic_transit.transit_halt_location}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] font-medium text-orange-900/90 mt-0.5">
                                        {lang === 'mr' 
                                          ? '८ तासांपेक्षा जास्त प्रवास असल्याने चालकाचा थकवा टाळण्यासाठी व सुरक्षिततेसाठी येथे रात्रीचा मुक्काम ठरवला आहे.' 
                                          : 'Driving duration exceeds 8 hours. Scheduled overnight midpoint halt to prevent fatigue and ensure road safety.'}
                                      </p>
                                      {dayItem.realistic_transit.transit_notes && (
                                        <p className="text-[10px] text-orange-900/80 mt-1 font-medium italic">
                                          {dayItem.realistic_transit.transit_notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {(dayItem.realistic_transit.transit_hours || dayItem.realistic_transit.departure_time) && !dayItem.realistic_transit.is_overnight_transit_stay && (
                                  <div className="p-2.5 rounded-[16px] bg-rose-50/70 border border-rose-200/60 text-rose-950 text-[11px] font-medium flex items-center justify-between flex-wrap gap-1.5">
                                    <span className="flex items-center gap-1.5 font-semibold">
                                      <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span>
                                        {dayItem.realistic_transit.departure_time ? `${dayItem.realistic_transit.departure_time} ➔ ${dayItem.realistic_transit.arrival_time || 'Arrival'}` : 'Transit'}
                                      </span>
                                    </span>
                                    <span className="text-[10px] font-bold bg-rose-100/80 px-2 py-0.5 rounded-md text-rose-900">
                                      ⏱️ {dayItem.realistic_transit.transit_hours} {dayItem.realistic_transit.distance_covered_km ? `(${dayItem.realistic_transit.distance_covered_km})` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {dayItem.travel_route_info && (
                              <div className="p-2.5 rounded-[16px] bg-[var(--premium-violet-soft)] text-[var(--premium-violet)] text-[11px] font-semibold flex items-center gap-2">
                                <Navigation className="w-3.5 h-3.5 text-[var(--premium-violet)] shrink-0" />
                                <span>{dayItem.travel_route_info}</span>
                              </div>
                            )}

                            {/* NEW FORMAT: sequential activities */}
                            {Array.isArray(dayItem.activities_sequence) && dayItem.activities_sequence.map((act: string, aIdx: number) => (
                              <div key={aIdx} className="flex gap-2">
                                <span className="text-premium-sky font-bold shrink-0">•</span>
                                <span className="font-medium text-slate-700">{act}</span>
                              </div>
                            ))}

                            {/* Historical Context & Cultural Significance for POIs */}
                            {Array.isArray(dayItem.points_of_interest) && dayItem.points_of_interest.length > 0 && (
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                                  <Landmark className="w-3.5 h-3.5 text-[var(--premium-violet)] shrink-0" />
                                  <span>{lang === 'mr' ? 'ऐतिहासिक व सांस्कृतिक वारसा' : 'Historical & Cultural Significance'}</span>
                                </div>
                                <div className="space-y-2">
                                  {dayItem.points_of_interest.map((poi: any, pIdx: number) => (
                                    <div key={pIdx} className="p-2.5 rounded-[14px] bg-slate-50 border border-slate-150 space-y-1.5">
                                      <div className="flex items-center justify-between gap-1 flex-wrap">
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                          <span>🏛️</span>
                                          <span>{poi.name}</span>
                                        </span>
                                        {poi.best_time_to_visit && (
                                          <span className="text-[9px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                                            {poi.best_time_to_visit}
                                          </span>
                                        )}
                                      </div>

                                      {/* Verified Wikipedia Image (Strictly from Wikipedia API) */}
                                      {poi.image_url && (
                                        <div className="relative rounded-lg overflow-hidden my-1.5 h-36 w-full bg-slate-200 border border-slate-200 shadow-2xs">
                                          <img 
                                            src={poi.image_url} 
                                            alt={poi.name} 
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { 
                                              // Gracefully hide if load fails
                                              const parent = (e.currentTarget as HTMLElement).parentElement;
                                              if (parent) parent.style.display = 'none';
                                            }}
                                          />
                                          <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] text-white font-medium flex items-center gap-1">
                                            <span>Wikipedia Verified</span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Verified Wikipedia Historical Context & Cultural Significance */}
                                      {poi.wiki_extract && (
                                        <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-md border border-slate-150 leading-relaxed">
                                          "{poi.wiki_extract}"
                                          {poi.wiki_url && (
                                            <a 
                                              href={poi.wiki_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="ml-1.5 text-pink-600 hover:underline not-italic font-semibold text-[10px]"
                                            >
                                              [Wikipedia ↗]
                                            </a>
                                          )}
                                        </p>
                                      )}

                                      {poi.historical_context && (
                                        <p className="text-[11px] text-slate-700 leading-relaxed">
                                          <strong className="text-slate-900 font-semibold">{lang === 'mr' ? 'ऐतिहासिक पार्श्वभूमी: ' : 'History: '}</strong>
                                          {poi.historical_context}
                                        </p>
                                      )}
                                      {poi.cultural_significance && (
                                        <p className="text-[11px] text-slate-700 leading-relaxed">
                                          <strong className="text-slate-900 font-semibold">{lang === 'mr' ? 'सांस्कृतिक महत्त्व: ' : 'Cultural Lore: '}</strong>
                                          {poi.cultural_significance}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Authentic Regional Culinary Heritage */}
                            {dayItem.authentic_dining && (
                              <div className="p-3 rounded-[16px] bg-gradient-to-br from-rose-50/80 to-orange-50/60 border border-rose-200/70 space-y-2">
                                <div className="flex items-center gap-1.5">
                                  <Utensils className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span className="text-xs font-bold text-rose-950">
                                    {lang === 'mr' ? 'अस्सल स्थानिक खाद्यसंस्कृती' : 'Authentic Regional Cuisine'}
                                  </span>
                                </div>
                                {dayItem.authentic_dining.culinary_tradition && (
                                  <p className="text-[11px] text-rose-900/90 leading-relaxed font-medium">
                                    {dayItem.authentic_dining.culinary_tradition}
                                  </p>
                                )}
                                {Array.isArray(dayItem.authentic_dining.signature_dishes) && dayItem.authentic_dining.signature_dishes.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {dayItem.authentic_dining.signature_dishes.map((dish: string, dIdx: number) => (
                                      <span key={dIdx} className="px-2 py-0.5 rounded-full bg-white text-rose-900 text-[10px] font-bold border border-rose-200 shadow-2xs">
                                        🍲 {dish}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {Array.isArray(dayItem.authentic_dining.recommended_food_spots) && dayItem.authentic_dining.recommended_food_spots.length > 0 && (
                                  <p className="text-[10px] text-rose-950 font-semibold pt-0.5">
                                    <span className="text-rose-700 font-bold">{lang === 'mr' ? 'प्रसिद्ध खानावळी / हॉटेल्स: ' : 'Recommended Food Hubs: '}</span>
                                    {dayItem.authentic_dining.recommended_food_spots.join(' • ')}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* OLD FORMAT FALLBACK */}
                            {(dayItem.morning_9am_to_12pm || dayItem.morning) && !dayItem.activities_sequence && (
                              <div className="flex gap-2">
                                <span className="text-premium-pink font-bold shrink-0">🌅 Morning:</span>
                                <span className="font-medium text-slate-700">{dayItem.morning_9am_to_12pm || dayItem.morning}</span>
                              </div>
                            )}

                            {(dayItem.afternoon_12pm_to_4pm || dayItem.afternoon) && !dayItem.activities_sequence && (
                              <div className="flex gap-2">
                                <span className="text-orange-500 font-bold shrink-0">☀️ Afternoon:</span>
                                <span className="font-medium text-slate-700">{dayItem.afternoon_12pm_to_4pm || dayItem.afternoon}</span>
                              </div>
                            )}

                            {(dayItem.evening_4pm_to_9pm || dayItem.evening) && !dayItem.activities_sequence && (
                              <div className="flex gap-2">
                                <span className="text-[var(--premium-violet)] font-bold shrink-0">🌆 Evening:</span>
                                <span className="font-medium text-slate-700">{dayItem.evening_4pm_to_9pm || dayItem.evening}</span>
                              </div>
                            )}

                            {(dayItem.local_food_specialty || dayItem.food_specialty) && !dayItem.authentic_dining && (
                              <div className="p-2 rounded-[16px] bg-[var(--premium-pink-soft)] text-[var(--premium-ink)] text-[11px] font-semibold flex items-center gap-1.5 mt-1">
                                <Utensils className="w-3.5 h-3.5 text-[var(--premium-pink)] shrink-0" />
                                <span><strong>Food Specialty:</strong> {dayItem.local_food_specialty || dayItem.food_specialty}</span>
                              </div>
                            )}

                            {dayItem.stay && !dayItem.activities_sequence && (
                              <div className="p-2 rounded-[16px] bg-[var(--premium-sky-soft)] text-[var(--premium-ink)] text-[11px] font-semibold flex items-center gap-1.5">
                                <Hotel className="w-3.5 h-3.5 text-[var(--premium-sky-deep)] shrink-0" />
                                <span><strong>Stay Recommendation:</strong> {dayItem.stay}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* HIDDEN PRINT / PDF CONTAINER */}
                <div className="hidden">
                  <div id="routripo-future-trip-plan-container" className="w-[800px] bg-white text-[var(--premium-ink)] p-6 font-sans space-y-4">
                    <PDFLayoutWrapper 
                      tripName={previewPlan.trip_title || destination} 
                      tripDates={`${days} Days • ${departureDate || 'Upcoming'}`}
                      documentType="Official AI Travel Itinerary"
                    >
                      <div className="p-4 space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{previewPlan.trip_title || destination}</h2>
                          <p className="text-xs text-slate-500">Route: {previewPlan.selectedRoute || destination} • {days} Days • {persons} Pax</p>
                        </div>

                        {previewPlan.budget_summary && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                            <div className="font-bold text-slate-900">Budget Breakdown:</div>
                            {previewPlan.budget_summary.transport_breakdown && <div>• Transit: {previewPlan.budget_summary.transport_breakdown}</div>}
                            {previewPlan.budget_summary.hotel_breakdown && <div>• Stay: {previewPlan.budget_summary.hotel_breakdown}</div>}
                            {previewPlan.budget_summary.food_breakdown && <div>• Dining: {previewPlan.budget_summary.food_breakdown}</div>}
                            {previewPlan.budget_summary.activities_breakdown && <div>• Sightseeing: {previewPlan.budget_summary.activities_breakdown}</div>}
                            {previewPlan.budget_summary.math_summary && <div className="font-semibold pt-1 border-t border-slate-200">• Total: {previewPlan.budget_summary.math_summary}</div>}
                          </div>
                        )}

                        <div className="space-y-4">
                          {previewPlan.itinerary && previewPlan.itinerary.map((d: any, idx: number) => (
                            <div key={idx} className="p-3 border border-slate-200 rounded-lg text-xs space-y-2">
                              <div className="font-bold text-sm text-slate-900">{d.day_title || `Day ${d.day || idx + 1}`}</div>
                              {d.realistic_transit?.is_overnight_transit_stay && (
                                <div className="p-2 bg-orange-50 border border-orange-200 text-orange-900 rounded font-semibold">
                                  🛑 Overnight Transit Halt: {d.realistic_transit.transit_halt_location || 'Midpoint'} (Drive exceeds 8 hours)
                                </div>
                              )}
                              <p className="text-slate-700">{d.description}</p>
                              {Array.isArray(d.points_of_interest) && d.points_of_interest.length > 0 && (
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-800">Historical & Cultural Landmarks:</div>
                                  {d.points_of_interest.map((poi: any, pIdx: number) => (
                                    <div key={pIdx} className="pl-2 border-l-2 border-slate-300">
                                      <span className="font-semibold text-slate-900">{poi.name}: </span>
                                      <span className="text-slate-600">{poi.historical_context} ({poi.cultural_significance})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {d.authentic_dining && (
                                <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-950">
                                  <span className="font-bold">Authentic Regional Cuisine: </span>
                                  {d.authentic_dining.signature_dishes?.join(', ')} • {d.authentic_dining.culinary_tradition}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </PDFLayoutWrapper>
                  </div>
                </div>

                {/* STICKY ACTIONS FOOTER */}
                <div className="pt-3 border-t border-slate-100 space-y-2 bg-white p-3 rounded-[20px] shadow-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-1/3 h-12 rounded-[20px] bg-slate-100 hover:bg-slate-200 text-[var(--premium-ink)] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmMakeTrip}
                      className="w-2/3 h-12 rounded-[20px] bg-[var(--premium-violet)] hover:opacity-95 text-white font-bold text-[13px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{lang === 'mr' ? 'ही सहल तयार करा 🚀' : 'Make This Trip 🚀'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isExportingPdf}
                      onClick={handleExportPDF}
                      className="h-11 rounded-[20px] bg-white border border-slate-200 hover:bg-slate-50 text-[var(--premium-ink)] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {isExportingPdf ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--premium-violet)]" />
                      ) : (
                        <FileText className="w-4 h-4 text-[var(--premium-violet)]" />
                      )}
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        let shareText = `*${previewPlan.trip_title || "Trip Plan"}*\n\n`;
                        if (previewPlan.totalDistanceKm) shareText += `Distance: ${previewPlan.totalDistanceKm} km\n`;
                        if (previewPlan.totalEstimatedCost) shareText += `Estimated Cost: ₹${previewPlan.totalEstimatedCost.toLocaleString('en-IN')}\n\n`;
                        shareText += `Plan generated on RouTripO!`;
                        shareAppOnWhatsApp(lang, shareText);
                      }}
                      className="h-11 rounded-[20px] bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* STEP 1: FORM INPUTS IN UNIFORM PREMIUM THEME */
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 bg-[var(--premium-page)]">
              
              {/* RTAIP GATE 1: LOCATION ERROR PREMIUM ALERT BANNER */}
              {locationError && (
                <div 
                  id="gate1-location-not-found-alert"
                  className="p-4 rounded-[22px] bg-rose-50 border-2 border-rose-500 shadow-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2"
                >
                  <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">
                        {lang === 'mr' ? 'स्थान सापडले नाही' : 'Location Not Found'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLocationError(null)}
                        className="text-rose-500 hover:text-rose-700 font-bold text-sm px-1.5 py-0.5 rounded cursor-pointer"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs font-bold text-rose-950 mt-1 leading-snug">
                      {locationError}
                    </p>
                    <p className="text-[11px] text-rose-800 mt-1 font-medium">
                      {lang === 'mr'
                        ? 'काल्पनिक किंवा अमान्य ठिकाणांसाठी सहलीचे नियोजन केले जाऊ शकत नाही. कृपया वैध, वास्तविक शहर किंवा पर्यटन ठिकाण टाका.'
                        : 'Trips cannot be generated for fictional, imaginary, or unrecognized places. Please enter an authentic, real-world city.'}
                    </p>
                  </div>
                </div>
              )}

              {/* From & Destination Card */}
              <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-xs space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider mb-1">
                      From (Departure)
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--premium-sky-deep)]" />
                      <input
                        type="text"
                        value={departure}
                        onChange={(e) => {
                          setDeparture(e.target.value);
                          if (locationError) setLocationError(null);
                        }}
                        placeholder="Mumbai / Pune"
                        className="w-full bg-[var(--premium-page)] border border-slate-200 rounded-[20px] pl-10 pr-3 py-2.5 text-xs font-bold text-[var(--premium-ink)] focus:bg-white focus:border-[var(--premium-violet)] outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider mb-1">
                      Destination *
                    </label>
                    <div className="relative">
                      <Compass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--premium-violet)]" />
                      <input
                        type="text"
                        required
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          if (locationError) setLocationError(null);
                        }}
                        placeholder="e.g. Goa"
                        className={`w-full bg-[var(--premium-page)] border ${locationError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'} rounded-[20px] pl-10 pr-3 py-2.5 text-xs font-bold text-[var(--premium-ink)] focus:bg-white focus:border-[var(--premium-violet)] outline-none transition`}
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Route / Via Stop Section */}
                <div className="pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-pink-600" />
                      <span>{lang === 'mr' ? 'पसंतीचा मार्ग / मार्गे (Via Stop - ऐच्छिक)' : 'Via / Preferred Route (Optional)'}</span>
                    </label>
                    {viaRoute && (
                      <button
                        type="button"
                        onClick={() => setViaRoute('')}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        {lang === 'mr' ? 'काढून टाका ✕' : 'Clear ✕'}
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Navigation className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-600" />
                    <input
                      type="text"
                      value={viaRoute}
                      onChange={(e) => setViaRoute(e.target.value)}
                      placeholder={lang === 'mr' ? "उदा. कराड, मुंबई, ताम्हिणी घाट, नाशिक..." : "e.g. Karad, Mumbai, Tamhini Ghat..."}
                      className="w-full bg-[var(--premium-page)] border border-slate-200 rounded-[20px] pl-10 pr-3 py-2 text-xs font-bold text-[var(--premium-ink)] focus:bg-white focus:border-pink-600 outline-none transition"
                    />
                  </div>

                  {/* Contextual Smart Via Suggestions */}
                  {smartViaRoutes.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 block">
                        {lang === 'mr' ? '⚡ लोकप्रिय मार्ग पर्याय (क्लिक करा):' : '⚡ Popular Route Options (Click to select):'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {smartViaRoutes.map((rt) => {
                          const isPicked = viaRoute.toLowerCase().includes(rt.id.toLowerCase());
                          return (
                            <button
                              key={rt.id}
                              type="button"
                              onClick={() => setViaRoute(isPicked ? '' : (lang === 'mr' ? rt.nameMr : rt.nameEn))}
                              className={`p-2 rounded-[14px] text-left transition-all cursor-pointer flex flex-col ${
                                isPicked
                                  ? 'bg-pink-50 border border-pink-500 shadow-2xs'
                                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[11px] font-bold ${isPicked ? 'text-pink-900' : 'text-slate-800'}`}>
                                  {lang === 'mr' ? rt.nameMr : rt.nameEn}
                                </span>
                                {isPicked && <span className="text-[10px] text-pink-700 font-bold">✓ Active</span>}
                              </div>
                              <span className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                                {lang === 'mr' ? rt.descMr : rt.descEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live Route Indicator Preview */}
                  <div className="mt-2 p-2 rounded-[14px] bg-slate-50 border border-slate-150 flex items-center gap-1.5 text-[11px] font-medium text-slate-700 overflow-x-auto">
                    <span className="font-bold text-slate-900 shrink-0">🚗 {departure || (lang === 'mr' ? 'पुणे' : 'Pune')}</span>
                    <span className="text-slate-400 shrink-0">➔</span>
                    {viaRoute ? (
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-md font-bold text-[10px] shrink-0">
                        {viaRoute} ({lang === 'mr' ? 'मार्गे' : 'Via'})
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[10px] shrink-0">
                        {lang === 'mr' ? 'थेट / सर्वोत्कृष्ट महामार्ग' : 'Direct / Optimal Route'}
                      </span>
                    )}
                    <span className="text-slate-400 shrink-0">➔</span>
                    <span className="font-bold text-slate-900 shrink-0">{destination || (lang === 'mr' ? 'रत्नागिरी' : 'Ratnagiri')}</span>
                  </div>
                </div>
              </div>

              {/* Transport Mode - ModeStrip Style Rail */}
              <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-xs space-y-2">
                <label className="block text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider">
                  Transport Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TRANSPORT_OPTIONS.map((opt) => {
                    const isSelected = transport === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTransport(opt.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-[20px] p-2.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[var(--premium-violet-soft)] border border-[var(--premium-violet)]/40 shadow-xs' 
                            : 'bg-[var(--premium-page)] border border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <span className={`flex h-11 w-11 items-center justify-center rounded-[20px] transition-colors ${
                          isSelected 
                            ? 'bg-[var(--premium-accent)] text-white shadow-xs' 
                            : 'bg-white text-slate-600 shadow-2xs'
                        }`}>
                          <opt.icon className="h-5 w-5" />
                        </span>
                        <span className={`text-[11px] font-bold truncate w-full text-center ${
                          isSelected ? 'text-[var(--premium-violet)]' : 'text-slate-600'
                        }`}>
                          {opt.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Duration Card */}
              <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-xs space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-[var(--premium-page)] border border-slate-200 rounded-[20px] px-3 py-2.5 text-xs font-bold text-[var(--premium-ink)] focus:bg-white focus:border-[var(--premium-violet)] outline-none transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider">
                        Days
                      </label>
                      <div className="flex gap-1">
                        {['2', '3', '5', '7'].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDays(d)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              days === d ? 'premium-gradient-pink text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {d}D
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full bg-[var(--premium-page)] border border-slate-200 rounded-[20px] px-3 py-2.5 text-xs font-bold text-[var(--premium-ink)] focus:bg-white focus:border-[var(--premium-violet)] outline-none transition"
                    />
                  </div>
                </div>

                {/* Budget & Travelers */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider">
                        Budget (₹)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSmartBudget(true)}
                        className="text-[10px] font-bold text-[var(--premium-violet)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Estimate</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      step="500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-[var(--premium-page)] border border-slate-200 rounded-[20px] px-3 py-2.5 text-xs font-bold text-[var(--premium-ink)] focus:bg-white focus:border-[var(--premium-violet)] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider mb-1">
                      Travelers Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={persons}
                      onChange={(e) => setPersons(e.target.value)}
                      className="w-full bg-[var(--premium-page)] border border-slate-200 rounded-[20px] px-3 py-2.5 text-xs font-bold text-[var(--premium-ink)] focus:bg-white focus:border-[var(--premium-violet)] outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Type Selector */}
              <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-xs space-y-2">
                <label className="block text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider">
                  Trip Vibe
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TRIP_TYPES.map((tt) => {
                    const isSelected = tripType === tt.id;
                    return (
                      <button
                        key={tt.id}
                        type="button"
                        onClick={() => {
                          setTripType(tt.id);
                          if (tt.id === 'solo') {
                            setPersons('1');
                            setCompanions('solo');
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'premium-gradient-pink text-white shadow-xs' 
                            : 'bg-[var(--premium-page)] text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tt.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingStep !== null}
                  className="w-full h-13 bg-[var(--premium-violet)] hover:opacity-95 text-white font-bold text-[15px] rounded-[20px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loadingStep ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span className="text-xs font-bold">{loadingStep}</span>
                    </>
                  ) : (
                    <>
                      <span>{lang === 'mr' ? 'स्मार्ट प्लॅन तयार करा ✨' : 'Generate AI Smart Plan ✨'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
