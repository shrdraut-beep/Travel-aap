import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingFunnelLayout } from './BookingFunnelLayout';

const getTomorrowDate = (daysAhead: number = 1) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

export const HotelSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const navigate = useNavigate();
  const isMr = lang === 'mr';

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(getTomorrowDate(1));
  const [checkOut, setCheckOut] = useState(getTomorrowDate(3));

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleHotelSearch = () => {
    const chosenDest = (destination || 'Mumbai').trim();
    navigate('/stays/results', {
      state: {
        searchParams: {
          destination: chosenDest,
          location: chosenDest,
          city: chosenDest,
          checkIn: checkIn,
          checkInDate: checkIn,
          checkOut: checkOut,
          checkOutDate: checkOut,
          adults,
          rooms,
          children,
          infants: 0
        }
      }
    });
  };

  const renderGuestSelector = () => (
    <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 pr-4">
          <div className="font-bold text-slate-800 text-lg">Rooms</div>
          <div className="text-xs text-slate-500 mt-1 max-w-[220px]">Select 1 room for 1-4 guests, or split across multiple rooms</div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 disabled:border-slate-300 disabled:text-slate-300 active:scale-95 transition-transform"
            disabled={rooms <= 1}
            onClick={() => setRooms(Math.max(1, rooms - 1))}
          >
            <span className="text-xl font-bold leading-none">-</span>
          </button>
          <div className="w-6 text-center font-bold text-xl text-slate-800">{rooms}</div>
          <button 
            type="button"
            className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 active:scale-95 transition-transform"
            onClick={() => setRooms(rooms + 1)}
          >
            <span className="text-xl font-bold leading-none">+</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 pr-4">
          <div className="font-bold text-slate-800 text-lg">Adults</div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 disabled:border-slate-300 disabled:text-slate-300 active:scale-95 transition-transform"
            disabled={adults <= 1}
            onClick={() => setAdults(Math.max(1, adults - 1))}
          >
            <span className="text-xl font-bold leading-none">-</span>
          </button>
          <div className="w-6 text-center font-bold text-xl text-slate-800">{adults}</div>
          <button 
            type="button"
            className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 active:scale-95 transition-transform"
            onClick={() => setAdults(adults + 1)}
          >
            <span className="text-xl font-bold leading-none">+</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex-1 pr-4">
          <div className="font-bold text-slate-800 text-lg">Children</div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 disabled:border-slate-300 disabled:text-slate-300 active:scale-95 transition-transform"
            disabled={children <= 0}
            onClick={() => setChildren(Math.max(0, children - 1))}
          >
            <span className="text-xl font-bold leading-none">-</span>
          </button>
          <div className="w-6 text-center font-bold text-xl text-slate-800">{children}</div>
          <button 
            type="button"
            className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 active:scale-95 transition-transform"
            onClick={() => setChildren(children + 1)}
          >
            <span className="text-xl font-bold leading-none">+</span>
          </button>
        </div>
      </div>
    </div>
  );

  const guestSummary = isMr
    ? `${rooms} खोली, ${adults + children} पाहुणे`
    : `${rooms} Room${rooms > 1 ? 's' : ''}, ${adults + children} Guest${(adults + children) > 1 ? 's' : ''}`;

  return (
    <BookingFunnelLayout
      mode="hotel"
      onBack={onBack}
      origin=""
      setOrigin={() => {}}
      destination={destination}
      setDestination={setDestination}
      date={checkIn}
      setDate={setCheckIn}
      returnDate={checkOut}
      setReturnDate={setCheckOut}
      onSearch={handleHotelSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={guestSummary}
      renderPassengerSelector={renderGuestSelector}
      renderResults={() => null}
    />
  );
};

export default HotelSearchTab;
