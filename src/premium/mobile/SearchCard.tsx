import React, { useState } from "react";
import { ArrowUpDown, CalendarDays, MapPin, Search, Users } from "lucide-react";
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
import type { SearchMode, SearchPayload, TripType } from "./types";

const TRIP_LABELS: Record<TripType, string> = {
  oneway: "One way",
  round: "Round trip"
};

const PLACE_LABELS: Record<SearchMode, { from: string; to: string }> = {
  flights: { from: "From", to: "To" },
  hotels: { from: "City, area or hotel", to: "" },
  trains: { from: "From", to: "To" },
  buses: { from: "From", to: "To" },
  cabs: { from: "Pickup", to: "Drop" }
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
    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-slate-50"
  >
    <span className="shrink-0 text-slate-400">{icon}</span>
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
  const [sheet, setSheet] = useState<
    "origin" | "destination" | "dates" | "travellers" | null
  >(null);

  const stay = mode === "hotels";
  const labels = PLACE_LABELS[mode];
  const showTripType = mode === "flights" || mode === "trains";
  const rangeMode = stay || tripType === "round";

  const close = () => setSheet(null);

  const dateValue = (date: Date | null) =>
    date ? `${formatDay(date)} ${formatMonthYear(date)}` : "";

  const submit = () =>
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

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)]">
        {showTripType ? (
          <div className="flex gap-2 border-b border-slate-100 px-4 py-3">
            {(Object.keys(TRIP_LABELS) as TripType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTripType(type);
                  if (type === "oneway") {
                    setDates((current) => ({ ...current, end: null }));
                  }
                }}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                  tripType === type
                    ? "bg-[var(--color-coral)]/10 text-[var(--color-coral)]"
                    : "text-slate-500"
                }`}
              >
                {TRIP_LABELS[type]}
              </button>
            ))}
          </div>
        ) : null}

        <div className="divide-y divide-slate-100">
          <div className="relative divide-y divide-slate-100">
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
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm active:bg-slate-100"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>

          <div className="flex divide-x divide-slate-100">
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

        <div className="px-4 pb-4 pt-4">
          <PremiumButton
            className="h-13 w-full text-[16px]"
            icon={<Search className="h-4.5 w-4.5" />}
            onClick={submit}
          >
            Search {stay ? "hotels" : mode}
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
