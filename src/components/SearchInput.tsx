import React, { useState, useEffect, useRef } from 'react';
import { Plane, Train, MapPin, Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export type TransportMode = 'flights' | 'trains';

export interface LocationItem {
  city: string;
  airport?: string;
  station?: string;
  code: string;
  country?: string;
}

interface SearchInputProps {
  label: string;
  placeholder?: string;
  value: string; // The selected code (e.g., 'BOM', 'DEL', 'NDLS')
  onChange: (code: string, item?: LocationItem) => void;
  mode?: TransportMode;
  onModeChange?: (newMode: TransportMode) => void;
  showModeToggle?: boolean;
  lang?: string;
  className?: string;
  iconType?: 'from' | 'to';
}

const DEFAULT_TRAIN_STATIONS: LocationItem[] = [
  { city: 'Mumbai Central', station: 'Mumbai Central', code: 'MMCT', country: 'Maharashtra' },
  { city: 'Chhatrapati Shivaji Maharaj Terminus', station: 'CSMT Mumbai', code: 'CSMT', country: 'Maharashtra' },
  { city: 'New Delhi', station: 'New Delhi Railway Station', code: 'NDLS', country: 'Delhi' },
  { city: 'Delhi Hazrat Nizamuddin', station: 'Hazrat Nizamuddin', code: 'NZM', country: 'Delhi' },
  { city: 'Bengaluru City', station: 'KSR Bengaluru', code: 'SBC', country: 'Karnataka' },
  { city: 'Chennai Central', station: 'Puratchi Thalaivar Dr. M.G.R. Central', code: 'MAS', country: 'Tamil Nadu' },
  { city: 'Howrah Junction', station: 'Howrah Junction', code: 'HWH', country: 'West Bengal' },
  { city: 'Pune Junction', station: 'Pune Junction', code: 'PUNE', country: 'Maharashtra' },
  { city: 'Hyderabad Secunderabad', station: 'Secunderabad Junction', code: 'SC', country: 'Telangana' },
  { city: 'Ahmedabad Junction', station: 'Ahmedabad Junction', code: 'ADI', country: 'Gujarat' },
  { city: 'Jaipur Junction', station: 'Jaipur Junction', code: 'JP', country: 'Rajasthan' },
  { city: 'Varanasi Junction', station: 'Varanasi Junction', code: 'BSB', country: 'Uttar Pradesh' },
  { city: 'Gorakhpur Junction', station: 'Gorakhpur Junction', code: 'GKP', country: 'Uttar Pradesh' },
  { city: 'Goa Madgaon', station: 'Madgaon Junction', code: 'MAO', country: 'Goa' },
];

function parseDataset(data: any, mode: TransportMode): LocationItem[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data
      .filter((item: any) => item && typeof item === 'object' && item.code)
      .map((item: any) => ({
        city: item.city || item.airportName || item.airport || item.stationName || item.station || item.name || item.code,
        airport: item.airport || item.airportName,
        station: item.station || item.stationName || item.name,
        code: String(item.code).trim().toUpperCase(),
        country: item.country || ''
      }));
  }

  // Handle GeoJSON FeatureCollection format (like in stations.json or trains.json)
  if (data.features && Array.isArray(data.features)) {
    const itemsMap = new Map<string, LocationItem>();

    for (const f of data.features) {
      const p = f?.properties;
      if (!p) continue;

      if (mode === 'trains') {
        if (p.code && p.name) {
          const code = String(p.code).trim().toUpperCase();
          if (code && code !== '\\N' && code !== 'N' && !itemsMap.has(code)) {
            itemsMap.set(code, {
              city: p.name,
              station: p.name,
              code: code,
              country: p.state || 'India',
            });
          }
        }
        if (p.from_station_code && p.from_station_name) {
          const code = String(p.from_station_code).trim().toUpperCase();
          if (code && code !== '\\N' && code !== 'N' && !itemsMap.has(code)) {
            itemsMap.set(code, {
              city: p.from_station_name,
              station: p.from_station_name,
              code: code,
              country: 'India',
            });
          }
        }
        if (p.to_station_code && p.to_station_name) {
          const code = String(p.to_station_code).trim().toUpperCase();
          if (code && code !== '\\N' && code !== 'N' && !itemsMap.has(code)) {
            itemsMap.set(code, {
              city: p.to_station_name,
              station: p.to_station_name,
              code: code,
              country: 'India',
            });
          }
        }
      } else {
        if (p.code) {
          const code = String(p.code).trim().toUpperCase();
          if (code && !itemsMap.has(code)) {
            itemsMap.set(code, {
              city: p.city || p.name || code,
              airport: p.airport || p.name,
              code: code,
              country: p.country || p.state || '',
            });
          }
        }
      }
    }

    return Array.from(itemsMap.values());
  }

  return [];
}

export const SearchInput: React.FC<SearchInputProps> = ({
  label,
  placeholder = 'Type city or code...',
  value,
  onChange,
  mode = 'flights',
  onModeChange,
  showModeToggle = false,
  lang = 'en',
  className = '',
  iconType = 'from',
}) => {
  const [currentDataset, setCurrentDataset] = useState<LocationItem[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  useEffect(() => {
    if (!hasInteracted && !value) return; // Wait for user interaction or pre-existing value
    let active = true;
    const loadDataset = async () => {
      try {
        if (mode === 'flights') {
          const mod = await import('../data/airports.json');
          const raw = mod.default || mod;
          if (active) {
            const parsed = parseDataset(raw, 'flights');
            setCurrentDataset(parsed);
          }
        } else {
          let raw: any = null;
          try {
            const res = await fetch('/data/stations.json');
            if (res.ok) raw = await res.json();
          } catch {
            // ignore
          }

          if (!raw) {
            try {
              const res = await fetch('/data/trains.json');
              if (res.ok) raw = await res.json();
            } catch {
              // ignore
            }
          }

          if (active) {
            const parsed = parseDataset(raw, 'trains');
            setCurrentDataset(parsed.length > 0 ? parsed : DEFAULT_TRAIN_STATIONS);
          }
        }
      } catch (err) {
        console.error("Error loading location dataset:", err);
        if (active && mode === 'trains') {
          setCurrentDataset(DEFAULT_TRAIN_STATIONS);
        }
      }
    };
    loadDataset();
    return () => { active = false; };
  }, [mode, hasInteracted, value]);

  // Find initial item by code to set initial display string
  const findItemByCode = (code: string) => {
    if (!code || !Array.isArray(currentDataset) || currentDataset.length === 0) return null;
    return currentDataset.find(
      (item) => item && item.code && item.code.toUpperCase() === code.toUpperCase() && item.code !== '\\N' && item.code !== '\N'
    ) || null;
  };

  const initialItem = findItemByCode(value);
  const [query, setQuery] = useState(
    initialItem ? `${initialItem.city} (${initialItem.code})` : value
  );
  const debouncedQuery = useDebounce(query, 300);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<LocationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync displayed query if value prop changes from outside
  useEffect(() => {
    const item = findItemByCode(value);
    if (item) {
      setQuery(`${item.city} (${item.code})`);
    } else if (value) {
      setQuery(value);
    }
  }, [value, mode, currentDataset]);

  // Handle typing and debounced filter logic
  useEffect(() => {
    const cleanQuery = debouncedQuery.trim().toLowerCase();

    // Trigger search only when user types minimum 2 characters
    if (cleanQuery.length < 2 || !Array.isArray(currentDataset)) {
      setFilteredResults([]);
      return;
    }

    const filtered = currentDataset
      .filter((item) => {
        if (!item || !item.code || item.code === '\\N' || item.code === '\N') {
          return false;
        }

        const cityMatch = item.city ? item.city.toLowerCase().includes(cleanQuery) : false;
        const codeMatch = item.code ? item.code.toLowerCase().includes(cleanQuery) : false;
        const nameMatch = mode === 'flights'
          ? (item.airport && item.airport.toLowerCase().includes(cleanQuery))
          : (item.station && item.station.toLowerCase().includes(cleanQuery));
        const countryMatch = item.country && item.country.toLowerCase().includes(cleanQuery);

        return cityMatch || codeMatch || nameMatch || countryMatch;
      })
      // Limit results to top 10 matches to keep dropdown render fast & clean
      .slice(0, 10);

    setFilteredResults(filtered);
  }, [debouncedQuery, mode, currentDataset]);

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
    // Pass the 3-letter / station code to parent state
    onChange(item.code, item);
    // Display friendly city name + code in input box
    setQuery(`${item.city} (${item.code})`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label and Mode Switcher Header */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </label>

        {showModeToggle && onModeChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onModeChange('flights')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                mode === 'flights'
                  ? 'bg-blue-600 text-white shadow-xs'
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
      <div className="relative bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3 transition-all flex items-center gap-2.5 shadow-xs">
        <div className="text-slate-400 shrink-0">
          {mode === 'flights' ? (
            <Plane className={`w-4 h-4 ${iconType === 'from' ? 'text-blue-500' : 'text-purple-500'}`} />
          ) : (
            <Train className="w-4 h-4 text-amber-500" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value); setHasInteracted(true);
            setIsOpen(true);
          }}
          onFocus={() => { setIsOpen(true); setHasInteracted(true); }}
          placeholder={placeholder}
          className="w-full bg-transparent font-extrabold text-sm text-slate-900 placeholder-slate-400 outline-none"
        />

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

      {/* Gen-Z Autocomplete Dropdown List */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100/80 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header indicator */}
          <div className="px-3 py-1.5 bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{mode === 'flights' ? 'Airport Results' : 'Railway Station Results'}</span>
            <span className="text-amber-600 font-mono">Top {filteredResults.length} matches</span>
          </div>

          {filteredResults.length > 0 ? (
            filteredResults.map((item, index) => (
              <button
                key={`${item.code}-${item.city}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-amber-50/80 transition-colors flex items-center justify-between group"
              >
                <div className="min-w-0 pr-3">
                  {/* City (CODE) */}
                  <div className="font-extrabold text-slate-900 text-sm group-hover:text-amber-900 flex items-center gap-1.5">
                    <span>{item.city}</span>
                    <span className="font-black text-amber-600 font-mono text-xs">({item.code})</span>
                  </div>

                  {/* Subtext: Airport Name, Country or Station Name, City */}
                  <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {mode === 'flights' ? (
                      <span>{item.airport || 'Airport'}, {item.country || 'International'}</span>
                    ) : (
                      <span>{item.station || 'Railway Station'}, {item.city}</span>
                    )}
                  </div>
                </div>

                {/* Gen-Z Code Pill Badge */}
                <div className="shrink-0 bg-amber-100 group-hover:bg-amber-200 text-amber-800 font-mono font-black text-xs px-2.5 py-1 rounded-xl border border-amber-200/80 shadow-2xs">
                  {item.code}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs font-bold text-slate-500">No matching locations found for &quot;{query}&quot;</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Try searching by city name, airport name, or 3-letter code</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
