import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  BedDouble,
  CalendarDays,
  Car,
  MapPin,
  Plane,
  Search,
  TrainFront,
  Users
} from "lucide-react";
import {
  FloatingField,
  GlassCard,
  PremiumButton
} from "../ui/primitives";
import {
  DateRangePicker,
  formatDate,
  type DateRange
} from "../ui/DateRangePicker";
import {
  summariseTravellers,
  TravellerPicker,
  type CabinClass,
  type TravellerCounts
} from "../ui/TravellerPicker";
import { useDismissable } from "../ui/useDismissable";

export type SearchMode = "flights" | "stays" | "trains" | "cars";
export type TripType = "oneway" | "round";

export interface SearchPayload {
  mode: SearchMode;
  tripType: TripType;
  origin: string;
  destination: string;
  dates: DateRange;
  travellers: TravellerCounts;
  cabin: CabinClass;
  rooms: number;
}

const TABS: Array<{ id: SearchMode; label: string; icon: React.ReactNode }> = [
  { id: "flights", label: "Flights", icon: <Plane className="h-4 w-4" /> },
  { id: "stays", label: "Stays", icon: <BedDouble className="h-4 w-4" /> },
  { id: "trains", label: "Trains", icon: <TrainFront className="h-4 w-4" /> },
  { id: "cars", label: "Cabs", icon: <Car className="h-4 w-4" /> }
];

/** Placeholder suggestions - swap for the live location API when wiring up. */
const SUGGESTIONS = [
  "Mumbai, India (BOM)",
  "Delhi, India (DEL)",
  "Goa, India (GOI)",
  "Bengaluru, India (BLR)",
  "Dubai, UAE (DXB)",
  "Singapore (SIN)"
];

type Popover = "dates" | "travellers" | null;

export interface SearchWidgetProps {
  onSearch?: (payload: SearchPayload) => void;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({ onSearch }) => {
  const [mode, setMode] = useState<SearchMode>("flights");
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState<DateRange>({ start: null, end: null });
  const [travellers, setTravellers] = useState<TravellerCounts>({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [cabin, setCabin] = useState<CabinClass>("Economy");
  const [rooms, setRooms] = useState(1);
  const [popover, setPopover] = useState<Popover>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<
    "origin" | "destination" | null
  >(null);

  const popoverRef = useDismissable<HTMLDivElement>(popover !== null, () =>
    setPopover(null)
  );
  const suggestionRef = useDismissable<HTMLDivElement>(
    activeSuggestion !== null,
    () => setActiveSuggestion(null)
  );

  const isStay = mode === "stays";
  const rangeMode = isStay || tripType === "round";

  const dateLabel = useMemo(() => {
    if (!dates.start) return "";
    if (!rangeMode) return formatDate(dates.start);
    return dates.end
      ? `${formatDate(dates.start)} → ${formatDate(dates.end)}`
      : formatDate(dates.start);
  }, [dates, rangeMode]);

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const submit = () =>
    onSearch?.({
      mode,
      tripType,
      origin,
      destination,
      dates,
      travellers,
      cabin,
      rooms
    });

  const suggestionList = (
    field: "origin" | "destination",
    apply: (value: string) => void
  ) => {
    const query = (field === "origin" ? origin : destination).trim().toLowerCase();
    const matches = query
      ? SUGGESTIONS.filter((item) => item.toLowerCase().includes(query))
      : SUGGESTIONS;

    return (
    <AnimatePresence>
      {activeSuggestion === field && matches.length > 0 ? (
        <motion.ul
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 top-[76px] z-30 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)]"
        >
          {matches.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => {
                  apply(item);
                  setActiveSuggestion(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-slate-300" />
                {item}
              </button>
            </li>
          ))}
        </motion.ul>
      ) : null}
    </AnimatePresence>
    );
  };

  return (
    <GlassCard className="p-3 sm:p-4">
      {/* Vertical tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-2xl bg-slate-100/70 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${
              mode === tab.id
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {mode === tab.id ? (
              <motion.span
                layoutId="premium-search-tab"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-xl bg-white shadow-sm"
              />
            ) : null}
            <span className="relative flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Trip type - flights and trains only */}
      {mode === "flights" || mode === "trains" ? (
        <div className="mb-3 flex gap-2 px-1">
          {(
            [
              { id: "oneway", label: "One way" },
              { id: "round", label: "Round trip" }
            ] as Array<{ id: TripType; label: string }>
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTripType(option.id)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                tripType === option.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={suggestionRef}
        className="grid gap-2 lg:grid-cols-[1fr_1fr_1.1fr_1fr_auto]"
      >
        <div className="relative">
          <FloatingField
            label={isStay ? "City or hotel" : "From"}
            value={isStay ? destination : origin}
            placeholder={isStay ? "Where are you going?" : "Origin city"}
            icon={<MapPin className="h-5 w-5" />}
            onChange={isStay ? setDestination : setOrigin}
            onFocus={() =>
              setActiveSuggestion(isStay ? "destination" : "origin")
            }
          />
          {suggestionList(
            isStay ? "destination" : "origin",
            isStay ? setDestination : setOrigin
          )}
        </div>

        {isStay ? (
          <FloatingField
            label="Rooms"
            value={`${rooms} Room${rooms > 1 ? "s" : ""}`}
            icon={<BedDouble className="h-5 w-5" />}
            onClick={() => setRooms(rooms >= 5 ? 1 : rooms + 1)}
            hint="Tap"
          />
        ) : (
          <div className="relative">
            <FloatingField
              label="To"
              value={destination}
              placeholder="Destination city"
              icon={<MapPin className="h-5 w-5" />}
              onChange={setDestination}
              onFocus={() => setActiveSuggestion("destination")}
            />
            {suggestionList("destination", setDestination)}
            <button
              type="button"
              onClick={swap}
              aria-label="Swap origin and destination"
              className="absolute -left-4 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-all hover:border-slate-900 hover:text-slate-900 active:scale-95 lg:flex"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="relative" ref={popover === "dates" ? popoverRef : null}>
          <FloatingField
            label={isStay ? "Check in — Check out" : "Travel dates"}
            value={dateLabel}
            placeholder="Add dates"
            icon={<CalendarDays className="h-5 w-5" />}
            onClick={() => setPopover(popover === "dates" ? null : "dates")}
          />
          <AnimatePresence>
            {popover === "dates" ? (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-[76px] z-40"
              >
                <DateRangePicker
                  value={dates}
                  rangeMode={rangeMode}
                  onChange={setDates}
                  onClose={() => setPopover(null)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          className="relative"
          ref={popover === "travellers" ? popoverRef : null}
        >
          <FloatingField
            label={isStay ? "Guests" : "Travellers"}
            value={summariseTravellers(travellers, cabin)}
            icon={<Users className="h-5 w-5" />}
            onClick={() =>
              setPopover(popover === "travellers" ? null : "travellers")
            }
          />
          <AnimatePresence>
            {popover === "travellers" ? (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-[76px] z-40"
              >
                <TravellerPicker
                  counts={travellers}
                  cabin={cabin}
                  showCabin={mode === "flights"}
                  onChange={setTravellers}
                  onCabinChange={setCabin}
                  onClose={() => setPopover(null)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <PremiumButton
          size="lg"
          onClick={submit}
          icon={<Search className="h-5 w-5" />}
          className="h-[68px] w-full rounded-2xl lg:w-[68px] lg:px-0"
        >
          <span className="lg:hidden">Search</span>
        </PremiumButton>
      </div>
    </GlassCard>
  );
};
