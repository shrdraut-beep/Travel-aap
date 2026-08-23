import React from 'react';
import { Plane, Clock } from 'lucide-react';
import { useCurrency } from '../booking/useCurrency';

export interface FlightCardProps {
  flight: any;
  minPrice?: number | null;
  currency?: string | null;
  onBookNow: () => void;
}

const formatTime = (isoString: string) => {
  if (!isoString) return '--:--';
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '--:--';
  }
};

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
};

const parseDuration = (ptDuration: string) => {
  if (!ptDuration) return '';
  const match = ptDuration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return ptDuration;
  const h = match[1] ? match[1].toLowerCase().replace('h', 'h ') : '';
  const m = match[2] ? match[2].toLowerCase() : '';
  return (h + m).trim();
};

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  minPrice,
  currency,
  onBookNow
}) => {
  const { formatPrice } = useCurrency();
  const slices: any[] = flight?.slices || [];
  const carrier = flight?.owner || {};

  // Extract display total amount
  const displayPrice = React.useMemo(() => {
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      return minPrice;
    }
    const topLevelPrice = parseFloat(flight?.total_amount);
    if (!isNaN(topLevelPrice) && isFinite(topLevelPrice)) {
      return topLevelPrice;
    }
    const offers = flight?.offers || [];
    const offerPrices = offers
      .map((o: any) => parseFloat(o.total_amount))
      .filter((p: number) => !isNaN(p) && isFinite(p));
    if (offerPrices.length > 0) {
      return Math.min(...offerPrices);
    }
    return null;
  }, [minPrice, flight]);

  const displayCurrency = currency || flight?.total_currency || flight?.offers?.[0]?.total_currency || 'INR';

  return (
    <div className="bg-[#FAFAFA] border border-slate-200/90 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-4 items-stretch md:items-center font-[Inter]">
      
      {/* Slices Container: Maps over each slice (Outbound, Return, Multi-City legs) */}
      <div className="flex-1 w-full space-y-3">
        {slices.map((slice: any, sliceIdx: number) => {
          const segments: any[] = slice?.segments || [];
          if (segments.length === 0) return null;

          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1] || firstSegment;

          const departTime = formatTime(firstSegment.departing_at);
          const arriveTime = formatTime(lastSegment.arriving_at);
          const departDateStr = formatDate(firstSegment.departing_at);
          
          const originCode = firstSegment.origin?.iata_code || firstSegment.origin?.name || '---';
          const originCity = firstSegment.origin?.city_name || firstSegment.origin?.name || originCode;
          const destCode = lastSegment.destination?.iata_code || lastSegment.destination?.name || '---';
          const destCity = lastSegment.destination?.city_name || lastSegment.destination?.name || destCode;

          const segmentCarrier = firstSegment.marketing_carrier || carrier;
          const airlineLogo = segmentCarrier?.logo_symbol_url || carrier?.logo_symbol_url;
          const airlineName = segmentCarrier?.name || carrier?.name || 'Airline';
          const flightNum = firstSegment.marketing_carrier_flight_number 
            ? `${segmentCarrier?.iata_code || ''} ${firstSegment.marketing_carrier_flight_number}`.trim()
            : '';

          const duration = parseDuration(slice.duration);
          const stops = segments.length - 1;

          // Slice Label for multi-slice journeys
          const sliceLabel = slices.length > 1 
            ? (sliceIdx === 0 ? 'Outbound Flight' : sliceIdx === 1 ? 'Return Flight' : `Flight ${sliceIdx + 1}`)
            : null;

          return (
            <React.Fragment key={slice.id || sliceIdx}>
              {/* Divider between slices for Round-Trip / Multi-City */}
              {sliceIdx > 0 && (
                <div className="pt-2">
                  <hr className="border-dashed border-slate-200 my-1" />
                </div>
              )}

              <div className="space-y-1">
                {/* Slice Type Badge if Round-Trip or Multi-Slice */}
                {sliceLabel && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                      {sliceLabel}
                    </span>
                    {departDateStr && (
                      <span className="text-[11px] font-bold text-slate-500">
                        {departDateStr}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  {/* Airline Info */}
                  <div className="flex items-center gap-2.5 w-full sm:w-36 flex-shrink-0">
                    {airlineLogo ? (
                      <img 
                        src={airlineLogo} 
                        alt={airlineName} 
                        className="w-8 h-8 object-contain rounded-md bg-slate-50 p-1 border border-slate-100" 
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                        <Plane className="w-4 h-4" />
                      </div>
                    )}
                    <div className="truncate">
                      <span className="text-sm font-bold text-slate-800 truncate block">
                        {airlineName}
                      </span>
                      {flightNum && (
                        <span className="text-xs text-slate-500 font-semibold block">
                          {flightNum}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flight Timing & Stops Strip */}
                  <div className="flex-1 flex items-center justify-between w-full gap-2">
                    {/* Origin & Depart Time */}
                    <div className="text-left flex-shrink-0 w-24">
                      <div className="text-xl font-black text-slate-900 leading-tight">
                        {departTime}
                      </div>
                      <div className="text-xs font-bold text-slate-700 truncate">
                        {originCode}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {originCity}
                      </div>
                    </div>

                    {/* Flight Path Graphic & Duration */}
                    <div className="flex-1 flex flex-col items-center px-2">
                      <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{duration || 'Direct'}</span>
                      </div>
                      <div className="w-full relative flex items-center justify-center">
                        <div className="h-px bg-slate-300 w-full absolute top-1/2"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 absolute left-0 top-1/2 -translate-y-1/2"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 absolute right-0 top-1/2 -translate-y-1/2"></div>
                        <div className="bg-white px-2 py-0.5 z-10 text-[10px] font-bold text-slate-600 border border-slate-200 rounded-full shadow-2xs">
                          {stops === 0 ? 'Non-Stop' : `${stops} Stop${stops > 1 ? 's' : ''} ${firstSegment.destination?.iata_code ? `via ${firstSegment.destination.iata_code}` : ''}`}
                        </div>
                      </div>
                    </div>

                    {/* Destination & Arrive Time */}
                    <div className="text-right flex-shrink-0 w-24">
                      <div className="text-xl font-black text-slate-900 leading-tight">
                        {arriveTime}
                      </div>
                      <div className="text-xs font-bold text-slate-700 truncate">
                        {destCode}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {destCity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Perks & Baggage Tags Row */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-600">
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
            <span>✨ ₹0 Convenience Fee</span>
          </span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
            🧳 7 kg Cabin
          </span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
            🧳 15 kg Check-in
          </span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">
            🛡️ Refundable Options
          </span>
        </div>
      </div>

      {/* Unified Price & Book Now Action for the whole trip */}
      <div className="w-full md:w-44 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {slices.length > 1 ? 'Total Trip Fare' : 'Starts from'}
        </span>
        <span className="text-2xl font-black text-slate-900 mb-2">
          {displayPrice !== null ? formatPrice(displayPrice, displayCurrency) : 'Price on request'}
        </span>
        <button
          type="button"
          onClick={onBookNow}
          className="w-full bg-[#e11d48] hover:bg-[#be123c] active:scale-98 text-white font-extrabold py-2.5 px-4 rounded-xl transition-all text-xs shadow-md shadow-[#e11d48]/20 cursor-pointer"
        >
          Book Now
        </button>
      </div>

    </div>
  );
};

export default FlightCard;
