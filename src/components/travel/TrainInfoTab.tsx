import React, { useState } from 'react';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { SearchResultsToolbar } from './SearchResultsToolbar';
import { Users, Minus, Plus } from 'lucide-react';

const QUOTAS = ['General', 'Tatkal', 'Ladies', 'Senior Citizen'];
const AC_CLASSES = ['1A', '2A', '3A', '3E', 'CC', 'EC'];

const toMinutes = (time: string) => {
  const [h, m] = String(time || '').split(':');
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
};

const durationToMinutes = (duration: string) => {
  const h = String(duration || '').match(/(\d+)h/);
  const m = String(duration || '').match(/(\d+)m/);
  return (h ? parseInt(h[1], 10) : 0) * 60 + (m ? parseInt(m[1], 10) : 0);
};

export const TrainInfoTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState(getTomorrowDate());
  const [passengers, setPassengers] = useState(1);
  const [classType, setClassType] = useState('SL');
  const [quota, setQuota] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trainData, setTrainData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('departure');
  const [acOnly, setAcOnly] = useState(false);

  const visibleTrains = React.useMemo(() => {
    const list = acOnly
      ? trainData.filter(t => (t.classes || []).some((c: string) => AC_CLASSES.includes(String(c).toUpperCase())))
      : trainData;

    return [...list].sort((a, b) => {
      if (sortBy === 'duration') return durationToMinutes(a.duration) - durationToMinutes(b.duration);
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      return toMinutes(a.departureTime) - toMinutes(b.departureTime);
    });
  }, [trainData, sortBy, acOnly]);

  const handleTrainSearch = async () => {
    if (origin.toUpperCase() === destination.toUpperCase()) {
        alert("Origin and destination cannot be the same.");
        return;
    }
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      setTrainData([
        {
          trainNumber: '12951',
          trainName: 'Rajdhani Express',
          origin: origin || 'Mumbai Central',
          destination: destination || 'New Delhi',
          departureTime: '17:00',
          arrivalTime: '08:32',
          duration: '15h 32m',
          classes: ['3A', '2A', '1A'],
          price: 2400,
          status: 'Available'
        },
        {
          trainNumber: '12903',
          trainName: 'Golden Temple Mail',
          origin: origin || 'Mumbai Central',
          destination: destination || 'Nizamuddin',
          departureTime: '21:25',
          arrivalTime: '19:00',
          duration: '21h 35m',
          classes: ['SL', '3A', '2A', '1A'],
          price: 680,
          status: 'WL 12'
        }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Passengers</h4>
          <p className="text-[10px] text-slate-500">IRCTC Limit: Max 6 per booking</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button 
            type="button"
            onClick={() => setPassengers(Math.max(1, passengers - 1))} 
            disabled={passengers <= 1}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Minus className="w-4 h-4"/>
          </button>
          <span className="font-black text-slate-900 w-4 text-center">{passengers}</span>
          <button 
            type="button"
            onClick={() => {
              if (passengers < 6) {
                setPassengers(passengers + 1);
              }
            }} 
            disabled={passengers >= 6}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4"/>
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-slate-800 mb-3">Quota</h4>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUOTAS.map(q => (
            <button
              key={q}
              type="button"
              onClick={() => setQuota(q)}
              className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${quota === q ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {passengers >= 6 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 leading-snug">
          ⚠️ IRCTC Rule: Maximum 6 passengers allowed per general ticket (4 for Tatkal).
        </div>
      )}

      <div>
        <h4 className="font-bold text-slate-800 mb-3">Class</h4>
        <div className="grid grid-cols-4 gap-2">
          {['SL', '3A', '2A', '1A'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setClassType(c)}
              className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${classType === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <BookingFunnelLayout
      mode="train"
      onBack={onBack}
      origin={origin}
      setOrigin={setOrigin}
      destination={destination}
      setDestination={setDestination}
      date={departDate}
      setDate={setDepartDate}
      onSearch={handleTrainSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={`${passengers} Pax, ${classType}, ${quota}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResultsToolbar={() => (
        <SearchResultsToolbar
          lang={lang}
          activeSort={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { key: 'departure', label: 'Departure' },
            { key: 'duration', label: 'Fastest' },
            { key: 'price', label: 'Cheapest' },
          ]}
          toggles={[{ key: 'ac', label: 'AC Only', active: acOnly, onToggle: () => setAcOnly(v => !v) }]}
        />
      )}
      renderResults={() => (
        <TransportOptions
          mode="train"
          data={visibleTrains}
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
