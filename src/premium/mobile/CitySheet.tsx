import React, { useMemo, useState } from "react";
import { Clock, MapPin, Search, X } from "lucide-react";
import { Sheet } from "./Sheet";

export interface CityOption {
  code: string;
  city: string;
  detail: string;
}

const CITIES: CityOption[] = [
  { code: "BOM", city: "Mumbai", detail: "Chhatrapati Shivaji Intl, India" },
  { code: "DEL", city: "New Delhi", detail: "Indira Gandhi Intl, India" },
  { code: "GOI", city: "Goa", detail: "Dabolim Airport, India" },
  { code: "BLR", city: "Bengaluru", detail: "Kempegowda Intl, India" },
  { code: "HYD", city: "Hyderabad", detail: "Rajiv Gandhi Intl, India" },
  { code: "MAA", city: "Chennai", detail: "Chennai Intl, India" },
  { code: "CCU", city: "Kolkata", detail: "Netaji Subhas Chandra Bose, India" },
  { code: "PNQ", city: "Pune", detail: "Lohegaon Airport, India" },
  { code: "JAI", city: "Jaipur", detail: "Jaipur Intl, India" },
  { code: "DXB", city: "Dubai", detail: "Dubai Intl, UAE" },
  { code: "SIN", city: "Singapore", detail: "Changi Airport, Singapore" },
  { code: "BKK", city: "Bangkok", detail: "Suvarnabhumi, Thailand" }
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

/** Full-screen city picker with search-as-you-type and recent searches. */
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
        <div className="flex h-12 items-center gap-2 rounded-2xl bg-slate-100 px-3.5">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="City, airport or station"
            className="h-full w-full border-0 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
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
      </div>

      {!query ? (
        <div className="px-4 pb-2">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {RECENT.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => choose(city)}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-[13px] font-semibold text-slate-700 active:bg-slate-200"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {city}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ul className="px-2 pb-8 pt-2">
        {matches.map((option) => (
          <li key={option.code}>
            <button
              type="button"
              onClick={() => choose(option.city)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-slate-100"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <MapPin className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-slate-900">
                  {option.city}
                </span>
                <span className="block truncate text-[12px] font-medium text-slate-400">
                  {option.detail}
                </span>
              </span>
              <span className="shrink-0 text-[12px] font-bold text-slate-400">
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
