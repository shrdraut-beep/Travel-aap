import React from 'react';
import { Plane, Clock, Lock, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCurrency } from './useCurrency';
import { getAirlineFareTiers } from '../../utils/airlineFareBrands';
import { ALL_AIRPORTS } from '../../data/airports';

export interface FlightCardProps {
  flight: any;
  passengerCount?: number;
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
  passengerCount,
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
    <div className="bg-white rounded-3xl shadow-[0_12px_35px_-15px_rgba(40,32,79,0.15)] hover:shadow-[0_20px_45px_-15px_rgba(40,32,79,0.22)] border border-slate-200/80 transition-all duration-300 overflow-hidden mb-4 group">
      
      {/* Main Ticket Area */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
        
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
              <div key={slice.id || sliceIdx} className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  
                {/* Airline Logo & Name */}
                <div className="flex items-center gap-2 w-full sm:w-32 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <img 
                      src={logoUrl} 
                      alt={carrierName} 
                      className="w-full h-full object-contain rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.kiwi.com/airlines/64/${carrierCode}.png`;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-black text-slate-900 truncate">
                      {carrierName}
                    </h4>
                    <p className="text-[10px] font-bold text-premium-violet flex items-center gap-1">
                      <span>{fullFlightCode}</span>
                    </p>
                  </div>
                </div>

                {/* Departure - Timeline - Arrival */}
                <div className="flex-1 flex items-center justify-between w-full gap-2 px-1">
                     
                  {/* Origin Departure */}
                  <div className="text-left shrink-0 min-w-[70px]">
                    <div className="text-lg font-black text-slate-900 leading-none">
                      {depTime}
                    </div>
                    <div className="text-[10px] font-black text-premium-violet tracking-wider flex items-center gap-1 mt-0.5">
                      <span>{originInfo.code}</span>
                      {(flight?.departureTerminal || firstSeg.origin?.terminal) && (
                        <span className="text-[8px] font-bold text-slate-600 bg-slate-100 px-1 rounded border border-slate-200">
                          {flight?.departureTerminal || firstSeg.origin?.terminal}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flight Duration Graphic */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <div className="text-[9px] font-bold text-slate-500 mb-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      <span>{durText}</span>
                    </div>

                    <div className="w-full max-w-[140px] relative flex items-center justify-center">
                      <div className="h-[2px] bg-gradient-to-r from-sky-400 via-pink-500 to-pink-400 w-full absolute top-1/2"></div>
                      <div className="w-2 h-2 rounded-full bg-pink-500 absolute left-0 top-1/2 -translate-y-1/2 shadow-xs"></div>
                      <div className="w-2 h-2 rounded-full bg-pink-500 absolute right-0 top-1/2 -translate-y-1/2 shadow-xs"></div>
                      <div className="bg-white border border-premium-violet px-2 py-0.5 rounded-full text-[9px] font-black text-premium-violet z-10 shadow-xs">
                        {stops === 0 ? (
                          <span className="text-premium-sky-deep font-black">Non-stop</span>
                        ) : (
                          <span className="text-premium-pink font-bold">
                            {flight?.layoverInfo || `${stops} Stop${stops > 1 ? 's' : ''}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Destination Arrival */}
                  <div className="text-right shrink-0 min-w-[70px]">
                    <div className="text-lg font-black text-slate-900 leading-none">
                      {arrTime}
                    </div>
                    <div className="text-[10px] font-black text-premium-violet tracking-wider flex items-center justify-end gap-1 mt-0.5">
                      {(flight?.arrivalTerminal || lastSeg.destination?.terminal) && (
                        <span className="text-[8px] font-bold text-slate-600 bg-slate-100 px-1 rounded border border-slate-200">
                          {flight?.arrivalTerminal || lastSeg.destination?.terminal}
                        </span>
                      )}
                      <span>{destInfo.code}</span>
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
              per adult (all taxes incl.)
            </div>
            {passengerCount && passengerCount > 1 && (
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {formatPrice(displayPrice * passengerCount, displayCurrency)} total ({passengerCount} travelers)
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onBookNow}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-95 active:scale-95 text-white font-black py-2.5 px-6 rounded-full text-xs shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] shadow-rose-500/25 transition-all cursor-pointer"
          >
            Book Flight
          </button>
        </div>

      </div>

      {/* Branded Fare Options Row */}
      <div className="bg-slate-50/70 border-t border-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
          <span>Fares:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {brandedTiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={onBookNow}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                tier.badge
                  ? 'bg-violet-50 text-rose-700 border-rose-300 hover:bg-rose-100 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{tier.label}</span>
              <span className="font-extrabold text-slate-900">{formatPrice(tier.pricePerAdult, displayCurrency)}</span>
              {tier.cancellationSummary && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                  {tier.cancellationSummary.replace('Cancellation: ', 'Cancel: ')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Perks Row */}
      <div className="bg-white border-t border-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-600 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Cancellation Charges */}
          {flight?.cancellationFee !== undefined ? (
            flight.cancellationFee === 0 ? (
              <span className="text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3 text-pink-600" />
                Zero Cancellation Fee
              </span>
            ) : (
              <span className="text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold flex items-center gap-1">
                <span>🔄 Cancel: ₹{flight.cancellationFee.toLocaleString('en-IN')}</span>
              </span>
            )
          ) : isRefundable ? (
            <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-rose-600" />
              Refundable (₹2,500 Fee)
            </span>
          ) : (
            <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 font-bold">
              Non-refundable
            </span>
          )}

          {/* Date Change Fee */}
          <span className="text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold">
            📅 Change: ₹{(flight?.dateChangeFee ?? 1500).toLocaleString('en-IN')}
          </span>

          {/* Baggage Allowance */}
          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold">
            🧳 {flight?.baggageAllowance || flight?.baggage || "7kg Cabin + 15kg Check-in"}
          </span>

          {/* Seat Selection */}
          <span className="bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200 font-bold">
            💺 Seats from ₹{flight?.seatFeeStarting || 150}
          </span>

          {/* Meals */}
          <span className="text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            🍱 {flight?.mealPolicy || "Meals & Snacks"}
          </span>

          {flight?.cabinClass && (
            <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold">
              {flight.cabinClass}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-rose-600 font-extrabold hover:underline cursor-pointer text-xs">
          <Lock className="w-3.5 h-3.5 text-rose-600" />
          <span>Lock Price @ ₹399</span>
        </div>
      </div>

    </div>
  );
};

export default FlightCard;
