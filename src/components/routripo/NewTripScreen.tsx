import React, { useState } from 'react';
import { ChevronLeft, Calendar, MapPin, Users, Type } from 'lucide-react';
import { TopBar, LogoName, Card } from '../routripo/SharedUI';
import { useTripContext } from '../../context/TripContext';

export const NewTripScreen: React.FC<{ onBack: () => void; onCreate: (data: any) => void }> = ({ onBack, onCreate }) => {
  const { addNewTrip } = useTripContext();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destination, setDestination] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter a trip name!");
      return;
    }
    const created = addNewTrip({
      name,
      destination: destination || "Goa",
      startDate: startDate || new Date().toISOString().substring(0, 10),
      endDate: endDate || new Date(Date.now() + 86400000 * 5).toISOString().substring(0, 10)
    });
    onCreate(created);
  };

  return (
    <div className="h-full overflow-y-auto pb-28 bg-slate-50 font-[Inter]">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-100">
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Start a New Trip</h1>
      </div>

      <div className="p-5 space-y-4">
        <Card className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1.5">Trip Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-500 rounded-2xl font-extrabold text-sm text-slate-900 placeholder-slate-400 outline-none" placeholder="e.g., Summer Beach Getaway" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1.5">Destination</label>
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-500 rounded-2xl font-extrabold text-sm text-slate-900 placeholder-slate-400 outline-none" placeholder="Where are you going?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-500 rounded-2xl font-extrabold text-sm text-slate-900 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1.5">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-500 rounded-2xl font-extrabold text-sm text-slate-900 outline-none" />
            </div>
          </div>
        </Card>

        <button 
          onClick={handleCreate}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-500/30 cursor-pointer"
        >
          Create Trip
        </button>
      </div>
    </div>
  );
};
