import React, { useState } from 'react';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { SearchResultsToolbar } from './SearchResultsToolbar';
import { Users, Minus, Plus } from 'lucide-react';
import { fetchHotelData } from './api';

export const HotelSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hotelData, setHotelData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [topRatedOnly, setTopRatedOnly] = useState(false);

  const visibleHotels = React.useMemo(() => {
    const list = topRatedOnly
      ? hotelData.filter(h => Number(h.rating || 0) >= 4)
      : hotelData;

    if (sortBy === 'recommended') return list;
    return [...list].sort((a, b) => {
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      const priceA = Number(a.pricePerNight || 0);
      const priceB = Number(b.pricePerNight || 0);
      return sortBy === 'priceHigh' ? priceB - priceA : priceA - priceB;
    });
  }, [hotelData, sortBy, topRatedOnly]);

  const handleHotelSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await fetchHotelData({
        destination: location,
        checkIn: checkInDate || new Date().toISOString().split('T')[0],
        checkOut: checkInDate || new Date().toISOString().split('T')[0],
        adults: guests
      });
      setHotelData(results);
    } catch (error) {
      console.error("Hotel search error:", error);
      setHotelData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildrenChange = (newChildrenCount: number) => {
    setChildren(newChildrenCount);
    if (newChildrenCount > childrenAges.length) {
      setChildrenAges([...childrenAges, ...Array(newChildrenCount - childrenAges.length).fill(1)]);
    } else {
      setChildrenAges(childrenAges.slice(0, newChildrenCount));
    }
  };

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Rooms</h4>
          <p className="text-[10px] text-slate-500">Max 5 rooms per booking</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Minus className="w-4 h-4"/></button>
          <span className="font-black text-slate-900 w-4 text-center">{rooms}</span>
          <button onClick={() => setRooms(Math.min(5, rooms + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800">Adults</h4>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Minus className="w-4 h-4"/></button>
          <span className="font-black text-slate-900 w-4 text-center">{guests}</span>
          <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800">Children</h4>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button onClick={() => handleChildrenChange(Math.max(0, children - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Minus className="w-4 h-4"/></button>
          <span className="font-black text-slate-900 w-4 text-center">{children}</span>
          <button onClick={() => handleChildrenChange(Math.min(4, children + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
      {children > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800">Child's Age</h4>
          {childrenAges.map((age, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Child {index + 1}</span>
              <select 
                value={age} 
                onChange={(e) => {
                  const newAges = [...childrenAges];
                  newAges[index] = parseInt(e.target.value);
                  setChildrenAges(newAges);
                }}
                className="bg-slate-100 rounded-lg p-2 font-bold text-slate-900"
              >
                {Array.from({length: 18}, (_, i) => i).map(i => (
                  <option key={i} value={i}>{i === 0 ? '<1' : i}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <BookingFunnelLayout
      mode="hotel"
      onBack={onBack}
      origin=""
      setOrigin={() => {}}
      destination={location}
      setDestination={setLocation}
      date={checkInDate}
      setDate={setCheckInDate}
      onSearch={handleHotelSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={`${guests} Adult${guests > 1 ? 's' : ''}, ${children > 0 ? `${children} Child` : ''} ${rooms} Room${rooms > 1 ? 's' : ''}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResultsToolbar={() => (
        <SearchResultsToolbar
          lang={lang}
          activeSort={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { key: 'recommended', label: 'Recommended' },
            { key: 'priceLow', label: 'Price: Low to High' },
            { key: 'priceHigh', label: 'Price: High to Low' },
            { key: 'rating', label: 'Rating' },
          ]}
          toggles={[{ key: 'topRated', label: '4+ Rating', active: topRatedOnly, onToggle: () => setTopRatedOnly(v => !v) }]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      renderResults={() => (
        <TransportOptions
          mode="hotel"
          data={visibleHotels}
          layout={viewMode}
          isLoading={isLoading}
          isCached={false}
          origin=""
          destination={location}
          lang={lang}
          currencySymbol={currencySymbol}
          onBookNow={onBookNow}
        />
      )}
    />
  );
};
