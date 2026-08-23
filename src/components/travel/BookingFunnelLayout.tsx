import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  CalendarDays, 
  MapPin, 
  Users, 
  X, 
  Check, 
  Clock, 
  ArrowLeftRight, 
  Plus, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { LogoName } from '../routripo/SharedUI';
import { SearchInput } from '../SearchInput';
import { useCurrencyStore, CURRENCIES } from '../../store/useCurrencyStore';
import { getMonthCalendarDays, DailyPriceInfo } from '../../utils/fareCalendarUtils';

export interface MultiCityLeg {
  id: string;
  origin: string;
  destination: string;
  date: string;
}

interface BookingFunnelLayoutProps {
  mode: 'flight' | 'hotel' | 'train' | 'bus' | 'car';
  onBack: () => void;
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  returnDate?: string;
  setReturnDate?: (val: string) => void;
  multiCitySlices?: MultiCityLeg[];
  setMultiCitySlices?: (slices: MultiCityLeg[]) => void;
  onSearch: (e?: any) => void;
  isLoading: boolean;
  hasSearched: boolean;
  renderResults: () => React.ReactNode;
  renderResultsToolbar?: () => React.ReactNode;
  renderPassengerSelector?: () => React.ReactNode;
  passengerSummary?: string;
  lang?: string;
  cabType?: 'regular' | 'rental';
  setCabType?: (val: 'regular' | 'rental') => void;
  tripType?: 'oneway' | 'roundtrip' | 'multicity';
  setTripType?: (val: 'oneway' | 'roundtrip' | 'multicity') => void;
}

export function BookingFunnelLayout({
  mode, onBack, origin, setOrigin, destination, setDestination,
  date, setDate, returnDate = '', setReturnDate, multiCitySlices = [], setMultiCitySlices,
  onSearch, isLoading, hasSearched, renderResults,
  renderResultsToolbar, renderPassengerSelector, passengerSummary, lang = 'en',
  cabType, setCabType, tripType = 'oneway', setTripType
}: BookingFunnelLayoutProps) {
  const [step, setStep] = useState<'main' | 'origin' | 'destination' | 'date' | 'returnDate' | 'passenger'>('main');
  const [activeSliceIdx, setActiveSliceIdx] = useState<number>(0);
  const isMr = lang === 'mr';

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialize timer
  React.useEffect(() => {
    // Force strictly to 15 minutes for all flows as requested
    setTimeLeft(900);
  }, []);

  // Timer countdown
  React.useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // 15 minute strictly enforce - Redirect to Home on 00:00 (via onBack which resets flow)
      onBack();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => (t !== null && t > 0) ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onBack]);

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dynamicTitle = mode === 'hotel' ? 'Book your Hotel' : 
                       mode === 'flight' ? 'Book your Flight' : 
                       mode === 'train' ? 'Book your Train' : 
                       mode === 'bus' ? 'Book your Bus' : 'Book your Cab';

  const addMultiCityLeg = () => {
    if (!setMultiCitySlices) return;
    if (multiCitySlices.length >= 6) {
      alert(isMr ? "कमाल ६ शहरे जोडता येतील." : "Maximum 6 flight legs allowed.");
      return;
    }
    const lastLeg = multiCitySlices[multiCitySlices.length - 1];
    const prevDate = lastLeg?.date ? new Date(lastLeg.date) : new Date();
    prevDate.setDate(prevDate.getDate() + 2);
    const nextDateStr = prevDate.toISOString().split('T')[0];

    const newLeg: MultiCityLeg = {
      id: String(Date.now()),
      origin: lastLeg?.destination || '',
      destination: '',
      date: nextDateStr
    };
    setMultiCitySlices([...multiCitySlices, newLeg]);
  };

  const removeMultiCityLeg = (idx: number) => {
    if (!setMultiCitySlices) return;
    if (multiCitySlices.length <= 2) {
      alert(isMr ? "किमान २ शहरे आवश्यक आहेत." : "Minimum 2 legs required.");
      return;
    }
    const updated = multiCitySlices.filter((_, i) => i !== idx);
    setMultiCitySlices(updated);
  };

  const updateMultiCityLeg = (idx: number, field: keyof MultiCityLeg, val: string) => {
    if (!setMultiCitySlices) return;
    const updated = [...multiCitySlices];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], [field]: val };
      setMultiCitySlices(updated);
    }
  };

  const getCurrentDateValue = () => {
    if (step === 'returnDate') return returnDate;
    if (tripType === 'multicity' && multiCitySlices[activeSliceIdx]) {
      return multiCitySlices[activeSliceIdx].date;
    }
    return date;
  };

  const handleDateSelect = (newDateStr: string) => {
    if (step === 'returnDate') {
      if (setReturnDate) setReturnDate(newDateStr);
      setStep('main');
    } else if (tripType === 'multicity') {
      updateMultiCityLeg(activeSliceIdx, 'date', newDateStr);
      setStep('main');
    } else {
      setDate(newDateStr);
      if (tripType === 'roundtrip' && !returnDate) {
        setStep('returnDate');
      } else {
        setStep('main');
      }
    }
  };

  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calDays = useMemo(() => {
    return getMonthCalendarDays(calYear, calMonth, origin || 'BOM', destination || 'DEL');
  }, [calYear, calMonth, origin, destination]);

  const handlePrevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const handleNextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  const getCalendar = () => {
    const currentDate = getCurrentDateValue();
    const minDate = step === 'returnDate' ? date : new Date().toISOString().split('T')[0];

    return (
      <div className="py-2 space-y-4 font-[Inter]">
        {/* Month Selector Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">
              {monthNames[calMonth]} {calYear}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevCalMonth}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextCalMonth}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {isMr ? 'कमी दर (Best)' : 'Lowest'}
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              {isMr ? 'मध्यम दर' : 'Regular'}
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-500">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              {isMr ? 'जास्त दर' : 'Peak'}
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
            <span key={d} className={`py-1 ${i === 0 || i === 6 ? 'text-rose-500' : 'text-slate-400'}`}>
              {d}
            </span>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {calDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;

            const isSelected = day.dateStr === currentDate;
            const isPast = day.isPast || (minDate && day.dateStr < minDate);

            return (
              <button
                key={day.dateStr}
                disabled={isPast}
                type="button"
                onClick={() => {
                  handleDateSelect(day.dateStr);
                }}
                className={`h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center p-1 transition-all relative cursor-pointer ${
                  isPast
                    ? 'opacity-25 cursor-not-allowed bg-slate-50/50'
                    : isSelected
                    ? 'bg-[#e11d48] text-white shadow-md ring-2 ring-[#e11d48]/40 scale-102 font-black'
                    : 'hover:bg-pink-50/60 bg-white border border-slate-100 hover:border-pink-200'
                }`}
              >
                <span className={`text-sm sm:text-base font-extrabold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {day.dayNum}
                </span>

                {!isPast && mode === 'flight' && (
                  <span className={`text-[10px] sm:text-[11px] tracking-tight leading-tight ${
                    isSelected ? 'text-white/90 font-black' : day.isCheapest ? 'text-emerald-700 font-bold' : day.isExpensive ? 'text-rose-600 font-semibold' : 'text-slate-500'
                  }`}>
                    {day.displayPrice}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom manual fallback date input and confirm */}
        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isMr ? 'निवडलेली तारीख' : 'Selected Date'}
            </span>
            <span className="text-sm font-black text-slate-900">
              {currentDate ? new Date(currentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (step === 'date' && tripType === 'roundtrip' && !returnDate) {
                setStep('returnDate');
              } else {
                setStep('main');
              }
            }}
            className="px-6 py-3 bg-[#e11d48] hover:bg-[#be123c] active:scale-95 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isMr ? 'निश्चित करा' : 'Done'}</span>
          </button>
        </div>
      </div>
    );
  };

  const header = (
    <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-xs z-50 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={() => {
          if (step !== 'main') setStep('main');
          else onBack();
        }} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer -ml-2 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-black text-[10px] text-amber-500 uppercase tracking-widest block">{dynamicTitle}</span>
          <LogoName />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {timeLeft !== null && (
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1 rounded-full shadow-sm">
            <Clock className="w-3 h-3" />
            <span className="text-[11px] font-black tracking-widest">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
    </div>
  );

  const activeStepIndex = hasSearched ? 1 : 0;
  const funnelSteps = ['Search', 'Select', 'Review'];

  const progressStrip = (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 shrink-0">
      {funnelSteps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              idx < activeStepIndex ? 'bg-emerald-500 text-white'
                : idx === activeStepIndex ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {idx < activeStepIndex ? <Check className="w-3 h-3" /> : idx + 1}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              idx === activeStepIndex ? 'text-slate-900' : 'text-slate-400'
            }`}>
              {label}
            </span>
          </div>
          {idx < funnelSteps.length - 1 && (
            <div className={`h-0.5 flex-1 rounded-full ${idx < activeStepIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (step === 'origin') {
    const curVal = tripType === 'multicity' && multiCitySlices[activeSliceIdx] 
      ? multiCitySlices[activeSliceIdx].origin 
      : origin;

    return (
      <div key="origin-view" className="fixed inset-0 z-50 bg-white flex flex-col">
        {header}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            {isMr ? `कुठून (Origin) ${tripType === 'multicity' ? `- शहर ${activeSliceIdx + 1}` : ''}` : `Select Origin ${tripType === 'multicity' ? `- Flight ${activeSliceIdx + 1}` : ''}`}
          </h2>
          <SearchInput
            label="Origin" autoFocus={true}
            placeholder={mode === 'hotel' ? "Search City, Area, or Property Name" : mode === 'bus' ? "Search City or Bus Stand" : mode === 'car' ? "Search Pick-up Location / Drop Location" : mode === 'train' ? "Search City or Railway Station" : "Search City or Airport"}
            value={curVal}
            onChange={(code) => {
              if (tripType === 'multicity') {
                updateMultiCityLeg(activeSliceIdx, 'origin', code);
                setTimeout(() => setStep('destination'), 10);
              } else {
                setOrigin(code);
                setTimeout(() => setStep('destination'), 10);
              }
            }}
            mode={mode === 'train' ? 'trains' : mode === 'bus' ? 'buses' : mode === 'car' ? 'cars' : mode === 'hotel' ? 'hotels' : 'flights'}
          />
        </div>
      </div>
    );
  }

  if (step === 'destination') {
    const curVal = tripType === 'multicity' && multiCitySlices[activeSliceIdx] 
      ? multiCitySlices[activeSliceIdx].destination 
      : destination;

    return (
      <div key="destination-view" className="fixed inset-0 z-50 bg-white flex flex-col">
        {header}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            {isMr ? `कुठे (Destination) ${tripType === 'multicity' ? `- शहर ${activeSliceIdx + 1}` : ''}` : `Select Destination ${tripType === 'multicity' ? `- Flight ${activeSliceIdx + 1}` : ''}`}
          </h2>
          <SearchInput
            label="Destination" autoFocus={true}
            placeholder={mode === 'hotel' ? "Search City, Area, or Property Name" : mode === 'bus' ? "Search City or Bus Stand" : mode === 'car' ? "Search Pick-up Location / Drop Location" : mode === 'train' ? "Search City or Railway Station" : "Search City or Airport"}
            value={curVal}
            onChange={(code) => {
              if (tripType === 'multicity') {
                updateMultiCityLeg(activeSliceIdx, 'destination', code);
                setTimeout(() => setStep('date'), 10);
              } else {
                setDestination(code);
                setTimeout(() => setStep('date'), 10);
              }
            }}
            mode={mode === 'train' ? 'trains' : mode === 'bus' ? 'buses' : mode === 'car' ? 'cars' : mode === 'hotel' ? 'hotels' : 'flights'}
          />
        </div>
      </div>
    );
  }

  if (step === 'date' || step === 'returnDate') {
    return (
      <div key="date-view" className="fixed inset-0 z-50 bg-white flex flex-col">
        {header}
        {mode !== 'hotel' && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 shrink-0">
            <h2 className="text-xl font-black text-slate-900">
              {step === 'returnDate' 
                ? (isMr ? 'परतीची तारीख (Return Date)' : 'Select Return Date')
                : (isMr ? 'प्रवासाची तारीख (Departure Date)' : 'Select Departure Date')}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-bold truncate">
              {origin && destination ? `${origin} → ${destination} • ` : ''}
              {mode === 'train' ? 'Availability Calendar'
                : (mode === 'car' && cabType === 'rental') ? 'Standard Calendar'
                : 'Fare Calendar'}
            </p>
          </div>
        )}
        <div className="px-6 flex-1 overflow-y-auto">
          {mode !== 'hotel' ? getCalendar() : (
            <p className="text-sm font-bold text-slate-600 pt-6">Hotel stay dates are managed at the property level.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      {header}
      {progressStrip}
      <div className="flex-1 overflow-y-auto pb-28">
        
        {/* Core Booking Form (Top-Heavy) */}
        {!hasSearched ? (
          <div className="bg-white p-5 sm:p-7 shadow-sm border-b border-slate-200">
            {mode === 'car' && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setCabType?.('regular')}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${cabType === 'regular' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                >
                  Point-to-Point
                </button>
                <button
                  type="button"
                  onClick={() => setCabType?.('rental')}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${cabType === 'rental' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                >
                  Rental
                </button>
              </div>
            )}
            {mode === 'flight' && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button 
                  type="button" 
                  onClick={() => setTripType?.('oneway')} 
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${tripType === 'oneway' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {isMr ? 'एकतर्फी' : 'One Way'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setTripType?.('roundtrip')} 
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${tripType === 'roundtrip' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {isMr ? 'राउंड ट्रिप' : 'Round Trip'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setTripType?.('multicity')} 
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${tripType === 'multicity' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {isMr ? 'मल्टी-सिटी' : 'Multi City'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* ================= ONE-WAY & ROUND-TRIP VIEW ================= */}
              {tripType !== 'multicity' && (
                <>
                  {mode !== 'hotel' && (
                    <div className="relative">
                      <button onClick={() => setStep('origin')} className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors shadow-sm cursor-pointer">
                        <MapPin className="w-6 h-6 text-indigo-500" />
                        <div>
                          <span className="block text-[10px] font-black text-slate-400 uppercase">{isMr ? 'कुठून (Origin)' : 'Origin'}</span>
                          <span className="block text-sm font-black text-slate-900">{origin || (isMr ? 'शहर निवडा' : 'Select Origin')}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          const prevOrigin = origin;
                          setOrigin(destination);
                          setDestination(prevOrigin);
                        }}
                        aria-label="Swap origin and destination"
                        className="absolute right-4 -bottom-5 z-10 p-2 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:border-indigo-400 transition-colors active:scale-95 cursor-pointer"
                      >
                        <ArrowLeftRight className="w-4 h-4 rotate-90" />
                      </button>
                    </div>
                  )}

                  <button onClick={() => setStep('destination')} className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors shadow-sm cursor-pointer">
                    <MapPin className="w-6 h-6 text-rose-500" />
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase">{mode === 'hotel' ? 'Location / City' : (isMr ? 'कुठे (Destination)' : 'Destination')}</span>
                      <span className="block text-sm font-black text-slate-900">{destination || (isMr ? 'गंतव्य स्थान निवडा' : 'Select Destination')}</span>
                    </div>
                  </button>

                  {/* Dates: 1 Date for Oneway, 2 Dates for Roundtrip */}
                  {!(mode === 'car' && cabType === 'regular') && mode !== 'hotel' && (
                    tripType === 'roundtrip' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setStep('date')} className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-indigo-400 transition-colors shadow-sm cursor-pointer">
                          <CalendarDays className="w-5 h-5 text-amber-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[10px] font-black text-slate-400 uppercase">{isMr ? 'जाण्याची तारीख' : 'Departure'}</span>
                            <span className="block text-xs sm:text-sm font-black text-slate-900 truncate">{formatDisplayDate(date) || 'Select'}</span>
                          </div>
                        </button>
                        <button onClick={() => setStep('returnDate')} className="w-full text-left bg-white border border-indigo-200 bg-indigo-50/20 rounded-xl p-4 flex items-center gap-3 hover:border-indigo-500 transition-colors shadow-sm cursor-pointer">
                          <CalendarDays className="w-5 h-5 text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[10px] font-black text-indigo-600 uppercase">{isMr ? 'परतीची तारीख' : 'Return'}</span>
                            <span className="block text-xs sm:text-sm font-black text-slate-900 truncate">{formatDisplayDate(returnDate) || (isMr ? '+ तारीख जोडा' : '+ Add Return')}</span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setStep('date')} className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors shadow-sm cursor-pointer">
                        <CalendarDays className="w-6 h-6 text-amber-500" />
                        <div>
                          <span className="block text-[10px] font-black text-slate-400 uppercase">{isMr ? 'तारीख' : 'Date'}</span>
                          <span className="block text-sm font-black text-slate-900">{formatDisplayDate(date) || 'Select Date'}</span>
                        </div>
                      </button>
                    )
                  )}
                </>
              )}

              {/* ================= MULTI-CITY LEGS VIEW ================= */}
              {tripType === 'multicity' && (
                <div className="space-y-4">
                  {multiCitySlices.map((slice, idx) => (
                    <div key={slice.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          ✈️ {isMr ? `फ्लाईट ${idx + 1}` : `Flight ${idx + 1}`}
                        </span>
                        {multiCitySlices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeMultiCityLeg(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isMr ? 'हे शहर काढून टाका' : 'Remove leg'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSliceIdx(idx);
                            setStep('origin');
                          }}
                          className="text-left bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-400 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] font-black text-slate-400 uppercase">{isMr ? 'कुठून (Origin)' : 'Origin'}</span>
                            <span className="block text-xs font-black text-slate-900 truncate">{slice.origin || (isMr ? 'शहर निवडा' : 'Select Origin')}</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSliceIdx(idx);
                            setStep('destination');
                          }}
                          className="text-left bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-400 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] font-black text-slate-400 uppercase">{isMr ? 'कुठे (Destination)' : 'Destination'}</span>
                            <span className="block text-xs font-black text-slate-900 truncate">{slice.destination || (isMr ? 'गंतव्य स्थान निवडा' : 'Select Destination')}</span>
                          </div>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveSliceIdx(idx);
                          setStep('date');
                        }}
                        className="w-full text-left bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-400 transition-colors cursor-pointer"
                      >
                        <CalendarDays className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">{isMr ? 'प्रवासाची तारीख' : 'Departure Date'}</span>
                          <span className="block text-xs font-black text-slate-900 truncate">{formatDisplayDate(slice.date) || 'Select Date'}</span>
                        </div>
                      </button>
                    </div>
                  ))}

                  {/* + Add Another City Button */}
                  <button
                    type="button"
                    onClick={addMultiCityLeg}
                    className="w-full py-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isMr ? '+ आणखी एक शहर / तारीख जोडा' : '+ Add Another City / Date'}</span>
                  </button>
                </div>
              )}

              {renderPassengerSelector && (
                <button onClick={() => setStep('passenger')} className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors shadow-sm cursor-pointer">
                  <Users className="w-6 h-6 text-emerald-500" />
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase">{isMr ? 'प्रवासी आणि क्लास' : 'Passengers & Class'}</span>
                    <span className="block text-sm font-black text-slate-900">{passengerSummary || 'Select Details'}</span>
                  </div>
                </button>
              )}

              <button
                onClick={onSearch}
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Search className="w-5 h-5" />
                {isLoading ? (isMr ? 'शोधत आहे...' : 'Searching...') : (isMr ? 'पर्याय शोधा' : 'Search Options')}
              </button>
            </div>
          </div>
        ) : (
          <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
            <div className="p-4 flex items-center gap-3">
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <button
                  onClick={() => setStep(mode === 'hotel' ? 'destination' : 'origin')}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-xs font-black text-slate-800 truncate">
                    {mode !== 'hotel' ? `${origin || 'Any'} → ${destination || 'Any'}` : `${destination || 'Any'}`}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5 truncate">
                    {!(mode === 'car' && cabType === 'regular') ? (formatDisplayDate(date) || 'Any Date') : 'Regular Cab'} • {passengerSummary || '1 Adult'}
                  </p>
                </button>
              </div>
              <button 
                onClick={() => {
                  setStep(mode === 'hotel' ? 'destination' : 'origin');
                }} 
                className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 shrink-0 cursor-pointer"
              >
                {isMr ? 'बदला' : 'Edit'}
              </button>
            </div>
            {renderResultsToolbar && !isLoading && (
              <div className="border-t border-slate-100">
                {renderResultsToolbar()}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {(hasSearched || isLoading) && (
          <div className="p-4">
            {renderResults()}
          </div>
        )}

        {/* Vouchers and suggestions go below */}
        {!hasSearched && (
           <div className="p-5">
             <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-start gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <h4 className="font-black text-purple-900 text-sm">{isMr ? 'खास सवलती' : 'Exclusive Deals'}</h4>
                  <p className="text-xs font-bold text-purple-700 mt-1">{isMr ? 'तुमच्या पहिल्या बुकिंगवर WELCOME15 कोड वापरून १५% पर्यंत सूट मिळवा.' : 'Get up to 15% off on your first booking with code WELCOME15.'}</p>
                </div>
             </div>
           </div>
        )}
      </div>

      <AnimatePresence>
        {step === 'passenger' && renderPassengerSelector && (
          <motion.div
            className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setStep('main')}
          >
            <motion.div
              className="bg-white rounded-t-3xl px-6 pb-6 pt-3 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-lg text-slate-900">{isMr ? 'प्रवासी आणि क्लास निवडा' : 'Select Details'}</h3>
                <button onClick={() => setStep('main')} className="p-2 bg-slate-100 rounded-full cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              {renderPassengerSelector()}
              <button onClick={() => setStep('main')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-wider mt-6 cursor-pointer">
                {isMr ? 'पूर्ण झाले' : 'Done'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
