import React from 'react';
import { Plane, Bus, Train, Clock, ExternalLink, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { getFullStationDetails } from '../../services/travelTimeService';

import { FunFactsLoader } from '../common/FunFactsLoader';

export interface TransportOptionsProps {
  mode: 'flight' | 'bus' | 'train' | 'hotel' | 'car';
  data: any;
  isLoading: boolean;
  isCached?: boolean;
  origin?: string;
  destination?: string;
  lang: string;
  currencySymbol?: string;
  onBookNow?: (item: any) => void;
}

const addDurationToTime = (timeStr: string, durationStr: string) => {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  try {
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    
    if (isNaN(h) || isNaN(m)) return timeStr;
    
    // Extract hours and minutes from duration string like "2h 30m"
    const durHMatch = durationStr.match(/(\d+)h/);
    const durMMatch = durationStr.match(/(\d+)m/);
    
    const durH = durHMatch ? parseInt(durHMatch[1], 10) : 0;
    const durM = durMMatch ? parseInt(durMMatch[1], 10) : 0;
    
    let totalMinutes = h * 60 + m + durH * 60 + durM;
    totalMinutes = totalMinutes % 1440; // Safely handle 24h rollover
    
    const finalH = Math.floor(totalMinutes / 60);
    const finalM = totalMinutes % 60;
    
    return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  } catch (e) {
    return timeStr;
  }
};

function safeFormat12Hour(timeStr: string) {
  if (!timeStr || typeof timeStr !== 'string') return 'TBD';
  
  // If it already has AM/PM, return as is safely
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
  
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr; // Return raw if it can't be split
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].substring(0, 2); 
  
  if (isNaN(hours)) return 'TBD';
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  const formattedHour = hours < 10 ? '0' + hours : hours;
  
  return `${formattedHour}:${minutes} ${ampm}`;
}

export const TransportOptions: React.FC<TransportOptionsProps> = ({
  mode,
  data,
  isLoading,
  isCached = false,
  origin,
  destination,
  lang,
  currencySymbol = '₹',
  onBookNow
}) => {
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = React.useState<number>(PAGE_SIZE);

  // Reset pagination when data or mode changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [data, mode]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm text-center">
        <FunFactsLoader />
      </div>
    );
  }

  // Extract items array safely
  let items: any[] = [];
  let isPendingApi = false;
  let customMessage = "";

  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object') {
    if (data.status === 'PENDING_API_INTEGRATION' || data.data?.status === 'PENDING_API_INTEGRATION') {
      isPendingApi = true;
      customMessage = data.message || data.data?.message || "";
    }
    if (mode === 'flight') {
      items = data.flights || data.flight_schedule || data.data?.flights || [];
    } else if (mode === 'bus') {
      items = data.buses || data.bus_schedule || data.data?.buses || [];
    } else if (mode === 'train') {
      items = data.trains || data.train_schedule || data.data?.trains || [];
    }
  }

  // If API integration is pending
  if (isPendingApi) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-blue-200 text-center space-y-4 shadow-sm bg-gradient-to-b from-blue-50/50 to-white">
        <div className="w-16 h-16 bg-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-xs">
          {mode === 'flight' && <Plane className="w-8 h-8 rotate-45" />}
          {mode === 'bus' && <Bus className="w-8 h-8" />}
          {mode === 'train' && <Train className="w-8 h-8" />}
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <h5 className="font-black text-slate-900 text-lg">
            {lang === 'mr' ? 'माहिती प्रक्रिया सुरू आहे...' : 'Processing Request...'}
          </h5>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs font-bold leading-relaxed shadow-2xs">
            {customMessage || (lang === 'mr' ? "कृपया प्रतीक्षा करा, आम्ही तुमच्यासाठी सर्वोत्तम पर्याय शोधत आहोत।" : "Please wait while we fetch options for you.")}
          </div>
          <p className="text-xs text-slate-500 font-semibold pt-1">
            {lang === 'mr' ? 'राऊट्रिपो ट्रॅव्हल असिस्टन्स' : 'Routripo Travel Assistance'}
          </p>
        </div>
      </div>
    );
  }

  // Clear Empty State when search returns 0 results
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-amber-200 text-center space-y-4 shadow-sm bg-gradient-to-b from-amber-50/50 to-white">
        <div className="w-16 h-16 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto text-amber-600 shadow-xs">
          {mode === 'flight' && <Plane className="w-8 h-8 rotate-45" />}
          {mode === 'bus' && <Bus className="w-8 h-8" />}
          {mode === 'train' && <Train className="w-8 h-8" />}
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <h5 className="font-black text-slate-900 text-lg">
            {mode === 'train' && (lang === 'mr' ? 'कोणतीही ट्रेन सापडली नाही' : 'No Trains Found')}
            {mode === 'bus' && (lang === 'mr' ? 'कोणतीही बस सापडली नाही' : 'No Buses Found')}
            {mode === 'flight' && (lang === 'mr' ? 'उड्डाणे उपलब्ध नाहीत' : 'No Flights Available')}
          </h5>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-bold leading-relaxed shadow-2xs">
            {mode === 'train' && (lang === 'mr' 
              ? `या मार्गासाठी (${origin || 'प्रस्थान'} ➔ ${destination || 'गंतव्य'}) थेट ट्रेन सापडली नाही. कृपया स्टेशन नाव किंवा कोड (उदा. CSMT, NDLS, HNZM, PUNE) तपासा.`
              : `No direct trains found for route (${origin || 'From'} ➔ ${destination || 'To'}). Please check station names or codes.`)}
            {mode === 'bus' && (lang === 'mr'
              ? `या मार्गासाठी (${origin || 'प्रस्थान'} ➔ ${destination || 'गantavya'}) कोणतीही बस उपलब्ध नाही.`
              : `No direct buses found for route (${origin || 'From'} ➔ ${destination || 'To'}).`)}
            {mode === 'flight' && (lang === 'mr'
              ? `या मार्गासाठी (${origin || 'प्रस्थान'} ➔ ${destination || 'गंतव्य'}) विमाने उपलब्ध नाहीत.`
              : `No direct flights available for route (${origin || 'From'} ➔ ${destination || 'To'}).`)}
          </div>
          <p className="text-xs text-slate-500 font-semibold pt-1">
            {lang === 'mr' ? 'राऊट्रिपो ट्रॅव्हल असिस्टन्स' : 'Routripo Travel Assistance'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header with Cache Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h4 className="font-black text-slate-900 text-base">
            {mode === 'flight' && (lang === 'mr' ? 'उपलब्ध उड्डाणे (Flights)' : 'Available Flights')}
            {mode === 'bus' && (lang === 'mr' ? 'उपलब्ध बसेस (Buses)' : 'Available Buses')}
            {mode === 'train' && (lang === 'mr' ? 'उपलब्ध गाड्या (Trains)' : 'Available Trains')}
            {mode === 'hotel' && (lang === 'mr' ? 'उपलब्ध हॉटेल्स (Hotels)' : 'Available Hotels')}
            {(mode !== 'hotel' && origin && destination) ? ` (${origin} ➔ ${destination})` : ''}
          </h4>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-0.5 rounded-full">
            {items.length} {lang === 'mr' ? 'पर्याय' : 'Options'}
          </span>
        </div>

        {/* 28-Day On-Demand Cache Status Badge */}
        {isCached ? (
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            <span>28-Day Smart Cached Schedule</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-black px-3 py-1 rounded-full shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Live Travel API</span>
          </div>
        )}
      </div>

      {/* Transport Cards List */}
      <div className="space-y-3">
        {mode === 'flight' && items.slice(0, visibleCount).map((flight: any, index: number) => {
          const airline = flight.airline || flight.operator_code || flight.operatorCode || flight.provider || (lang === 'mr' ? 'अज्ञात विमान कंपनी' : 'Unknown Airline');
          const flightNo = flight.flightNumber || flight.flight_number || 'N/A';
          const rawDepTime = flight.departureTime || flight.departure_time || flight.time || '00:00';
          const dur = flight.duration || (lang === 'mr' ? '२ तास ३० मि' : '2h 30m');
          
          const rawArrTime = addDurationToTime(rawDepTime, dur);
          
          const depTime = safeFormat12Hour(rawDepTime);
          const arrTime = safeFormat12Hour(rawArrTime);
          const typeStr = flight.type || (flight.stops === 0 ? (lang === 'mr' ? 'विना थांबा' : 'Non-stop') : (lang === 'mr' ? 'थेट विमान' : 'Direct Flight'));

          const srcCode = flight.originCode || flight.from || origin || 'BOM';
          const dstCode = flight.destinationCode || flight.to || destination || 'DEL';
          const srcDet = getFullStationDetails(srcCode);
          const dstDet = getFullStationDetails(dstCode);
          const srcFullName = flight.originFullName || srcDet.fullName;
          const dstFullName = flight.destinationFullName || dstDet.fullName;

          return (
            <div
              key={index}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
                    ✈️
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-base">
                      {airline} <span className="text-slate-400 font-mono text-xs ml-1">({flightNo})</span>
                    </h5>
                    <p className="text-xs font-bold text-slate-500">{lang === 'mr' ? 'नियमित वेळापत्रक' : 'Regular Timetable'}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full border border-blue-100">
                  {typeStr}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-1">
                <div>
                  <span className="font-black text-xl text-slate-900 block">{depTime}</span>
                  <span className="text-xs font-extrabold text-blue-700 uppercase block">{srcCode}</span>
                  <span className="text-[11px] font-bold text-slate-600 leading-tight block mt-0.5 max-w-[150px] line-clamp-2">{srcFullName}</span>
                </div>

                <div className="flex-1 flex flex-col items-center max-w-[160px]">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {dur}
                  </span>
                  <div className="w-full flex items-center gap-1 my-1">
                    <div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
                    <Plane className="w-4 h-4 text-blue-600 rotate-90 shrink-0" />
                    <div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {lang === 'mr' ? 'सत्यपित वेळापत्रक' : 'Verified Schedule'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-black text-xl text-slate-900 block">{arrTime}</span>
                  <span className="text-xs font-extrabold text-emerald-700 uppercase block">{dstCode}</span>
                  <span className="text-[11px] font-bold text-slate-600 leading-tight block mt-0.5 max-w-[150px] line-clamp-2 ml-auto">{dstFullName}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] font-extrabold text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lang === 'mr' ? 'पार्टनर असिस्टन्स' : 'Partner Assistance'}</span>
                </span>
                <div className="flex items-center gap-4">
                  <span className={`font-black text-lg ${
                    (flight.price || 5500) < 4000 ? 'text-emerald-600' :
                    (flight.price || 5500) < 6000 ? 'text-orange-600' : 'text-rose-600'
                  }`}>
                    {currencySymbol}{(flight.price || 5500).toLocaleString('en-IN')}
                  </span>
                  <button
                    className="px-5 py-2.5 bg-[#3399cc] hover:bg-sky-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-sky-500/20 flex items-center gap-1.5 active:scale-95 transition-all inline-flex cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onBookNow) {
                        onBookNow({
                          id: flightNo,
                          title: `${airline} (${flightNo})`,
                          vertical: 'flight',
                          subtitle: `${srcCode} → ${dstCode}`,
                          location: `${srcCode} to ${dstCode}`,
                          time: `${depTime} - ${arrTime}`,
                          duration: dur,
                          amount: flight.price || 5500,
                          provider: airline
                        });
                      }
                    }}
                  >
                    <span>{lang === 'mr' ? 'आत्ताच बुक करा' : 'Book Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {mode === 'hotel' && items.slice(0, visibleCount).map((hotel: any, index: number) => {
          return (
            <div
              key={hotel.id || index}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4"
            >
              <div className="flex items-center gap-4">
                <img src={hotel.image} alt={hotel.name} className="w-24 h-24 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h5 className="font-black text-slate-900 text-base">{hotel.name}</h5>
                  <p className="text-xs font-bold text-slate-500">{hotel.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">⭐ {hotel.rating}</span>
                    <span className="text-xs font-bold text-slate-500">{hotel.reviewsCount} reviews</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-lg text-slate-900 block">{currencySymbol}{hotel.pricePerNight}</span>
                  <span className="text-xs font-bold text-slate-500 block">per night</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex gap-2 flex-wrap">
                  {hotel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                    <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{amenity}</span>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (onBookNow) onBookNow(hotel);
                  }}
                  className="px-5 py-2.5 bg-[#3399cc] hover:bg-sky-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-sky-500/20 flex items-center gap-1.5 active:scale-95 transition-all inline-flex cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'आत्ताच बुक करा' : 'Book Now'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {mode === 'bus' && items.slice(0, visibleCount).map((bus: any, index: number) => {
          const operator = bus.operator_name || bus.operator || bus.operatorName || 'Express Travels';
          const busType = bus.bus_type || bus.busType || 'Volvo AC Sleeper';
          const depTime = safeFormat12Hour(bus.departure_time || bus.departureTime || '08:00 PM');
          const arrTime = safeFormat12Hour(bus.arrival_time || bus.arrivalTime || '06:00 AM');
          const dur = bus.duration || '8h 00m';

          return (
            <div
              key={index}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
                    🚌
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-base">{operator}</h5>
                    <p className="text-xs font-bold text-slate-500">{busType}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-100">
                  {busType}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-1">
                <div>
                  <span className="font-black text-xl text-slate-900 block">{depTime}</span>
                  <span className="text-xs font-extrabold text-slate-500 uppercase">{origin || 'DEP'}</span>
                </div>

                <div className="flex-1 flex flex-col items-center max-w-[160px]">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {dur}
                  </span>
                  <div className="w-full flex items-center gap-1 my-1">
                    <div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
                    <Bus className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Direct Service
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-black text-xl text-slate-900 block">{arrTime}</span>
                  <span className="text-xs font-extrabold text-slate-500 uppercase">{destination || 'ARR'}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] font-extrabold text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lang === 'mr' ? 'सुरक्षित बुकिंग' : 'Secure Checkout'}</span>
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (onBookNow) {
                      onBookNow({
                        id: `BUS-${Math.random().toString(36).substr(2, 9)}`,
                        title: `${operator} (${busType})`,
                        vertical: 'bus',
                        subtitle: `${origin || 'DEP'} → ${destination || 'ARR'}`,
                        location: `${origin || 'DEP'} to ${destination || 'ARR'}`,
                        time: `${depTime} - ${arrTime}`,
                        duration: dur,
                        amount: 1200, // Dummy fallback price
                        provider: operator
                      });
                    }
                  }}
                  className="px-5 py-2.5 bg-[#3399cc] hover:bg-sky-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-sky-500/20 flex items-center gap-1.5 active:scale-95 transition-all inline-flex cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'आत्ताच बुक करा' : 'Book Now'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {mode === 'train' && items.slice(0, visibleCount).map((train: any, index: number) => {
          const name = train.train_name || train.name || train.trainName || 'Express Train';
          const trainNum = train.train_number || train.number || train.trainNumber || '12345';
          const depTime = safeFormat12Hour(train.departure_time || train.depTime || '06:00 AM');
          const arrTime = safeFormat12Hour(train.arrival_time || train.arrTime || '02:00 PM');
          const travelTime = train.travel_time || train.duration || '8h 00m';
          const trainType = train.type || train.train_type || 'Superfast Express';

          const srcCode = train.originCode || train.from_station || train.origin || train.from || origin || 'DEP';
          const dstCode = train.destinationCode || train.to_station || train.destination || train.to || destination || 'ARR';

          const srcDet = getFullStationDetails(srcCode);
          const dstDet = getFullStationDetails(dstCode);

          const srcFullName = train.originFullName || srcDet.fullName;
          const dstFullName = train.destinationFullName || dstDet.fullName;

          return (
            <div
              key={index}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black text-sm">
                    🚆
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono font-black text-xs">
                        #{trainNum}
                      </span>
                      <h5 className="font-black text-slate-900 text-base">{name}</h5>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{trainType}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-black rounded-full border border-amber-200">
                  {trainType}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-1">
                <div>
                  <span className="font-black text-xl text-slate-900 block">{depTime}</span>
                  <span className="text-xs font-extrabold text-amber-700 uppercase block">{srcCode}</span>
                  <span className="text-[11px] font-bold text-slate-600 leading-tight block mt-0.5 max-w-[150px] line-clamp-2">{srcFullName}</span>
                </div>

                <div className="flex-1 flex flex-col items-center max-w-[160px]">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {travelTime}
                  </span>
                  <div className="w-full flex items-center gap-1 my-1">
                    <div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
                    <Train className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Daily Service
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-black text-xl text-slate-900 block">{arrTime}</span>
                  <span className="text-xs font-extrabold text-amber-700 uppercase block">{dstCode}</span>
                  <span className="text-[11px] font-bold text-slate-600 leading-tight block mt-0.5 max-w-[150px] line-clamp-2 ml-auto">{dstFullName}</span>
                </div>
              </div>

              {/* Accommodation & Classes Badge Bar */}
              {(train.accommodationTypes || train.accommodation || (train.classes && train.classes.length > 0)) && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {lang === 'mr' ? 'उपलब्ध वर्ग (Classes):' : 'Classes:'}
                  </span>
                  {Array.isArray(train.accommodationTypes) && train.accommodationTypes.length > 0 ? (
                    train.accommodationTypes.map((accType: string, aIdx: number) => (
                      <span
                        key={aIdx}
                        className="px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-bold shadow-2xs"
                      >
                        {accType}
                      </span>
                    ))
                  ) : train.accommodation ? (
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-bold shadow-2xs">
                      {train.accommodation}
                    </span>
                  ) : Array.isArray(train.classes) ? (
                    train.classes.map((cls: any, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-bold shadow-2xs"
                      >
                        {cls.code || cls.name}
                      </span>
                    ))
                  ) : null}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] font-extrabold text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lang === 'mr' ? 'सुरक्षित बुकिंग' : 'Secure Checkout'}</span>
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (onBookNow) {
                      onBookNow({
                        id: trainNum,
                        title: `${name} (#${trainNum})`,
                        vertical: 'train',
                        subtitle: `${srcCode} → ${dstCode}`,
                        location: `${srcCode} - ${dstCode}`,
                        time: `${depTime} - ${arrTime}`,
                        duration: travelTime,
                        amount: 850, // Dummy fallback price
                        provider: 'Indian Railways'
                      });
                    }
                  }}
                  className="px-5 py-2.5 bg-[#3399cc] hover:bg-sky-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-sky-500/20 flex items-center gap-1.5 active:scale-95 transition-all inline-flex cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'आत्ताच बुक करा' : 'Book Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controller */}
      {items.length > visibleCount && (
        <div className="pt-4 text-center space-y-2">
          <p className="text-xs font-extrabold text-slate-500">
            {lang === 'mr' 
              ? `एकूण ${items.length} पैकी ${Math.min(visibleCount, items.length)} पर्याय दाखवत आहे`
              : `Showing ${Math.min(visibleCount, items.length)} of ${items.length} options`}
          </p>
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-slate-900/20 transition-all active:scale-95"
          >
            {lang === 'mr' ? 'अधिक पर्याय लोड करा (Load More)' : 'Load More Options'}
          </button>
        </div>
      )}
    </div>
  );
};
