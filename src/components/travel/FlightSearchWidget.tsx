import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  Minus, 
  Search, 
  AlertCircle
} from 'lucide-react';
import { ALL_AIRPORTS } from '../../data/airports';
import { FlightPriceCalendarModal } from '../flights/FlightPriceCalendarModal';

export interface TripSlice {
  origin: string;
  destination: string;
  date: string;
}

export interface FlightSearchWidgetProps {
  lang?: string;
  currencySymbol?: string;
  onSearchOverride?: (params: any) => void;
  onBack?: () => void;
}

const getTomorrowDate = (daysAhead: number = 1) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const CABIN_CLASSES = [
  { id: 'economy', label: 'Economy' },
  { id: 'premium', label: 'Premium Economy' },
  { id: 'business', label: 'Business' },
  { id: 'first', label: 'First Class' },
];

export const FlightSearchWidget: React.FC<FlightSearchWidgetProps> = ({
  lang = 'en',
  currencySymbol = '₹',
  onSearchOverride,
}) => {
  const navigate = useNavigate();

  // Task 1: State Management for Trip Type
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip' | 'multiCity'>('oneWay');

  // Task 1: State for slices (Array of objects: [{ origin, destination, date }])
  const [slices, setSlices] = useState<TripSlice[]>([
    { origin: 'BOM', destination: 'DEL', date: getTomorrowDate(1) }
  ]);

  // Task 1: Separate state for returnDate (only used for Round Trip)
  const [returnDate, setReturnDate] = useState<string>(getTomorrowDate(5));

  // Passengers & Cabin Class
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [cabinClass, setCabinClass] = useState<string>('economy');
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [calendarModal, setCalendarModal] = useState<{
    isOpen: boolean;
    sliceIndex: number;
    isReturn: boolean;
  }>({
    isOpen: false,
    sliceIndex: 0,
    isReturn: false
  });

  // Tab switching handler
  const handleTripTypeChange = (type: 'oneWay' | 'roundTrip' | 'multiCity') => {
    setTripType(type);
    setErrorMsg(null);

    if (type === 'oneWay') {
      setSlices(prev => [{
        origin: prev[0]?.origin || 'BOM',
        destination: prev[0]?.destination || 'DEL',
        date: prev[0]?.date || getTomorrowDate(1),
      }]);
    } else if (type === 'roundTrip') {
      const baseOrigin = slices[0]?.origin || 'BOM';
      const baseDest = slices[0]?.destination || 'DEL';
      const outboundDate = slices[0]?.date || getTomorrowDate(1);
      const retDate = returnDate >= outboundDate ? returnDate : getTomorrowDate(4);

      setReturnDate(retDate);
      setSlices([
        { origin: baseOrigin, destination: baseDest, date: outboundDate },
        { origin: baseDest, destination: baseOrigin, date: retDate }
      ]);
    } else if (type === 'multiCity') {
      if (slices.length < 2) {
        const firstOrig = slices[0]?.origin || 'BOM';
        const firstDest = slices[0]?.destination || 'DEL';
        const firstDate = slices[0]?.date || getTomorrowDate(1);

        setSlices([
          { origin: firstOrig, destination: firstDest, date: firstDate },
          { origin: firstDest, destination: 'BLR', date: getTomorrowDate(4) }
        ]);
      }
    }
  };

  // Update specific slice attribute
  const updateSlice = (index: number, field: keyof TripSlice, value: string) => {
    setSlices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // In Round Trip mode, keep the return origin & destination synchronized
      if (tripType === 'roundTrip') {
        if (field === 'origin') {
          if (updated[1]) updated[1] = { ...updated[1], destination: value };
        } else if (field === 'destination') {
          if (updated[1]) updated[1] = { ...updated[1], origin: value };
        } else if (field === 'date') {
          if (returnDate < value) {
            const nextRet = new Date(value);
            nextRet.setDate(nextRet.getDate() + 3);
            const nextRetStr = nextRet.toISOString().split('T')[0];
            setReturnDate(nextRetStr);
            if (updated[1]) updated[1] = { ...updated[1], date: nextRetStr };
          }
        }
      }
      return updated;
    });
  };

  // Swap origin and destination for Slice 0
  const swapOriginDestination = (index: number = 0) => {
    setSlices(prev => {
      const updated = [...prev];
      const orig = updated[index]?.origin || 'BOM';
      const dest = updated[index]?.destination || 'DEL';
      updated[index] = { ...updated[index], origin: dest, destination: orig };

      if (tripType === 'roundTrip' && updated[1]) {
        updated[1] = { ...updated[1], origin: orig, destination: dest };
      }
      return updated;
    });
  };

  // Multi-City: Add another flight slice
  const addFlightLeg = () => {
    if (slices.length >= 6) {
      setErrorMsg("Maximum 6 flight legs allowed for multi-city search.");
      return;
    }
    const lastSlice = slices[slices.length - 1];
    const nextDate = new Date(lastSlice?.date || getTomorrowDate(1));
    nextDate.setDate(nextDate.getDate() + 3);

    setSlices(prev => [
      ...prev,
      {
        origin: lastSlice?.destination || 'BLR',
        destination: '',
        date: nextDate.toISOString().split('T')[0]
      }
    ]);
  };

  // Multi-City: Remove a flight slice for index > 0
  const removeFlightLeg = (indexToRemove: number) => {
    if (slices.length <= 1) return;
    setSlices(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Task 3: Correct Duffel Payload Mapping & Submit Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (tripType === 'oneWay') {
      const s0 = slices[0];
      if (!s0?.origin || !s0?.destination) {
        setErrorMsg("Please specify both origin and destination.");
        return;
      }
      if (s0.origin.toUpperCase() === s0.destination.toUpperCase()) {
        setErrorMsg(`Origin and destination cannot be identical (${s0.origin}).`);
        return;
      }
      if (!s0.date) {
        setErrorMsg("Please select a departure date.");
        return;
      }
    } else if (tripType === 'roundTrip') {
      const s0 = slices[0];
      if (!s0?.origin || !s0?.destination) {
        setErrorMsg("Please specify both origin and destination.");
        return;
      }
      if (s0.origin.toUpperCase() === s0.destination.toUpperCase()) {
        setErrorMsg(`Origin and destination cannot be identical (${s0.origin}).`);
        return;
      }
      if (!s0.date) {
        setErrorMsg("Please select a departure date.");
        return;
      }
      if (!returnDate) {
        setErrorMsg("Please select a return date.");
        return;
      }
      if (returnDate < s0.date) {
        setErrorMsg("Return date cannot be earlier than departure date.");
        return;
      }
    } else if (tripType === 'multiCity') {
      for (let i = 0; i < slices.length; i++) {
        const s = slices[i];
        if (!s.origin || !s.destination) {
          setErrorMsg(`Please specify both origin and destination for Flight ${i + 1}.`);
          return;
        }
        if (s.origin.toUpperCase() === s.destination.toUpperCase()) {
          setErrorMsg(`Origin and destination cannot be identical for Flight ${i + 1} (${s.origin}).`);
          return;
        }
        if (!s.date) {
          setErrorMsg(`Please select a departure date for Flight ${i + 1}.`);
          return;
        }
      }
    }

    // Task 3 Duffel Payload Mapping:
    // One Way: Send [slices[0]].
    // Round Trip: Send 2 slices: [{ origin: slices[0].origin, destination: slices[0].destination, departure_date: slices[0].date }, { origin: slices[0].destination, destination: slices[0].origin, departure_date: returnDate }].
    // Multi-City: Send the entire mapped slices array.
    let duffelSlicesPayload: Array<{ origin: string; destination: string; departure_date: string }> = [];

    if (tripType === 'oneWay') {
      duffelSlicesPayload = [
        {
          origin: slices[0].origin.trim().toUpperCase(),
          destination: slices[0].destination.trim().toUpperCase(),
          departure_date: slices[0].date
        }
      ];
    } else if (tripType === 'roundTrip') {
      duffelSlicesPayload = [
        {
          origin: slices[0].origin.trim().toUpperCase(),
          destination: slices[0].destination.trim().toUpperCase(),
          departure_date: slices[0].date
        },
        {
          origin: slices[0].destination.trim().toUpperCase(),
          destination: slices[0].origin.trim().toUpperCase(),
          departure_date: returnDate
        }
      ];
    } else if (tripType === 'multiCity') {
      duffelSlicesPayload = slices.map(s => ({
        origin: s.origin.trim().toUpperCase(),
        destination: s.destination.trim().toUpperCase(),
        departure_date: s.date
      }));
    }

    const searchParams = {
      tripType,
      slices: duffelSlicesPayload,
      origin: duffelSlicesPayload[0]?.origin || 'BOM',
      destination: duffelSlicesPayload[0]?.destination || 'DEL',
      departDate: duffelSlicesPayload[0]?.departure_date || getTomorrowDate(1),
      returnDate: tripType === 'roundTrip' ? returnDate : undefined,
      adults,
      children,
      infants,
      cabinClass
    };

    if (onSearchOverride) {
      onSearchOverride(searchParams);
      return;
    }

    navigate('/flights/results', {
      state: { searchParams }
    });
  };

  const totalPassengers = adults + children + infants;

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 md:p-8  relative">
      
      {/* Top Header & Trip Type Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        
        {/* 3 Tabs: One Way, Round Trip, Multi-City */}
        <div className="inline-flex bg-slate-100/90 p-1.5 rounded-[20px] gap-1 border border-slate-200/50">
          <button
            type="button"
            onClick={() => handleTripTypeChange('oneWay')}
            className={`px-4 sm:px-5 py-2.5 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              tripType === 'oneWay'
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/60 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            {lang === 'mr' ? 'एकतर्फी' : 'One Way'}
          </button>

          <button
            type="button"
            onClick={() => handleTripTypeChange('roundTrip')}
            className={`px-4 sm:px-5 py-2.5 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              tripType === 'roundTrip'
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/60 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            {lang === 'mr' ? 'राउंड ट्रिप' : 'Round Trip'}
          </button>

          <button
            type="button"
            onClick={() => handleTripTypeChange('multiCity')}
            className={`px-4 sm:px-5 py-2.5 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              tripType === 'multiCity'
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/60 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            {lang === 'mr' ? 'मल्टी-सिटी' : 'Multi-City'}
            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
              +Add Leg
            </span>
          </button>
        </div>

        {/* Global Fare Type & Passengers Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPassengerDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-transparent border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-rose-600" />
            <span>
              {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}, {CABIN_CLASSES.find(c => c.id === cabinClass)?.label}
            </span>
          </button>

          {/* Passenger & Cabin Dropdown Modal */}
          {isPassengerDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[20px] shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-black text-slate-900">Travelers & Cabin</h4>
                  <button
                    type="button"
                    onClick={() => setIsPassengerDropdownOpen(false)}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                {/* Adults Stepper */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Adults</div>
                    <div className="text-[10px] text-slate-400">12+ yrs (Max 9)</div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-[16px] p-1">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => {
                        const next = Math.max(1, adults - 1);
                        setAdults(next);
                        if (infants > next) setInfants(next);
                      }}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black w-4 text-center">{adults}</span>
                    <button
                      type="button"
                      disabled={adults + children >= 9}
                      onClick={() => setAdults(a => Math.min(9, a + 1))}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children Stepper */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Children</div>
                    <div className="text-[10px] text-slate-400">2 - 11 yrs</div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-[16px] p-1">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren(c => Math.max(0, c - 1))}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black w-4 text-center">{children}</span>
                    <button
                      type="button"
                      disabled={adults + children >= 9}
                      onClick={() => setChildren(c => Math.min(8, c + 1))}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Infants Stepper */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Infants</div>
                    <div className="text-[10px] text-slate-400">Under 2 yrs (on lap)</div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-[16px] p-1">
                    <button
                      type="button"
                      disabled={infants <= 0}
                      onClick={() => setInfants(i => Math.max(0, i - 1))}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black w-4 text-center">{infants}</span>
                    <button
                      type="button"
                      disabled={infants >= adults}
                      onClick={() => setInfants(i => Math.min(adults, i + 1))}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cabin Class Selection */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 mb-2">Cabin Class</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CABIN_CLASSES.map(cls => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setCabinClass(cls.id)}
                        className={`py-2 px-2.5 rounded-[16px] text-left text-xs font-bold transition-colors cursor-pointer ${
                          cabinClass === cls.id
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-transparent text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cls.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-[20px] flex items-center gap-2.5 text-xs font-bold text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Task 2: Conditional UI Form Rendering */}
      <form onSubmit={handleSearch} className="mt-6 space-y-4">
        
        {/* ================= ONE WAY UI RENDERING ================= */}
        {tripType === 'oneWay' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative lg:col-span-7">
              
              {/* Origin */}
              <div className="bg-transparent border border-slate-200 rounded-[20px] p-3.5 hover:border-rose-400 focus-within:border-rose-600 transition-all">
                <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">
                  FROM / ORIGIN
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    {slices[0]?.origin || 'BOM'}
                  </span>
                  <select
                    value={slices[0]?.origin || 'BOM'}
                    onChange={(e) => updateSlice(0, 'origin', e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-hidden cursor-pointer"
                  >
                    {ALL_AIRPORTS.map((apt, idx) => (
                      <option key={`ow-orig-${apt.code}-${idx}`} value={apt.code}>
                        {apt.city} ({apt.code}) - {apt.airport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={() => swapOriginDestination(0)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all z-10 hidden sm:flex cursor-pointer"
                title="Swap Origin & Destination"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              {/* Destination */}
              <div className="bg-transparent border border-slate-200 rounded-[20px] p-3.5 hover:border-rose-400 focus-within:border-rose-600 transition-all">
                <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">
                  TO / DESTINATION
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    {slices[0]?.destination || 'DEL'}
                  </span>
                  <select
                    value={slices[0]?.destination || 'DEL'}
                    onChange={(e) => updateSlice(0, 'destination', e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-hidden cursor-pointer"
                  >
                    {ALL_AIRPORTS.map((apt, idx) => (
                      <option key={`ow-dest-${apt.code}-${idx}`} value={apt.code}>
                        {apt.city} ({apt.code}) - {apt.airport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Departure Date (Exactly ONE Date Picker) */}
            <div className="lg:col-span-3">
              <div className="bg-transparent border border-slate-200 rounded-[20px] p-3.5 hover:border-rose-400 focus-within:border-rose-600 transition-all">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">
                    DEPARTURE DATE
                  </label>
                  <button
                    type="button"
                    onClick={() => setCalendarModal({ isOpen: true, sliceIndex: 0, isReturn: false })}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    {lang === 'mr' ? 'कॅलेंडर' : 'Fare Calendar'}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setCalendarModal({ isOpen: true, sliceIndex: 0, isReturn: false })}
                    className="cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
                  </button>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={slices[0]?.date || getTomorrowDate(1)}
                    onChange={(e) => updateSlice(0, 'date', e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm uppercase tracking-wider rounded-[20px] shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

          </div>
        )}

        {/* ================= ROUND TRIP UI RENDERING ================= */}
        {tripType === 'roundTrip' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative lg:col-span-6">
              
              {/* Origin */}
              <div className="bg-transparent border border-slate-200 rounded-[20px] p-3.5 hover:border-rose-400 focus-within:border-rose-600 transition-all">
                <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">
                  FROM / ORIGIN
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    {slices[0]?.origin || 'BOM'}
                  </span>
                  <select
                    value={slices[0]?.origin || 'BOM'}
                    onChange={(e) => updateSlice(0, 'origin', e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-hidden cursor-pointer"
                  >
                    {ALL_AIRPORTS.map((apt, idx) => (
                      <option key={`rt-orig-${apt.code}-${idx}`} value={apt.code}>
                        {apt.city} ({apt.code}) - {apt.airport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={() => swapOriginDestination(0)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all z-10 hidden sm:flex cursor-pointer"
                title="Swap Origin & Destination"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              {/* Destination */}
              <div className="bg-transparent border border-slate-200 rounded-[20px] p-3.5 hover:border-rose-400 focus-within:border-rose-600 transition-all">
                <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">
                  TO / DESTINATION
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    {slices[0]?.destination || 'DEL'}
                  </span>
                  <select
                    value={slices[0]?.destination || 'DEL'}
                    onChange={(e) => updateSlice(0, 'destination', e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-hidden cursor-pointer"
                  >
                    {ALL_AIRPORTS.map((apt, idx) => (
                      <option key={`rt-dest-${apt.code}-${idx}`} value={apt.code}>
                        {apt.city} ({apt.code}) - {apt.airport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Departure Date & Return Date (Two Date Pickers) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:col-span-4">
              
              {/* Departure Date */}
              <div className="bg-transparent border border-slate-200 rounded-[20px] p-3.5 hover:border-rose-400 focus-within:border-rose-600 transition-all">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">
                    DEPARTURE
                  </label>
                  <button
                    type="button"
                    onClick={() => setCalendarModal({ isOpen: true, sliceIndex: 0, isReturn: false })}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    {lang === 'mr' ? 'कॅलेंडर' : 'Fare Calendar'}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setCalendarModal({ isOpen: true, sliceIndex: 0, isReturn: false })}
                    className="cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
                  </button>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={slices[0]?.date || getTomorrowDate(1)}
                    onChange={(e) => updateSlice(0, 'date', e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                </div>
              </div>

              {/* NEW Return Date Picker */}
              <div className="bg-transparent border border-slate-200 rounded-[20px] p-3.5 hover:border-rose-400 focus-within:border-rose-600 transition-all">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">
                    RETURN DATE
                  </label>
                  <button
                    type="button"
                    onClick={() => setCalendarModal({ isOpen: true, sliceIndex: 0, isReturn: true })}
                    className="text-[10px] font-bold text-premium-violet hover:underline cursor-pointer"
                  >
                    {lang === 'mr' ? 'कॅलेंडर' : 'Fare Calendar'}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setCalendarModal({ isOpen: true, sliceIndex: 0, isReturn: true })}
                    className="cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-premium-violet shrink-0" />
                  </button>
                  <input
                    type="date"
                    min={slices[0]?.date || new Date().toISOString().split('T')[0]}
                    value={returnDate}
                    onChange={(e) => {
                      setReturnDate(e.target.value);
                      if (slices[1]) updateSlice(1, 'date', e.target.value);
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm uppercase tracking-wider rounded-[20px] shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

          </div>
        )}

        {/* ================= MULTI-CITY UI RENDERING ================= */}
        {tripType === 'multiCity' && (
          <div className="space-y-3">
            {slices.map((slice, index) => (
              <div
                key={index}
                className="bg-transparent/90 border border-slate-200 rounded-[20px] p-4 transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-rose-600" />
                    Flight {index + 1}
                  </span>
                  
                  {/* Remove icon for rows index > 0 */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeFlightLeg(index)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors p-1 rounded-lg hover:bg-rose-50"
                      title="Remove flight leg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  
                  {/* Origin */}
                  <div className="md:col-span-4 bg-white border border-slate-200 rounded-[16px] p-3">
                    <label className="block text-[9px] font-black tracking-wider uppercase text-slate-400">
                      FROM / ORIGIN
                    </label>
                    <select
                      value={slice.origin}
                      onChange={(e) => updateSlice(index, 'origin', e.target.value)}
                      className="w-full mt-1 bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                    >
                      <option value="" disabled>Select Departure Airport</option>
                      {ALL_AIRPORTS.map((apt, idx) => (
                        <option key={`mc-orig-${apt.code}-${idx}-${index}`} value={apt.code}>
                          {apt.city} ({apt.code}) - {apt.airport}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div className="md:col-span-4 bg-white border border-slate-200 rounded-[16px] p-3">
                    <label className="block text-[9px] font-black tracking-wider uppercase text-slate-400">
                      TO / DESTINATION
                    </label>
                    <select
                      value={slice.destination}
                      onChange={(e) => updateSlice(index, 'destination', e.target.value)}
                      className="w-full mt-1 bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                    >
                      <option value="" disabled>Select Arrival Airport</option>
                      {ALL_AIRPORTS.map((apt, idx) => (
                        <option key={`mc-dest-${apt.code}-${idx}-${index}`} value={apt.code}>
                          {apt.city} ({apt.code}) - {apt.airport}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Picker */}
                  <div className="md:col-span-4 bg-white border border-slate-200 rounded-[16px] p-3">
                    <label className="block text-[9px] font-black tracking-wider uppercase text-slate-400">
                      DEPARTURE DATE
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <input
                        type="date"
                        min={
                          index > 0 && slices[index - 1]?.date 
                            ? slices[index - 1].date 
                            : new Date().toISOString().split('T')[0]
                        }
                        value={slice.date}
                        onChange={(e) => updateSlice(index, 'date', e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                      />
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* + Add Another Flight & Search Multi-City Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={addFlightLeg}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-[16px] text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border border-rose-200 active:scale-95 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'mr' ? '+ आणखी एक शहर / फ्लाईट जोडा' : '+ Add Another Flight'}</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-64 h-12 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider rounded-[16px] shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{lang === 'mr' ? 'मल्टी-सिटी फ्लाईट्स शोधा' : 'Search Multi-City'}</span>
              </button>
            </div>

          </div>
        )}

      </form>

      {/* Full Monthly Flight Price Calendar Modal */}
      <FlightPriceCalendarModal
        isOpen={calendarModal.isOpen}
        onClose={() => setCalendarModal(prev => ({ ...prev, isOpen: false }))}
        selectedDate={calendarModal.isReturn ? returnDate : (slices[calendarModal.sliceIndex]?.date || getTomorrowDate(1))}
        onSelectDate={(newDate) => {
          if (calendarModal.isReturn) {
            setReturnDate(newDate);
            if (slices[1]) updateSlice(1, 'date', newDate);
          } else {
            updateSlice(calendarModal.sliceIndex, 'date', newDate);
          }
          setCalendarModal(prev => ({ ...prev, isOpen: false }));
        }}
        originCode={slices[calendarModal.sliceIndex]?.origin || 'BOM'}
        destCode={slices[calendarModal.sliceIndex]?.destination || 'DEL'}
        isReturnDate={calendarModal.isReturn}
        minDate={calendarModal.isReturn ? slices[0]?.date : new Date().toISOString().split('T')[0]}
        lang={lang}
      />

    </div>
  );
};

export default FlightSearchWidget;
