import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plane, Train, MapPin, Search, X, Building2, Bus, Car, Check, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { ALL_AIRPORTS } from '../data/airports';
import { ALL_RAILWAY_STATIONS } from '../data/railwayStations';
import { MASTER_CITIES_CLIENT, MasterCityItem } from '../data/masterCities';

export type TransportMode = 'flights' | 'trains' | 'hotels' | 'buses' | 'cars';

export interface LocationItem {
  id?: string;
  city: string;
  airport?: string;
  station?: string;
  code: string;
  country?: string;
  state?: string;
  cityMr?: string;
  airportCode?: string;
  railwayCode?: string;
  busTerminal?: string;
  type?: 'city' | 'airport' | 'station' | 'hotel' | 'bus' | 'custom';
}

interface SearchInputProps {
  label: string;
  placeholder?: string;
  value: string; // The selected city name or code
  onChange: (codeOrCity: string, item?: LocationItem) => void;
  mode?: TransportMode;
  onModeChange?: (newMode: TransportMode) => void;
  showModeToggle?: boolean;
  lang?: string;
  className?: string;
  autoFocus?: boolean;
  iconType?: 'from' | 'to';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  autoFocus,
  label,
  placeholder = 'Type at least 3 letters (e.g. Nashik, Mumbai)...',
  value,
  onChange,
  mode = 'flights',
  onModeChange,
  showModeToggle = false,
  className = '',
  iconType = 'from',
}) => {
  const [query, setQuery] = useState(value || '');
  const debouncedQuery = useDebounce(query, 120);
  const [isOpen, setIsOpen] = useState(false);
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [serverResults, setServerResults] = useState<LocationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync displayed query if value prop changes from outside
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Fetch from live /api/search when query has at least 3 characters
  useEffect(() => {
    const clean = debouncedQuery.trim();
    if (clean.length < 3) {
      setServerResults([]);
      setIsServerLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsServerLoading(true);

    const fetchUrl = `/api/search?q=${encodeURIComponent(clean)}&index=all&limit=15`;
    fetch(fetchUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || !data.success) return;

        const items: LocationItem[] = [];

        // 1. Process Master Cities from server
        if (Array.isArray(data.cities)) {
          data.cities.forEach((c: any) => {
            items.push({
              id: c.id,
              city: c.name || c.city,
              cityMr: c.nameMr || c.cityMr,
              state: c.state,
              country: c.country || 'India',
              code: mode === 'flights' ? (c.airportCode || c.id) : mode === 'trains' ? (c.railwayCode || c.id) : c.id,
              airportCode: c.airportCode,
              airport: c.airportName,
              railwayCode: c.railwayCode,
              station: c.railwayStationName,
              busTerminal: c.busTerminal,
              type: 'city',
            });
          });
        }

        // 2. Process Airports from server
        if (mode === 'flights' && Array.isArray(data.airports)) {
          data.airports.forEach((a: any) => {
            items.push({
              city: a.city,
              airport: a.airport_name,
              code: a.iata_code,
              airportCode: a.iata_code,
              country: a.country || 'India',
              type: 'airport',
            });
          });
        }

        // 3. Process Train Stations from server
        if (mode === 'trains' && Array.isArray(data.train_stations)) {
          data.train_stations.forEach((s: any) => {
            items.push({
              city: s.address ? s.address.split(',')[0] : s.name,
              station: s.name,
              code: s.code,
              railwayCode: s.code,
              state: s.state,
              country: 'India',
              type: 'station',
            });
          });
        }

        // 4. Process Hotels from server (if mode is hotels)
        if (mode === 'hotels' && Array.isArray(data.hotels)) {
          data.hotels.forEach((h: any) => {
            items.push({
              id: h.id,
              city: h.city,
              state: h.state,
              country: 'India',
              code: h.city_id || h.id,
              type: 'hotel',
            });
          });
        }

        setServerResults(items);
        setIsServerLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsServerLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, mode]);

  // Instant local Master Cities search (0ms response guarantee)
  const localMatchedCities = useMemo<LocationItem[]>(() => {
    const clean = debouncedQuery.trim().toLowerCase();
    if (clean.length < 3) {
      return [];
    }

    const matched = MASTER_CITIES_CLIENT.filter((c) => {
      return (
        c.city.toLowerCase().includes(clean) ||
        (c.cityMr && c.cityMr.includes(clean)) ||
        c.id.toLowerCase().includes(clean) ||
        c.state.toLowerCase().includes(clean) ||
        (c.airportCode && c.airportCode.toLowerCase().includes(clean)) ||
        (c.railwayCode && c.railwayCode.toLowerCase().includes(clean)) ||
        c.keywords.some((k) => k.toLowerCase().includes(clean))
      );
    });

    return matched.map((c) => ({
      id: c.id,
      city: c.city,
      cityMr: c.cityMr,
      state: c.state,
      country: c.country,
      code: mode === 'flights' ? (c.airportCode || c.id) : mode === 'trains' ? (c.railwayCode || c.id) : c.id,
      airportCode: c.airportCode,
      airport: c.airportName,
      railwayCode: c.railwayCode,
      station: c.railwayStationName,
      busTerminal: c.busTerminal,
      type: 'city' as const,
    }));
  }, [debouncedQuery, mode]);

  // Combine and rank all results (Local Master Cities + Server API + Mode Datasets)
  const displayResults = useMemo<LocationItem[]>(() => {
    const clean = debouncedQuery.trim().toLowerCase();
    if (clean.length < 3) {
      return [];
    }

    const map = new Map<string, LocationItem>();

    // 1. Add local master cities first (reliable, instant)
    localMatchedCities.forEach((item) => {
      const key = `${item.city}-${item.code}`.toLowerCase();
      map.set(key, item);
    });

    // 2. Merge server results
    serverResults.forEach((item) => {
      const key = `${item.city}-${item.code}`.toLowerCase();
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    // 3. Fallback to Mode-specific auxiliary lists
    if (mode === 'flights') {
      ALL_AIRPORTS.filter(
        (a) =>
          a.city.toLowerCase().includes(clean) ||
          a.code.toLowerCase().includes(clean) ||
          a.airport.toLowerCase().includes(clean)
      ).slice(0, 5).forEach((a) => {
        const key = `${a.city}-${a.code}`.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            city: a.city,
            airport: a.airport,
            code: a.code,
            airportCode: a.code,
            country: a.country,
            cityMr: a.cityMr,
            type: 'airport',
          });
        }
      });
    } else if (mode === 'trains') {
      ALL_RAILWAY_STATIONS.filter(
        (s) =>
          s.city.toLowerCase().includes(clean) ||
          s.code.toLowerCase().includes(clean) ||
          s.station.toLowerCase().includes(clean)
      ).slice(0, 5).forEach((s) => {
        const key = `${s.city}-${s.code}`.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            city: s.city,
            station: s.station,
            code: s.code,
            railwayCode: s.code,
            country: 'India',
            type: 'station',
          });
        }
      });
    }

    const list = Array.from(map.values());

    // Sort by exact city match > prefix match
    list.sort((a, b) => {
      const aCity = (a.city || '').toLowerCase();
      const bCity = (b.city || '').toLowerCase();
      const aCode = (a.code || '').toLowerCase();
      const bCode = (b.code || '').toLowerCase();
      const aId = (a.id || '').toLowerCase();
      const bId = (b.id || '').toLowerCase();

      const aExact = aCity === clean || aCode === clean || aId === clean ? 100 : 0;
      const bExact = bCity === clean || bCode === clean || bId === clean ? 100 : 0;

      const aStarts = aCity.startsWith(clean) || aCode.startsWith(clean) ? 50 : 0;
      const bStarts = bCity.startsWith(clean) || bCode.startsWith(clean) ? 50 : 0;

      return (bExact + bStarts) - (aExact + aStarts);
    });

    return list.slice(0, 15);
  }, [debouncedQuery, localMatchedCities, serverResults, mode]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: LocationItem) => {
    let displayText = item.city;
    let emitValue = item.city;

    if (mode === 'hotels' || mode === 'buses' || mode === 'cars') {
      // For Hotels, Buses, Cars: strictly use the real city name
      displayText = item.city;
      emitValue = item.city;
    } else if (mode === 'flights') {
      const airportCode = item.airportCode || item.code;
      displayText = `${item.city} (${airportCode})`;
      emitValue = `${item.city} (${airportCode})`;
    } else if (mode === 'trains') {
      const stationName = item.station || item.city;
      const stationCode = item.railwayCode || item.code;
      displayText = `${stationName} (${stationCode})`;
      emitValue = `${stationName} (${stationCode})`;
    }

    setQuery(displayText);
    onChange(emitValue, item);
    setIsOpen(false);
  };

  const handleSelectCustom = (customText: string) => {
    if (!customText.trim()) return;
    const clean = customText.trim();
    const item: LocationItem = {
      id: `CUSTOM-${clean.toUpperCase().slice(0, 4)}`,
      city: clean,
      code: clean.toUpperCase().slice(0, 4),
      country: 'Custom Location',
      type: 'custom',
    };
    setQuery(clean);
    onChange(clean, item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setServerResults([]);
    onChange('');
    setIsOpen(false);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'flights':
        return <Plane className={`w-4 h-4 ${iconType === 'from' ? 'text-rose-500' : 'text-purple-500'}`} />;
      case 'trains':
        return <Train className="w-4 h-4 text-amber-600" />;
      case 'hotels':
        return <Building2 className="w-4 h-4 text-rose-500" />;
      case 'buses':
        return <Bus className="w-4 h-4 text-sky-600" />;
      case 'cars':
        return <Car className="w-4 h-4 text-indigo-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label and Mode Switcher Header */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-black uppercase tracking-widest text-slate-700">
          {label}
        </label>

        {showModeToggle && onModeChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onModeChange('flights')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                mode === 'flights'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plane className="w-3 h-3" />
              Flights
            </button>
            <button
              type="button"
              onClick={() => onModeChange('trains')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                mode === 'trains'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Train className="w-3 h-3" />
              Trains
            </button>
          </div>
        )}
      </div>

      {/* Input Field Container */}
      <div className="relative bg-transparent border border-slate-200 hover:border-premium-pink focus-within:border-premium-pink focus-within:bg-white rounded-[20px] p-3 transition-all flex items-center gap-2.5 shadow-xs">
        <div className="shrink-0">
          {getModeIcon()}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Strictly require >= 3 characters before opening dropdown
            if (e.target.value.trim().length >= 3) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= 3) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (displayResults.length > 0) {
                handleSelect(displayResults[0]);
              } else if (query.trim().length >= 3) {
                handleSelectCustom(query.trim());
              }
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent font-extrabold text-sm text-slate-900 placeholder-slate-400 outline-none"
        />

        {isServerLoading && (
          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />
        )}

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 
        Autocomplete Dropdown List:
        STRICT REQUIREMENT: query.trim().length >= 3 must be satisfied before any results or dropdown appear!
      */}
      {isOpen && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white/98 backdrop-blur-md border border-slate-200 rounded-[20px] shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header indicator */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <span>
              {mode === 'hotels' ? 'Master City & Hotel Destinations' :
               mode === 'buses' ? 'Bus Terminals & Cities' :
               mode === 'cars' ? 'City Pick-up & Cab Hubs' :
               mode === 'flights' ? 'Airports & Flight Routes' :
               'Railway Stations & Indian Railways Hubs'}
            </span>
            <span className="text-premium-pink font-mono font-bold">
              {displayResults.length} matches
            </span>
          </div>

          {/* Quick select custom query if typed */}
          <button
            type="button"
            onClick={() => handleSelectCustom(query.trim())}
            className="w-full text-left px-4 py-2.5 bg-rose-50/70 hover:bg-rose-100/70 transition-colors flex items-center justify-between group border-b border-rose-100"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-black text-slate-900 truncate">
                Use &quot;<span className="text-rose-600 font-extrabold">{query.trim()}</span>&quot; as {label.toLowerCase()}
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-black uppercase text-rose-600 bg-rose-200/60 px-2 py-0.5 rounded-md">
              Select
            </span>
          </button>

          {displayResults.length > 0 ? (
            displayResults.map((item, index) => {
              // Determine badge and badge color
              const badgeText = 
                (mode === 'hotels' || mode === 'buses' || mode === 'cars')
                  ? (item.id || item.code || 'CITY')
                  : mode === 'flights'
                  ? (item.airportCode || item.code)
                  : (item.railwayCode || item.code);

              return (
                <button
                  key={`${item.id || item.code}-${item.city}-${index}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    {/* City Name & Multi-Lingual Details */}
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-rose-600 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{item.city}</span>
                      {item.cityMr && (
                        <span className="text-slate-400 font-bold text-xs truncate">[{item.cityMr}]</span>
                      )}
                      {mode === 'flights' && item.airportCode && (
                        <span className="text-rose-600 font-mono font-black text-xs">({item.airportCode})</span>
                      )}
                      {mode === 'trains' && item.railwayCode && (
                        <span className="text-amber-600 font-mono font-black text-xs">({item.railwayCode})</span>
                      )}
                    </div>

                    {/* Subtext description */}
                    <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {mode === 'hotels' ? (
                        <span>{item.state ? `${item.state}, ` : ''}{item.country || 'India'} • Master City ID: <strong className="font-mono text-slate-700">{item.id || 'CITY'}</strong></span>
                      ) : mode === 'buses' ? (
                        <span>{item.busTerminal || `${item.city} Central Bus Stand`}, {item.state || 'India'}</span>
                      ) : mode === 'cars' ? (
                        <span>Doorstep Pickup & Cab Service • {item.state || 'India'}</span>
                      ) : mode === 'flights' ? (
                        <span>{item.airport || 'Airport'}, {item.state || item.country || 'India'}</span>
                      ) : (
                        <span>{item.station || 'Railway Station'}, {item.state || 'Indian Railways'}</span>
                      )}
                    </div>
                  </div>

                  {/* Badge */}
                  {badgeText && (
                    <div className={`shrink-0 font-mono font-black text-xs px-2.5 py-1 rounded-[12px] border shadow-2xs ${
                      mode === 'hotels' || mode === 'buses' || mode === 'cars'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : mode === 'flights'
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {badgeText}
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs font-bold text-slate-600">
                No matching destinations found for &quot;<span className="text-rose-600">{query}</span>&quot;.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click above to use &quot;{query}&quot; as a custom location.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
