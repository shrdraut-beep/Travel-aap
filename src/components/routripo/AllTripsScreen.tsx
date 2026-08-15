import React, { useState } from "react";
import { Search, Compass, Plane, Hotel, Train, Bus, Car, Package, Plus, Sparkles, MapPin } from "lucide-react";
import { TopBar, SectionTitle, LogoName } from "./SharedUI";
import { useTripContext } from "../../context/TripContext";

export function AllTripsScreen({ 
  onBack, 
  setActive,
  onLogout,
  onSOS
}: { 
  onBack?: () => void, 
  setActive: (tab: string, subTab?: string) => void,
  onLogout: () => void,
  onSOS: () => void
}) {
  const { trips, selectTripById } = useTripContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrips = trips.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.startDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bookingServices = [
    { icon: Plane, label: "Flights", category: "Flights", color: "from-blue-500 to-indigo-600" },
    { icon: Hotel, label: "Hotels", category: "Hotels", color: "from-amber-500 to-orange-600" },
    { icon: Train, label: "Trains", category: "Trains", color: "from-rose-500 to-red-600" },
    { icon: Bus, label: "Bus", category: "Bus", color: "from-emerald-500 to-teal-600" },
    { icon: Car, label: "Car & Cabs", category: "Cars", color: "from-orange-500 to-amber-600" },
    { icon: Package, label: "Holiday Pkgs", category: "Packages", color: "from-purple-500 to-pink-600" }
  ];

  return (
    <div className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar 
        title={<LogoName />} 
        sub="All Trips & Explore" 
        scrolled={false} 
        onLogout={onLogout} 
        onSOS={onSOS} 
        onOpenSettings={() => setActive('settings')}
      />
      <div className="px-5 mt-2 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setActive('planning')} 
            className="text-xs font-bold text-rose-600 cursor-pointer flex items-center gap-1 hover:underline"
          >
            Go to Active Trip Workspace →
          </button>
        </div>

        {/* Quick Actions: New Trip & Smart Planner */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={() => setActive('new-trip')}
            className="p-3.5 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl shadow-md shadow-rose-200/60 flex items-center gap-3 active:scale-95 transition-all cursor-pointer group text-left border border-rose-400/30"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white stroke-[3]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider leading-tight">
                NEW TRIP
              </h4>
              <p className="text-[10px] text-rose-100 font-bold truncate mt-0.5">
                Start a new trip
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActive('smart-planner')}
            className="p-3.5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-2xl shadow-md shadow-indigo-200/60 flex items-center gap-3 active:scale-95 transition-all cursor-pointer group text-left border border-indigo-400/30"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider leading-tight">
                SMART PLANNER
              </h4>
              <p className="text-[10px] text-indigo-100 font-bold truncate mt-0.5">
                AI trip generator
              </p>
            </div>
          </button>
        </div>

                
        {/* Explore Services */}
        <div className="space-y-4">
          <SectionTitle icon={Compass}>Book Travel Services</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            {bookingServices.map((b, i) => {
              const BIcon = b.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive("booking", b.category)}
                  className="flex flex-col items-center gap-2 text-center cursor-pointer group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <BIcon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        
        {/* Flagship Hotel Stores */}

        {/* Trips List */}
        <div className="space-y-4">
          <SectionTitle icon={Search}>Search Trips</SectionTitle>
          <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-sm border border-slate-200">
            <Search className="w-4 h-4 text-red-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search old & current trips..."
              className="w-full text-xs font-bold text-slate-800 placeholder-slate-400 outline-none bg-transparent"
            />
          </div>
          <div className="space-y-3">
            {filteredTrips.map((t) => (
              <div 
                key={t.id} 
                onClick={() => {
                  selectTripById(t.id);
                  setActive('planning');
                }}
                className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 cursor-pointer hover:border-rose-300 active:scale-98 transition-all shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{t.startDate} – {t.endDate} • {t.destination}</p>
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                  t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {t.status || 'PLANNED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
