import React from 'react';
import { Plane, Clock, Lock, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCurrency } from './useCurrency';
import { getAirlineFareTiers } from '../../utils/airlineFareBrands';
import { ALL_AIRPORTS } from '../../data/airports';

export interface FlightCardProps {
  flight: any;
  minPrice?: number | null;
  currency?: string | null;
  onBookNow: () => void;
}

// Build airport code lookup dictionary
const AIRPORT_MAP: Record<string, { city: string; airport: string }> = {};
ALL_AIRPORTS.forEach(a => {
  if (a.code) {
    AIRPORT_MAP[a.code.trim().toUpperCase()] = { city: a.city, airport: a.airport };
  }
});

const getAirportInfo = (code: string, fallbackName?: string, fallbackCity?: string) => {
  if (!code) return { code: '---', city: fallbackCity || 'Unknown City', airport: fallbackName || 'Airport' };
  const cleanCode = code.trim().toUpperCase();
  const found = AIRPORT_MAP[cleanCode];
  if (found) {
    return {
      code: cleanCode,
      city: found.city,
      airport: found.airport
    };
  }
  return {
    code: cleanCode,
    city: fallbackCity || cleanCode,
    airport: fallbackName || `${cleanCode} Airport`
  };
};

const AIRLINE_LOGOS: Record<string, string> = {
  '6E': 'https://images.kiwi.com/airlines/64/6E.png',
  'AI': 'https://images.kiwi.com/airlines/64/AI.png',
  'UK': 'https://images.kiwi.com/airlines/64/UK.png',
  'SG': 'https://images.kiwi.com/airlines/64/SG.png',
  'QP': 'https://images.kiwi.com/airlines/64/QP.png',
  'I5': 'https://images.kiwi.com/airlines/64/I5.png',
  'IX': 'https://images.kiwi.com/airlines/64/IX.png',
  'S5': 'https://images.kiwi.com/airlines/64/S5.png',
  'EK': 'https://images.kiwi.com/airlines/64/EK.png',
  'QR': 'https://images.kiwi.com/airlines/64/QR.png',
  'EY': 'https://images.kiwi.com/airlines/64/EY.png',
  'SQ': 'https://images.kiwi.com/airlines/64/SQ.png',
  'LH': 'https://images.kiwi.com/airlines/64/LH.png',
  'BA': 'https://images.kiwi.com/airlines/64/BA.png',
  'AA': 'https://images.kiwi.com/airlines/64/AA.png',
  'DL': 'https://images.kiwi.com/airlines/64/DL.png',
  'UA': 'https://images.kiwi.com/airlines/64/UA.png',
  'CX': 'https://images.kiwi.com/airlines/64/CX.png',
  'MH': 'https://images.kiwi.com/airlines/64/MH.png',
  'TG': 'https://images.kiwi.com/airlines/64/TG.png',
  'IndiGo': 'https://images.kiwi.com/airlines/64/6E.png',
  'Air India': 'https://images.kiwi.com/airlines/64/AI.png',
  'Vistara': 'https://images.kiwi.com/airlines/64/UK.png',
  'SpiceJet': 'https://images.kiwi.com/airlines/64/SG.png',
  'Akasa Air': 'https://images.kiwi.com/airlines/64/QP.png',
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '09:00';
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } catch {}
  }
  return timeStr;
};

const formatDuration = (dur: string) => {
  if (!dur) return '02h 15m';
  if (dur.includes('PT')) {
    const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
    if (match) {
      const h = match[1] ? `${match[1].padStart(2, '0')}h` : '00h';
      const m = match[2] ? `${match[2].padStart(2, '0')}m` : '00m';
      return `${h} ${m}`;
    }
  }
  if (/^\d+h\s*\d+m$/i.test(dur.trim())) return dur;
  if (/^\d+\s*h/i.test(dur)) return dur;
  return dur;
};

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  minPrice,
  currency,
  onBookNow
}) => {
  const { formatPrice } = useCurrency();

  // Normalize flight structure to handle both Duffel and Travelport API offers
  const normalizedSlices = React.useMemo(() => {
    if (Array.isArray(flight?.slices) && flight.slices.length > 0) {
      return flight.slices;
    }

    const originCode = flight?.origin || flight?.originCode || 'BOM';
    const destCode = flight?.destination || flight?.destinationCode || 'DEL';
    const depTime = flight?.departureTime || flight?.departing_at || '09:00';
    const arrTime = flight?.arrivalTime || flight?.arriving_at || '11:20';
    const airlineName = flight?.airline || flight?.owner?.name || 'IndiGo';
    const airlineCode = flight?.airlineCode || flight?.owner?.iata_code || (
      airlineName.toLowerCase().includes('air india') ? 'AI' :
      airlineName.toLowerCase().includes('vistara') ? 'UK' :
      airlineName.toLowerCase().includes('spicejet') ? 'SG' :
      airlineName.toLowerCase().includes('akasa') ? 'QP' : '6E'
    );
    const flightNum = flight?.flightNumber || `${airlineCode}-6636`;
    const durationStr = flight?.duration || '02h 20m';
    const stopsCount = typeof flight?.stops === 'number' ? flight.stops : 0;
    const logoUrl = flight?.logo || AIRLINE_LOGOS[airlineCode] || AIRLINE_LOGOS[airlineName] || `https://images.kiwi.com/airlines/64/${airlineCode}.png`;

    return [
      {
        id: flight?.id || 'slice_1',
        duration: durationStr,
        stops: stopsCount,
        segments: [
          {
            departing_at: depTime,
            arriving_at: arrTime,
            origin: {
              iata_code: originCode,
              name: flight?.originFullName,
              city_name: flight?.originCity
            },
            destination: {
              iata_code: destCode,
              name: flight?.destinationFullName,
              city_name: flight?.destinationCity
            },
            marketing_carrier: {
              name: airlineName,
              iata_code: airlineCode,
              logo_symbol_url: logoUrl
            },
            marketing_carrier_flight_number: flightNum.includes('-') ? flightNum.split('-')[1] : flightNum.replace(/^[A-Z0-9]+/, '')
          }
        ]
      }
    ];
  }, [flight]);

  // Unified price computation
  const displayPrice = React.useMemo(() => {
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice) && minPrice > 0) {
      return minPrice;
    }
    if (typeof flight?.price === 'number' && !isNaN(flight.price) && flight.price > 0) {
      return flight.price;
    }
    if (flight?.price && !isNaN(parseFloat(flight.price)) && parseFloat(flight.price) > 0) {
      return parseFloat(flight.price);
    }
    const topLevelPrice = parseFloat(flight?.total_amount);
    if (!isNaN(topLevelPrice) && isFinite(topLevelPrice) && topLevelPrice > 0) {
      return topLevelPrice;
    }
    const offers = flight?.offers || [];
    const offerPrices = offers
      .map((o: any) => parseFloat(o.total_amount || o.price))
      .filter((p: number) => !isNaN(p) && isFinite(p) && p > 0);
    if (offerPrices.length > 0) {
      return Math.min(...offerPrices);
    }
    return 5600;
  }, [minPrice, flight]);

  const displayCurrency = currency || flight?.currency || flight?.total_currency || 'INR';
  const providerName = flight?.provider || (flight?.sourceType ? `Travelport ${flight.sourceType}` : 'Travelport GDS');
  const isRefundable = flight?.refundable !== false;

  const carrierName = flight?.airline || flight?.owner?.name || normalizedSlices[0]?.segments[0]?.marketing_carrier?.name || 'IndiGo';
  const brandedTiers = React.useMemo(() => {
    return getAirlineFareTiers(carrierName, displayPrice);
  }, [carrierName, displayPrice]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden font-[Inter] mb-3">
      
      {/* Top Banner Offer Callout (EaseMyTrip Style) */}
      <div className="bg-amber-50/90 border-b border-amber-100/80 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-bold text-amber-900 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="bg-amber-200/60 text-amber-900 text-[10px] uppercase font-black px-1.5 py-0.5 rounded tracking-wide">
            OFFER
          </span>
          <span className="truncate">
            BOOKNOW: Get extra ₹220 instant discount on this flight
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1 bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            {providerName} Verified
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Slices Column */}
        <div className="flex-1 space-y-4">
          {normalizedSlices.map((slice: any, sliceIdx: number) => {
            const segments: any[] = slice?.segments || [];
            if (segments.length === 0) return null;

            const firstSeg = segments[0];
            const lastSeg = segments[segments.length - 1] || firstSeg;

            const originCode = firstSeg.origin?.iata_code || flight?.origin || 'BOM';
            const originInfo = getAirportInfo(originCode, firstSeg.origin?.name, firstSeg.origin?.city_name);
            
            const destCode = lastSeg.destination?.iata_code || flight?.destination || 'DEL';
            const destInfo = getAirportInfo(destCode, lastSeg.destination?.name, lastSeg.destination?.city_name);

            const carrier = firstSeg.marketing_carrier || {};
            const carrierCode = carrier.iata_code || flight?.airlineCode || '6E';
            const carrierName = carrier.name || flight?.airline || 'Airline';
            const logoUrl = carrier.logo_symbol_url || AIRLINE_LOGOS[carrierCode] || AIRLINE_LOGOS[carrierName] || `https://images.kiwi.com/airlines/64/${carrierCode}.png`;
            
            const flightCodeNum = firstSeg.marketing_carrier_flight_number || (flight?.flightNumber ? flight.flightNumber.replace(/^[A-Z0-9]+[- ]?/, '') : '6636');
            const fullFlightCode = `${carrierCode}-${flightCodeNum}`;

            const depTime = formatTime(firstSeg.departing_at || flight?.departureTime);
            const arrTime = formatTime(lastSeg.arriving_at || flight?.arrivalTime);
            const durText = formatDuration(slice.duration || flight?.duration);
            const stops = typeof slice.stops === 'number' ? slice.stops : Math.max(0, segments.length - 1);

            return (
              <div key={slice.id || sliceIdx} className="flex flex-col sm:flex-row items-center gap-4 w-full">
                
                {/* Airline Logo & Name */}
                <div className="flex items-center gap-3 w-full sm:w-44 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img 
                      src={logoUrl} 
                      alt={carrierName} 
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.kiwi.com/airlines/64/${carrierCode}.png`;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">
                      {carrierName}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <span>{fullFlightCode}</span>
                    </p>
                  </div>
                </div>

                {/* Departure - Timeline - Arrival */}
                <div className="flex-1 flex items-center justify-between w-full gap-2">
                  
                  {/* Origin Departure */}
                  <div className="text-left shrink-0 min-w-[90px]">
                    <div className="text-2xl font-black text-slate-900 leading-tight">
                      {depTime}
                    </div>
                    <div className="text-xs font-black text-slate-800 tracking-wider">
                      {originInfo.code}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 truncate max-w-[120px]" title={`${originInfo.city} - ${originInfo.airport}`}>
                      {originInfo.city}
                    </div>
                  </div>

                  {/* Flight Duration Graphic */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{durText}</span>
                    </div>

                    <div className="w-full max-w-[180px] relative flex items-center justify-center">
                      <div className="h-[2px] bg-slate-200 w-full absolute top-1/2"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600 absolute left-0 top-1/2 -translate-y-1/2"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600 absolute right-0 top-1/2 -translate-y-1/2"></div>
                      <div className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-slate-700 z-10 shadow-2xs">
                        {stops === 0 ? (
                          <span className="text-emerald-700 font-black">Non-stop</span>
                        ) : (
                          <span className="text-amber-700">{stops} Stop{stops > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Destination Arrival */}
                  <div className="text-right shrink-0 min-w-[90px]">
                    <div className="text-2xl font-black text-slate-900 leading-tight">
                      {arrTime}
                    </div>
                    <div className="text-xs font-black text-slate-800 tracking-wider">
                      {destInfo.code}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 truncate max-w-[120px]" title={`${destInfo.city} - ${destInfo.airport}`}>
                      {destInfo.city}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Price & Action Column */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
          <div className="text-left md:text-right">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatPrice(displayPrice, displayCurrency)}
            </div>
            <div className="text-[10px] font-bold text-slate-400">
              per adult (incl. taxes)
            </div>
          </div>

          <button
            type="button"
            onClick={onBookNow}
            className="bg-gradient-to-r from-orange-500 via-rose-600 to-pink-600 hover:brightness-105 active:scale-95 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            Book Now
          </button>
        </div>

      </div>

      {/* Branded Fare Options Row (Air India, IndiGo, Vistara, etc.) */}
      <div className="bg-slate-50/60 border-t border-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Fare Options:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {brandedTiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={onBookNow}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                tier.badge
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{tier.label}</span>
              <span className="font-extrabold text-slate-900">{formatPrice(tier.pricePerAdult, displayCurrency)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Perks Row (EaseMyTrip Style) */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-600 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
            ✨ ₹0 Convenience Fee
          </span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            🧳 7 kg Cabin
          </span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            🧳 15 kg Check-in
          </span>
          {isRefundable ? (
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Refundable
            </span>
          ) : (
            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Non-Refundable
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-rose-600 font-extrabold hover:underline cursor-pointer">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>Lock Price @ ₹489 →</span>
        </div>
      </div>

    </div>
  );
};

export default FlightCard;
