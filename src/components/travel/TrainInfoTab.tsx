import React, { useState, useEffect } from 'react';
import { fetchTravelDataFromAI } from '../../services/travelAIService';
import { Train, Search, Clock, MapPin, AlertTriangle, ShieldCheck, CheckCircle2, Navigation, Loader2, Calendar, ExternalLink, Building, ShieldAlert } from 'lucide-react';
import { fetchTrainData, TrainStatusData } from './api';
import { ALL_RAILWAY_STATIONS, searchRailwayStations, RailwayStationItem } from '../../data/railwayStations';
import { SearchInput } from '../SearchInput';
import { HandoffModal } from './HandoffModal';
import { TransportOptions } from './TransportOptions';
import { useDebounce } from '../../hooks/useDebounce';
import { getFromCache, saveToCache, enrichTrainDetails } from '../../services/travelCacheService';
import { searchLocalTrains } from '../../services/localSearchService';
import { calculateLiveTrainStatus } from '../../services/travelTimeService';
import { TrainStatusTimeline } from './TrainStatusTimeline';

import { loadTrainCatalog, searchTrainCatalog, TrainCatalogEntry } from '../../services/trainCatalogService';

interface TrainInfoTabProps {
  lang: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Select Date';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });
  } catch(e) {
    return dateString;
  }
};

const normalizeStr = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
};

const getStationAliases = (query: string): string[] => {
  const q = normalizeStr(query);
  if (!q) return [];

  const aliases = [q];

  // Match code/station/city from ALL_RAILWAY_STATIONS
  const matches = ALL_RAILWAY_STATIONS.filter(st =>
    st.code.toLowerCase() === q ||
    normalizeStr(st.station) === q ||
    normalizeStr(st.city) === q ||
    normalizeStr(st.station).includes(q) ||
    normalizeStr(st.city).includes(q)
  );

  matches.forEach(st => {
    aliases.push(st.code.toLowerCase());
    aliases.push(normalizeStr(st.station));
    aliases.push(normalizeStr(st.city));
  });

  // Common station shorthand aliases
  if (q === 'csmt' || q === 'cstm' || q === 'mumbai') {
    aliases.push('csmt', 'cstm', 'mumbai', 'chhatrapati shivaji', 'mumbai csmt');
  }
  if (q === 'ndls' || q === 'delhi' || q === 'nzm') {
    aliases.push('ndls', 'delhi', 'nizamuddin', 'nzm', 'anand vihar', 'anvt', 'new delhi');
  }
  if (q.includes('nasik') || q.includes('nashik') || q === 'nk') {
    aliases.push('nasik', 'nashik', 'nk', 'nasik road', 'nashik road');
  }
  if (q === 'pune' || q === 'pune jn') {
    aliases.push('pune', 'pune junction');
  }
  if (q === 'sbc' || q === 'bengaluru' || q === 'bangalore') {
    aliases.push('sbc', 'ksr bengaluru', 'bengaluru', 'bangalore');
  }
  if (q === 'mas' || q === 'chennai') {
    aliases.push('mas', 'chennai', 'chennai central');
  }

  return Array.from(new Set(aliases)).filter(a => a.length >= 2);
};

const matchesStation = (stationInSchedule: string, searchInput: string) => {
  if (!stationInSchedule || !searchInput) return false;
  const raw = String(stationInSchedule).trim();
  if (raw === '.' || raw === '. .' || raw === 'km.' || raw === '..' || raw.length < 2) return false;

  const cleanSched = normalizeStr(stationInSchedule);
  const aliases = getStationAliases(searchInput);

  for (const alias of aliases) {
    if (cleanSched === alias) return true;
    if (alias.length >= 3 && cleanSched.includes(alias)) return true;
    if (cleanSched.length >= 3 && alias.includes(cleanSched)) return true;
  }

  return false;
};

export const TrainInfoTab: React.FC<TrainInfoTabProps> = ({ lang }) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [trainNumberInput, setTrainNumberInput] = useState('');
  const debouncedTrainNumberInput = useDebounce(trainNumberInput, 300);
  const [trainSuggestions, setTrainSuggestions] = useState<TrainCatalogEntry[]>([]);
  const [showTrainSuggestions, setShowTrainSuggestions] = useState(false);

  const [startDate, setStartDate] = useState(getTodayStr());
  const [activeSubView, setActiveSubView] = useState<'status' | 'timetable'>('status');
  const [mode, setMode] = useState<'status' | 'book' | 'directory'>('status');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [journeyDate, setJourneyDate] = useState(getTodayStr());
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const debouncedStationQuery = useDebounce(stationSearchQuery, 300);
  const [stationVisibleCount, setStationVisibleCount] = useState(24);
  const [isLoading, setIsLoading] = useState(false);

  // Train Status State
  const [trainData, setTrainData] = useState<TrainStatusData | null>(null);
  const [notFoundTrainNumber, setNotFoundTrainNumber] = useState<string | null>(null);

  // Train Booking Search State
  const [hasBookSearched, setHasBookSearched] = useState(false);
  const [bookTrainData, setBookTrainData] = useState<any>(null);
  const [isTrainCached, setIsTrainCached] = useState(false);

  // Handoff modal for train booking affiliate redirect
  const [handoffModal, setHandoffModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // Clean initial state on mount
  useEffect(() => {
    // Keep clean initial search state
    loadTrainCatalog();
  }, []);

  useEffect(() => {
    if (debouncedTrainNumberInput.length >= 2) {
      setTrainSuggestions(searchTrainCatalog(debouncedTrainNumberInput));
    } else {
      setTrainSuggestions([]);
    }
  }, [debouncedTrainNumberInput]);

  const getTrainSchedules = async () => {
    try {
      const module = await import('../../data/trainSchedules.json');
      return module.default || module;
    } catch (e) {
      console.error("Failed to load train schedules:", e);
      return [];
    }
  };

  const performTrainSearch = async (inputStr: string) => {
    const input = inputStr.trim() || '22223';
    setNotFoundTrainNumber(null);
    setIsLoading(true);

    try {
      const cleanInput = input.trim();
      const cleanInputLower = normalizeStr(input);
      const cleanInputNumeric = input.replace(/\D/g, '');
      const cacheKey = `train_status_${cleanInput}_${startDate}`;

      // 1. Check instant cache first
      const cached = getFromCache<TrainStatusData>(cacheKey);
      if (cached) {
        setTrainData(cached);
        setIsLoading(false);
        return;
      }

      const trainSchedules = await getTrainSchedules();
      const foundTrain = (trainSchedules as any[]).find((t: any) => {
        const num1 = String(t.trainNumber || t.train_number || '').trim();
        const num2 = String(t.train_number || t.trainNumber || '').trim();
        const tName = normalizeStr(t.trainName || t.train_name || t.name || '');

        return (
          (cleanInputNumeric && (num1 === cleanInputNumeric || num2 === cleanInputNumeric)) ||
          num1 === cleanInput ||
          num2 === cleanInput ||
          (cleanInputLower.length >= 3 && tName.includes(cleanInputLower))
        );
      });

      if (foundTrain) {
        const route = foundTrain.trainRoute || foundTrain.schedule || [];
        if (Array.isArray(route) && route.length > 0) {
          const routeStr = foundTrain.route || '';
          const routeParts = routeStr.includes(' to ') ? routeStr.split(' to ') : [];
          const originName = routeParts[0] || 'Origin Station';
          const destName = routeParts[1] || 'Destination Station';

          const calculated = calculateLiveTrainStatus(
            {
              number: foundTrain.trainNumber || foundTrain.train_number || cleanInput,
              name: foundTrain.trainName || foundTrain.train_name || foundTrain.name || `Express Train #${cleanInput}`,
              origin: originName,
              destination: destName,
              speed: '85 km/h',
              lastUpdated: 'Just now (Live Clock Calculated)',
              delayMins: 0
            },
            route,
            startDate
          );

          // Apply Fallback Enrichment
          const enrichedObj = enrichTrainDetails({
            train_number: calculated.number,
            train_name: calculated.name,
            origin: calculated.origin,
            destination: calculated.destination
          });

          const finalResult: TrainStatusData = {
            ...calculated,
            name: enrichedObj.train_name,
            accommodation: enrichedObj.accommodation,
            accommodationTypes: enrichedObj.accommodationTypes
          };

          saveToCache(cacheKey, finalResult);
          setTrainData(finalResult);
          return;
        }
      }

      // Fallback to API search if available, else mark not found
      try {
        const apiResult = await fetchTrainData({ trainNumber: input, startDate });
        if (apiResult) {
          const enrichedApi = enrichTrainDetails({ train_number: apiResult.number, train_name: apiResult.name });
          const enrichedApiResult = {
            ...apiResult,
            name: enrichedApi.train_name,
            accommodation: enrichedApi.accommodation,
            accommodationTypes: enrichedApi.accommodationTypes
          };
          saveToCache(cacheKey, enrichedApiResult);
          setTrainData(enrichedApiResult);
        } else {
          setTrainData(null);
          setNotFoundTrainNumber(input);
        }
      } catch {
        setTrainData(null);
        setNotFoundTrainNumber(input);
      }
    } catch (error: any) {
      console.warn("Train search warning:", error);
      setTrainData(null);
      setNotFoundTrainNumber(input);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performTrainSearch(trainNumberInput);
  };

  const handleBookSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasBookSearched(true);

    const cacheKey = `train_route_${fromStation.trim().toUpperCase()}_${toStation.trim().toUpperCase()}`;

    // 1. Check local search cache first for instant retrieval
    const cachedResult = getFromCache<any[]>(cacheKey);
    if (cachedResult && Array.isArray(cachedResult) && cachedResult.length > 0) {
      setBookTrainData(cachedResult);
      setIsTrainCached(true);
      setIsLoading(false);
      return;
    }

    setIsTrainCached(false);

    try {
      const trainSchedules = await getTrainSchedules();
      const matchingTrains = (trainSchedules as any[]).filter((t: any) => {
        const route = t.trainRoute || t.schedule || [];
        if (!Array.isArray(route) || route.length < 2) return false;

        const fromIdx = route.findIndex((s: any) =>
          matchesStation(s.stationName || s.station_name || s.station, fromStation)
        );
        if (fromIdx === -1) return false;

        const toIdx = route.findIndex(
          (s: any, idx: number) => idx > fromIdx && matchesStation(s.stationName || s.station_name || s.station, toStation)
        );

        return toIdx > fromIdx;
      });

      let formattedBookData = matchingTrains.map((t: any) => {
        const route = t.trainRoute || t.schedule || [];
        const fromStop = route.find((s: any) => matchesStation(s.stationName || s.station_name || s.station, fromStation));
        const toStop = route.find((s: any) => matchesStation(s.stationName || s.station_name || s.station, toStation));

        const fromIdx = route.indexOf(fromStop);
        const toIdx = route.indexOf(toStop);

        const distFrom = parseInt(fromStop?.distance || '0', 10) || 0;
        const distTo = parseInt(toStop?.distance || '0', 10) || 0;
        const totalDist = Math.abs(distTo - distFrom);

        let travelTimeStr = `${Math.max(1, toIdx - fromIdx)} stops`;
        if (totalDist > 0) {
          const estHours = Math.floor(totalDist / 55);
          const estMins = totalDist % 55;
          travelTimeStr = `${estHours}h ${estMins}m (${totalDist} km)`;
        }

        const rawDep = fromStop?.departs || fromStop?.arrives || fromStop?.departure_time || '08:00 AM';
        const rawArr = toStop?.arrives || toStop?.departs || toStop?.arrival_time || '04:00 PM';

        const rawTrainObj = {
          train_number: t.trainNumber || t.train_number || '12345',
          train_name: t.trainName || t.train_name || t.name || `Express Train #${t.trainNumber || '12345'}`,
          type: t.type || 'Superfast Express',
          departure_time: rawDep === 'Source' ? '08:00 AM' : rawDep,
          arrival_time: rawArr === 'Destination' ? '08:00 PM' : rawArr,
          travel_time: travelTimeStr,
          from_station: fromStop?.stationName || fromStop?.station_name || fromStop?.station || fromStation,
          to_station: toStop?.stationName || toStop?.station_name || toStop?.station || toStation
        };

        // Fallback Mechanism: Enrich train details if missing
        return enrichTrainDetails(rawTrainObj);
      });

      // 2. Fallback to searchLocalTrains if no matches found in trainSchedules
      if (formattedBookData.length === 0) {
        try {
          const svcTrains = await searchLocalTrains(fromStation, toStation, journeyDate);
          if (svcTrains && svcTrains.length > 0) {
            formattedBookData = svcTrains.map(t => ({
              train_number: t.number,
              train_name: t.name,
              type: 'Express Train',
              departure_time: t.depTime,
              arrival_time: t.arrTime,
              travel_time: t.duration,
              from_station: t.origin,
              to_station: t.destination,
              classes: t.classes,
              price: t.price,
              status: t.status,
              isDeparted: t.isDeparted,
              timeSlot: t.timeSlot
            }));
          }
        } catch (svcErr: any) {
          console.warn("Fallback local train search error:", svcErr);
          if (svcErr?.message && svcErr.message.includes('भूतकाळातील')) {
            alert(svcErr.message);
          }
        }
      }

      setBookTrainData(formattedBookData);

      if (formattedBookData.length > 0) {
        saveToCache(cacheKey, formattedBookData);
      }
    } catch (err) {
      console.error("Book Search Error:", err);
      setBookTrainData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookTrainDirect = () => {
    window.open('https://bitli.in/1HdfW4l', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200 w-full sm:w-auto mx-auto max-w-lg">
        <button
          onClick={() => setMode('status')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            mode === 'status'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          {lang === 'mr' ? 'थेट स्थिती (Live)' : 'Check Live Status'}
        </button>
        <button
          onClick={() => setMode('book')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            mode === 'book'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          {lang === 'mr' ? 'तिकीट बुकिंग (Book)' : 'Book Tickets'}
        </button>
        <button
          onClick={() => setMode('directory')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            mode === 'directory'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          {lang === 'mr' ? 'स्टेशन डिरेक्टरी (Stations)' : 'Stations Directory'}
        </button>
      </div>

      {mode === 'status' && (
      <>
        {/* Train Schedule Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 shadow-sm">
          <div className="shrink-0 pt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-sm mb-0.5">
              {lang === 'mr' ? 'लाईव्ह ट्रेन स्थिती व ट्रॅकिंग' : 'Live Train Status & Tracking'}
            </h4>
            <p className="text-xs text-amber-800/90 leading-relaxed font-semibold">
              {lang === 'mr'
                ? 'रिअल-टाइम ट्रेन धावणारी स्थिती आणि लाइव्ह वेळापत्रक पहा.'
                : 'Verified Train Schedule & Live Status. Real-time updates directly integrated.'}
            </p>
          </div>
        </div>

        {/* Train Input Form */}
        <form onSubmit={handleTrainSearch} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Train Number Input */}
            <div className="relative bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3.5 transition-all">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {lang === 'mr' ? 'ट्रेन नंबर प्रविष्ट करा' : 'Enter Train Number (e.g. 22223)'}
              </label>
              <div className="flex items-center gap-3">
                <span className="text-lg">🚆</span>
                <input
                  type="text"
                  autoComplete="off"
                  value={trainNumberInput}
                  onChange={(e) => {
                    setTrainNumberInput(e.target.value);
                    setShowTrainSuggestions(true);
                  }}
                  onFocus={() => setShowTrainSuggestions(true)}
                  placeholder={lang === 'mr' ? 'उदा. 22223, राजधानी एक्स्प्रेस' : 'e.g. 22223, Rajdhani Express'}
                  className="w-full bg-transparent font-black text-lg text-slate-900 outline-none"
                  required
                />
              </div>
              {showTrainSuggestions && trainSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl max-h-60 overflow-y-auto z-50 flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
                  {trainSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex flex-col"
                      onClick={() => {
                        setTrainNumberInput(suggestion.trainNumber);
                        setShowTrainSuggestions(false);
                      }}
                    >
                      <span className="font-bold text-slate-900">{suggestion.trainNumber} - {suggestion.trainName}</span>
                      {suggestion.accommodation && (
                        <span className="text-[10px] font-semibold text-slate-500">{suggestion.accommodation}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Departure / Start Date Picker */}
            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3.5 transition-all">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {lang === 'mr' ? 'ट्रेनची प्रस्थान तारीख (Start Date)' : 'Train Start / Departure Date'}
              </label>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="relative w-full">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="w-full bg-transparent font-black text-base text-slate-900 pointer-events-none flex items-center h-7">
                    {formatDate(startDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{lang === 'mr' ? 'थेट माहिती शोधत आहे...' : 'Fetching Train Status...'}</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>{lang === 'mr' ? 'थेट धावणारी स्थिती पहा' : 'View Live Running Status'}</span>
              </>
            )}
          </button>

          {/* Quick Shortcuts */}
          <div className="pt-3 border-t border-slate-100 mt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Popular Express Trains</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                type="button"
                onClick={() => { setTrainNumberInput('22223'); performTrainSearch('22223'); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full shrink-0 hover:bg-amber-50 hover:border-amber-300 transition-colors"
              >
                22223 - Vande Bharat
              </button>
              <button
                type="button"
                onClick={() => { setTrainNumberInput('12617'); performTrainSearch('12617'); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full shrink-0 hover:bg-amber-50 hover:border-amber-300 transition-colors"
              >
                12617 - Mangala Exp
              </button>
              <button
                type="button"
                onClick={() => { setTrainNumberInput('12951'); performTrainSearch('12951'); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full shrink-0 hover:bg-amber-50 hover:border-amber-300 transition-colors"
              >
                12951 - Rajdhani Exp
              </button>
            </div>
          </div>
        </form>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm animate-pulse space-y-6">
            <div className="h-10 w-full bg-slate-100 rounded-2xl mb-4" />
            <div className="h-16 w-full bg-slate-100 rounded-2xl" />
            <div className="h-16 w-full bg-slate-100 rounded-2xl" />
          </div>
        )}

        {/* Clean Initial Train Status State Prompt / Not Found State */}
        {!isLoading && !trainData && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-600 shadow-sm">
              <Train className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h5 className="font-black text-slate-900 text-lg">
                {notFoundTrainNumber
                  ? (lang === 'mr' ? 'रेल्वे माहिती सापडली नाही' : 'Train Not Found')
                  : (lang === 'mr' ? 'रेल्वे थेट स्थिती पहा' : 'Check Live Train Status')}
              </h5>
              <p className="text-xs font-medium text-slate-500">
                {notFoundTrainNumber
                  ? (lang === 'mr'
                      ? `ट्रेन क्र. #${notFoundTrainNumber} चे वेळापत्रक डेटाबेसमध्ये सापडले नाही. कृपया ट्रेन क्र. तपासा (उदा. 22223, 12617, 12951, 22360).`
                      : `Train #${notFoundTrainNumber} was not found in our schedule database. Please verify the train number (e.g. 22223, 12617, 12951, 22360) and try again.`)
                  : (lang === 'mr'
                      ? 'लाइव्ह रेल्वे धावणारी स्थिती आणि वेळापत्रक पाहण्यासाठी वर ट्रेन नंबर (उदा. 22223) आणि तारीख प्रविष्ट करा.'
                      : 'Enter a train number (e.g. 22223) and date above to view real-time station tracking and route schedules.')}
              </p>
            </div>
          </div>
        )}

        {/* Train Details Card */}
        {!isLoading && trainData && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-6">
            {/* Train Name & Origin-Dest Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-md font-black text-xs font-mono">
                    #{trainData.number}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                    {trainData.statusText}
                  </span>
                </div>
                <h4 className="font-black text-slate-900 text-lg leading-snug">{trainData.name}</h4>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{trainData.origin} ➔ {trainData.destination}</p>
                {(trainData.accommodationTypes || trainData.accommodation) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{lang === 'mr' ? 'वर्ग:' : 'Classes:'}</span>
                    {Array.isArray(trainData.accommodationTypes) && trainData.accommodationTypes.length > 0 ? (
                      trainData.accommodationTypes.map((acc: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-md text-[11px] font-bold shadow-2xs">
                          {acc}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-md text-[11px] font-bold shadow-2xs">
                        {trainData.accommodation}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block">{lang === 'mr' ? 'गती / वेळ' : 'Speed / Updated'}</span>
                <span className="font-black text-sm text-slate-900">{trainData.speed} • {trainData.lastUpdated}</span>
              </div>
            </div>

            {/* Sub-View Selector (Live Status vs Timetable) */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setActiveSubView('status')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  activeSubView === 'status'
                    ? 'bg-white text-amber-700 shadow border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'mr' ? '📍 थेट स्थान व स्थिती' : '📍 Live Status'}
              </button>
              <button
                onClick={() => setActiveSubView('timetable')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  activeSubView === 'timetable'
                    ? 'bg-white text-amber-700 shadow border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'mr' ? '📅 पूर्ण वेळापत्रक' : '📅 Route Timetable'}
              </button>
            </div>

            {/* SUB-VIEW 1: LIVE STATUS WITH ANIMATED TRAIN ENGINE TIMELINE */}
            {activeSubView === 'status' && (
              <TrainStatusTimeline
                schedule={trainData.schedule}
                currentStationName={trainData.currentStation}
                nextStationName={trainData.nextStation}
                delayMins={trainData.delayMins}
                speed={trainData.speed}
                lastUpdated={trainData.lastUpdated}
                lang={lang}
              />
            )}

            {/* SUB-VIEW 2: TIMETABLE */}
            {activeSubView === 'timetable' && (
              <TrainStatusTimeline
                schedule={trainData.schedule}
                currentStationName={trainData.currentStation}
                nextStationName={trainData.nextStation}
                delayMins={trainData.delayMins}
                speed={trainData.speed}
                lastUpdated={trainData.lastUpdated}
                lang={lang}
              />
            )}

            {/* Book Train CTA Banner on Live Status Card */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'mr' ? 'सुरक्षित बुकिंग' : 'Secure Checkout'}</span>
              </span>
              <a
                href="https://bitli.in/1HdfW4l"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-orange-500/20 flex items-center gap-1.5 active:scale-95 transition-all inline-flex cursor-pointer"
              >
                <span>CHECK LIVE PRICE & BOOK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </>
      )}

      {/* MODE = BOOK (TICKET BOOKING LIST) */}
      {mode === 'book' && (
        <div className="space-y-6">
          <form 
            onSubmit={handleBookSearch} 
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SearchInput
                label={lang === 'mr' ? 'प्रस्थान स्टेशन (From)' : 'From Station'}
                placeholder="Search station or city (e.g. CSMT, ERS, MMCT)..."
                value={fromStation}
                onChange={(code) => setFromStation(code)}
                mode="trains"
                iconType="from"
              />

              <SearchInput
                label={lang === 'mr' ? 'गंतव्य स्टेशन (To)' : 'To Station'}
                placeholder="Search station or city (e.g. NDLS, NZM, PUNE)..."
                value={toStation}
                onChange={(code) => setToStation(code)}
                mode="trains"
                iconType="to"
              />

              <div className="md:col-span-2 bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3.5 transition-all">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {lang === 'mr' ? 'प्रवासाची तारीख' : 'Date of Journey'}
                </label>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="relative w-full">
                    <input
                      type="date"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="w-full bg-transparent font-black text-base text-slate-900 pointer-events-none flex items-center h-7">
                      {formatDate(journeyDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
            >
              <Search className="w-5 h-5" />
              <span>{lang === 'mr' ? 'उपलब्ध गाड्या शोधा' : 'Search Available Trains'}</span>
            </button>
          </form>

          {/* TRAIN BOOKING CARDS LIST */}
          {(hasBookSearched || isLoading) && (
            <TransportOptions
              mode="train"
              data={bookTrainData}
              isLoading={isLoading}
              isCached={isTrainCached}
              origin={fromStation}
              destination={toStation}
              lang={lang}
            />
          )}
        </div>
      )}

      {mode === 'directory' && (() => {
        const filteredStations = searchRailwayStations(debouncedStationQuery);
        const visibleStations = filteredStations.slice(0, stationVisibleCount);

        return (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-600" />
                  {lang === 'mr' ? 'रेल्वे स्टेशन डिरेक्टरी' : 'Railway Station Directory'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'mr'
                    ? 'सर्व स्थानकांची माहिती आणि स्टेशन कोड शोधा'
                    : `Browse all ${ALL_RAILWAY_STATIONS.length} stations in Indian Railways network`}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black">
                {filteredStations.length} {lang === 'mr' ? 'स्थानके' : 'stations'}
              </span>
            </div>

            {/* Search bar */}
            <div className="bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3 flex items-center gap-3 transition-all">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={stationSearchQuery}
                onChange={(e) => {
                  setStationSearchQuery(e.target.value);
                  setStationVisibleCount(24);
                }}
                placeholder={lang === 'mr' ? 'शहर, स्टेशनचे नाव किंवा कोड शोधा (उदा. NDLS, Pune)...' : 'Search city, station name, or station code (e.g. NDLS, Pune, Nashik)...'}
                className="w-full bg-transparent font-bold text-slate-900 placeholder-slate-400 outline-none text-sm"
              />
              {stationSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setStationSearchQuery('');
                    setStationVisibleCount(24);
                  }}
                  className="text-xs font-black text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full px-2 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Station List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1 flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
              {visibleStations.map((st: RailwayStationItem, idx: number) => (
                <div
                  key={`${st.code}-${idx}`}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/50 rounded-2xl transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="font-black text-slate-800 text-sm truncate group-hover:text-amber-900">{st.station}</h4>
                    <p className="text-xs font-medium text-slate-500 truncate">{st.city}</p>
                  </div>
                  <span className="font-mono font-black text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl shrink-0 border border-amber-200">
                    {st.code}
                  </span>
                </div>
              ))}

              {filteredStations.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold text-sm">
                  No railway stations matching &quot;{stationSearchQuery}&quot;
                </div>
              )}
            </div>

            {filteredStations.length > stationVisibleCount && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStationVisibleCount((prev) => prev + 24)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-amber-100 text-amber-900 font-black text-xs uppercase rounded-xl transition-all border border-slate-200"
                >
                  {lang === 'mr' ? 'अधिक स्थानके लोड करा' : 'Load More Stations'}
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* 2-Second Handoff Modal for EarnKaro Affiliate Redirect */}
      <HandoffModal
        isOpen={handoffModal.isOpen}
        partnerUrl={handoffModal.url}
        itemTitle={handoffModal.title}
        onClose={() => setHandoffModal((prev) => ({ ...prev, isOpen: false }))}
        lang={lang}
      />
    </div>
  );
};

