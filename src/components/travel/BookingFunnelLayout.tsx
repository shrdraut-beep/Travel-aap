import React, { useState } from 'react';
import { ArrowLeft, Search, CalendarDays, MapPin, Users, X, Check, Clock } from 'lucide-react';
import { LogoName } from '../routripo/SharedUI';
import { SearchInput } from '../SearchInput';
import { useCurrencyStore, CURRENCIES } from '../../store/useCurrencyStore';

interface BookingFunnelLayoutProps {
  mode: 'flight' | 'hotel' | 'train' | 'bus' | 'car';
  onBack: () => void;
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  onSearch: (e?: any) => void;
  isLoading: boolean;
  hasSearched: boolean;
  renderResults: () => React.ReactNode;
  renderPassengerSelector?: () => React.ReactNode;
  passengerSummary?: string;
  lang?: string;
  cabType?: 'regular' | 'rental';
  setCabType?: (val: 'regular' | 'rental') => void;
}

export function BookingFunnelLayout({
  mode, onBack, origin, setOrigin, destination, setDestination,
  date, setDate, onSearch, isLoading, hasSearched, renderResults,
  renderPassengerSelector, passengerSummary, lang = 'en',
  cabType, setCabType
}: BookingFunnelLayoutProps) {
  const [step, setStep] = useState<'main' | 'origin' | 'destination' | 'date' | 'passenger'>('main');
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dynamicTitle = mode === 'hotel' ? 'Book your Hotel' : 
                       mode === 'flight' ? 'Book your Flight' : 
                       mode === 'train' ? 'Book your Train' : 
                       mode === 'bus' ? 'Book your Bus' : 'Book your Cab';

  const currencySymbol = CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹";

  const calendarData = React.useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const dayOfWeek = today.getDay();

    for (let i = 0; i < dayOfWeek; i++) {
      days.push({ isEmpty: true });
    }

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      let priceInfo = null;
      if (mode === 'train') {
        const statuses = ['AVL', 'RAC', 'WL'];
        const colors = ['text-emerald-600', 'text-orange-500', 'text-rose-600'];
        const r = Math.floor(Math.random() * 3);
        priceInfo = { type: 'status', text: statuses[r], colorClass: colors[r] };
      } else if (mode === 'car' && cabType === 'rental') {
        priceInfo = null;
      } else {
        const base = mode === 'flight' ? 4000 : mode === 'hotel' ? 2000 : 500;
        const maxAdd = mode === 'flight' ? 3000 : mode === 'hotel' ? 2000 : 800;
        const price = base + Math.floor(Math.random() * maxAdd);
        let colorClass = 'text-emerald-600';
        if (price > base + (maxAdd * 0.6)) colorClass = 'text-rose-600';
        else if (price > base + (maxAdd * 0.3)) colorClass = 'text-orange-500';
        priceInfo = { type: 'price', price, colorClass };
      }
      
      days.push({
        isEmpty: false,
        dateObj: d,
        dateStr: d.toISOString().split('T')[0],
        priceInfo
      });
    }
    return days;
  }, [mode, cabType]);

  const getCalendar = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekdays.map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((d, idx) => {
            if (d.isEmpty) {
              return <div key={`empty-${idx}`} className="p-2" />;
            }
            return (
              <button
                key={idx}
                onClick={() => {
                  setDate(d.dateStr);
                  setTimeout(() => {
                    setStep('main');
                  }, 10);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer min-h-[60px]"
              >
                <span className="text-sm font-black text-slate-900 leading-none mb-1">{d.dateObj.getDate()}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase leading-none mb-1">{d.dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                <div className="h-3 flex items-center justify-center">
                  {d.priceInfo?.type === 'status' && (
                    <span className={`text-[8px] font-black uppercase ${d.priceInfo.colorClass}`}>{d.priceInfo.text}</span>
                  )}
                  {d.priceInfo?.type === 'price' && (
                    <span className={`text-[9px] font-black tracking-tighter ${d.priceInfo.colorClass}`}>{currencySymbol}{d.priceInfo.price}</span>
                  )}
                </div>
              </button>
            );
          })}
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

  if (step === 'origin') {
    return (
      <div key="origin-view" className="fixed inset-0 z-50 bg-white flex flex-col">
        {header}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-black text-slate-900 mb-6">{isMr ? 'कुठून (Origin)' : 'Select Origin'}</h2>
          <SearchInput
            label="Origin" autoFocus={true}
            placeholder={mode === 'hotel' ? "Search City, Area, or Property Name" : mode === 'bus' ? "Search City or Bus Stand" : mode === 'car' ? "Search Pick-up Location / Drop Location" : mode === 'train' ? "Search City or Railway Station" : "Search City or Airport"}
            value={origin}
            onChange={(code) => {
              setOrigin(code);
              setTimeout(() => {
                setStep('destination');
              }, 10);
            }}
            mode={mode === 'train' ? 'trains' : mode === 'bus' ? 'buses' : mode === 'car' ? 'cars' : mode === 'hotel' ? 'hotels' : 'flights'}
          />
        </div>
      </div>
    );
  }

  if (step === 'destination') {
    return (
      <div key="destination-view" className="fixed inset-0 z-50 bg-white flex flex-col">
        {header}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-black text-slate-900 mb-6">{isMr ? 'कुठे (Destination)' : 'Select Destination'}</h2>
          <SearchInput
            label="Destination" autoFocus={true}
            placeholder={mode === 'hotel' ? "Search City, Area, or Property Name" : mode === 'bus' ? "Search City or Bus Stand" : mode === 'car' ? "Search Pick-up Location / Drop Location" : mode === 'train' ? "Search City or Railway Station" : "Search City or Airport"}
            value={destination}
            onChange={(code) => {
              setDestination(code);
              setTimeout(() => {
                if ((mode === 'car' && cabType === 'regular') || mode === 'hotel') {
                  setStep('main');
                } else {
                  setStep('date');
                }
              }, 10);
            }}
            mode={mode === 'train' ? 'trains' : mode === 'bus' ? 'buses' : mode === 'car' ? 'cars' : mode === 'hotel' ? 'hotels' : 'flights'}
          />
        </div>
      </div>
    );
  }

  if (step === 'date') {
    return (
      <div key="date-view" className="fixed inset-0 z-50 bg-white flex flex-col">
        {header}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-black text-slate-900 mb-2">{isMr ? 'तारीख (Date)' : 'Select Date'}</h2>
          {mode !== 'hotel' && (
            <>
              {mode === 'train' && <p className="text-xs text-slate-500 mb-4 font-bold">Color-Coded Availability Calendar</p>}
              {(mode === 'flight' || mode === 'hotel' || mode === 'bus') && <p className="text-xs text-slate-500 mb-4 font-bold">Fare Calendar</p>}
              {mode === 'car' && cabType === 'rental' && <p className="text-xs text-slate-500 mb-4 font-bold">Standard Calendar</p>}
              {getCalendar()}
            </>
          )}
          {mode === 'hotel' && (
             <p className="text-sm font-bold text-slate-600">Hotel stay dates are managed at the property level.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      {header}
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

            <div className="space-y-4">
              {mode !== 'hotel' && (
                <button onClick={() => setStep('origin')} className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors">
                  <MapPin className="w-6 h-6 text-indigo-500" />
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase">Origin</span>
                    <span className="block text-sm font-black text-slate-900">{origin || 'Select Origin'}</span>
                  </div>
                </button>
              )}

              <button onClick={() => setStep('destination')} className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors">
                <MapPin className="w-6 h-6 text-rose-500" />
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase">{mode === 'hotel' ? 'Location / City' : 'Destination'}</span>
                  <span className="block text-sm font-black text-slate-900">{destination || 'Select Destination'}</span>
                </div>
              </button>

              {!(mode === 'car' && cabType === 'regular') && mode !== 'hotel' && (
                <button onClick={() => setStep('date')} className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors">
                  <CalendarDays className="w-6 h-6 text-amber-500" />
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase">Date</span>
                    <span className="block text-sm font-black text-slate-900">{date || 'Select Date'}</span>
                  </div>
                </button>
              )}

              {renderPassengerSelector && (
                <button onClick={() => setStep('passenger')} className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-400 transition-colors">
                  <Users className="w-6 h-6 text-emerald-500" />
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase">Passengers & Class</span>
                    <span className="block text-sm font-black text-slate-900">{passengerSummary || 'Select Details'}</span>
                  </div>
                </button>
              )}

              <button
                onClick={onSearch}
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Search className="w-5 h-5" />
                {isLoading ? 'Searching...' : 'Search Options'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 shadow-sm border-b border-slate-200 flex items-center justify-between">
             <div className="min-w-0 flex-1 pr-4">
               <p className="text-xs font-black text-slate-800 truncate">
                 {mode !== 'hotel' ? `${origin || 'Any'} → ${destination || 'Any'}` : `${destination || 'Any'}`}
               </p>
               <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                 {!(mode === 'car' && cabType === 'regular') ? (date || 'Any Date') : 'Regular Cab'} • {passengerSummary || '1 Adult'}
               </p>
             </div>
             <button 
               onClick={() => {
                 // To edit search, we can just trigger a state change in the parent, but since we don't have a clear Search button state reset,
                 // we will just open the 'origin' step to restart the funnel.
                 setStep('origin');
               }} 
               className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200"
             >
               Edit
             </button>
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
                  <h4 className="font-black text-purple-900 text-sm">Exclusive Deals</h4>
                  <p className="text-xs font-bold text-purple-700 mt-1">Get up to 15% off on your first booking with code WELCOME15.</p>
                </div>
             </div>
           </div>
        )}
      </div>

      {step === 'passenger' && (
        <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg text-slate-900">Select Details</h3>
              <button onClick={() => setStep('main')} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            {renderPassengerSelector()}
            <button onClick={() => setStep('main')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-wider mt-6">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
