import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Minus, Plus, Search, Building2, BedDouble } from 'lucide-react';
import { DateRangePicker } from '../common/DateRangePicker';
import { CurrencyConverter } from '../CurrencyConverter';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getNextDay = (dateStr: string) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const HotelSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(getTomorrowDate());
  const [checkOut, setCheckOut] = useState(getNextDay(getTomorrowDate()));
  
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const handleSearch = () => {
    navigate('/stays/results', {
      state: {
        searchParams: {
          location,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults,
          rooms,
          children,
          infants
        }
      }
    });
  };

  const handleAdultsChange = (val: number) => {
    // Max 3 adults per room
    const maxAdults = rooms * 3;
    setAdults(Math.min(maxAdults, Math.max(1, val)));
  };

  const handleRoomsChange = (val: number) => {
    const newRooms = Math.max(1, val);
    setRooms(newRooms);
    // Adjust adults if they exceed the new max
    if (adults > newRooms * 3) {
      setAdults(newRooms * 3);
    } else if (adults < newRooms) {
      setAdults(newRooms); // At least 1 adult per room
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-[Inter] flex flex-col md:flex-row">
      {/* Left Search Form Side */}
      <div className="flex-1 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Find Your Stay
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Discover perfect hotels and resorts for your trip.</p>
        </div>

        <div className="space-y-4">
          {/* Location */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-indigo-600" />
            </div>
            <input
              type="text"
              placeholder="Where are you going? (e.g. Mumbai, Goa)"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Date Range Picker */}
          <DateRangePicker 
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(start, end) => {
              setCheckIn(start);
              setCheckOut(end);
            }}
            lang={lang}
          />

          {/* Guest Selection */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700">
              <Users className="w-4 h-4 text-indigo-600" />
              Guests & Rooms
            </div>
            
            <div className="space-y-3">
              {/* Rooms */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Rooms</div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button onClick={() => handleRoomsChange(rooms - 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 active:scale-95"><Minus className="w-4 h-4"/></button>
                  <span className="font-black text-slate-900 w-4 text-center text-sm">{rooms}</span>
                  <button onClick={() => handleRoomsChange(rooms + 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 active:scale-95"><Plus className="w-4 h-4"/></button>
                </div>
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Adults</div>
                  <div className="text-[10px] text-slate-500">Max 3 per room</div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button onClick={() => handleAdultsChange(adults - 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 active:scale-95"><Minus className="w-4 h-4"/></button>
                  <span className="font-black text-slate-900 w-4 text-center text-sm">{adults}</span>
                  <button onClick={() => handleAdultsChange(adults + 1)} disabled={adults >= rooms * 3} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:active:scale-100 active:scale-95"><Plus className="w-4 h-4"/></button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Children</div>
                  <div className="text-[10px] text-slate-500">Ages 2-12</div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 active:scale-95"><Minus className="w-4 h-4"/></button>
                  <span className="font-black text-slate-900 w-4 text-center text-sm">{children}</span>
                  <button onClick={() => setChildren(children + 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 active:scale-95"><Plus className="w-4 h-4"/></button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Infants</div>
                  <div className="text-[10px] text-slate-500">Under 2</div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button onClick={() => setInfants(Math.max(0, infants - 1))} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 active:scale-95"><Minus className="w-4 h-4"/></button>
                  <span className="font-black text-slate-900 w-4 text-center text-sm">{infants}</span>
                  <button onClick={() => setInfants(infants + 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-slate-700 hover:bg-slate-200 active:scale-95"><Plus className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 text-lg mt-4"
          >
            <Search className="w-5 h-5" />
            Search Hotels
          </button>
        </div>
      </div>

      {/* Right Sidebar - Currency Converter */}
      <div className="md:w-72 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-6 flex flex-col items-center justify-center">
         <CurrencyConverter lang={lang} defaultCurrency="INR" onSetDefault={() => {}} />
         
         <div className="mt-8 text-center px-4">
           <BedDouble className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
           <h4 className="font-bold text-slate-700 text-sm mb-1">Best Price Guarantee</h4>
           <p className="text-[11px] text-slate-500">Find a lower price? We'll refund the difference.</p>
         </div>
      </div>
    </div>
  );
};
