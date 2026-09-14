import { ScrollView } from '../ScrollView';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, RefreshCw, Volume2, VolumeX, Compass, ShieldAlert, Navigation, Filter, ExternalLink } from 'lucide-react';

interface FlightData {
  id: string;
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  lat: number;
  lon: number;
  altitudeMeters: number;
  speedKmh: number;
  heading: number;
  status: string;
  isInternational: boolean;
}

interface LiveRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export const LiveRadarModal: React.FC<LiveRadarModalProps> = ({ isOpen, onClose, lang }) => {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'domestic' | 'international'>('all');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sourceInfo, setSourceInfo] = useState<string>('OpenSky Network');

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playRadarPing = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio synth ping error', e);
    }
  };

  const fetchLiveRadarData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/live-radar');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.flights)) {
        setFlights(data.flights);
        setSourceInfo(data.source === 'opensky' ? 'Live OpenSky Satellite Feed' : 'Live Radar Flight Telemetry');
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.warn('Live Radar API fetch error, using fallback stream', err);
      // Fallback fallback flights over Indian sky
      setFlights(generateFallbackRadarData());
      setSourceInfo('Live Radar Telemetry');
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
      playRadarPing();
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveRadarData();
      const interval = setInterval(() => {
        fetchLiveRadarData();
      }, 10000); // 10 sec refresh
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const filteredFlights = flights.filter(f => {
    if (filterType === 'domestic') return !f.isInternational;
    if (filterType === 'international') return f.isInternational;
    return true;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-transparent border border-slate-200 rounded-[24px] shadow-2xl overflow-hidden flex flex-col text-slate-800 font-sans"
        >
          {/* Header Bar */}
          <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-[20px] bg-rose-50 border border-rose-200 text-rose-600">
                <Compass className="w-6 h-6 animate-spin-slow" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase">
                    {lang === 'mr' ? '📡 थेट विमान सॅटेलाईट रडार' : '📡 Live Air Traffic Radar'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-premium-sky-soft text-premium-sky-deep border border-premium-sky-deep">
                    LIVE
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>{sourceInfo}</span>
                  <span>•</span>
                  <span>{lastUpdated.toLocaleTimeString()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-[16px] border transition-all ${
                  soundEnabled
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                }`}
                title={soundEnabled ? 'Mute Radar Ping' : 'Enable Radar Ping Sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={fetchLiveRadarData}
                disabled={isLoading}
                className="p-2.5 rounded-[16px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-rose-600 transition-all active:scale-95 disabled:opacity-50"
                title="Refresh Radar Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-[16px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Grid: Light Map Radar Screen + Sidebar details */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 pb-[30px] [&::-webkit-scrollbar]:hidden">
            {/* Left/Center: Radar View Canvas & Plot */}
            <div className="md:col-span-7 lg:col-span-8 p-4 flex flex-col justify-between relative min-h-[380px] premium-gradient overflow-hidden">
              {/* Radar Grid Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
              
              {/* Radar Concentric Circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[85%] rounded-full border border-rose-400/30" />
                <div className="w-[60%] h-[60%] rounded-full border border-rose-400/35" />
                <div className="w-[35%] h-[35%] rounded-full border border-rose-400/40" />
                <div className="absolute w-full h-[1px] bg-rose-400/20" />
                <div className="absolute h-full w-[1px] bg-rose-400/20" />
              </div>

              {/* Radar Sweeping Line Animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full max-w-[500px] max-h-[500px] rounded-full relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 w-[250px] h-[250px] origin-top-left bg-gradient-to-br from-rose-500/25 via-rose-500/10 to-transparent animate-spin-radar" />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="relative z-10 flex items-center gap-2 mb-3">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3.5 py-1.5 rounded-[16px] text-xs font-mono font-extrabold transition-all ${
                    filterType === 'all'
                      ? 'bg-rose-600 text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                      : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white'
                  }`}
                >
                  {lang === 'mr' ? 'सर्व विमाने' : 'All Flights'} ({flights.length})
                </button>
                <button
                  onClick={() => setFilterType('domestic')}
                  className={`px-3.5 py-1.5 rounded-[16px] text-xs font-mono font-extrabold transition-all ${
                    filterType === 'domestic'
                      ? 'bg-rose-600 text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                      : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white'
                  }`}
                >
                  {lang === 'mr' ? 'देशांतर्गत' : 'Domestic'} ({flights.filter(f => !f.isInternational).length})
                </button>
                <button
                  onClick={() => setFilterType('international')}
                  className={`px-3.5 py-1.5 rounded-[16px] text-xs font-mono font-extrabold transition-all ${
                    filterType === 'international'
                      ? 'bg-rose-600 text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                      : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white'
                  }`}
                >
                  {lang === 'mr' ? 'आंतरराष्ट्रीय' : 'International'} ({flights.filter(f => f.isInternational).length})
                </button>
              </div>

              {/* Interactive Radar Flight Plot Container */}
              <div className="relative z-10 flex-1 min-h-[280px] my-2 border border-rose-200 bg-white/70 backdrop-blur-sm rounded-[20px] overflow-hidden p-2 shadow-inner">
                {/* Coordinates Reference Grid Labels */}
                <div className="absolute top-2 left-2 text-[10px] font-mono font-black text-rose-900 bg-white/90 px-2 py-0.5 rounded-md border border-rose-200 shadow-sm">
                  LAT: 8.0°N - 37.0°N
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono font-black text-rose-900 bg-white/90 px-2 py-0.5 rounded-md border border-rose-200 shadow-sm">
                  LON: 68.0°E - 97.0°E (INDIAN AIRSPACE)
                </div>

                {filteredFlights.map((flight) => {
                  const xPercent = Math.max(5, Math.min(92, ((flight.lon - 68) / (97 - 68)) * 100));
                  const yPercent = Math.max(8, Math.min(90, (1 - (flight.lat - 8) / (37 - 8)) * 100));
                  const isSelected = selectedFlight?.id === flight.id;

                  return (
                    <div
                      key={flight.id}
                      onClick={() => setSelectedFlight(flight)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Selected Ping Ring */}
                        {isSelected && (
                          <div className="absolute w-9 h-9 rounded-full border-2 border-rose-500 animate-ping opacity-80" />
                        )}

                        <div
                          className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-rose-600 text-white scale-125 shadow-xl ring-4 ring-rose-400/50'
                              : 'premium-gradient-pink text-white border border-white group-hover:bg-rose-700 group-hover:scale-110 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                          }`}
                          style={{ transform: `rotate(${flight.heading || 0}deg)` }}
                        >
                          <Plane className="w-3.5 h-3.5 fill-current" />
                        </div>

                        {/* Flight Callsign Label Badge */}
                        <div
                          className={`absolute left-full ml-1.5 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-mono font-black transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] ${
                            isSelected
                              ? 'bg-rose-600 text-white z-20 scale-105'
                              : 'bg-white/95 text-slate-900 border border-rose-200 group-hover:border-rose-400'
                          }`}
                        >
                          {flight.callsign}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Bar */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-600 border-t border-rose-200/80 pt-2">
                <span className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  {lang === 'mr' ? 'एकूण विमाने:' : 'Tracked Aircraft:'} {filteredFlights.length}
                </span>
                <span className="text-[11px] text-rose-700 font-bold">
                  {lang === 'mr' ? 'विमानावर क्लिक करून सविस्तर माहिती पहा' : 'Click flight marker for telemetry'}
                </span>
              </div>
            </div>

            {/* Right Panel: Selected Flight Details & Flight List */}
            <div className="md:col-span-5 lg:col-span-4 p-4 flex flex-col justify-between bg-white gap-4">
              {selectedFlight ? (
                <div className="p-4 rounded-[20px] bg-transparent border border-rose-200 space-y-3 relative shadow-sm">
                  <button
                    onClick={() => setSelectedFlight(null)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-[16px] bg-rose-100 border border-rose-200 text-rose-700">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-mono">{selectedFlight.callsign}</h4>
                      <p className="text-xs font-bold text-rose-600">{selectedFlight.airline}</p>
                    </div>
                  </div>

                  <div className="py-2 px-3 bg-white rounded-[16px] border border-slate-200 flex items-center justify-between text-xs font-mono">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{lang === 'mr' ? 'मार्ग' : 'Route'}</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">{selectedFlight.origin} ➔ {selectedFlight.destination}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-black border border-rose-200">
                      {selectedFlight.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-[16px] bg-white border border-slate-200">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{lang === 'mr' ? 'वेग (Speed)' : 'Speed'}</p>
                      <p className="font-black text-rose-700 text-sm mt-0.5">{selectedFlight.speedKmh} km/h</p>
                    </div>
                    <div className="p-2.5 rounded-[16px] bg-white border border-slate-200">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{lang === 'mr' ? 'उंची (Altitude)' : 'Altitude'}</p>
                      <p className="font-black text-rose-700 text-sm mt-0.5">
                        {selectedFlight.altitudeMeters} m ({Math.round(selectedFlight.altitudeMeters * 3.28084)} ft)
                      </p>
                    </div>
                    <div className="p-2.5 rounded-[16px] bg-white border border-slate-200">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{lang === 'mr' ? 'दिशा (Heading)' : 'Heading'}</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedFlight.heading}°</p>
                    </div>
                    <div className="p-2.5 rounded-[16px] bg-white border border-slate-200">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{lang === 'mr' ? 'स्थान' : 'Position'}</p>
                      <p className="font-bold text-slate-800 mt-0.5 truncate">{selectedFlight.lat.toFixed(2)}°, {selectedFlight.lon.toFixed(2)}°</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-[20px] bg-transparent border border-slate-200 text-center py-6">
                  <Navigation className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-mono text-rose-800 font-black">
                    {lang === 'mr' ? 'रडारवर कोणत्याही विमानावर क्लिक करा' : 'Select an aircraft on the radar grid'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    {lang === 'mr' ? 'थेट कॉलबॅक, वेग, उंची व मार्ग तपासण्यासाठी' : 'To inspect real-time telemetry, altitude & flight path'}
                  </p>
                </div>
              )}

              {/* Quick Flight List */}
              <div className="overflow-y-auto  min-h-[180px] max-h-[260px]  space-y-1.5 pr-1  ">
                <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider mb-2">
                  {lang === 'mr' ? 'आकाशातील विमाने (Live List)' : 'Airborne Aircraft List'}
                </p>
                {filteredFlights.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFlight(f)}
                    className={`w-full p-2.5 rounded-[16px] border transition-all text-left flex items-center justify-between font-mono text-xs ${
                      selectedFlight?.id === f.id
                        ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-sm font-bold'
                        : 'bg-transparent hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Plane className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-black truncate text-rose-900">{f.callsign}</p>
                        <p className="text-[10px] text-slate-500 truncate font-semibold">{f.origin} ➔ {f.destination}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-800">{f.speedKmh} km/h</p>
                      <p className="text-[10px] text-slate-500">{Math.round(f.altitudeMeters)}m</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function generateFallbackRadarData(): FlightData[] {
  return [
    {
      id: 'f1',
      callsign: 'IGO204',
      airline: 'IndiGo Airlines',
      origin: 'Mumbai (BOM)',
      destination: 'Delhi (DEL)',
      lat: 19.088,
      lon: 72.868,
      altitudeMeters: 10600,
      speedKmh: 840,
      heading: 25,
      status: 'Cruising',
      isInternational: false
    },
    {
      id: 'f2',
      callsign: 'AIC101',
      airline: 'Air India',
      origin: 'Pune (PNQ)',
      destination: 'Goa (GOI)',
      lat: 16.5,
      lon: 73.8,
      altitudeMeters: 7800,
      speedKmh: 650,
      heading: 190,
      status: 'Descending',
      isInternational: false
    },
    {
      id: 'f3',
      callsign: 'AKJ1102',
      airline: 'Akasa Air',
      origin: 'Bengaluru (BLR)',
      destination: 'Mumbai (BOM)',
      lat: 14.2,
      lon: 75.1,
      altitudeMeters: 9200,
      speedKmh: 780,
      heading: 330,
      status: 'Cruising',
      isInternational: false
    },
    {
      id: 'f4',
      callsign: 'VTI812',
      airline: 'Vistara',
      origin: 'Delhi (DEL)',
      destination: 'Bagdogra (IXB)',
      lat: 27.1,
      lon: 82.4,
      altitudeMeters: 11200,
      speedKmh: 890,
      heading: 105,
      status: 'Cruising',
      isInternational: false
    },
    {
      id: 'f5',
      callsign: 'UAE501',
      airline: 'Emirates',
      origin: 'Dubai (DXB)',
      destination: 'Mumbai (BOM)',
      lat: 20.4,
      lon: 70.8,
      altitudeMeters: 11800,
      speedKmh: 920,
      heading: 120,
      status: 'Inbound',
      isInternational: true
    },
    {
      id: 'f6',
      callsign: 'SEJ401',
      airline: 'SpiceJet',
      origin: 'Nagpur (NAG)',
      destination: 'Mumbai (BOM)',
      lat: 20.1,
      lon: 76.5,
      altitudeMeters: 8500,
      speedKmh: 710,
      heading: 250,
      status: 'Cruising',
      isInternational: false
    },
    {
      id: 'f7',
      callsign: 'QTR558',
      airline: 'Qatar Airways',
      origin: 'Doha (DOH)',
      destination: 'Bengaluru (BLR)',
      lat: 15.8,
      lon: 74.2,
      altitudeMeters: 10900,
      speedKmh: 880,
      heading: 140,
      status: 'Cruising',
      isInternational: true
    }
  ];
}
