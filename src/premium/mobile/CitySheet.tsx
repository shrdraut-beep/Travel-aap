import React, { useMemo, useState } from "react";
import { Clock, MapPin, Plane, Search, X } from "lucide-react";
import { Sheet } from "./Sheet";

export interface CityOption {
  code: string;
  city: string;
  detail: string;
}

const CITIES: CityOption[] = [
  { code: "BOM", city: "Mumbai", detail: "Chhatrapati Shivaji Maharaj Intl (BOM), India" },
  { code: "DEL", city: "New Delhi", detail: "Indira Gandhi Intl (DEL), India" },
  { code: "BLR", city: "Bengaluru", detail: "Kempegowda Intl (BLR), India" },
  { code: "GOI", city: "Goa (Dabolim)", detail: "Dabolim Airport (GOI), India" },
  { code: "GOX", city: "Goa (Mopa)", detail: "Manohar Intl Airport (GOX), India" },
  { code: "PNQ", city: "Pune", detail: "Pune Intl Airport (PNQ), India" },
  { code: "HYD", city: "Hyderabad", detail: "Rajiv Gandhi Intl (HYD), India" },
  { code: "MAA", city: "Chennai", detail: "Chennai Intl (MAA), India" },
  { code: "CCU", city: "Kolkata", detail: "Netaji Subhas Chandra Bose (CCU), India" },
  { code: "JAI", city: "Jaipur", detail: "Jaipur Intl (JAI), India" },
  { code: "AMD", city: "Ahmedabad", detail: "Sardar Vallabhbhai Patel (AMD), India" },
  { code: "COK", city: "Kochi", detail: "Cochin Intl Airport (COK), India" },
  { code: "DXB", city: "Dubai", detail: "Dubai Intl Airport (DXB), UAE" },
  { code: "SIN", city: "Singapore", detail: "Singapore Changi Airport (SIN), Singapore" },
  { code: "BKK", city: "Bangkok", detail: "Suvarnabhumi Airport (BKK), Thailand" }
];

const POPULAR_CHIPS = [
  { code: "BOM", label: "Mumbai" },
  { code: "DEL", label: "Delhi" },
  { code: "BLR", label: "Bengaluru" },
  { code: "GOI", label: "Goa" },
  { code: "PNQ", label: "Pune" },
  { code: "HYD", label: "Hyderabad" },
  { code: "DXB", label: "Dubai" },
  { code: "SIN", label: "Singapore" }
];

const RECENT = ["Mumbai", "Goa", "New Delhi"];

export interface CitySheetProps {
  open: boolean;
  title: string;
  /** Cities to offer; defaults to the built-in demo list. */
  options?: CityOption[];
  onSelect: (label: string) => void;
  onClose: () => void;
}

/** Full-screen city picker with search-as-you-type, 1-tap chips, and recent searches. */
export const CitySheet: React.FC<CitySheetProps> = ({
  open,
  title,
  options = CITIES,
  onSelect,
  onClose
}) => {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (option) =>
        option.city.toLowerCase().includes(term) ||
        option.code.toLowerCase().includes(term) ||
        option.detail.toLowerCase().includes(term)
    );
  }, [options, query]);

  const choose = (label: string) => {
    setQuery("");
    onSelect(label);
  };

  return (
    <Sheet open={open} title={title} variant="full" onClose={onClose}>
      <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-3">
        <div className="flex h-12 items-center gap-2 rounded-2xl bg-slate-100 px-3.5 border border-slate-200/80 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-inner">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city, airport code (e.g. BOM, DEL, Goa)..."
            className="h-full w-full border-0 bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 active:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Instant Popular Metro 1-Tap Chips */}
        <div className="flex gap-1.5 pt-3 overflow-x-auto no-scrollbar pb-1">
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip.code}
              type="button"
              onClick={() => choose(`${chip.label} (${chip.code})`)}
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/60 text-xs font-bold text-slate-700 active:scale-95 transition-all"
            >
              <span className="text-[10px] font-black text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/60">
                {chip.code}
              </span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {!query ? (
        <div className="px-4 pb-2 pt-1">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {RECENT.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => choose(city)}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-[13px] font-bold text-slate-700 active:bg-slate-200 border border-slate-200/60"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {city}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="px-4 pt-2">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-1 flex items-center gap-1">
          <Plane className="w-3 h-3 text-premium-violet" />
          {query ? `Search Results (${matches.length})` : "All Airports & Destinations"}
        </p>
      </div>

      <ul className="px-2 pb-8 pt-1 divide-y divide-slate-100">
        {matches.map((option) => (
          <li key={option.code}>
            <button
              type="button"
              onClick={() => choose(`${option.city} (${option.code})`)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-slate-100 hover:bg-slate-50 transition-colors group"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-premium-violet-soft/80 text-premium-violet group-hover:bg-premium-violet-soft group-hover:text-white transition-colors">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-slate-900 group-hover:text-premium-violet transition-colors">
                  {option.city}
                </span>
                <span className="block truncate text-[12px] font-medium text-slate-400">
                  {option.detail}
                </span>
              </span>
              <span className="shrink-0 text-[13px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
                {option.code}
              </span>
            </button>
          </li>
        ))}

        {matches.length === 0 ? (
          <li className="px-4 py-10 text-center text-[14px] font-medium text-slate-400">
            No cities match “{query}”.
          </li>
        ) : null}
      </ul>
    </Sheet>
  );
};

