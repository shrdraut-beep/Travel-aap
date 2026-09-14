import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, CalendarDays, MapPin, Plus, Search, Trash2, Users } from "lucide-react";
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
import { PremiumButton } from "../ui/primitives";
import { Sheet } from "./Sheet";
import { CitySheet } from "./CitySheet";
import type { FlightLeg, SearchMode, SearchPayload, TripType } from "./types";

const TRIP_LABELS_KEY: Record<TripType, string> = {
  oneway: "one_way",
  round: "round_trip",
  multicity: "multi_city"
};
const TRIP_LABELS: Record<TripType, string> = {
  oneway: "One way",
  round: "Round trip",
  multicity: "Multi-city"
};

const PLACE_LABELS: Record<SearchMode, { from: string; to: string }> = {
  flights: { from: "From", to: "To" },
  hotels: { from: "City, area or hotel", to: "" },
  trains: { from: "From", to: "To" },
  buses: { from: "From", to: "To" },
  cabs: { from: "Pickup", to: "Drop" },
  holidays: { from: "Leaving from", to: "Destination or Theme" }
};

export interface SearchCardProps {
  mode: SearchMode;
  onSearch?: (payload: SearchPayload) => void;
}

/** Reads as a single tap target row: label on top, value large below. */
const Row: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, value, placeholder, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-sky-50/40"
  >
    <span className="shrink-0 text-sky-600">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>
      <span
        className={`block truncate text-[17px] font-bold tracking-tight ${
          value ? "text-slate-900" : "text-slate-300"
        }`}
      >
        {value || placeholder}
      </span>
    </span>
  </button>
);

export const SearchCard: React.FC<SearchCardProps> = ({ mode, onSearch }) => {
  const { t } = useTranslation();
  const [tripType, setTripType] = useState<TripType>("oneway");
  
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
      case 'holidays': return "Maldives";
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
  const labels = PLACE_LABELS[mode] || { from: "From", to: "To" };
  const showTripType = mode === "flights" || mode === "trains";
  const rangeMode = stay || tripType === "round";

  const close = () => setSheet(null);

  const dateValue = (date: Date | null) =>
    date ? `${formatDay(date)} ${formatMonthYear(date)}` : "";

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

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_45px_-24px_rgba(2,132,199,0.14)] border border-slate-200">
        {showTripType ? (
          <div className="flex gap-1.5 border-b border-[#f0ebe1] px-3 py-2.5 overflow-x-auto no-scrollbar">
            {availableTripTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTripType(type);
                  if (type === "oneway") {
                    setDates((current) => ({ ...current, end: null }));
                  }
                }}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all shrink-0 ${
                  tripType === type
                    ? "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#faf8f4]"
                }`}
              >
                {TRIP_LABELS[type]}
              </button>
            ))}
          </div>
        ) : null}

        {/* MULTI-CITY FLIGHTS VIEW */}
        {mode === 'flights' && tripType === 'multicity' ? (
          <div className="p-3.5 space-y-3">
            {legs.map((leg, index) => (
              <div 
                key={leg.id} 
                className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 relative transition-all hover:border-premium-violet"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-premium-violet bg-premium-violet-soft px-2 py-0.5 rounded-md border border-premium-violet">
                    Flight {index + 1}
                  </span>
                  {legs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLeg(index)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Remove flight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleOpenLegCity(index, 'origin')}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 text-left hover:border-premium-violet transition-colors"
                  >
                    <span className="block text-[10px] font-bold uppercase text-slate-400">From</span>
                    <span className="block text-[13px] font-bold text-slate-800 truncate">
                      {leg.origin || "Select origin"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenLegCity(index, 'destination')}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 text-left hover:border-premium-violet transition-colors"
                  >
                    <span className="block text-[10px] font-bold uppercase text-slate-400">To</span>
                    <span className="block text-[13px] font-bold text-slate-800 truncate">
                      {leg.destination || "Select destination"}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenLegDate(index)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-left hover:border-premium-violet transition-colors"
                >
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Departure</span>
                    <span className="block text-[13px] font-bold text-slate-800">
                      {leg.date ? `${formatDay(leg.date)} ${formatMonthYear(leg.date)} (${formatWeekday(leg.date).slice(0, 3)})` : "Select Date"}
                    </span>
                  </div>
                  <CalendarDays className="w-4 h-4 text-premium-violet" />
                </button>
              </div>
            ))}

            {legs.length < 5 && (
              <button
                type="button"
                onClick={handleAddLeg}
                className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-premium-violet bg-premium-violet-soft/50 hover:bg-premium-violet-soft text-premium-violet text-[13px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Flight (Flight {legs.length + 1})</span>
              </button>
            )}

            <div className="pt-1">
              <Row
                label="Travellers & class"
                value={summariseTravellers(travellers, cabin)}
                placeholder="Add travellers"
                icon={<Users className="h-5 w-5" />}
                onClick={() => setSheet("travellers")}
              />
            </div>
          </div>
        ) : (
          /* STANDARD ONE-WAY & ROUND-TRIP / HOTEL VIEW */
          <div className="divide-y divide-[#f0ebe1]">
            <div className="relative divide-y divide-[#f0ebe1]">
              <Row
                label={labels.from}
                value={origin}
                placeholder={stay ? "Where are you going?" : "Select city"}
                icon={<MapPin className="h-5 w-5" />}
                onClick={() => setSheet("origin")}
              />

              {!stay ? (
                <>
                  <Row
                    label={labels.to}
                    value={destination}
                    placeholder="Select city"
                    icon={<MapPin className="h-5 w-5" />}
                    onClick={() => setSheet("destination")}
                  />
                  <button
                    type="button"
                    aria-label="Swap cities"
                    onClick={() => {
                      setOrigin(destination);
                      setDestination(origin);
                    }}
                    className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-700 shadow-sm hover:bg-sky-50 active:scale-95 transition-all"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex divide-x divide-[#f0ebe1]">
              <div className="min-w-0 flex-1">
                <Row
                  label={stay ? "Check in" : "Departure"}
                  value={dateValue(dates.start)}
                  placeholder="Add date"
                  icon={<CalendarDays className="h-5 w-5" />}
                  onClick={() => setSheet("dates")}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Row
                  label={stay ? "Check out" : "Return"}
                  value={dateValue(dates.end)}
                  placeholder={
                    showTripType && tripType === "oneway" ? "Add return" : "Add date"
                  }
                  icon={<CalendarDays className="h-5 w-5" />}
                  onClick={() => {
                    if (showTripType) setTripType("round");
                    setSheet("dates");
                  }}
                />
              </div>
            </div>

            <Row
              label={stay ? "Guests & rooms" : "Travellers & class"}
              value={
                stay
                  ? `${travellers.adults + travellers.children} Guest${
                      travellers.adults + travellers.children > 1 ? "s" : ""
                    } · ${rooms} Room${rooms > 1 ? "s" : ""}`
                  : summariseTravellers(travellers, cabin)
              }
              placeholder="Add travellers"
              icon={<Users className="h-5 w-5" />}
              onClick={() => setSheet("travellers")}
            />
          </div>
        )}

        <div className="px-4 pb-4 pt-3">
          <PremiumButton
            className="h-13 w-full text-[16px]"
            icon={<Search className="h-4.5 w-4.5" />}
            onClick={submit}
          >
            Search {stay ? (mode === 'holidays' ? 'holidays' : 'hotels') : mode === 'flights' && tripType === 'multicity' ? 'Multi-City Flights' : mode}
          </PremiumButton>
        </div>
      </div>

      <CitySheet
        open={sheet === "origin"}
        title={stay ? "Where to?" : labels.from}
        onClose={close}
        onSelect={(city) => {
          setOrigin(city);
          close();
        }}
      />

      <CitySheet
        open={sheet === "destination"}
        title={labels.to || "To"}
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
          <PremiumButton onClick={close} className="w-full">
            Confirm Date
          </PremiumButton>
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

      <Sheet
        open={sheet === "dates"}
        title={stay ? "Select your stay" : "Select travel dates"}
        onClose={close}
        footer={
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-900">
                {dates.start ? formatWeekday(dates.start) : "No date selected"}
              </p>
              <p className="truncate text-[12px] font-medium text-slate-400">
                {dates.start
                  ? `${dateValue(dates.start)}${
                      dates.end ? ` → ${dateValue(dates.end)}` : ""
                    }`
                  : "Pick a date to continue"}
              </p>
            </div>
            <PremiumButton onClick={close} disabled={!dates.start}>
              Done
            </PremiumButton>
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

      <Sheet
        open={sheet === "travellers"}
        title={stay ? "Guests & rooms" : "Travellers & class"}
        onClose={close}
        footer={
          <PremiumButton className="w-full" onClick={close}>
            Apply
          </PremiumButton>
        }
      >
        <TravellerPicker
          counts={travellers}
          cabin={cabin}
          showCabin={!stay}
          onChange={setTravellers}
          onCabinChange={setCabin}
        />

        {stay ? (
          <div className="border-t border-slate-100 px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-slate-900">Rooms</p>
                <p className="text-[12px] font-medium text-slate-400">
                  Up to 4 guests per room
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Remove one room"
                  disabled={rooms <= 1}
                  onClick={() => setRooms((value) => Math.max(1, value - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[18px] font-semibold text-slate-700 active:bg-slate-100 disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-5 text-center text-[15px] font-bold text-slate-900">
                  {rooms}
                </span>
                <button
                  type="button"
                  aria-label="Add one room"
                  disabled={rooms >= 6}
                  onClick={() => setRooms((value) => Math.min(6, value + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[18px] font-semibold text-slate-700 active:bg-slate-100 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Sheet>
    </>
  );
};
