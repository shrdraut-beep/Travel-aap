import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { BookingFunnelLayout, MultiCityLeg } from './BookingFunnelLayout';
import { TransportOptions } from './TransportOptions';
import { SearchResultsToolbar } from './SearchResultsToolbar';

const getTomorrowDate = (daysAhead: number = 1) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const CABIN_CLASSES = ['economy', 'premium', 'business', 'first'];

const departureMinutes = (flight: any) => {
  const t = flight?.departureTime || flight?.departure_time || '';
  const match = t.match(/(\d+):(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

const durationMinutes = (flight: any) => {
  const d = flight?.duration || '';
  const h = d.match(/(\d+)h/);
  const m = d.match(/(\d+)m/);
  return (h ? parseInt(h[1], 10) : 0) * 60 + (m ? parseInt(m[1], 10) : 0);
};

export const FlightSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const navigate = useNavigate();
  const isMr = lang === 'mr';

  const [origin, setOrigin] = useState('BOM');
  const [destination, setDestination] = useState('DEL');
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip' | 'multicity'>('oneway');
  const [departDate, setDepartDate] = useState(getTomorrowDate(1));
  const [returnDate, setReturnDate] = useState(getTomorrowDate(4));
  const [multiCitySlices, setMultiCitySlices] = useState<MultiCityLeg[]>([
    { id: '1', origin: 'DEL', destination: 'BOM', date: getTomorrowDate(1) },
    { id: '2', origin: 'BOM', destination: 'BLR', date: getTomorrowDate(3) }
  ]);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('economy');

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [flightData, setFlightData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('price');
  const [nonStopOnly, setNonStopOnly] = useState(false);

  const visibleFlights = React.useMemo(() => {
    const list = nonStopOnly
      ? flightData.filter(f => (f.stops ?? 0) === 0)
      : flightData;

    return [...list].sort((a, b) => {
      if (sortBy === 'departure') return departureMinutes(a) - departureMinutes(b);
      if (sortBy === 'duration') return durationMinutes(a) - durationMinutes(b);
      return (a.price || 0) - (b.price || 0);
    });
  }, [flightData, sortBy, nonStopOnly]);

  const handleFlightSearch = async () => {
    if (tripType === 'oneway') {
      if (origin.toUpperCase() === destination.toUpperCase()) {
        alert(isMr ? "प्रस्थान आणि गंतव्य शहर एकच असू शकत नाही." : "Origin and destination cannot be the same.");
        return;
      }
    } else if (tripType === 'roundtrip') {
      if (origin.toUpperCase() === destination.toUpperCase()) {
        alert(isMr ? "प्रस्थान आणि गंतव्य शहर एकच असू शकत नाही." : "Origin and destination cannot be the same.");
        return;
      }
      if (returnDate && returnDate < departDate) {
        alert(isMr ? "परतीची तारीख जाण्याच्या तारखेपेक्षा आधी असू शकत नाही." : "Return date cannot be earlier than departure date.");
        return;
      }
    } else if (tripType === 'multicity') {
      for (let i = 0; i < multiCitySlices.length; i++) {
        const leg = multiCitySlices[i];
        if (!leg.origin || !leg.destination) {
          alert(isMr ? `कृपया फ्लाईट ${i + 1} साठी शहरे निवडा.` : `Please select cities for Flight ${i + 1}.`);
          return;
        }
        if (leg.origin.toUpperCase() === leg.destination.toUpperCase()) {
          alert(isMr ? `फ्लाईट ${i + 1} साठी प्रस्थान आणि गंतव्य शहर एकच असू शकत नाही.` : `Origin and destination cannot be identical for Flight ${i + 1}.`);
          return;
        }
      }
    }

    // Prepare slices payload for search
    let formattedSlices: Array<{ origin: string; destination: string; departure_date: string }> = [];
    if (tripType === 'oneway') {
      formattedSlices = [{ origin: origin.trim().toUpperCase(), destination: destination.trim().toUpperCase(), departure_date: departDate }];
    } else if (tripType === 'roundtrip') {
      formattedSlices = [
        { origin: origin.trim().toUpperCase(), destination: destination.trim().toUpperCase(), departure_date: departDate },
        { origin: destination.trim().toUpperCase(), destination: origin.trim().toUpperCase(), departure_date: returnDate || getTomorrowDate(4) }
      ];
    } else {
      formattedSlices = multiCitySlices.map(s => ({
        origin: s.origin.trim().toUpperCase(),
        destination: s.destination.trim().toUpperCase(),
        departure_date: s.date
      }));
    }

    const searchParams = {
      tripType: tripType === 'oneway' ? 'oneWay' : tripType === 'roundtrip' ? 'roundTrip' : 'multiCity',
      origin,
      destination,
      departDate,
      returnDate: tripType === 'roundtrip' ? returnDate : undefined,
      slices: formattedSlices,
      adults,
      children,
      infants,
      cabinClass
    };

    // If navigate to results page is preferred
    navigate('/flights/results', {
      state: { searchParams }
    });
  };

  const renderStepper = (
    label: string,
    hint: string,
    value: number,
    onChange: (next: number) => void,
    min: number,
    max: number
  ) => (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-bold text-slate-800">{label}</h4>
        <p className="text-[10px] text-slate-500">{hint}</p>
      </div>
      <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          <Minus className="w-4 h-4"/>
        </button>
        <span className="font-black text-slate-900 w-4 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      {renderStepper(isMr ? 'प्रौढ (Adults)' : 'Adults', isMr ? '१२+ वर्षे (कमाल ९)' : '12+ years (Max 9 per booking)', adults, (next) => {
        setAdults(next);
        if (infants > next) setInfants(next);
      }, 1, 9)}

      {renderStepper(isMr ? 'मुले (Children)' : 'Children', isMr ? '२-११ वर्षे' : '2-11 years', children, setChildren, 0, 8)}

      {renderStepper(isMr ? 'लहान बाळे (Infants)' : 'Infants', isMr ? '२ वर्षांखालील' : 'Under 2 years (one per adult)', infants, setInfants, 0, adults)}

      {adults >= 9 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 leading-snug">
          ⚠️ {isMr ? 'विमान नियम: एका बुकिंगमध्ये कमाल ९ प्रवाशांना परवानगी आहे.' : 'Airline Rule: Maximum 9 passengers allowed per standard booking. For more than 9 passengers, please make a Group Booking.'}
        </div>
      )}

      <div>
        <h4 className="font-bold text-slate-800 mb-3">{isMr ? 'केबिन क्लास' : 'Cabin Class'}</h4>
        <div className="grid grid-cols-4 gap-2">
          {CABIN_CLASSES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCabinClass(c)}
              className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${cabinClass === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const totalTravellers = adults + children + infants;
  const passengerSummary = isMr
    ? `${totalTravellers} प्रवासी, ${cabinClass}`
    : `${totalTravellers} Traveller${totalTravellers > 1 ? 's' : ''}, ${cabinClass}`;

  return (
    <BookingFunnelLayout
      mode="flight"
      onBack={onBack}
      origin={origin}
      setOrigin={setOrigin}
      destination={destination}
      setDestination={setDestination}
      date={departDate}
      setDate={setDepartDate}
      returnDate={returnDate}
      setReturnDate={setReturnDate}
      multiCitySlices={multiCitySlices}
      setMultiCitySlices={setMultiCitySlices}
      tripType={tripType}
      setTripType={setTripType}
      onSearch={handleFlightSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={passengerSummary}
      renderPassengerSelector={renderPassengerSelector}
      renderResultsToolbar={() => (
        <SearchResultsToolbar
          lang={lang}
          activeSort={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { key: 'price', label: isMr ? 'कमी दर' : 'Cheapest' },
            { key: 'duration', label: isMr ? 'कमी वेळ' : 'Fastest' },
            { key: 'departure', label: isMr ? 'प्रस्थान वेळ' : 'Departure' },
          ]}
          toggles={[{ key: 'nonstop', label: isMr ? 'नॉन-स्टॉप' : 'Non-stop', active: nonStopOnly, onToggle: () => setNonStopOnly(v => !v) }]}
        />
      )}
      renderResults={() => (
        <TransportOptions
          mode="flight"
          data={visibleFlights}
          isLoading={isLoading}
          isCached={false}
          origin={origin}
          destination={destination}
          lang={lang}
          currencySymbol={currencySymbol}
          onBookNow={onBookNow}
        />
      )}
    />
  );
};

export default FlightSearchTab;
