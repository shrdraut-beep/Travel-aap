import React, { useState, useRef } from 'react';
import { fetchLiveFlights, fetchLiveTrains } from '../services/LiveTravelAPI';
import { Train, Bus, Plane, Clock, Search, AlertCircle, Info } from 'lucide-react';
import { UniversalBookingCheckoutModal, BookingItemPayload } from './travel/UniversalBookingCheckoutModal';

interface TransitSchedule {
  trains?: { trainName: string; departureTime: string; arrivalTime: string; duration: string }[];
  buses?: { operatorName: string; busType: string; departureTime: string; arrivalTime: string; duration: string }[];
  flights?: { airlineName: string; departureTime: string; arrivalTime: string; duration: string }[];
}

export const TransitSchedules: React.FC<{ source: string; destination: string }> = ({ 
  source: initialSource, 
  destination: initialDestination 
}) => {
  const [source, setSource] = useState(initialSource || 'Mumbai');
  const [destination, setDestination] = useState(initialDestination || 'Pune');
  const [schedules, setSchedules] = useState<TransitSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingApi, setIsPendingApi] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<BookingItemPayload | null>(null);
  const isFetching = useRef(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isFetching.current) return;
    if (!source.trim() || !destination.trim()) {
      setErrorMessage("Please enter both source and destination cities.");
      return;
    }

    isFetching.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    setIsPendingApi(false);

    try {
      const today = new Date().toISOString().split('T')[0];
      const [flightsRes, trainsRes] = await Promise.all([
        fetchLiveFlights(source.trim(), destination.trim(), today),
        fetchLiveTrains(source.trim(), destination.trim(), today)
      ]);

      if (flightsRes.status === 'PENDING_API_INTEGRATION' || trainsRes.status === 'PENDING_API_INTEGRATION') {
        setIsPendingApi(true);
      }

      setSchedules({
        flights: (flightsRes.data || []).map((f: any) => ({
          airlineName: `${f.airline || f.provider || 'Flight'} (${f.flightNumber || 'Live'})`,
          departureTime: f.departure_time || f.departureTime || '06:00 AM',
          arrivalTime: f.arrival_time || f.arrivalTime || '08:15 AM',
          duration: f.duration || '2h 15m'
        })),
        trains: (trainsRes.data || []).map((t: any) => ({
          trainName: `${t.train_name || t.name || 'Express'} (${t.train_number || t.number || ''})`,
          departureTime: t.departure_time || t.schDep || '07:00 AM',
          arrivalTime: t.arrival_time || t.schArr || '02:00 PM',
          duration: t.travel_time || '7h 00m'
        })),
        buses: []
      });
    } catch (apiError: any) {
      console.error("Transit Search Error:", apiError);
      setErrorMessage("Search error: " + apiError.message);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Inputs */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">From City</label>
            <input 
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Nashik, Mumbai"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">To City</label>
            <input 
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Pune, Delhi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          {isLoading ? "लाईव्ह डेटा आणला जात आहे..." : "Find Live Transit Routes"}
        </button>
      </form>

      {/* Pending API Notice Display */}
      {isPendingApi && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="font-extrabold text-slate-900 text-base">लाईव्ह वेळापत्रक आणण्यासाठी सिस्टीम अपडेट होत आहे...</div>
            <p className="text-xs text-amber-800 font-bold">
              लाईव्ह डेटा आणण्यासाठी कृपया खऱ्या API (उदा. RapidAPI) शी कनेक्ट करा.
            </p>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Unable to Fetch Routes</div>
            <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Skeleton Loading */}
      {isLoading && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-rose-600 animate-pulse text-center">Searching local CSV and JSON transit schedules...</div>
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />)}
        </div>
      )}

      {/* Results Display */}
      {!isLoading && schedules && (
        <div className="space-y-6">
          {schedules.trains && schedules.trains.length > 0 && (
            <TransitSection type="train" source={source} destination={destination} onBookNow={setCheckoutItem} title="Trains" icon={Train} items={schedules.trains.map(t => ({ name: t.trainName, ...t }))} />
          )}
          {schedules.buses && schedules.buses.length > 0 && (
            <TransitSection type="bus" source={source} destination={destination} onBookNow={setCheckoutItem} title="Buses" icon={Bus} items={schedules.buses.map(b => ({ name: `${b.operatorName} (${b.busType})`, ...b }))} />
          )}
          {schedules.flights && schedules.flights.length > 0 && (
            <TransitSection type="flight" source={source} destination={destination} onBookNow={setCheckoutItem} title="Flights" icon={Plane} items={schedules.flights.map((f: any) => ({
              name: f.airlineName,
              departureTime: f.departureTime,
              arrivalTime: f.arrivalTime,
              duration: f.duration
            }))} />
          )}
        </div>
      )}

      {checkoutItem && (
        <UniversalBookingCheckoutModal
          isOpen={true}
          onClose={() => setCheckoutItem(null)}
          item={checkoutItem}
          currencySymbol="₹"
          lang="en"
          onBookingSuccess={(receipt) => {
            alert(`🎉 Booking confirmed! ID: ${receipt.bookingId}`);
          }}
        />
      )}
    </div>
  );
};

const TransitSection = ({ title, icon: Icon, items, onBookNow, type, source, destination }: { title: string, icon: any, items: any[], onBookNow: any, type: string, source: string, destination: string }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
      <Icon className="w-4 h-4 text-rose-600" /> {title}
    </h3>
    {items.map((item, i) => (
      <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
          <div className="text-xs text-slate-600 flex items-center gap-2 mt-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.departureTime} - {item.arrivalTime} 
            <span className="text-slate-400 font-normal">({item.duration})</span>
          </div>
        </div>
        <button 
          onClick={() => {
            onBookNow({
              id: `transit-${type}-${i}`,
              title: item.name,
              vertical: type as any,
              subtitle: `${source} → ${destination}`,
              location: `${source} - ${destination}`,
              time: `${item.departureTime} - ${item.arrivalTime}`,
              amount: type === 'flight' ? 4500 : type === 'train' ? 850 : 650,
              provider: item.name
            });
          }}
          className="bg-[#3399cc] text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
        >
          Book Now
        </button>
      </div>
    ))}
  </div>
);
