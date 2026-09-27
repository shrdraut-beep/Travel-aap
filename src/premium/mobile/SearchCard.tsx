import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, CalendarDays, MapPin, Plus, Search, Trash2, Users, ArrowRight } from "lucide-react";
import {
  DateRangePicker,
  formatDay,
  formatMonthYear,
  formatWeekday
} from "../ui/DateRangePicker";
import type { DateRange } from "../ui/DateRangePicker";
import {
  TravellerPicker,
  summariseTravellers
} from "../ui/TravellerPicker";
import type { CabinClass, TravellerCounts } from "../ui/TravellerPicker";
import { Sheet } from "./Sheet";
import { CitySheet } from "./CitySheet";
import type { FlightLeg, SearchMode, SearchPayload, TripType } from "./types";

const TRIP_LABELS: Record<TripType, string> = {
  oneway: "One Way",
  round: "Round Trip",
  multicity: "Multi-City"
};

const PLACE_LABELS: Record<SearchMode, { from: string; to: string; fromPlaceholder: string; toPlaceholder: string }> = {
  flights: { from: "FROM", to: "TO", fromPlaceholder: "Select departure airport", toPlaceholder: "Select arrival airport" },
  hotels: { from: "CITY OR LOCATION", to: "", fromPlaceholder: "Where are you staying?", toPlaceholder: "" },
  trains: { from: "FROM STATION", to: "TO STATION", fromPlaceholder: "Source station", toPlaceholder: "Destination station" },
  buses: { from: "BOARDING FROM", to: "DROPPING AT", fromPlaceholder: "Pickup city", toPlaceholder: "Drop city" },
  cabs: { from: "PICKUP LOCATION", to: "DROP LOCATION", fromPlaceholder: "Pickup address or city", toPlaceholder: "Drop address or city" },
  holidays: { from: "DEPARTING FROM", to: "DESTINATION / THEME", fromPlaceholder: "City of departure", toPlaceholder: "Where to explore?" }
};

export interface SearchCardProps {
  mode: SearchMode;
  onSearch?: (payload: SearchPayload) => void;
}

export const SearchCard: React.FC<SearchCardProps> = ({ mode, onSearch }) => {
  const { t } = useTranslation();
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [isSwapping, setIsSwapping] = useState(false);
  
  const getDefaultOrigin = (m: SearchMode) => {
    switch (m) {
      case 'flights': return "Mumbai (BOM)";
      case 'hotels': return "Goa";
      case 'trains': return "Pune";
      case 'buses': return "Pune";
      case 'cabs': return "Mumbai";
      case 'holidays': return "Mumbai";
      default: return "Mumbai";
    }
  };

  const getDefaultDestination = (m: SearchMode) => {
    switch (m) {
      case 'flights': return "New Delhi (DEL)";
      case 'hotels': return "";
      case 'trains': return "Varanasi";
      case 'buses': return "Goa";
      case 'cabs': return "Pune";
      case 'holidays': return "Goa";
      default: return "New Delhi";
    }
  };

  const tomorrow = new Date(Date.now() + 86400000);
  const fourDaysLater = new Date(Date.now() + 86400000 * 4);
  const sevenDaysLater = new Date(Date.now() + 86400000 * 7);

  const [origin, setOrigin] = useState<string>(() => getDefaultOrigin(mode));
  const [destination, setDestination] = useState<string>(() => getDefaultDestination(mode));
  const [dates, setDates] = useState<DateRange>({ 
    start: tomorrow, 
    end: (mode === 'hotels' || mode === 'holidays') ? fourDaysLater : null 
  });

  // Multi-city legs state
  const [legs, setLegs] = useState<FlightLeg[]>([
    { id: 'leg-1', origin: 'Mumbai (BOM)', destination: 'New Delhi (DEL)', date: tomorrow },
    { id: 'leg-2', origin: 'New Delhi (DEL)', destination: 'Bengaluru (BLR)', date: fourDaysLater }
  ]);
  const [activeLegIndex, setActiveLegIndex] = useState<number>(0);
  const [activeLegField, setActiveLegField] = useState<'origin' | 'destination' | 'date'>('origin');

  const [travellers, setTravellers] = useState<TravellerCounts>({
    adults: (mode === 'hotels' || mode === 'holidays') ? 2 : 1,
    children: 0,
    infants: 0
  });
  const [cabin, setCabin] = useState<CabinClass>("Economy");
  const [rooms, setRooms] = useState(1);

  const [sheet, setSheet] = useState<
    "origin" | "destination" | "dates" | "travellers" | "leg-city" | "leg-date" | null
  >(null);

  // Update defaults when mode changes
  React.useEffect(() => {
    setOrigin(getDefaultOrigin(mode));
    setDestination(getDefaultDestination(mode));
    if (mode === 'hotels' || mode === 'holidays') {
      setDates({ start: tomorrow, end: fourDaysLater });
      setTravellers(prev => ({ ...prev, adults: 2 }));
    } else {
      setDates({ start: tomorrow, end: null });
      setTravellers(prev => ({ ...prev, adults: 1 }));
    }
    if (mode !== 'flights' && tripType === 'multicity') {
      setTripType('oneway');
    }
  }, [mode]);

  const stay = mode === "hotels" || mode === "holidays";
  const labels = PLACE_LABELS[mode] || PLACE_LABELS.flights;
  const showTripType = mode === "flights" || mode === "trains";
  const rangeMode = stay || tripType === "round";

  const close = () => setSheet(null);

  const dateValue = (date: Date | null) =>
    date ? `${formatDay(date)} ${formatMonthYear(date)}` : "";

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleAddLeg = () => {
    if (legs.length >= 5) return;
    const lastLeg = legs[legs.length - 1];
    const newDate = lastLeg.date ? new Date(lastLeg.date.getTime() + 86400000 * 3) : sevenDaysLater;
    setLegs([
      ...legs,
      {
        id: `leg-${Date.now()}`,
        origin: lastLeg.destination || 'Bengaluru (BLR)',
        destination: 'Goa (GOI)',
        date: newDate
      }
    ]);
  };

  const handleRemoveLeg = (idx: number) => {
    if (legs.length <= 2) return;
    setLegs(legs.filter((_, i) => i !== idx));
  };

  const handleOpenLegCity = (index: number, field: 'origin' | 'destination') => {
    setActiveLegIndex(index);
    setActiveLegField(field);
    setSheet('leg-city');
  };

  const handleOpenLegDate = (index: number) => {
    setActiveLegIndex(index);
    setActiveLegField('date');
    setSheet('leg-date');
  };

  const submit = () => {
    if (mode === 'flights' && tripType === 'multicity') {
      onSearch?.({
        mode,
        tripType: 'multicity',
        origin: legs[0]?.origin || origin,
        destination: legs[legs.length - 1]?.destination || destination,
        dates: { start: legs[0]?.date || tomorrow, end: legs[legs.length - 1]?.date || null },
        legs,
        travellers,
        cabin,
        rooms
      });
    } else {
      onSearch?.({
        mode,
        tripType: rangeMode ? "round" : "oneway",
        origin,
        destination,
        dates,
        travellers,
        cabin,
        rooms
      });
    }
  };

  const availableTripTypes: TripType[] = mode === 'flights' 
    ? ['oneway', 'round', 'multicity'] 
    : ['oneway', 'round'];

  // Mode Theme Configuration matching RouTripo design
  const getTheme = () => {
    switch (mode) {
      case 'hotels':
        return {
          accentColor: '#f59e0b',
          btnGradient: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200/80',
          activeTab: 'bg-amber-500 text-white',
          badgeText: 'text-amber-700 bg-amber-50 border-amber-200',
          btnLabel: 'Search Hotels & Stays'
        };
      case 'buses':
        return {
          accentColor: '#059669',
          btnGradient: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/25',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
          activeTab: 'bg-emerald-600 text-white',
          badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          btnLabel: 'Search Buses'
        };
      case 'cabs':
        return {
          accentColor: '#7c3aed',
          btnGradient: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/25',
          iconBg: 'bg-purple-50 text-purple-600 border-purple-200/80',
          activeTab: 'bg-purple-600 text-white',
          badgeText: 'text-purple-700 bg-purple-50 border-purple-200',
          btnLabel: 'Search Cabs & Taxis'
        };
      case 'holidays':
        return {
          accentColor: '#f43f5e',
          btnGradient: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/25',
          iconBg: 'bg-rose-50 text-rose-500 border-rose-200/80',
          activeTab: 'bg-rose-500 text-white',
          badgeText: 'text-rose-700 bg-rose-50 border-rose-200',
          btnLabel: 'Explore Tour Packages'
        };
      default: // flights
        return {
          accentColor: '#0ea5e9',
          btnGradient: 'from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] shadow-sky-500/25',
          iconBg: 'bg-sky-50 text-sky-600 border-sky-200/80',
          activeTab: 'bg-[#0ea5e9] text-white',
          badgeText: 'text-sky-700 bg-sky-50 border-sky-200',
          btnLabel: tripType === 'multicity' ? 'Search Multi-City Flights' : 'Search Flights'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Trip Type Pill Switcher (Flights / Trains) */}
      {showTripType && (
        <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-2xl">
          {availableTripTypes.map((type) => {
            const isActive = tripType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTripType(type);
                  if (type === "oneway") {
                    setDates((current) => ({ ...current, end: null }));
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-['Outfit',sans-serif] transition-all cursor-pointer ${
                  isActive
                    ? `${theme.activeTab} shadow-sm scale-[1.02]`
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                }`}
              >
                {TRIP_LABELS[type]}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. MULTI-CITY FLIGHTS VIEW */}
      {mode === 'flights' && tripType === 'multicity' ? (
        <div className="space-y-3">
          {legs.map((leg, index) => (
            <div 
              key={leg.id} 
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-['Outfit',sans-serif]">
                  Flight {index + 1}
                </span>
                {legs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLeg(index)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    title="Remove flight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenLegCity(index, 'origin')}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-left hover:border-sky-400 transition-colors cursor-pointer"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">From</span>
                  <span className="block text-sm font-extrabold text-slate-900 truncate font-['Outfit',sans-serif]">
                    {leg.origin || "Select origin"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenLegCity(index, 'destination')}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-left hover:border-sky-400 transition-colors cursor-pointer"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">To</span>
                  <span className="block text-sm font-extrabold text-slate-900 truncate font-['Outfit',sans-serif]">
                    {leg.destination || "Select destination"}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleOpenLegDate(index)}
                className="w-full p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-left hover:border-sky-400 transition-colors cursor-pointer"
              >
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">Departure Date</span>
                  <span className="block text-sm font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                    {leg.date ? `${formatDay(leg.date)} ${formatMonthYear(leg.date)} (${formatWeekday(leg.date).slice(0, 3)})` : "Select Date"}
                  </span>
                </div>
                <CalendarDays className="w-4 h-4 text-sky-600" />
              </button>
            </div>
          ))}

          {legs.length < 5 && (
            <button
              type="button"
              onClick={handleAddLeg}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/60 hover:bg-sky-50 text-sky-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99] font-['Outfit',sans-serif] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Flight Segment</span>
            </button>
          )}

          {/* Travellers for Multi-City */}
          <button
            type="button"
            onClick={() => setSheet("travellers")}
            className="w-full bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3 text-left hover:border-sky-300 transition-colors cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/70">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">
                Travellers &amp; Cabin Class
              </span>
              <span className="block text-sm font-extrabold text-slate-900 truncate font-['Outfit',sans-serif]">
                {summariseTravellers(travellers, cabin)}
              </span>
            </div>
          </button>
        </div>
      ) : (
        /* 3. STANDARD ONE-WAY / ROUND-TRIP / HOTEL VIEW */
        <div className="space-y-3">
          {/* Origin & Destination Card */}
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {/* Origin Row */}
            <button
              type="button"
              onClick={() => setSheet("origin")}
              className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-50/70 active:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${theme.iconBg}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 pr-10">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">
                  {labels.from}
                </span>
                <span className={`block text-[16px] font-extrabold tracking-tight truncate font-['Outfit',sans-serif] ${origin ? "text-slate-900" : "text-slate-300"}`}>
                  {origin || labels.fromPlaceholder}
                </span>
              </div>
            </button>

            {/* Destination Row (if not single location) */}
            {!stay && (
              <button
                type="button"
                onClick={() => setSheet("destination")}
                className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-50/70 active:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="size-10 rounded-xl bg-rose-50 text-rose-500 border border-rose-200/70 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 pr-10">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">
                    {labels.to}
                  </span>
                  <span className={`block text-[16px] font-extrabold tracking-tight truncate font-['Outfit',sans-serif] ${destination ? "text-slate-900" : "text-slate-300"}`}>
                    {destination || labels.toPlaceholder}
                  </span>
                </div>
              </button>
            )}

            {/* Floating Circular Swap Button */}
            {!stay && (
              <button
                type="button"
                aria-label="Swap cities"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwap();
                }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-slate-200 shadow-md text-sky-600 flex items-center justify-center hover:bg-sky-50 hover:border-sky-300 active:scale-90 transition-transform cursor-pointer ${
                  isSwapping ? "rotate-180 duration-300" : "duration-200"
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dates Row: Departure & Return Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Departure / Check-in */}
            <button
              type="button"
              onClick={() => setSheet("dates")}
              className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between text-left hover:border-sky-300 active:bg-slate-50 transition-all cursor-pointer min-h-[76px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">
                  {stay ? "Check In" : "Departure"}
                </span>
                <CalendarDays className="w-4 h-4 text-sky-600" />
              </div>
              <span className="block text-[14px] font-extrabold text-slate-900 truncate font-['Outfit',sans-serif] mt-1">
                {dates.start ? `${formatDay(dates.start)} ${formatMonthYear(dates.start)}` : "Select Date"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {dates.start ? formatWeekday(dates.start) : "Pick date"}
              </span>
            </button>

            {/* Return / Check-out */}
            <button
              type="button"
              onClick={() => {
                if (showTripType && tripType === "oneway") {
                  setTripType("round");
                }
                setSheet("dates");
              }}
              className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between text-left hover:border-sky-300 active:bg-slate-50 transition-all cursor-pointer min-h-[76px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">
                  {stay ? "Check Out" : "Return"}
                </span>
                <CalendarDays className="w-4 h-4 text-slate-400" />
              </div>
              <span className={`block text-[14px] font-extrabold truncate font-['Outfit',sans-serif] mt-1 ${dates.end ? "text-slate-900" : "text-sky-600"}`}>
                {dates.end ? `${formatDay(dates.end)} ${formatMonthYear(dates.end)}` : "+ Add Return"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {dates.end ? formatWeekday(dates.end) : "Save more on round-trip"}
              </span>
            </button>
          </div>

          {/* Travellers / Guests & Class Card */}
          <button
            type="button"
            onClick={() => setSheet("travellers")}
            className="w-full bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3 text-left hover:border-sky-300 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/70 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Outfit',sans-serif]">
                {stay ? "Guests & Rooms" : "Travellers & Cabin Class"}
              </span>
              <span className="block text-[15px] font-extrabold text-slate-900 truncate font-['Outfit',sans-serif]">
                {stay
                  ? `${travellers.adults + travellers.children} Guest${travellers.adults + travellers.children > 1 ? "s" : ""} · ${rooms} Room${rooms > 1 ? "s" : ""}`
                  : summariseTravellers(travellers, cabin)}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 4. Primary Search Action Button matching RouTripo theme */}
      <div className="pt-2">
        <button
          type="button"
          onClick={submit}
          className={`w-full bg-gradient-to-r ${theme.btnGradient} text-white font-extrabold text-[15px] py-4 px-6 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-['Outfit',sans-serif] cursor-pointer`}
        >
          <Search className="w-5 h-5" />
          <span>{theme.btnLabel}</span>
          <ArrowRight className="w-4 h-4 ml-1 opacity-90" />
        </button>
      </div>

      {/* Pickers Sheets */}
      <CitySheet
        open={sheet === "origin"}
        title={stay ? "Where to?" : labels.from}
        mode={mode}
        onClose={close}
        onSelect={(city) => {
          setOrigin(city);
          close();
        }}
      />

      <CitySheet
        open={sheet === "destination"}
        title={labels.to || "To"}
        mode={mode}
        onClose={close}
        onSelect={(city) => {
          setDestination(city);
          close();
        }}
      />

      {/* Multi-city dynamic leg city picker */}
      <CitySheet
        open={sheet === "leg-city"}
        title={`Flight ${activeLegIndex + 1}: ${activeLegField === 'origin' ? 'From City' : 'To City'}`}
        mode="flights"
        onClose={close}
        onSelect={(city) => {
          setLegs(prev => {
            const updated = [...prev];
            if (updated[activeLegIndex]) {
              updated[activeLegIndex] = {
                ...updated[activeLegIndex],
                [activeLegField]: city
              };
            }
            return updated;
          });
          close();
        }}
      />

      {/* Multi-city single date picker */}
      <Sheet
        open={sheet === "leg-date"}
        title={`Flight ${activeLegIndex + 1} Departure Date`}
        onClose={close}
        footer={
          <button 
            type="button" 
            onClick={close} 
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl font-['Outfit',sans-serif] cursor-pointer"
          >
            Confirm Date
          </button>
        }
      >
        <DateRangePicker
          value={{ start: legs[activeLegIndex]?.date || tomorrow, end: null }}
          rangeMode={false}
          onChange={(newRange) => {
            if (newRange.start) {
              setLegs(prev => {
                const updated = [...prev];
                if (updated[activeLegIndex]) {
                  updated[activeLegIndex] = {
                    ...updated[activeLegIndex],
                    date: newRange.start
                  };
                }
                return updated;
              });
            }
          }}
          onClose={close}
        />
      </Sheet>

      {/* Date Picker Sheet */}
      <Sheet
        open={sheet === "dates"}
        title={stay ? "Select Stay Dates" : "Select Travel Dates"}
        onClose={close}
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 font-['Outfit',sans-serif]">
                {dates.start ? formatWeekday(dates.start) : "No date selected"}
              </p>
              <p className="truncate text-[11px] text-slate-500 font-medium">
                {dates.start
                  ? `${dateValue(dates.start)}${dates.end ? ` → ${dateValue(dates.end)}` : ""}`
                  : "Pick a date to continue"}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              disabled={!dates.start}
              className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl font-['Outfit',sans-serif] cursor-pointer"
            >
              Done
            </button>
          </div>
        }
      >
        <DateRangePicker
          value={dates}
          rangeMode={rangeMode}
          onChange={setDates}
          onClose={close}
        />
      </Sheet>

      {/* Travellers Sheet */}
      <Sheet
        open={sheet === "travellers"}
        title={stay ? "Guests & Rooms" : "Travellers & Cabin Class"}
        onClose={close}
        footer={
          <button
            type="button"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl font-['Outfit',sans-serif] cursor-pointer"
            onClick={close}
          >
            Apply Details
          </button>
        }
      >
        <TravellerPicker
          counts={travellers}
          cabin={cabin}
          showCabin={!stay}
          onChange={setTravellers}
          onCabinChange={setCabin}
        />

        {stay && (
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">Rooms</p>
                <p className="text-xs text-slate-400">Up to 4 guests per room</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Remove room"
                  disabled={rooms <= 1}
                  onClick={() => setRooms((value) => Math.max(1, value - 1))}
                  className="size-9 flex items-center justify-center rounded-full border border-slate-200 text-base font-bold text-slate-700 active:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {rooms}
                </span>
                <button
                  type="button"
                  aria-label="Add room"
                  disabled={rooms >= 6}
                  onClick={() => setRooms((value) => Math.min(6, value + 1))}
                  className="size-9 flex items-center justify-center rounded-full border border-slate-200 text-base font-bold text-slate-700 active:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};
