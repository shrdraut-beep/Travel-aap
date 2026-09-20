import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  Building2, 
  Bus, 
  Car, 
  Clock, 
  Loader2, 
  MapPin, 
  Palmtree, 
  Plane, 
  Search, 
  Train, 
  X 
} from "lucide-react";
import { Sheet } from "./Sheet";
import type { SearchMode } from "./types";
import { MASTER_CITIES_CLIENT, MasterCityItem } from "../../data/masterCities";
import { ALL_AIRPORTS } from "../../data/airports";
import { ALL_RAILWAY_STATIONS } from "../../data/railwayStations";

export interface CityOption {
  code: string;
  city: string;
  detail: string;
  id?: string;
  cityMr?: string;
  state?: string;
  airportCode?: string;
  airportName?: string;
  railwayCode?: string;
  railwayStationName?: string;
  busTerminal?: string;
  type?: 'city' | 'airport' | 'station' | 'hotel' | 'custom';
}

export interface CitySheetProps {
  open: boolean;
  title: string;
  mode?: SearchMode;
  /** Legacy or custom options if passed */
  options?: CityOption[];
  onSelect: (label: string, item?: MasterCityItem | CityOption) => void;
  onClose: () => void;
}

// Popular quick chips per search mode
const POPULAR_CHIPS_BY_MODE: Record<SearchMode, Array<{ code: string; label: string; value: string }>> = {
  flights: [
    { code: "BOM", label: "Mumbai", value: "Mumbai (BOM)" },
    { code: "DEL", label: "Delhi", value: "New Delhi (DEL)" },
    { code: "BLR", label: "Bengaluru", value: "Bengaluru (BLR)" },
    { code: "GOI", label: "Goa", value: "Goa (GOI)" },
    { code: "PNQ", label: "Pune", value: "Pune (PNQ)" },
    { code: "ISK", label: "Nashik", value: "Nashik (ISK)" },
    { code: "HYD", label: "Hyderabad", value: "Hyderabad (HYD)" },
    { code: "DXB", label: "Dubai", value: "Dubai (DXB)" }
  ],
  trains: [
    { code: "CSMT", label: "Mumbai", value: "Mumbai (CSMT)" },
    { code: "PUNE", label: "Pune", value: "Pune (PUNE)" },
    { code: "NK", label: "Nashik", value: "Nashik (NK)" },
    { code: "NDLS", label: "Delhi", value: "New Delhi (NDLS)" },
    { code: "BSB", label: "Varanasi", value: "Varanasi (BSB)" },
    { code: "ST", label: "Surat", value: "Surat (ST)" },
    { code: "HYB", label: "Hyderabad", value: "Hyderabad (HYB)" }
  ],
  hotels: [
    { code: "GOA", label: "Goa", value: "Goa" },
    { code: "BOM", label: "Mumbai", value: "Mumbai" },
    { code: "ISK", label: "Nashik", value: "Nashik" },
    { code: "MHB", label: "Mahabaleshwar", value: "Mahabaleshwar" },
    { code: "JAI", label: "Jaipur", value: "Jaipur" },
    { code: "UDR", label: "Udaipur", value: "Udaipur" },
    { code: "MNL", label: "Manali", value: "Manali" }
  ],
  buses: [
    { code: "PUNE", label: "Pune", value: "Pune" },
    { code: "BOM", label: "Mumbai", value: "Mumbai" },
    { code: "ISK", label: "Nashik", value: "Nashik" },
    { code: "KLH", label: "Kolhapur", value: "Kolhapur" },
    { code: "SAG", label: "Shirdi", value: "Shirdi" },
    { code: "GOA", label: "Goa", value: "Goa" }
  ],
  cabs: [
    { code: "BOM", label: "Mumbai", value: "Mumbai" },
    { code: "PUNE", label: "Pune", value: "Pune" },
    { code: "ISK", label: "Nashik", value: "Nashik" },
    { code: "LNV", label: "Lonavala", value: "Lonavala" },
    { code: "SAG", label: "Shirdi", value: "Shirdi" },
    { code: "MHB", label: "Mahabaleshwar", value: "Mahabaleshwar" }
  ],
  holidays: [
    { code: "GOA", label: "Goa", value: "Goa" },
    { code: "SXR", label: "Kashmir", value: "Srinagar" },
    { code: "COK", label: "Kerala", value: "Kochi" },
    { code: "DXB", label: "Dubai", value: "Dubai" },
    { code: "MLE", label: "Maldives", value: "Maldives" }
  ]
};

// Recent suggested destinations per mode
const RECENT_BY_MODE: Record<SearchMode, Array<{ label: string; value: string }>> = {
  flights: [
    { label: "Mumbai (BOM)", value: "Mumbai (BOM)" },
    { label: "Delhi (DEL)", value: "New Delhi (DEL)" },
    { label: "Nashik (ISK)", value: "Nashik (ISK)" },
    { label: "Goa (GOI)", value: "Goa (GOI)" }
  ],
  trains: [
    { label: "Mumbai (CSMT)", value: "Mumbai (CSMT)" },
    { label: "Pune (PUNE)", value: "Pune (PUNE)" },
    { label: "Nashik (NK)", value: "Nashik (NK)" },
    { label: "Varanasi (BSB)", value: "Varanasi (BSB)" }
  ],
  hotels: [
    { label: "Goa", value: "Goa" },
    { label: "Nashik", value: "Nashik" },
    { label: "Mumbai", value: "Mumbai" },
    { label: "Jaipur", value: "Jaipur" }
  ],
  buses: [
    { label: "Pune", value: "Pune" },
    { label: "Nashik", value: "Nashik" },
    { label: "Mumbai", value: "Mumbai" },
    { label: "Kolhapur", value: "Kolhapur" }
  ],
  cabs: [
    { label: "Mumbai", value: "Mumbai" },
    { label: "Pune", value: "Pune" },
    { label: "Nashik", value: "Nashik" },
    { label: "Lonavala", value: "Lonavala" }
  ],
  holidays: [
    { label: "Goa", value: "Goa" },
    { label: "Srinagar", value: "Srinagar" },
    { label: "Kochi", value: "Kochi" },
    { label: "Dubai", value: "Dubai" }
  ]
};

/**
 * Full-screen Master City & Location Picker
 * Seamlessly resolves city name into specific transport entity:
 * - Flights: Automatically resolves city to commercial airport (e.g. Nashik -> ISK)
 * - Trains: Automatically resolves city to railway station (e.g. Nashik -> NK)
 * - Hotels / Stays: Selects clean city name & Master City ID (e.g. Nashik, CITY-ISK)
 * - Buses: Selects city and central bus terminal (e.g. Nashik CBS)
 * - Cabs: Selects doorstep city (e.g. Nashik)
 */
export const CitySheet: React.FC<CitySheetProps> = ({
  open,
  title,
  mode = "flights",
  options,
  onSelect,
  onClose
}) => {
  const [query, setQuery] = useState("");
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [serverResults, setServerResults] = useState<CityOption[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Clear query on modal close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setServerResults([]);
    }
  }, [open]);

  // Live unified backend search when query >= 3 chars
  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 3) {
      setServerResults([]);
      setIsServerLoading(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsServerLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(clean)}&index=all&limit=20`, {
      signal: controller.signal
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !data.success) return;
        const fetched: CityOption[] = [];

        // 1. Process Master Cities from server
        if (Array.isArray(data.cities)) {
          data.cities.forEach((c: any) => {
            const cityName = c.name || c.city || '';
            const aptCode = c.airportCode;
            const rCode = c.railwayCode;

            let code = c.id || 'CITY';
            let detail = `${c.state ? `${c.state}, ` : ''}${c.country || 'India'}`;

            if (mode === 'flights') {
              code = aptCode || c.id;
              detail = `${c.airportName || `${cityName} Airport`} • ${c.state || 'India'}`;
            } else if (mode === 'trains') {
              code = rCode || c.id;
              detail = `${c.railwayStationName || `${cityName} Railway Station`} • ${c.state || 'India'}`;
            } else if (mode === 'buses') {
              detail = `${c.busTerminal || `${cityName} Central Bus Stand`} • ${c.state || 'India'}`;
            }

            fetched.push({
              id: c.id,
              city: cityName,
              cityMr: c.nameMr || c.cityMr,
              code,
              detail,
              state: c.state,
              airportCode: aptCode,
              airportName: c.airportName,
              railwayCode: rCode,
              railwayStationName: c.railwayStationName,
              busTerminal: c.busTerminal,
              type: 'city'
            });
          });
        }

        // 2. Process Airports from server
        if (mode === 'flights' && Array.isArray(data.airports)) {
          data.airports.forEach((a: any) => {
            fetched.push({
              code: a.iata_code,
              city: a.city,
              detail: `${a.airport_name} (${a.iata_code}) • ${a.country || 'India'}`,
              airportCode: a.iata_code,
              airportName: a.airport_name,
              type: 'airport'
            });
          });
        }

        // 3. Process Train Stations from server
        if (mode === 'trains' && Array.isArray(data.train_stations)) {
          data.train_stations.forEach((s: any) => {
            fetched.push({
              code: s.code,
              city: s.address ? s.address.split(',')[0].trim() : s.name,
              detail: `${s.name} (${s.code}) • ${s.state || 'India'}`,
              railwayCode: s.code,
              railwayStationName: s.name,
              type: 'station'
            });
          });
        }

        setServerResults(fetched);
        setIsServerLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsServerLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, mode]);

  // Master local client dataset resolution
  const localOptions = useMemo<CityOption[]>(() => {
    return MASTER_CITIES_CLIENT.map((c) => {
      let code = c.id;
      let detail = `${c.state ? `${c.state}, ` : ''}${c.country}`;

      if (mode === 'flights') {
        code = c.airportCode || c.id;
        detail = `${c.airportName || `${c.city} Airport`} (${c.airportCode || 'APT'}) • ${c.state}`;
      } else if (mode === 'trains') {
        code = c.railwayCode || c.id;
        detail = `${c.railwayStationName || `${c.city} Station`} (${c.railwayCode || 'RLY'}) • ${c.state}`;
      } else if (mode === 'hotels') {
        code = c.id;
        detail = `${c.state}, India • Master City ID: ${c.id}`;
      } else if (mode === 'buses') {
        code = 'BUS';
        detail = `${c.busTerminal || `${c.city} Central Bus Stand`}, ${c.state}`;
      } else if (mode === 'cabs') {
        code = 'CAB';
        detail = `Doorstep Pickup & Outstation Cab Service • ${c.state}`;
      } else if (mode === 'holidays') {
        code = 'TOUR';
        detail = `Holiday Packages & Curated Tours • ${c.state}`;
      }

      return {
        id: c.id,
        city: c.city,
        cityMr: c.cityMr,
        code,
        detail,
        state: c.state,
        airportCode: c.airportCode,
        airportName: c.airportName,
        railwayCode: c.railwayCode,
        railwayStationName: c.railwayStationName,
        busTerminal: c.busTerminal,
        type: 'city' as const
      };
    });
  }, [mode]);

  // Filter and rank matches
  const matches = useMemo<CityOption[]>(() => {
    const term = query.trim().toLowerCase();

    // If options was explicitly provided and query is empty, allow fallback
    const baseList = options && options.length > 0 && !query ? options : localOptions;

    if (!term) {
      return baseList.slice(0, 30);
    }

    const map = new Map<string, CityOption>();

    // 1. Match from Local Master Cities
    baseList.forEach((item) => {
      const cityLower = item.city.toLowerCase();
      const codeLower = (item.code || '').toLowerCase();
      const idLower = (item.id || '').toLowerCase();
      const mrLower = (item.cityMr || '').toLowerCase();
      const aptLower = (item.airportCode || '').toLowerCase();
      const rlyLower = (item.railwayCode || '').toLowerCase();
      const detailLower = (item.detail || '').toLowerCase();

      if (
        cityLower.includes(term) ||
        codeLower.includes(term) ||
        idLower.includes(term) ||
        mrLower.includes(term) ||
        aptLower.includes(term) ||
        rlyLower.includes(term) ||
        detailLower.includes(term)
      ) {
        map.set(`${item.city}-${item.code}`.toLowerCase(), item);
      }
    });

    // 2. Merge server results
    serverResults.forEach((item) => {
      const key = `${item.city}-${item.code}`.toLowerCase();
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    // 3. Mode auxiliary lists if not found
    if (mode === 'flights') {
      ALL_AIRPORTS.filter(
        (a) =>
          a.city.toLowerCase().includes(term) ||
          a.code.toLowerCase().includes(term) ||
          a.airport.toLowerCase().includes(term)
      ).slice(0, 5).forEach((a) => {
        const key = `${a.city}-${a.code}`.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            city: a.city,
            code: a.code,
            airportCode: a.code,
            airportName: a.airport,
            detail: `${a.airport} (${a.code}) • ${a.country}`,
            type: 'airport'
          });
        }
      });
    } else if (mode === 'trains') {
      ALL_RAILWAY_STATIONS.filter(
        (s) =>
          s.city.toLowerCase().includes(term) ||
          s.code.toLowerCase().includes(term) ||
          s.station.toLowerCase().includes(term)
      ).slice(0, 5).forEach((s) => {
        const key = `${s.city}-${s.code}`.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            city: s.city,
            code: s.code,
            railwayCode: s.code,
            railwayStationName: s.station,
            detail: `${s.station} (${s.code}) • Indian Railways`,
            type: 'station'
          });
        }
      });
    }

    const list = Array.from(map.values());

    // Sort exact city / code matches to the top
    list.sort((a, b) => {
      const aCity = a.city.toLowerCase();
      const bCity = b.city.toLowerCase();
      const aCode = (a.code || '').toLowerCase();
      const bCode = (b.code || '').toLowerCase();

      const aExact = aCity === term || aCode === term ? 100 : 0;
      const bExact = bCity === term || bCode === term ? 100 : 0;
      const aStarts = aCity.startsWith(term) || aCode.startsWith(term) ? 40 : 0;
      const bStarts = bCity.startsWith(term) || bCode.startsWith(term) ? 40 : 0;

      return (bExact + bStarts) - (aExact + aStarts);
    });

    return list.slice(0, 25);
  }, [query, localOptions, serverResults, options, mode]);

  // Mode-intelligent selection emission
  const choose = (option: CityOption | { label: string; value: string; code?: string }) => {
    let emitValue = '';

    if ('value' in option && option.value) {
      emitValue = option.value;
    } else {
      const opt = option as CityOption;
      if (mode === 'flights') {
        const aptCode = opt.airportCode || opt.code;
        emitValue = `${opt.city} (${aptCode})`;
      } else if (mode === 'trains') {
        const rlyCode = opt.railwayCode || opt.code;
        emitValue = `${opt.city} (${rlyCode})`;
      } else {
        // Hotels, Buses, Cabs, Holidays: Clean city name
        emitValue = opt.city;
      }
    }

    setQuery("");
    onSelect(emitValue, 'city' in option ? (option as CityOption) : undefined);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'flights':
        return <Plane className="h-4.5 w-4.5 text-rose-500" />;
      case 'trains':
        return <Train className="h-4.5 w-4.5 text-amber-600" />;
      case 'hotels':
        return <Building2 className="h-4.5 w-4.5 text-purple-600" />;
      case 'buses':
        return <Bus className="h-4.5 w-4.5 text-sky-600" />;
      case 'cabs':
        return <Car className="h-4.5 w-4.5 text-emerald-600" />;
      case 'holidays':
        return <Palmtree className="h-4.5 w-4.5 text-teal-600" />;
      default:
        return <MapPin className="h-4.5 w-4.5 text-slate-500" />;
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'flights':
        return "Search city or airport (e.g. Nashik, BOM, Pune, Delhi)...";
      case 'trains':
        return "Search city or railway station (e.g. Nashik, CSMT, Pune)...";
      case 'hotels':
        return "Search city or hotel destination (e.g. Nashik, Goa, Mumbai)...";
      case 'buses':
        return "Search city or bus terminal (e.g. Nashik, Pune, Shirdi)...";
      case 'cabs':
        return "Search pickup / drop city (e.g. Nashik, Mumbai, Lonavala)...";
      case 'holidays':
        return "Search tour package destination (e.g. Goa, Kashmir, Kerala)...";
      default:
        return "Search city or location (e.g. Nashik, Mumbai)...";
    }
  };

  const chips = POPULAR_CHIPS_BY_MODE[mode] || POPULAR_CHIPS_BY_MODE.flights;
  const recentItems = RECENT_BY_MODE[mode] || RECENT_BY_MODE.flights;

  return (
    <Sheet open={open} title={title} variant="full" onClose={onClose}>
      <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-3 border-b border-slate-100">
        {/* Search Input Bar */}
        <div className="flex h-12 items-center gap-2.5 rounded-2xl bg-slate-100 px-3.5 border border-slate-200/80 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-inner">
          <span className="shrink-0">{getModeIcon()}</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className="h-full w-full border-0 bg-transparent text-[14px] font-bold text-slate-900 outline-none placeholder:text-slate-400"
          />
          {isServerLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
          )}
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 active:bg-slate-200 shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* 1-Tap Popular Chips */}
        <div className="flex gap-1.5 pt-3 overflow-x-auto no-scrollbar pb-1">
          {chips.map((chip) => (
            <button
              key={chip.code}
              type="button"
              onClick={() => choose(chip)}
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/60 text-xs font-bold text-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[10px] font-black text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/60">
                {chip.code}
              </span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {!query && recentItems.length > 0 && (
        <div className="px-4 pb-2 pt-3">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => choose(item)}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-700 active:bg-slate-200 border border-slate-200/60 hover:border-slate-300 transition-all cursor-pointer"
              >
                <Clock className="h-3 w-3 text-slate-400" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick custom selection button if user typed custom text */}
      {query.trim().length >= 2 && (
        <div className="px-4 pt-2">
          <button
            type="button"
            onClick={() => choose({ label: query.trim(), value: query.trim() })}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/70 border border-sky-200 text-sky-900 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-xs font-bold truncate">
                Use &quot;<strong className="text-sky-700 font-extrabold">{query.trim()}</strong>&quot; as location
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-200 shrink-0">
              Select
            </span>
          </button>
        </div>
      )}

      {/* Result Section Header */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 flex items-center gap-1.5">
          {getModeIcon()}
          {query ? `Search Results (${matches.length})` : "Available Cities & Hubs"}
        </p>
        <span className="text-[10px] font-bold text-slate-400">
          Master City Dataset
        </span>
      </div>

      {/* Results List */}
      <ul className="px-2 pb-12 pt-1 divide-y divide-slate-100">
        {matches.map((option, idx) => {
          // Display title and code based on mode
          const isFlight = mode === 'flights';
          const isTrain = mode === 'trains';
          const displayTitle = option.city;
          const displayCode = isFlight
            ? (option.airportCode || option.code)
            : isTrain
            ? (option.railwayCode || option.code)
            : (option.id || option.code);

          return (
            <li key={`${option.id || option.code}-${option.city}-${idx}`}>
              <button
                type="button"
                onClick={() => choose(option)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                  isFlight
                    ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'
                    : isTrain
                    ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
                    : mode === 'hotels'
                    ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white'
                    : mode === 'buses'
                    ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white'
                    : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
                }`}>
                  {isFlight ? (
                    <Plane className="h-4.5 w-4.5" />
                  ) : isTrain ? (
                    <Train className="h-4.5 w-4.5" />
                  ) : mode === 'hotels' ? (
                    <Building2 className="h-4.5 w-4.5" />
                  ) : mode === 'buses' ? (
                    <Bus className="h-4.5 w-4.5" />
                  ) : mode === 'cabs' ? (
                    <Car className="h-4.5 w-4.5" />
                  ) : (
                    <MapPin className="h-4.5 w-4.5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {displayTitle}
                    </span>
                    {option.cityMr && (
                      <span className="text-slate-400 font-bold text-xs truncate">
                        [{option.cityMr}]
                      </span>
                    )}
                    {isFlight && option.airportCode && (
                      <span className="text-rose-600 font-mono font-black text-xs">
                        ({option.airportCode})
                      </span>
                    )}
                    {isTrain && option.railwayCode && (
                      <span className="text-amber-600 font-mono font-black text-xs">
                        ({option.railwayCode})
                      </span>
                    )}
                  </div>

                  <span className="block truncate text-[11px] font-medium text-slate-500 mt-0.5">
                    {option.detail}
                  </span>
                </div>

                {displayCode && (
                  <span className={`shrink-0 font-mono font-black text-xs px-2.5 py-1 rounded-xl border shadow-2xs ${
                    isFlight
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : isTrain
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : mode === 'hotels'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {displayCode}
                  </span>
                )}
              </button>
            </li>
          );
        })}

        {matches.length === 0 && (
          <li className="px-4 py-12 text-center">
            <p className="text-[14px] font-bold text-slate-700">
              No matching destinations found for “<span className="text-sky-600">{query}</span>”.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Use as location&quot; above to search with your custom text.
            </p>
          </li>
        )}
      </ul>
    </Sheet>
  );
};
export default CitySheet;
