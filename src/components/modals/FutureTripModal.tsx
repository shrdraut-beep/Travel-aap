import { ScrollView } from '../ScrollView';
import { fetchLocationImage } from "../../services/api/unsplash";
import React, { useState, useRef } from 'react';
import { SmartBudgetModal } from './SmartBudgetModal';
import { Calculator, Wallet } from 'lucide-react';
import { X, MapPin, Calendar, DollarSign, Users, Bus, Compass, Loader2, ArrowLeft, CheckCircle2, Navigation, Lightbulb, Sun, Sunrise, Sunset, AlertTriangle, Clock, ArrowRight, Hotel, Download, Share2, FileText, Check, ShieldCheck, Landmark, Camera, Plane, Train, Car, Tag, Fuel, Utensils, ChefHat, Sparkles, Printer } from 'lucide-react';
import { LogoName, BrandLogo } from '../routripo/SharedUI';
import { getBrochureHeroContent, getFeaturedSpotsForTrip, getSpotsForDay, resolveDestinationImage } from '../../utils/touristSpotImages';
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
];

const TRANSPORT_OPTIONS = [
  { id: 'train', labelMr: 'रेल्वे (Train)', labelEn: 'Train', icon: Train, emoji: '🚂', activeBg: 'from-rose-600 via-rose-700 to-red-800', iconBg: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'car', labelMr: 'गाडी / कॅब (Car)', labelEn: 'Car / Cab', icon: Car, emoji: '🚗', activeBg: 'from-sky-600 via-sky-700 to-blue-800', iconBg: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: 'bus', labelMr: 'बस (Bus)', labelEn: 'Bus', icon: Bus, emoji: '🚌', activeBg: 'from-amber-600 via-amber-700 to-orange-800', iconBg: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'flight', labelMr: 'विमान (Flight)', labelEn: 'Flight', icon: Plane, emoji: '✈️', activeBg: 'from-indigo-600 via-indigo-700 to-purple-800', iconBg: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

const TRIP_TYPES = [
  { id: 'leisure', labelMr: '🌴 पर्यटन (Leisure)', labelEn: '🌴 Vacation' },
  { id: 'adventure', labelMr: '🏔️ ट्रेकिंग (Adventure)', labelEn: '🏔️ Adventure' },
  { id: 'pilgrimage', labelMr: '🛕 धार्मिक (Pilgrimage)', labelEn: '🛕 Pilgrimage' },
  { id: 'family', labelMr: '👨‍👩‍👧‍👦 फॅमिली (Family)', labelEn: '👨‍👩‍👧‍👦 Family' },
  { id: 'friends', labelMr: '👥 फ्रेंड्स (Friends)', labelEn: '👥 Friends' },
  { id: 'couple', labelMr: '👩‍❤️‍👨 कपल्स (Couple)', labelEn: '👩‍❤️‍👨 Couple' },
  { id: 'solo', labelMr: '👤 सोलो (Solo)', labelEn: '👤 Solo' },
];

export const FutureTripModal: React.FC<FutureTripModalProps> = ({ isOpen, onClose, lang, onAlert, onManualEntry, isFullPage = false }) => {
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
  const [selectedDayTab, setSelectedDayTab] = useState<number | 'all'>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setPreviewPlan(null);
  };

  const handleModalClose = () => {
    setPreviewPlan(null);
    onClose();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      onAlert(lang === 'mr' ? 'कृपया गंतव्यस्थान प्रविष्ट करा' : 'Please enter destination');
      return;
    }

    setGenerationError(null);
    setLoadingStep(lang === 'mr' ? '📍 अंतर आणि मार्ग मोजत आहे...' : '📍 Calculating distance and route...');
    
    try {
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStep(transport === 'train' 
        ? (lang === 'mr' ? '🚂 रेल्वे मार्ग आणि वेळ तपासत आहे...' : '🚂 Checking train routes and times...')
        : (lang === 'mr' ? '🚗 हायवे आणि टोल तपासत आहे...' : '🚗 Checking highways and tolls...'));
        
      await new Promise(r => setTimeout(r, 1200));
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

      if (resData.data && (resData.data.is_feasible === false || resData.data.practicality_warning)) {
        setPreviewPlan(resData.data);
      } else {
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

    const aiPlanObj = typeof previewPlan === 'string' ? previewPlan : JSON.stringify(previewPlan);
    const tripPayload = {
      name: previewPlan.trip_title || destination,
      startDate: departureDate,
      days: Number(days),
      budget: Number(budget),
      transportMode: transport,
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
    <div className={isFullPage ? "w-full min-h-screen bg-slate-50 flex flex-col pb-24" : "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden"}>
      <div id="ai-trip-planner-modal" className={isFullPage ? "relative w-full max-w-2xl bg-white sm:rounded-[32px] shadow-sm border border-slate-200 flex flex-col overflow-hidden my-0 sm:my-4 mx-auto flex-1" : "relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-rose-100 flex flex-col max-h-[90vh] overflow-hidden my-6"}>
        
        {/* Header - Signature Routripo Red/Rose Theme with Official Brand Logo */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 p-5 sm:p-6 text-white relative shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Top Bar: Back Button on Left + Clean Header LogoName Badge */}
          <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
            {/* Back Button */}
            <button 
              type="button"
              onClick={previewPlan ? handleReset : handleModalClose}
              disabled={loadingStep !== null}
              className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center gap-1.5 transition-all text-white font-extrabold text-xs border border-white/20 cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>{lang === 'mr' ? 'मागे जा' : 'Back'}</span>
            </button>
            
            {/* Official Prominent RouTripO Brand Logo Badge */}
            <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-white/90 flex items-center gap-2">
              <BrandLogo className="text-lg sm:text-xl font-black" />
            </div>
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block mb-0.5">
              Routripo AI Engine
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
              {previewPlan 
                ? (lang === 'mr' ? 'स्मार्ट प्रवास आराखडा (पूर्वावलोकन)' : 'Smart Trip Itinerary Preview') 
                : (lang === 'mr' ? 'स्मार्ट ट्रिप प्लॅनर' : 'AI Smart Trip Planner')
              }
            </h3>
            <p className="text-xs text-rose-100 font-medium mt-1">
              {previewPlan 
                ? (lang === 'mr' ? 'सविस्तर दिवस व वेळेनुसार आखलेला प्लॅन तपासा' : 'Review your customized day & time wise travel plan')
                : (lang === 'mr' ? 'अचूक दिवस व वेळेनुसार आखलेला प्लॅन' : 'Generate automated, smart day-wise travel itinerary')
              }
            </p>
          </div>
        </div>

        {/* STEP 2: PREVIEW GENERATED PLAN OR FEASIBILITY WARNING */}
        {previewPlan ? (
          previewPlan.is_feasible === false || previewPlan.practicality_warning ? (
            /* PRACTICALITY WARNING & REFUSAL VIEW */
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="bg-gradient-to-br from-rose-50 via-rose-50/50 to-amber-50 border-2 border-rose-300 rounded-[24px] p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 animate-pulse">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-rose-200/80 text-rose-950 rounded-lg text-[10px] font-black uppercase tracking-wider mb-1">
                      {lang === 'mr' ? 'प्रवास कालावधी इशारा' : 'Trip Feasibility Warning'}
                    </span>
                    <h4 className="text-base font-black text-rose-950 leading-snug">
                      {previewPlan.practicality_warning?.alert || (lang === 'mr' ? '⚠️ ही सहल प्रवासाच्या अंतरामुळे अशक्य आहे!' : '⚠️ Trip is geographically impractical!')}
                    </h4>
                  </div>
                </div>

                {previewPlan.practicality_warning?.detailed_fact && (
                  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-rose-200 shadow-xs space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-black uppercase text-[11px] tracking-wide">
                      <Clock className="w-4 h-4 text-rose-600" />
                      <span>{lang === 'mr' ? 'वास्तविक वेळ व अंतराचे तथ्य:' : 'Real Travel Time & Distance Fact:'}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-semibold">
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
                        className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-rose-400 shadow-xs transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h6 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-rose-600" />
                            {alt.name}
                          </h6>
                          {alt.travel_time && (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 font-extrabold text-[11px] rounded-xl border border-rose-200 shrink-0">
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
                          className="w-full mt-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'कालावधी / ठिकाण बदला' : 'Change Days or Destination'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* FEASIBLE DETAILED ITINERARY VIEW - INTEGRATED DAY-BY-DAY */
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overflow-x-hidden">
              <div className="space-y-6">
                
                {/* 1. HERO SUMMARY CARD - THEME BRAND GRADIENT */}
                {(() => {
                  const planItineraryText = Array.isArray(previewPlan.itinerary) 
                    ? previewPlan.itinerary.map((d: any) => `${d.day_title || ''} ${d.morning_9am_to_12pm || d.morning || ''} ${d.afternoon_12pm_to_4pm || d.afternoon || ''} ${d.evening_4pm_to_9pm || d.evening || ''}`).join(' ')
                    : '';
                  const futureBannerInfo = getBrochureHeroContent(destination, previewPlan.trip_title || destination, planItineraryText, lang === 'mr');
                  
                  return (
                    <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 rounded-[28px] overflow-hidden shadow-xl relative border border-rose-500 text-white">
                      <OptimizedImage 
                        src={futureBannerInfo.url} 
                        alt={futureBannerInfo.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-950/85 via-rose-900/50 to-transparent" />
                      
                      <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end min-h-[190px] space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest border border-white/30 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-300" />
                            {destination}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-widest shadow-sm">
                            {lang === 'mr' ? 'अधिकृत प्रवास आराखडा' : 'Official Travel Plan'}
                          </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                          {previewPlan.trip_title || destination}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white pt-1">
                          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20">
                            <Calendar className="w-4 h-4 text-amber-300" />
                            <span>{days} {lang === 'mr' ? 'दिवस' : 'Days'}</span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20">
                            <Users className="w-4 h-4 text-amber-300" />
                            <span>{persons} {lang === 'mr' ? 'प्रवासी' : 'Travelers'}</span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-black shadow-md border border-emerald-400">
                            <DollarSign className="w-4 h-4" />
                            <span>₹{Number(budget).toLocaleString('en-IN')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. OVERALL TRIP BUDGET & LOGISTICS SUMMARY */}
                {previewPlan.totalEstimatedCost && (
                  <div className={`p-4 rounded-2xl border-2 ${Number(previewPlan.totalEstimatedCost) > Number(budget) ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-emerald-50 border-emerald-300 text-emerald-950'}`}>
                    <div className="font-black text-sm mb-2 flex items-center gap-2">
                      {Number(previewPlan.totalEstimatedCost) > Number(budget) 
                        ? (lang === 'mr' ? `⚠️ तुमचे बजेट ₹${(Number(previewPlan.totalEstimatedCost) - Number(budget)).toLocaleString('en-IN')} ने कमी पडत आहे.` : `⚠️ Budget short by ₹${(Number(previewPlan.totalEstimatedCost) - Number(budget)).toLocaleString('en-IN')}.`)
                        : (lang === 'mr' ? '✅ तुमची सहल पूर्णपणे बजेटमध्ये आहे!' : '✅ Trip is within your budget!')
                      }
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold border-t border-black/10 pt-2.5">
                      {previewPlan.totalDistanceKm && (
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Navigation className="w-4 h-4 text-rose-600" />
                          <span>{lang === 'mr' ? 'प्रवासाचे अंतर:' : 'Distance:'} <strong>{previewPlan.totalDistanceKm} km</strong></span>
                        </div>
                      )}
                      
                      {(() => {
                        const mode = (previewPlan.transportMode || transport || "Car").toLowerCase();
                        const isCar = mode.includes("car") || mode.includes("गाडी");
                        const icon = isCar ? "🚗" : mode.includes("train") ? "🚂" : mode.includes("flight") ? "✈️" : "🚌";
                        return (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <span>{icon}</span>
                            <span>{lang === 'mr' ? 'प्रवास खर्च:' : 'Transport:'} <strong>₹{Number(previewPlan.costBreakdown?.travel || 0).toLocaleString('en-IN')}</strong></span>
                            {isCar && previewPlan.transportBreakdown && (
                              <span className="text-[11px] opacity-80">
                                ({lang === 'mr' ? 'इंधन:' : 'Fuel:'} ₹{previewPlan.transportBreakdown.fuel}, {lang === 'mr' ? 'टोल:' : 'Toll:'} ₹{previewPlan.transportBreakdown.toll})
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="text-xs font-black opacity-95 border-t border-black/10 pt-2 mt-2 flex justify-between items-center">
                      <span>{lang === 'mr' ? 'एकूण अंदाजे खर्च: ' : 'Total Estimated Cost: '}</span>
                      <span className="text-sm font-extrabold text-rose-900 bg-rose-100/80 px-2.5 py-0.5 rounded-lg">
                        ₹{Number(previewPlan.totalEstimatedCost).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
                
                {previewPlan.weatherPackingTips && (
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex gap-3 shadow-xs">
                    <Sun className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-sky-950 uppercase tracking-wider">{lang === 'mr' ? '🌤️ हवामान व आवश्यक तयारी' : '🌤️ Weather & Packing Tips'}</h5>
                      <p className="text-xs font-semibold text-sky-900 mt-1 leading-relaxed">{previewPlan.weatherPackingTips}</p>
                    </div>
                  </div>
                )}

                {/* 3. INTEGRATED DAY-BY-DAY ITINERARY CARDS */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-rose-600" />
                      <span>{lang === 'mr' ? 'दिवसनिहाय सविस्तर शेड्युल (Day-by-Day Schedule)' : 'Detailed Day-by-Day Schedule'}</span>
                    </h5>

                    {/* Day Filter Pills */}
                    {Array.isArray(previewPlan.itinerary) && previewPlan.itinerary.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        <button
                          type="button"
                          onClick={() => setSelectedDayTab('all')}
                          className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedDayTab === 'all' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {lang === 'mr' ? 'सर्व दिवस' : 'All Days'}
                        </button>
                        {previewPlan.itinerary.map((d: any, i: number) => {
                          const dNum = d.day || i + 1;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedDayTab(dNum)}
                              className={`px-3 py-1 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${selectedDayTab === dNum ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                              Day {dNum}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {Array.isArray(previewPlan.itinerary) && previewPlan.itinerary
                    .filter((dayItem: any, idx: number) => {
                      if (selectedDayTab === 'all') return true;
                      const dayNum = dayItem.day || idx + 1;
                      return selectedDayTab === dayNum;
                    })
                    .map((dayItem: any, idx: number) => {
                    const dayNum = dayItem.day || idx + 1;
                    const morning = dayItem.morning_9am_to_12pm || dayItem.morning;
                    const afternoon = dayItem.afternoon_12pm_to_4pm || dayItem.afternoon;
                    const evening = dayItem.evening_4pm_to_9pm || dayItem.evening;
                    const stay = dayItem.stay || (lang === 'mr' ? `${destination} मध्यवर्ती हॉटेल / रिसॉर्ट` : `${destination} Central Hotel / Resort`);
                    const tips = dayItem.daily_local_travel_tips || dayItem.local_pro_tips;
                    const routeInfo = dayItem.travel_route_info || (dayNum === 1 && previewPlan.agent_insights?.transport_specialist ? previewPlan.agent_insights.transport_specialist : null);
                    const heritageInfo = dayItem.heritage_highlights || (previewPlan.agent_insights?.cultural_heritage && idx === 0 ? previewPlan.agent_insights.cultural_heritage : null);
                    const foodInfo = dayItem.local_food_specialty || (previewPlan.culinary_specialties && previewPlan.culinary_specialties.length > 0 ? previewPlan.culinary_specialties[idx % previewPlan.culinary_specialties.length] : null);
                    const daySpots = getSpotsForDay(dayNum, `${dayItem.day_title || ''} ${morning || ''} ${afternoon || ''} ${evening || ''} ${heritageInfo || ''}`, destination, previewPlan.trip_title || destination, lang === 'mr');

                    return (
                      <div key={idx} className="bg-white rounded-[24px] border-2 border-rose-100/90 shadow-sm overflow-hidden space-y-0">
                        {/* DAY TITLE HEADER - THEME COLOR GRADIENT */}
                        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 border-b border-rose-500 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-black text-rose-950 bg-amber-300 px-3 py-1.5 rounded-xl shadow-xs uppercase tracking-wider">
                              {lang === 'mr' ? `दिवस ${dayNum}` : `Day ${dayNum}`}
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                              {dayItem.day_title || `${destination} प्रेक्षणीय सहल`}
                            </h4>
                          </div>
                        </div>
                        
                        {/* DAY SPOTS MATCHED PHOTO GALLERY */}
                        {daySpots.length > 0 && (
                          <div className="p-3.5 bg-slate-50 border-b border-slate-200">
                            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                              <Camera className="w-3.5 h-3.5 text-rose-600" />
                              <span>{lang === 'mr' ? 'या दिवसाची प्रमुख प्रेक्षणीय स्थळे' : 'Day Highlights & Historical Spots'}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {daySpots.slice(0, 3).map((sp, sIdx) => (
                                <div key={sIdx} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-2xs group">
                                  <OptimizedImage 
                                    src={sp.url} 
                                    alt={sp.title} 
                                    className="w-full h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                                    <span className="text-[11px] font-black text-white leading-tight drop-shadow-xs truncate">{sp.title}</span>
                                    {(sp.subtitle || sp.location) && (
                                      <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">{sp.subtitle || sp.location}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SCHEDULE & INTEGRATED DETAILS */}
                        <div className="p-4 sm:p-5 space-y-3.5">
                          
                          {/* 1. ROUTE & TRANSIT INFO */}
                          {routeInfo && (
                            <div className="bg-sky-50/90 border border-sky-200/90 rounded-2xl p-3.5 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-sky-950 uppercase tracking-wide flex items-center gap-1.5">
                                  <Car className="w-4 h-4 text-sky-600" />
                                  {lang === 'mr' ? '🚗 प्रवासाचा मार्ग व वेळ:' : '🚗 Route & Travel Logistics:'}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                                {typeof routeInfo === 'string' ? routeInfo : routeInfo.details || ''}
                              </p>
                            </div>
                          )}

                          {/* 2. HERITAGE & HISTORICAL SIGNIFICANCE */}
                          {heritageInfo && (
                            <div className="bg-purple-50/90 border border-purple-200/90 rounded-2xl p-3.5 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                                  <Landmark className="w-4 h-4 text-purple-600" />
                                  {lang === 'mr' ? '🏛️ ऐतिहासिक महत्त्व व माहिती:' : '🏛️ Historical Heritage & Highlights:'}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                                {heritageInfo}
                              </p>
                            </div>
                          )}

                          {/* 3. TIME-BLOCKS (Morning, Afternoon, Evening) */}
                          <div className="space-y-2.5">
                            {/* MORNING */}
                            {morning && (
                              <div className="flex items-start gap-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/60">
                                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5 shadow-2xs">
                                  <Sunrise className="w-4 h-4" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest block">
                                    {lang === 'mr' ? '🌅 सकाळ (9:00 AM - 12:00 PM)' : '🌅 Morning (9:00 AM - 12:00 PM)'}
                                  </span>
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">{morning}</p>
                                </div>
                              </div>
                            )}

                            {/* AFTERNOON */}
                            {afternoon && (
                              <div className="flex items-start gap-3 bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200/50">
                                <div className="p-2 bg-rose-100 text-rose-800 rounded-xl shrink-0 mt-0.5 shadow-2xs">
                                  <Sun className="w-4 h-4" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <span className="text-[10px] font-black text-rose-950 uppercase tracking-widest block">
                                    {lang === 'mr' ? '☀️ दुपार (12:00 PM - 4:00 PM)' : '☀️ Afternoon (12:00 PM - 4:00 PM)'}
                                  </span>
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">{afternoon}</p>
                                </div>
                              </div>
                            )}

                            {/* EVENING */}
                            {evening && (
                              <div className="flex items-start gap-3 bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200/60">
                                <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl shrink-0 mt-0.5 shadow-2xs">
                                  <Sunset className="w-4 h-4" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <span className="text-[10px] font-black text-indigo-950 uppercase tracking-widest block">
                                    {lang === 'mr' ? '🌆 संध्याकाळ व रात्र (4:00 PM - 9:00 PM)' : '🌆 Evening & Night (4:00 PM - 9:00 PM)'}
                                  </span>
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">{evening}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 4. LOCAL FOOD & DINING SPECIALTY */}
                          {foodInfo && (
                            <div className="bg-orange-50/90 border border-orange-200/90 rounded-2xl p-3.5 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-orange-950 uppercase tracking-wide flex items-center gap-1.5">
                                  <Utensils className="w-4 h-4 text-orange-600" />
                                  {lang === 'mr' ? '🍲 स्थानिक प्रसिद्ध जेवण व खानावळ:' : '🍲 Local Food & Dining Specialty:'}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                                {typeof foodInfo === 'string' 
                                  ? foodInfo 
                                  : `${foodInfo.type?.toLowerCase().includes('non') ? '🔴' : '🟢'} ${foodInfo.dish} ${foodInfo.bestAt ? `(@ ${foodInfo.bestAt})` : ''} — ${foodInfo.description || ''}`}
                              </p>
                            </div>
                          )}
                          
                          {/* 5. STAY & LOCAL TIPS */}
                          <div className="pt-1 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs bg-slate-50 px-3.5 py-2.5 rounded-xl text-slate-800 font-bold border border-slate-200 shadow-2xs">
                              <Hotel className="w-4 h-4 text-rose-600 shrink-0" />
                              <span className="text-slate-900 font-extrabold">{lang === 'mr' ? 'मुक्काम:' : 'Stay:'}</span>
                              <span className="truncate text-slate-700">{stay}</span>
                            </div>

                            {tips && (
                              <div className="flex items-start gap-2 text-xs bg-amber-50/90 px-3.5 py-2.5 rounded-xl text-amber-950 font-medium border border-amber-200 shadow-2xs">
                                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                  <strong className="text-amber-950 font-black mr-1">{lang === 'mr' ? 'मार्गदर्शक टीप:' : 'Local Pro Tip:'}</strong>
                                  <span className="text-slate-700 font-semibold">{tips}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* HIDDEN PRINT CONTAINER FOR PDF GENERATION */}
              <div className="hidden">
                <div id="routripo-future-trip-plan-container" className="w-[800px] bg-white text-slate-900 p-6 font-sans space-y-5">
                  <PDFLayoutWrapper 
                    tripName={previewPlan.trip_title || destination} 
                    tripDates={`${days} ${lang === 'mr' ? 'दिवस' : 'Days'} • ${departureDate || 'Upcoming'}`}
                    documentType={lang === 'mr' ? 'अधिकृत सहल आराखडा' : 'Trip Itinerary'}
                  >
                    <div className="space-y-4 pt-2">
                      {/* STATS STRIP */}
                      <div className="grid grid-cols-3 gap-3 bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 text-xs font-bold text-slate-800">
                        <div>
                          <span className="text-[10px] uppercase text-rose-900 block font-black">प्रारंभ / गंतव्य</span>
                          <span>{departure || 'Mumbai'} ➔ {destination}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-rose-900 block font-black">अंदाजे अंतर / खर्च</span>
                          <span>{previewPlan.totalDistanceKm || 0} km • ₹{Number(previewPlan.totalEstimatedCost || budget).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-rose-900 block font-black">प्रवासी / साधन</span>
                          <span>{persons} प्रवासी • {previewPlan.transportMode || transport || 'Car'}</span>
                        </div>
                      </div>

                      {/* DAYS */}
                      {Array.isArray(previewPlan.itinerary) && previewPlan.itinerary.map((dayItem: any, idx: number) => {
                        const dayNum = dayItem.day || idx + 1;
                        const daySpots = getSpotsForDay(dayNum, `${dayItem.day_title || ''} ${dayItem.morning_9am_to_12pm || ''}`, destination, previewPlan.trip_title || destination, lang === 'mr');
                        return (
                          <div key={idx} className="day-card border-2 border-rose-200 rounded-xl overflow-hidden page-break-avoid break-inside-avoid space-y-0">
                            <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 px-4 py-2.5 text-white font-black text-sm flex items-center justify-between">
                              <span>दिवस {dayNum}: {dayItem.day_title || destination}</span>
                              <span className="text-xs bg-amber-300 text-slate-950 px-2 py-0.5 rounded-md font-extrabold">Day {dayNum}</span>
                            </div>

                            {/* PHOTOS IN PDF */}
                            {daySpots.length > 0 && (
                              <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
                                {daySpots.slice(0, 2).map((sp, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                    <img 
                                      src={sp.url} 
                                      alt={sp.title} 
                                      crossOrigin="anonymous" 
                                      className="w-12 h-12 rounded object-cover shrink-0" 
                                    />
                                    <div className="overflow-hidden">
                                      <span className="text-xs font-black text-slate-900 block truncate">{sp.title}</span>
                                      {(sp.subtitle || sp.location) && (
                                        <span className="text-[10px] text-amber-700 font-bold">{sp.subtitle || sp.location}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="p-3.5 space-y-2 text-xs text-slate-800">
                              {dayItem.travel_route_info && (
                                <p className="bg-sky-50 p-2 rounded border border-sky-200 font-medium">
                                  <strong>🚗 प्रवास मार्ग:</strong> {dayItem.travel_route_info}
                                </p>
                              )}
                              {dayItem.heritage_highlights && (
                                <p className="bg-purple-50 p-2 rounded border border-purple-200 font-medium">
                                  <strong>🏛️ वारसा व इतिहास:</strong> {dayItem.heritage_highlights}
                                </p>
                              )}
                              {(dayItem.morning_9am_to_12pm || dayItem.morning) && (
                                <p><strong>🌅 सकाळ (9 AM - 12 PM):</strong> {dayItem.morning_9am_to_12pm || dayItem.morning}</p>
                              )}
                              {(dayItem.afternoon_12pm_to_4pm || dayItem.afternoon) && (
                                <p><strong>☀️ दुपार (12 PM - 4 PM):</strong> {dayItem.afternoon_12pm_to_4pm || dayItem.afternoon}</p>
                              )}
                              {(dayItem.evening_4pm_to_9pm || dayItem.evening) && (
                                <p><strong>🌆 संध्याकाळ (4 PM - 9 PM):</strong> {dayItem.evening_4pm_to_9pm || dayItem.evening}</p>
                              )}
                              {dayItem.local_food_specialty && (
                                <p className="bg-orange-50 p-2 rounded border border-orange-200 font-medium">
                                  <strong>🍲 खाद्यसंस्कृती:</strong> {dayItem.local_food_specialty}
                                </p>
                              )}
                              {dayItem.stay && (
                                <p className="bg-slate-50 p-2 rounded border border-slate-200 font-medium">
                                  <strong>🏨 मुक्काम / हॉटेल:</strong> {dayItem.stay}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </PDFLayoutWrapper>
                </div>
              </div>

              {/* STICKY ACTIONS FOOTER */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {lang === 'mr' ? 'बदल करा' : 'Edit Inputs'}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmMakeTrip}
                    className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:from-rose-700 hover:to-red-900 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{lang === 'mr' ? 'ही सहल तयार करा 🚀' : 'Make This Trip 🚀'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* PDF Download Button */}
                  <button
                    type="button"
                    disabled={isExportingPdf}
                    onClick={handleExportPDF}
                    className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isExportingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'mr' ? 'PDF तयार होत आहे...' : 'Generating PDF...'}</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>{lang === 'mr' ? 'PDF डाऊनलोड करा 📄' : 'Download Trip PDF 📄'}</span>
                      </>
                    )}
                  </button>

                  {/* WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={() => {
                      let shareText = `*${previewPlan.trip_title || "Trip Plan"}*\n\n`;
                      if (previewPlan.totalDistanceKm) shareText += `Distance: ${previewPlan.totalDistanceKm} km\n`;
                      if (previewPlan.totalEstimatedCost) shareText += `Total Estimated Cost: ₹${previewPlan.totalEstimatedCost.toLocaleString('en-IN')}\n\n`;
                      
                      if (Array.isArray(previewPlan.itinerary)) {
                          shareText += `*Itinerary:*\n`;
                          previewPlan.itinerary.forEach((d: any) => {
                              shareText += `\n*${d.day_title || ''}*\n`;
                              if (d.morning) shareText += `☀️ Morning: ${d.morning}\n`;
                              if (d.afternoon) shareText += `🌤️ Afternoon: ${d.afternoon}\n`;
                              if (d.evening) shareText += `🌙 Evening: ${d.evening}\n`;
                          });
                      }

                      shareText += `\nCheck out my trip plan on Routripo!`;
                      shareAppOnWhatsApp(lang, shareText);
                    }}
                    className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{lang === 'mr' ? 'WhatsApp वर शेअर करा 💬' : 'Share on WhatsApp 💬'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* STEP 1: FORM INPUTS - THEME ALIGNED */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
            
            {/* Quick Presets for Popular Destinations */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Tag className="w-3 h-3 text-rose-600" />
                {lang === 'mr' ? 'लोकप्रिय ठिकाणे (1-क्लिक निवडा)' : 'Popular Destinations (Quick Select)'}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {POPULAR_DESTINATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setDestination(preset.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      destination === preset.name 
                        ? 'bg-rose-600 text-white font-black shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Starting & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  {lang === 'mr' ? 'प्रारंभ ठिकाण (Departure)' : 'Departure Location'}
                </label>
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. मुंबई / पुणे' : 'e.g. Mumbai'}
                  className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-rose-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-rose-600" />
                  {lang === 'mr' ? 'गंतव्यस्थान *' : 'Destination *'}
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. मनाली / गोवा' : 'e.g. Goa'}
                  className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-rose-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Transport Mode - Large Interactive Cards with Vibrant Icons */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-rose-600" />
                {lang === 'mr' ? 'प्रवास साधन (Transport Mode)' : 'Transport Mode'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {TRANSPORT_OPTIONS.map((opt) => {
                  const isSelected = transport === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTransport(opt.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 text-xs font-black flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? `bg-gradient-to-br ${opt.activeBg} border-rose-600 text-white shadow-lg shadow-rose-600/30 scale-[1.03] ring-2 ring-rose-400/50` 
                          : 'bg-white border-slate-200 text-slate-800 hover:border-rose-400 hover:bg-rose-50/30 shadow-xs'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-transform border ${
                        isSelected 
                          ? 'bg-white/25 text-white backdrop-blur-md scale-110 border-white/40 shadow-inner' 
                          : `${opt.iconBg}`
                      }`}>
                        <span>{opt.emoji}</span>
                      </div>
                      <span className={`font-black text-xs tracking-tight text-center ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {lang === 'mr' ? opt.labelMr : opt.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  {lang === 'mr' ? 'प्रवास तारीख' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-rose-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === 'mr' ? 'दिवस संख्या' : 'Duration (Days)'}</span>
                  <div className="flex gap-1">
                    {['2', '3', '5', '7'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                          days === d ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-rose-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Budget & Travelers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-rose-600" />
                    {lang === 'mr' ? 'एकूण बजेट (₹)' : 'Budget (₹)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSmartBudget(true)}
                    className="text-[10px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>{lang === 'mr' ? 'स्मार्ट बजेट' : 'Calculator'}</span>
                  </button>
                </div>
                <input
                  type="number"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-rose-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-rose-600" />
                  {lang === 'mr' ? 'प्रवासी संख्या' : 'No. of Travelers'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={persons}
                  onChange={(e) => setPersons(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-rose-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Trip Type Selector - Visual Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                {lang === 'mr' ? 'प्रवासाचा प्रकार (Trip Type)' : 'Trip Type'}
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
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lang === 'mr' ? tt.labelMr : tt.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loadingStep !== null}
                className="w-full bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:from-rose-700 hover:to-red-900 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-rose-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider disabled:opacity-60 cursor-pointer"
              >
                {loadingStep ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-xs font-black">{loadingStep}</span>
                  </>
                ) : (
                  <span>{lang === 'mr' ? 'स्मार्ट प्लॅन तयार करा' : 'Generate AI Smart Plan'}</span>
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

