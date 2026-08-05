import React, { useState } from 'react';
import { generateEarnKaroLink } from "./travel/config";
import { Plane, Calendar, Users, ArrowRightLeft, Search, Clock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, X, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAVELPAYOUTS_MARKER } from './travel/config';
import { HandoffModal } from './travel/HandoffModal';
import { FlightOption } from './travel/api';
import { ALL_AIRPORTS } from '../data/airports';
import { SearchInput, TransportMode } from './SearchInput';
import { fetchDuffelFlights } from '../services/duffelFlightService';
import { getFullStationDetails } from '../services/travelTimeService';

interface LiveFlightSearchCardProps {
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  themeColor?: string;
  defaultDestination?: string;
  onBookFlight?: (flight: FlightOption) => void;
}

const POPULAR_AIRPORTS = ALL_AIRPORTS.map((ap) => ({
  code: ap.code,
  city: ap.city,
  cityMr: ap.cityMr || ap.city,
  name: ap.airport,
  country: ap.country
}));

export const LiveFlightSearchCard: React.FC<LiveFlightSearchCardProps> = ({
  lang,
  t,
  currencySymbol,
  themeColor = '#6366f1',
  defaultDestination = 'DEL',
  onBookFlight
}) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [transportMode, setTransportMode] = useState<TransportMode>('flights');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState(
    defaultDestination && defaultDestination.length === 3 ? defaultDestination.toUpperCase() : ''
  );
  const [departureDate, setDepartureDate] = useState(tomorrowStr);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');

  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [requestParams, setRequestParams] = useState<any>(null);
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [handoffModal, setHandoffModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });


  const filterLocations = (query: string) => {
    if (!query.trim()) return POPULAR_AIRPORTS;
    const q = query.trim().toLowerCase();
    return POPULAR_AIRPORTS.filter(
      (ap) =>
        ap.code.toLowerCase().includes(q) ||
        ap.city.toLowerCase().includes(q) ||
        ap.name.toLowerCase().includes(q)
    );
  };

  const filteredOrigin = filterLocations(origin);
  const filteredDest = filterLocations(destination);

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin || !destination) {
      setErrorMsg(lang === 'mr' ? 'कृपया विमानतळ कोड टाका' : 'Please enter origin and destination');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setHasSearched(true);
    setBookingSuccessMsg(null);

    try {
      const { formatDateToYYYYMMDD } = await import('./travel/api');
      const formattedDate = formatDateToYYYYMMDD(departureDate);
      const origCode = origin.trim().toUpperCase().slice(0, 3);
      const destCode = destination.trim().toUpperCase().slice(0, 3);

      setRequestParams({
        origin: origCode,
        destination: destCode,
        date: formattedDate,
        adults: passengers,
        cabinClass
      });

      const flightList = await fetchDuffelFlights({
        origin: origCode,
        destination: destCode,
        departDate: formattedDate,
        adults: passengers,
        cabinClass
      });

      console.log("Duffel API Response:", flightList);

      setFlights(flightList || []);
      setIsLiveApi(true);
      setShowModal(true);
    } catch (err: any) {
      console.error('Error searching flights via Duffel API:', err);
      setFlights([]);
      setIsLiveApi(true);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBooking = (flight: FlightOption) => {
    setSelectedFlight(flight);
    if (onBookFlight) {
      onBookFlight(flight);
    } else {
      const targetUrl = flight.deepLink && flight.deepLink.startsWith('http') ? flight.deepLink : "https://bitli.in/bzzMIEZ";
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };


  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-lg space-y-6">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {t('searchLiveFlights') || (lang === 'mr' ? 'Duffel लाईव्ह फ्लाईट सर्च' : 'Duffel Live Flight Search')}
            </h3>
            <p className="text-xs font-bold text-slate-500">
              {lang === 'mr' ? 'Duffel API द्वारे विमानाचे थेट सर्वोत्तम दर आणि वेळापत्रक' : 'Powered by Duffel Live Flight API Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Duffel API Verified
          </span>
        </div>
      </div>

      {/* Flight Search Form - MakeMyTrip / OTA Style */}
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Row 1: Unified Transport Search Autocomplete (Flights / Trains) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Origin Autocomplete */}
          <SearchInput
            label={lang === 'mr' ? 'कुठून (From / Origin)' : 'From / Origin'}
            placeholder={transportMode === 'flights' ? 'Search city, airport name, or BOM...' : 'Search station or NDLS...'}
            value={origin}
            onChange={(code) => setOrigin(code)}
            mode={transportMode}
            onModeChange={(m) => setTransportMode(m)}
            showModeToggle={true}
            iconType="from"
          />

          <button
            type="button"
            onClick={handleSwapAirports}
            className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all mx-auto shrink-0 shadow-xs mt-4 md:mt-0"
            title="Swap Locations"
          >
            <ArrowRightLeft className="w-4 h-4 md:rotate-0 rotate-90" />
          </button>

          {/* Destination Autocomplete */}
          <SearchInput
            label={lang === 'mr' ? 'कुठे (To / Destination)' : 'To / Destination'}
            placeholder={transportMode === 'flights' ? 'Search city, airport name, or DEL...' : 'Search station or PUNE...'}
            value={destination}
            onChange={(code) => setDestination(code)}
            mode={transportMode}
            onModeChange={(m) => setTransportMode(m)}
            showModeToggle={true}
            iconType="to"
          />
        </div>

        {/* Row 2: Departure Date & Passengers/Class Side-by-Side */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Departure Date */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-600" />
              {t('departureDate') || (lang === 'mr' ? 'तारीख' : 'Date')}
            </label>
            <input 
              type="date"
              value={departureDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-800 outline-none cursor-pointer"
            />
          </div>

          {/* Passengers & Class */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-600" />
              {t('passengers') || (lang === 'mr' ? 'प्रवासी व क्लास' : 'Passengers')}
            </label>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
                >
                  -
                </button>
                <span className="font-extrabold text-xs text-slate-900">{passengers} Pax</span>
                <button
                  type="button"
                  onClick={() => setPassengers(Math.min(9, passengers + 1))}
                  className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 text-[10px] font-black text-slate-700 outline-none cursor-pointer"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Prem. Eco</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:opacity-95"
          style={{ backgroundColor: themeColor }}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{lang === 'mr' ? 'Duffel विमाने शोधत आहे...' : 'Searching Duffel Offers...'}</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>{t('searchFlightsBtn') || (lang === 'mr' ? 'Duffel विमाने शोधा' : 'Search Flights (Duffel API)')}</span>
            </>
          )}
        </button>
      </form>

      {/* Booking Toast Banner */}
      <AnimatePresence>
        {bookingSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{bookingSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Error / Warning Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
          </div>
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="w-24 h-6 bg-slate-200 rounded-lg" />
                <div className="w-20 h-6 bg-slate-200 rounded-lg" />
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="w-16 h-8 bg-slate-200 rounded" />
                <div className="w-20 h-4 bg-slate-200 rounded" />
                <div className="w-16 h-8 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flight Search Results */}
      {!isLoading && hasSearched && (
        <div className="space-y-4 pt-2">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span>{t('flightResults') || (lang === 'mr' ? 'उपलब्ध विमाने' : 'Available Flights')}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
                {flights.length}
              </span>
            </h4>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              ✈️ Duffel Live Flight API
            </span>
          </div>

          {flights.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-bold text-sm">
              {lang === 'mr' ? 'कोणतीही विमाने सापडली नाहीत.' : 'No flight offers found for this route.'}
            </div>
          ) : (
            <div className="space-y-3">
              {flights.map((flight, index) => {
                const srcDet = getFullStationDetails(flight.originCode || origin || 'BOM');
                const dstDet = getFullStationDetails(flight.destinationCode || destination || 'DEL');
                const srcFullName = flight.originFullName || srcDet.fullName;
                const dstFullName = flight.destinationFullName || dstDet.fullName;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-all ${selectedFlight?.id === flight.id ? 'border-indigo-500 bg-indigo-50/30 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-indigo-700 overflow-hidden">
                          {flight.airlineCode}
                        </div>
                        <div>
                          <h5 className="font-black text-slate-900 text-sm leading-tight">{flight.airline}</h5>
                          <p className="text-[10px] font-bold text-slate-400">{flight.flightNumber} • {flight.cabinClass}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900 block">
                          {currencySymbol}{new Intl.NumberFormat('en-IN').format(flight.price)}
                        </div>
                        <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                          पासून सुरू
                        </span>
                        <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
                          {flight.seatsAvailable} seats left
                        </div>
                      </div>

                    </div>

                    {/* Schedule Details with Full Airport Names */}
                    <div className="bg-slate-50/80 rounded-xl p-3 flex items-center justify-between border border-slate-100 mb-3 gap-2">
                      <div className="text-left max-w-[40%]">
                        <p className="text-base font-black text-slate-900 leading-none">{flight.departureTime}</p>
                        <p className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider mt-1">{flight.originCode}</p>
                        <p className="text-[10px] font-bold text-slate-600 leading-tight mt-0.5 line-clamp-2">{srcFullName}</p>
                      </div>

                      <div className="flex flex-col items-center px-1 shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {flight.duration}
                        </span>
                        <div className="w-20 h-0.5 bg-slate-300 relative my-1">
                          <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[8px]">
                            ✈
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest">
                          {flight.direct ? (t('directFlight') || 'Non-stop') : 'Connecting'}
                        </span>
                      </div>

                      <div className="text-right max-w-[40%]">
                        <p className="text-base font-black text-slate-900 leading-none">{flight.arrivalTime}</p>
                        <p className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider mt-1">{flight.destinationCode}</p>
                        <p className="text-[10px] font-bold text-slate-600 leading-tight mt-0.5 line-clamp-2 ml-auto">{dstFullName}</p>
                      </div>
                    </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-slate-400">
                      Inclusive of taxes
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectBooking(flight)}
                      className="px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 transition-all active:scale-95 hover:opacity-90"
                      style={{ backgroundColor: themeColor }}
                    >
                      <span>{t('bookNow') || (lang === 'mr' ? 'बुक करा' : 'Book Now')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* FLIGHT RESULTS POPUP MODAL */}
      <AnimatePresence>
        {showModal && (
          <div 
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Duffel Live Flight API
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                      {flights.length} Options
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <span>{origin}</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                    <span>{destination}</span>
                  </h3>
                  <p className="text-xs font-semibold text-slate-300">
                    📅 {departureDate} • 👥 {passengers} Passenger(s) • 💺 {cabinClass.toUpperCase()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 z-10 hover:rotate-90 active:scale-95"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Flight Options */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50 pb-[30px] [&::-webkit-scrollbar]:hidden">
                {flights.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-bold space-y-2">
                    <Plane className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
                    <p>{lang === 'mr' ? 'कोणतीही विमाने सापडली नाहीत.' : 'No flights available for selected dates.'}</p>
                  </div>
                ) : (
                  flights.map((flight, index) => {
                    const mSrcDet = getFullStationDetails(flight.originCode || origin || 'BOM');
                    const mDstDet = getFullStationDetails(flight.destinationCode || destination || 'DEL');
                    const mSrcFullName = flight.originFullName || mSrcDet.fullName;
                    const mDstFullName = flight.destinationFullName || mDstDet.fullName;

                    return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all space-y-3"
                    >
                      {/* Top Row: Airline, Flight Number, Price */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                            {flight.airlineCode}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm leading-tight">{flight.airline}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {flight.flightNumber}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {flight.cabinClass}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block mt-0.5">
                            {flight.seatsAvailable} seats left
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Times, Full Airport Names, Duration, Stops */}
                      <div className="grid grid-cols-3 items-center bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center gap-2">
                        <div className="text-left">
                          <p className="text-base font-black text-slate-900">{flight.departureTime}</p>
                          <p className="text-[10px] font-extrabold text-indigo-700 uppercase">{flight.originCode}</p>
                          <p className="text-[10px] font-bold text-slate-600 leading-tight line-clamp-2 mt-0.5">{mSrcFullName}</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-0.5">{flight.departureDate || departureDate}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-slate-500 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {flight.duration}
                          </span>
                          <div className="w-full h-0.5 bg-slate-300 relative my-1">
                            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[8px]">
                              ✈
                            </div>
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[9px] font-black uppercase tracking-wider">
                            {flight.direct ? 'Direct / Non-stop' : `${flight.stops || 1} Stop`}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-black text-slate-900">{flight.arrivalTime}</p>
                          <p className="text-[10px] font-extrabold text-indigo-700 uppercase">{flight.destinationCode}</p>
                          <p className="text-[10px] font-bold text-slate-600 leading-tight line-clamp-2 mt-0.5 ml-auto">{mDstFullName}</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-0.5">{flight.arrivalDate || departureDate}</p>
                        </div>
                      </div>

                      {/* Bottom Row: Redirect Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{lang === 'mr' ? 'सुरक्षित बुकिंग' : 'Secure Checkout'}</span>
                        </span>

                        <a
                          href="https://bitli.in/1HdfW4l"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setSelectedFlight(flight)}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-200 flex items-center gap-2 active:scale-95 transition-all inline-flex cursor-pointer"
                        >
                          <span>{lang === 'mr' ? 'आत्ताच बुक करा' : 'Book Now'}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  {lang === 'mr' ? 'बंद करा' : 'Close Modal'}
                </button>
                <p className="text-[11px] font-bold text-slate-400">
                  Powered by Duffel Live Flight API Engine
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Affiliate Handoff Modal */}
      <HandoffModal
        isOpen={handoffModal.isOpen}
        onClose={() => setHandoffModal((prev) => ({ ...prev, isOpen: false }))}
        partnerUrl={handoffModal.url}
        itemTitle={handoffModal.title}
        lang={lang}
      />
    </div>
  );
};

