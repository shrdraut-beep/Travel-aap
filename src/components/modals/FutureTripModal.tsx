import { ScrollView } from '../ScrollView';
import { fetchLocationImage } from "../../services/api/unsplash";
import React, { useState } from 'react';
import { SmartBudgetModal } from './SmartBudgetModal';
import { Calculator, Wallet } from 'lucide-react';
import { X, Sparkles, MapPin, Calendar, DollarSign, Users, Bus, Compass, Loader2, ArrowLeft, CheckCircle2, Navigation, Lightbulb, Sun, Sunrise, Sunset, AlertTriangle, Clock, ArrowRight, Hotel, Download, Share2, FileText, Check, ShieldCheck, Landmark, Camera } from 'lucide-react';
import { getBrochureHeroContent, getFeaturedSpotsForTrip, getSpotsForDay } from '../../utils/touristSpotImages';
import { shareAppOnWhatsApp } from '../../utils/shareUtils';

interface FutureTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'mr' | 'hi' | string;
  onAlert: (msg: string) => void;
  onManualEntry: () => void;
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

export const FutureTripModal: React.FC<FutureTripModalProps> = ({ isOpen, onClose, lang, onAlert, onManualEntry }) => {


  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('leisure');
  const [persons, setPersons] = useState('2');
  const [companions, setCompanions] = useState('friends');
  const [transport, setTransport] = useState('train');
  const [budget, setBudget] = useState('10000');
  const [days, setDays] = useState('3');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [previewPlan, setPreviewPlan] = useState<any>(null);
  const [bgImage, setBgImage] = useState<string>('');
  const [showSmartBudget, setShowSmartBudget] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setPreviewPlan(null);
  };

  const handleModalClose = () => {
    setPreviewPlan(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      onAlert(lang === 'mr' ? 'कृपया गंतव्यस्थान प्रविष्ट करा' : 'Please enter destination');
      return;
    }

    setGenerationError(null);
    setLoadingStep(lang === 'mr' ? '📍 अंतर आणि मार्ग मोजत आहे...' : '📍 Calculating distance and route...');
    
    try {
      await new Promise(r => setTimeout(r, 1500));
      setLoadingStep(transport === 'train' 
        ? (lang === 'mr' ? '🚂 रेल्वे मार्ग आणि वेळ तपासत आहे...' : '🚂 Checking train routes and times...')
        : (lang === 'mr' ? '🚗 हायवे आणि टोल तपासत आहे...' : '🚗 Checking highways and tolls...'));
        
      await new Promise(r => setTimeout(r, 1500));
      setLoadingStep(lang === 'mr' ? '✨ सर्वोत्तम प्रेक्षणीय स्थळे निवडत आहे...' : '✨ Selecting best sightseeing spots...');
        
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStep(lang === 'mr' ? '🏨 हॉटेल आणि जेवणाचे पर्याय शोधत आहे...' : '🏨 Finding hotels and dining options...');
        
      const response = await fetch("/api/generate-future-trip-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure: departure || (lang === 'mr' ? 'मुंबई' : 'Mumbai'),
          destination: destination,
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
        throw new Error(resData.message || (lang === 'mr' ? 'सहलीचा प्लॅन तयार करताना त्रुटी आली.' : 'Failed to generate trip plan.'));
      }

      // Check for impracticality warning from API
      if (resData.data && (resData.data.is_feasible === false || resData.data.practicality_warning)) {
        setPreviewPlan(resData.data);
      } else {
        // Successful generation
        try {
          const imgData = await fetchLocationImage(destination);
          if (imgData?.url) setBgImage(imgData.url);
        } catch (imgErr) {
          console.warn("Failed to fetch dynamic image", imgErr);
        }
        setPreviewPlan(resData.data);
      }
    } catch (err: any) {
      setLoadingStep(null);
      setGenerationError(err.message);
      onAlert(err.message);
    }
  };

  const handleConfirmMakeTrip = async () => {
    if (!previewPlan) return;
    
    // Add Firestore import
    const { db } = await import('../../firebase');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

    const aiPlanObj = typeof previewPlan === 'string' ? previewPlan : JSON.stringify(previewPlan);
    const tripPayload = {
      name: previewPlan.trip_title || destination,
      startDate: departureDate,
      days: Number(days),
      budget: Number(budget),
      transportMode: transport,
      aiPlan: aiPlanObj,
      createdAt: serverTimestamp(),
      ownerId: 'placeholder-user-id', // Need to get current user ID
      // Mapping to calendar/list view structure
      itinerary: previewPlan.itinerary
    };

    try {
      await addDoc(collection(db, 'trips'), tripPayload);
    } catch (e) {
      console.error("Error saving trip:", e);
      onAlert(lang === 'mr' ? 'सहल जतन करण्यात त्रुटी आली.' : 'Failed to save trip.');
    }

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
      <div id="ai-trip-planner-modal" className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative">
          <button 
            onClick={handleModalClose}
            disabled={loadingStep !== null}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            {previewPlan && (
              <button
                type="button"
                onClick={handleReset}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all text-white mr-1"
                title={lang === 'mr' ? 'मागे जा' : 'Go back'}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight leading-tight">
                {previewPlan 
                  ? (lang === 'mr' ? 'स्मार्ट प्रवास आराखडा (पूर्वावलोकन)' : 'Smart Trip Itinerary Preview') 
                  : (lang === 'mr' ? 'स्मार्ट ट्रिप प्लॅनर' : 'Smart Trip Planner')
                }
              </h3>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                {previewPlan 
                  ? (lang === 'mr' ? 'सविस्तर दिवस व वेळेनुसार आखलेला प्लॅन तपासा' : 'Review your customized day & time wise travel plan')
                  : (lang === 'mr' ? 'स्मार्ट द्वारे तयार करा सविस्तर प्रवास आराखडा' : 'Generate an automated, smart day-wise travel plan')
                }
              </p>
            </div>
          </div>
        </div>

        {/* STEP 2: PREVIEW GENERATED PLAN OR FEASIBILITY WARNING */}
        {previewPlan ? (
          previewPlan.is_feasible === false || previewPlan.practicality_warning ? (
            /* PRACTICALITY WARNING & REFUSAL VIEW */
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 animate-pulse">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-lg text-[10px] font-black uppercase tracking-wider mb-1">
                      {lang === 'mr' ? 'प्रवास कालावधी इशारा' : 'Trip Feasibility Warning'}
                    </span>
                    <h4 className="text-base font-black text-rose-950 leading-snug">
                      {previewPlan.practicality_warning?.alert || (lang === 'mr' ? '⚠️ ही सहल प्रवासाच्या अंतरामुळे अशक्य आहे!' : '⚠️ Trip is geographically impractical!')}
                    </h4>
                  </div>
                </div>

                {previewPlan.practicality_warning?.detailed_fact && (
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-rose-200/80 shadow-xs space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-extrabold uppercase text-[11px] tracking-wide">
                      <Clock className="w-4 h-4 text-rose-600" />
                      <span>{lang === 'mr' ? 'वास्तविक वेळ व अंतराचे तथ्य:' : 'Real Travel Time & Distance Fact:'}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {previewPlan.practicality_warning.detailed_fact}
                    </p>
                  </div>
                )}
              </div>

              {previewPlan.practicality_warning?.smart_alternatives && previewPlan.practicality_warning.smart_alternatives.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {lang === 'mr' ? `सुचवलेले सोयीस्कर पर्याय (${days} दिवसांसाठी):` : `Suggested Feasible Alternatives (for ${days} days):`}
                    </h5>
                  </div>

                  <div className="space-y-2.5">
                    {previewPlan.practicality_warning.smart_alternatives.map((alt: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h6 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-teal-600" />
                            {alt.name}
                          </h6>
                          {alt.travel_time && (
                            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-extrabold text-[11px] rounded-xl border border-teal-200 shrink-0">
                              ⏱️ {alt.travel_time}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {alt.reason}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            const cleanName = alt.name.split('(')[0].trim();
                            setDestination(cleanName);
                            setPreviewPlan(null);
                          }}
                          className="w-full mt-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>{lang === 'mr' ? 'हे ठिकाण निवडा व प्लॅन करा' : 'Select Destination & Plan'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'कालावधी / ठिकाण बदला' : 'Change Days or Destination'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* FEASIBLE DETAILED ITINERARY VIEW */
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overflow-x-hidden">
              <div className="space-y-6">
                
                {/* 0. BUDGET & WEATHER BANNERS */}
                {previewPlan.totalEstimatedCost && (
                  <div className={`p-4 rounded-2xl border ${Number(previewPlan.totalEstimatedCost) > Number(budget) ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                    <div className="font-black text-sm mb-2">
                      {Number(previewPlan.totalEstimatedCost) > Number(budget) 
                        ? (lang === 'mr' ? `⚠️ तुमचे बजेट ₹${(Number(previewPlan.totalEstimatedCost) - Number(budget)).toLocaleString('en-IN')} ने कमी पडत आहे.` : `⚠️ Your budget is short by ₹${(Number(previewPlan.totalEstimatedCost) - Number(budget)).toLocaleString('en-IN')}.`)
                        : (lang === 'mr' ? '✅ तुमची सहल बजेटमध्ये आहे!' : '✅ Your trip is within budget!')
                      }
                    </div>
                    {previewPlan.totalDistanceKm && (
                      <div className="text-xs font-semibold opacity-90 mb-1 border-t border-black/10 pt-2">
                        📍 {lang === 'mr' ? 'अंदाजे अंतर:' : 'Estimated Distance:'} {previewPlan.totalDistanceKm} km
                      </div>
                    )}
                    {previewPlan.costBreakdown && (
                      <div className="text-xs font-semibold opacity-90 mb-1 border-t border-black/10 pt-2">
                        {(() => {
                           const mode = (previewPlan.transportMode || "Car").toLowerCase();
                           const isCar = mode.includes("car") || mode.includes("गाडी");
                           const isTrain = mode.includes("train") || mode.includes("रेल्वे");
                           const isFlight = mode.includes("flight") || mode.includes("विमान");
                           const isBus = mode.includes("bus") || mode.includes("बस");
                           const icon = isCar ? "🚗" : isTrain ? "🚂" : isFlight ? "✈️" : "🚌";
                           const label = isCar ? (lang === 'mr' ? 'प्रवासाचा खर्च:' : 'Transport Cost:') : (lang === 'mr' ? 'प्रवासाचा खर्च (तिकीट):' : 'Transport Cost (Ticket):');
                           return (
                             <>
                               {icon} {label} ₹{Number(previewPlan.costBreakdown?.travel || 0).toLocaleString('en-IN')}
                               {isCar && previewPlan.transportBreakdown && (
                                 <span className="opacity-70 ml-2">
                                   ({lang === 'mr' ? 'पेट्रोल:' : 'Fuel:'} ₹{previewPlan.transportBreakdown.fuel}, {lang === 'mr' ? 'टोल:' : 'Toll:'} ₹{previewPlan.transportBreakdown.toll})
                                 </span>
                               )}
                             </>
                           );
                        })()}
                      </div>
                    )}
                    <div className="text-xs font-semibold opacity-80 border-t border-black/10 pt-2">
                      {lang === 'mr' ? 'एकूण अंदाजे खर्च: ' : 'Total Estimated Cost: '} ₹{Number(previewPlan.totalEstimatedCost).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
                
                {previewPlan.weatherPackingTips && (
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex gap-3">
                    <Sun className="w-6 h-6 text-sky-600 shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-sky-950 uppercase tracking-wider">{lang === 'mr' ? '🌤️ हवामान आणि तयारी' : '🌤️ Weather & Packing'}</h5>
                      <p className="text-sm font-semibold text-sky-800 mt-0.5">{previewPlan.weatherPackingTips}</p>
                    </div>
                  </div>
                )}
                
                {/* 1. CLEAN HEADER SUMMARY CARD */}
                {(() => {
                  const planItineraryText = Array.isArray(previewPlan.itinerary) 
                    ? previewPlan.itinerary.map((d: any) => `${d.day_title || ''} ${d.morning_9am_to_12pm || d.morning || ''} ${d.afternoon_12pm_to_4pm || d.afternoon || ''} ${d.evening_4pm_to_9pm || d.evening || ''}`).join(' ')
                    : '';
                  const futureBannerInfo = getBrochureHeroContent(destination, previewPlan.trip_title || destination, planItineraryText);
                  
                  return (
                    <div className="bg-slate-900 rounded-[24px] overflow-hidden shadow-lg relative">
                      <OptimizedImage 
                        src={futureBannerInfo.url} 
                        alt={futureBannerInfo.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                      
                      <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end min-h-[180px] space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {futureBannerInfo.title}
                          </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                          {previewPlan.trip_title || destination}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-slate-100 pt-2">
                          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
                            <Calendar className="w-4 h-4 text-amber-400" />
                            <span>{days} {lang === 'mr' ? 'दिवस' : 'Days'}</span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span>{persons} {lang === 'mr' ? 'प्रवासी' : 'Travelers'}</span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black shadow-md">
                            <DollarSign className="w-4 h-4" />
                            <span>{lang === 'mr' ? 'बजेट' : 'Budget'}: ₹{Number(budget).toLocaleString('en-IN')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. HIGHLIGHTS & TRANSPORT */}
                {previewPlan.logistics?.transport_options && previewPlan.logistics.transport_options.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Bus className="w-4 h-4 text-amber-600" />
                      <span>{lang === 'mr' ? 'प्रवास व लॉजिस्टिक्स' : 'Transport & Logistics'}</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {previewPlan.logistics.transport_options.map((opt: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-900">{opt.name || opt.type}</span>
                            <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">{opt.estimated_cost}</span>
                          </div>
                          {opt.estimated_timing && (
                            <div className="text-[11px] text-slate-600 font-bold">⏱️ {opt.estimated_timing}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DAY WISE SCHEDULE */}
                <div className="space-y-4">
                  <h5 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-indigo-600" />
                    <span>{lang === 'mr' ? 'सविस्तर प्रवास योजना' : 'Detailed Itinerary'}</span>
                  </h5>
                  {Array.isArray(previewPlan.itinerary) && previewPlan.itinerary.map((dayItem: any, idx: number) => {
                    const dayNum = dayItem.day || idx + 1;
                    const morning = dayItem.morning_9am_to_12pm || dayItem.morning;
                    const afternoon = dayItem.afternoon_12pm_to_4pm || dayItem.afternoon;
                    const evening = dayItem.evening_4pm_to_9pm || dayItem.evening;
                    const stay = dayItem.stay || (lang === 'mr' ? 'हॉटेल / मुक्काम' : 'Hotel / Accommodation');
                    const tips = dayItem.daily_local_travel_tips || dayItem.local_pro_tips;
                    const daySpots = getSpotsForDay(dayNum, `${dayItem.day_title || ''} ${morning || ''} ${afternoon || ''} ${evening || ''}`, destination, previewPlan.trip_title || destination);
                    
                    return (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* DAY TITLE */}
                        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-sm font-black text-white bg-indigo-600 px-3.5 py-1.5 rounded-xl shadow-sm inline-flex w-max">
                            {dayItem.day_title || `${lang === 'mr' ? 'दिवस' : 'Day'} ${dayNum}`}
                          </span>
                          
                          {/* DAY SPOTS MINI GALLERY */}
                          {daySpots.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                              {daySpots.slice(0, 3).map((sp, sIdx) => (
                                <OptimizedImage 
                                  key={sIdx}
                                  src={sp.url} 
                                  alt={sp.title} 
                                  className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0 border border-slate-200"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* SCHEDULE DETAILS */}
                        <div className="p-4 space-y-4">
                          <div className="space-y-3">
                            {morning && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0 mt-0.5">
                                  <Sunrise className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{lang === 'mr' ? 'सकाळ' : 'Morning'}</span>
                                  <p className="text-sm font-semibold text-slate-700 leading-relaxed mt-0.5">{morning}</p>
                                </div>
                              </div>
                            )}
                            {afternoon && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shrink-0 mt-0.5">
                                  <Sun className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{lang === 'mr' ? 'दुपार' : 'Afternoon'}</span>
                                  <p className="text-sm font-semibold text-slate-700 leading-relaxed mt-0.5">{afternoon}</p>
                                </div>
                              </div>
                            )}
                            {evening && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-xl text-purple-600 shrink-0 mt-0.5">
                                  <Sunset className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{lang === 'mr' ? 'संध्याकाळ' : 'Evening'}</span>
                                  <p className="text-sm font-semibold text-slate-700 leading-relaxed mt-0.5">{evening}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm bg-indigo-50 px-3 py-2 rounded-xl text-indigo-900 font-bold border border-indigo-100">
                              <Hotel className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span className="truncate">{stay}</span>
                            </div>

                            {/* Agoda Text Link Button */}
                            <div className="mt-3 mb-2 flex justify-start">
                              <a 
                                href="https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1969781&city=11304" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-block bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                              >
                                येथे हॉटेल बुक करा 🏨
                              </a>
                            </div>

                            {tips && (
                              <div className="flex items-start gap-2 text-sm bg-amber-50 px-3 py-2 rounded-xl text-amber-900 font-bold border border-amber-100">
                                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span className="leading-tight">{tips}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

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
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all"
                  >
                    {lang === 'mr' ? 'बदल करा' : 'Edit Inputs'}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmMakeTrip}
                    className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600 hover:from-teal-600 hover:to-green-700 text-white font-black text-sm shadow-lg shadow-teal-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 fill-white/20" />
                    <span>{lang === 'mr' ? 'ही सहल तयार करा 🚀' : 'Make This Trip 🚀'}</span>
                  </button>
                </div>
                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  onClick={() => {
                    let shareText = `*${previewPlan.trip_title || "Trip Plan"}*\n\n`;
                    shareText += `Distance: ${previewPlan.totalDistanceKm} km\n`;
                    shareText += `Total Estimated Cost: ₹${previewPlan.totalEstimatedCost.toLocaleString('en-IN')}\n\n`;
                    
                    if (Array.isArray(previewPlan.itinerary)) {
                        shareText += `*Itinerary:*\n`;
                        previewPlan.itinerary.forEach((d: any) => {
                            shareText += `\n*${d.day_title || ''}*\n`;
                            if (d.morning) shareText += `☀️ Morning: ${d.morning}\n`;
                            if (d.afternoon) shareText += `🌤️ Afternoon: ${d.afternoon}\n`;
                            if (d.evening) shareText += `🌙 Evening: ${d.evening}\n`;
                        });
                    }

                    shareText += `\nCheck out my trip plan on Pravas Wataghati!`;
                    shareAppOnWhatsApp(lang, shareText);
                  }}
                  className="w-full py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-xs transition-all flex items-center justify-center gap-2"
                >
                  Share on WhatsApp 💬
                </button>
              </div>
            </div>
          )
        ) : (
          /* STEP 1: FORM INPUTS */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
            {/* Starting & Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'mr' ? 'प्रारंभ ठिकाण' : 'Departure'}
                </label>
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. मुंबई / पुणे' : 'e.g. Mumbai'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'mr' ? 'गंतव्यस्थान *' : 'Destination *'}
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. मनाली / गोवा' : 'e.g. Goa'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Date & Days */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'mr' ? 'प्रवास तारीख' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === 'mr' ? 'दिवस संख्या' : 'Duration (Days)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Budget & Travelers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'mr' ? 'एकूण बजेट (₹)' : 'Budget (₹)'}
                </label>
                <input
                  type="number"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'mr' ? 'प्रवासी संख्या' : 'No. of Travelers'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={persons}
                  onChange={(e) => setPersons(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Transport & Trip Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'mr' ? 'प्रवास साधन' : 'Transport'}
                </label>
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="train">{lang === 'mr' ? 'ट्रेन (Train)' : 'Train'}</option>
                  <option value="bus">{lang === 'mr' ? 'बस (Bus)' : 'Bus'}</option>
                  <option value="flight">{lang === 'mr' ? 'विमान (Flight)' : 'Flight'}</option>
                  <option value="car">{lang === 'mr' ? 'गाडी / कॅब (Car)' : 'Car / Cab'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === 'mr' ? 'प्रवासाचा प्रकार' : 'Trip Type'}
                </label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="leisure">{lang === 'mr' ? 'मनोरंजन / पर्यटन' : 'Leisure & Vacation'}</option>
                  <option value="adventure">{lang === 'mr' ? 'साहसी (Adventure)' : 'Adventure & Trekking'}</option>
                  <option value="pilgrimage">{lang === 'mr' ? 'धार्मिक / तीर्थक्षेत्र' : 'Pilgrimage / Spiritual'}</option>
                  <option value="family">{lang === 'mr' ? 'कौटुंबिक (Family)' : 'Family Trip'}</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingStep !== null}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-200 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {loadingStep ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs">{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{lang === 'mr' ? 'स्मार्ट प्लॅन तयार करा' : 'Generate Smart Trip Plan'}</span>
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
