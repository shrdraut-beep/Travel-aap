import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plane, Train, MapPin, Search, X, Building2, Bus, Car, Check } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { ALL_AIRPORTS } from '../data/airports';
import { ALL_RAILWAY_STATIONS } from '../data/railwayStations';

export type TransportMode = 'flights' | 'trains' | 'hotels' | 'buses' | 'cars';

export interface LocationItem {
  city: string;
  airport?: string;
  station?: string;
  code: string;
  country?: string;
  cityMr?: string;
  type?: 'city' | 'airport' | 'station' | 'hotel' | 'bus' | 'custom';
}

interface SearchInputProps {
  label: string;
  placeholder?: string;
  value: string; // The selected code or city name
  onChange: (code: string, item?: LocationItem) => void;
  mode?: TransportMode;
  onModeChange?: (newMode: TransportMode) => void;
  showModeToggle?: boolean;
  lang?: string;
  className?: string;
  autoFocus?: boolean;
  iconType?: 'from' | 'to';
}

export const POPULAR_CITIES_AND_DESTINATIONS: LocationItem[] = [
  // Goa Destinations
  { city: 'Goa', code: 'GOA', country: 'Goa, India', cityMr: 'गोवा', type: 'city' },
  { city: 'Goa (Dabolim Airport)', airport: 'Dabolim Airport', code: 'GOI', country: 'Goa, India', cityMr: 'गोवा (दाबोळी)', type: 'airport' },
  { city: 'Goa (Mopa Airport)', airport: 'Manohar International Airport', code: 'GOX', country: 'Goa, India', cityMr: 'गोवा (मोपा)', type: 'airport' },
  { city: 'Goa (Madgaon Junction)', station: 'Madgaon Junction', code: 'MAO', country: 'Goa, India', cityMr: 'गोवा (मडगाव)', type: 'station' },
  { city: 'Goa (Vasco da Gama)', station: 'Vasco-da-Gama', code: 'VSG', country: 'Goa, India', cityMr: 'वास्को द गामा', type: 'station' },

  // Maharashtra Hubs & Tourist Spots
  { city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl Airport', code: 'BOM', country: 'Maharashtra, India', cityMr: 'मुंबई', type: 'airport' },
  { city: 'Mumbai CSMT', station: 'CSMT Mumbai', code: 'CSMT', country: 'Maharashtra, India', cityMr: 'मुंबई सीएसएमटी', type: 'station' },
  { city: 'Mumbai Central', station: 'Mumbai Central', code: 'MMCT', country: 'Maharashtra, India', cityMr: 'मुंबई सेंट्रल', type: 'station' },
  { city: 'Pune', airport: 'Pune International Airport', code: 'PNQ', country: 'Maharashtra, India', cityMr: 'पुणे', type: 'airport' },
  { city: 'Pune Junction', station: 'Pune Junction', code: 'PUNE', country: 'Maharashtra, India', cityMr: 'पुणे जंक्शन', type: 'station' },
  { city: 'Nagpur', airport: 'Dr. Babasaheb Ambedkar Intl Airport', code: 'NAG', country: 'Maharashtra, India', cityMr: 'नागपूर', type: 'airport' },
  { city: 'Nashik', code: 'ISK', country: 'Maharashtra, India', cityMr: 'नाशिक', type: 'city' },
  { city: 'Chhatrapati Sambhajinagar (Aurangabad)', code: 'IXU', country: 'Maharashtra, India', cityMr: 'छत्रपती संभाजीनगर', type: 'city' },
  { city: 'Shirdi', airport: 'Shirdi International Airport', code: 'SAG', country: 'Maharashtra, India', cityMr: 'शिर्डी', type: 'city' },
  { city: 'Kolhapur', code: 'KLH', country: 'Maharashtra, India', cityMr: 'कोल्हापूर', type: 'city' },
  { city: 'Mahabaleshwar', code: 'MHB', country: 'Maharashtra, India', cityMr: 'महाबळेश्वर', type: 'city' },
  { city: 'Lonavala / Khandala', code: 'LNL', country: 'Maharashtra, India', cityMr: 'लोणावळा / खंडाळा', type: 'city' },
  { city: 'Alibaug', code: 'ALB', country: 'Maharashtra, India', cityMr: 'अलिबाग', type: 'city' },
  { city: 'Matheran', code: 'MTH', country: 'Maharashtra, India', cityMr: 'माथेरान', type: 'city' },
  { city: 'Solapur', code: 'SOP', country: 'Maharashtra, India', cityMr: 'सोलापूर', type: 'city' },
  { city: 'Amravati', code: 'AMI', country: 'Maharashtra, India', cityMr: 'अमरावती', type: 'city' },
  { city: 'Nanded', code: 'NDC', country: 'Maharashtra, India', cityMr: 'नांदेड', type: 'city' },
  { city: 'Ratnagiri', code: 'RN', country: 'Maharashtra, India', cityMr: 'रत्नागिरी', type: 'city' },
  { city: 'Sindhudurg', code: 'SDW', country: 'Maharashtra, India', cityMr: 'सिंधुदुर्ग', type: 'city' },

  // Major Indian Metros & Travel Destinations
  { city: 'Delhi', airport: 'Indira Gandhi International Airport', code: 'DEL', country: 'Delhi, India', cityMr: 'दिल्ली', type: 'airport' },
  { city: 'New Delhi', station: 'New Delhi Railway Station', code: 'NDLS', country: 'Delhi, India', cityMr: 'नवी दिल्ली', type: 'station' },
  { city: 'Bengaluru', airport: 'Kempegowda International Airport', code: 'BLR', country: 'Karnataka, India', cityMr: 'बेंगळुरू', type: 'airport' },
  { city: 'Bengaluru City', station: 'KSR Bengaluru', code: 'SBC', country: 'Karnataka, India', cityMr: 'बेंगळुरू सिटी', type: 'station' },
  { city: 'Hyderabad', airport: 'Rajiv Gandhi International Airport', code: 'HYD', country: 'Telangana, India', cityMr: 'हैदराबाद', type: 'airport' },
  { city: 'Chennai', airport: 'Chennai International Airport', code: 'MAA', country: 'Tamil Nadu, India', cityMr: 'चेन्नई', type: 'airport' },
  { city: 'Kolkata', airport: 'Netaji Subhash Chandra Bose Intl Airport', code: 'CCU', country: 'West Bengal, India', cityMr: 'कोलकाता', type: 'airport' },
  { city: 'Howrah Junction', station: 'Howrah Junction', code: 'HWH', country: 'West Bengal, India', cityMr: 'हावडा', type: 'station' },
  { city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel Intl Airport', code: 'AMD', country: 'Gujarat, India', cityMr: 'अहमदाबाद', type: 'airport' },
  { city: 'Jaipur', airport: 'Jaipur International Airport', code: 'JAI', country: 'Rajasthan, India', cityMr: 'जयपूर', type: 'city' },
  { city: 'Udaipur', airport: 'Maharana Pratap Airport', code: 'UDR', country: 'Rajasthan, India', cityMr: 'उदयपूर', type: 'city' },
  { city: 'Jodhpur', code: 'JDH', country: 'Rajasthan, India', cityMr: 'जोधपूर', type: 'city' },
  { city: 'Jaisalmer', code: 'JSA', country: 'Rajasthan, India', cityMr: 'जैसलमेर', type: 'city' },
  { city: 'Varanasi', airport: 'Lal Bahadur Shastri Intl Airport', code: 'VNS', country: 'Uttar Pradesh, India', cityMr: 'वाराणसी', type: 'city' },
  { city: 'Agra', station: 'Agra Cantt', code: 'AGC', country: 'Uttar Pradesh, India', cityMr: 'आग्रा', type: 'city' },
  { city: 'Ayodhya', airport: 'Maharishi Valmiki Intl Airport', code: 'AY', country: 'Uttar Pradesh, India', cityMr: 'अयोध्या', type: 'city' },
  { city: 'Lucknow', airport: 'Chaudhary Charan Singh Intl Airport', code: 'LKO', country: 'Uttar Pradesh, India', cityMr: 'लखनऊ', type: 'city' },
  { city: 'Mathura / Vrindavan', code: 'MTJ', country: 'Uttar Pradesh, India', cityMr: 'मथुरा / वृंदावन', type: 'city' },
  { city: 'Manali', code: 'KUU', country: 'Himachal Pradesh, India', cityMr: 'मनाली', type: 'city' },
  { city: 'Shimla', code: 'SLV', country: 'Himachal Pradesh, India', cityMr: 'शिमला', type: 'city' },
  { city: 'Dharamshala', code: 'DHM', country: 'Himachal Pradesh, India', cityMr: 'धर्मशाळा', type: 'city' },
  { city: 'Rishikesh', code: 'RKSH', country: 'Uttarakhand, India', cityMr: 'ऋषिकेश', type: 'city' },
  { city: 'Haridwar', station: 'Haridwar Junction', code: 'HW', country: 'Uttarakhand, India', cityMr: 'हरिद्वार', type: 'city' },
  { city: 'Dehradun', airport: 'Jolly Grant Airport', code: 'DED', country: 'Uttarakhand, India', cityMr: 'डेहराडून', type: 'city' },
  { city: 'Mussoorie', code: 'MSR', country: 'Uttarakhand, India', cityMr: 'मसूरी', type: 'city' },
  { city: 'Nainital', code: 'NTL', country: 'Uttarakhand, India', cityMr: 'नैनिताल', type: 'city' },
  { city: 'Amritsar', airport: 'Sri Guru Ram Dass Jee Intl Airport', code: 'ATQ', country: 'Punjab, India', cityMr: 'अमृतसर', type: 'city' },
  { city: 'Chandigarh', airport: 'Shaheed Bhagat Singh Intl Airport', code: 'IXC', country: 'Chandigarh, India', cityMr: 'चंदीगड', type: 'city' },
  { city: 'Srinagar', airport: 'Sheikh ul-Alam Intl Airport', code: 'SXR', country: 'Jammu & Kashmir, India', cityMr: 'श्रीनगर', type: 'city' },
  { city: 'Leh Ladakh', airport: 'Kushok Bakula Rimpochee Airport', code: 'IXL', country: 'Ladakh, India', cityMr: 'लेह लडाख', type: 'city' },
  { city: 'Kochi (Cochin)', airport: 'Cochin International Airport', code: 'COK', country: 'Kerala, India', cityMr: 'कोची', type: 'city' },
  { city: 'Munnar', code: 'MNR', country: 'Kerala, India', cityMr: 'मुन्नार', type: 'city' },
  { city: 'Alleppey (Alappuzha)', code: 'ALLP', country: 'Kerala, India', cityMr: 'अलेप्पी (आलप्पुझा)', type: 'city' },
  { city: 'Wayanad', code: 'WYD', country: 'Kerala, India', cityMr: 'वायनाड', type: 'city' },
  { city: 'Ooty', code: 'UAM', country: 'Tamil Nadu, India', cityMr: 'उटी', type: 'city' },
  { city: 'Kodaikanal', code: 'KQN', country: 'Tamil Nadu, India', cityMr: 'कोडाईकनाल', type: 'city' },
  { city: 'Mysuru (Mysore)', code: 'MYA', country: 'Karnataka, India', cityMr: 'म्हैसूर', type: 'city' },
  { city: 'Coorg', code: 'CRG', country: 'Karnataka, India', cityMr: 'कूर्ग', type: 'city' },
  { city: 'Hampi', code: 'HMP', country: 'Karnataka, India', cityMr: 'हंपी', type: 'city' },
  { city: 'Gokarna', code: 'GOK', country: 'Karnataka, India', cityMr: 'गोकर्ण', type: 'city' },
  { city: 'Pondicherry (Puducherry)', code: 'PNY', country: 'Puducherry, India', cityMr: 'पाँडिचेरी', type: 'city' },
  { city: 'Puri', station: 'Puri Railway Station', code: 'PURI', country: 'Odisha, India', cityMr: 'पुरी', type: 'city' },
  { city: 'Bhubaneswar', airport: 'Biju Patnaik Intl Airport', code: 'BBI', country: 'Odisha, India', cityMr: 'भुवनेश्वर', type: 'city' },
  { city: 'Darjeeling', code: 'DAJ', country: 'West Bengal, India', cityMr: 'दार्जिलिंग', type: 'city' },
  { city: 'Gangtok', code: 'GTK', country: 'Sikkim, India', cityMr: 'गंगटोक', type: 'city' },
  { city: 'Surat', airport: 'Surat International Airport', code: 'STV', country: 'Gujarat, India', cityMr: 'सुरत', type: 'city' },
  { city: 'Indore', airport: 'Devi Ahilyabai Holkar Airport', code: 'IDR', country: 'Madhya Pradesh, India', cityMr: 'इंदूर', type: 'city' },
  { city: 'Bhopal', airport: 'Raja Bhoj Airport', code: 'BHO', country: 'Madhya Pradesh, India', cityMr: 'भोपाळ', type: 'city' },
  { city: 'Ujjain', code: 'UJN', country: 'Madhya Pradesh, India', cityMr: 'उज्जैन', type: 'city' },

  // International Hubs
  { city: 'Dubai', airport: 'Dubai International Airport', code: 'DXB', country: 'UAE', cityMr: 'दुबई', type: 'city' },
  { city: 'Singapore', airport: 'Changi Airport', code: 'SIN', country: 'Singapore', cityMr: 'सिंगापूर', type: 'city' },
  { city: 'Bangkok', airport: 'Suvarnabhumi Airport', code: 'BKK', country: 'Thailand', cityMr: 'बँकॉग', type: 'city' },
  { city: 'Phuket', airport: 'Phuket International Airport', code: 'HKT', country: 'Thailand', cityMr: 'फुकेत', type: 'city' },
  { city: 'Bali', airport: 'Ngurah Rai International Airport', code: 'DPS', country: 'Indonesia', cityMr: 'बाली', type: 'city' },
  { city: 'London', airport: 'Heathrow Airport', code: 'LHR', country: 'United Kingdom', cityMr: 'लंडन', type: 'city' },
  { city: 'New York', airport: 'John F. Kennedy Intl Airport', code: 'JFK', country: 'USA', cityMr: 'न्यूयॉर्क', type: 'city' },
  { city: 'Paris', airport: 'Charles de Gaulle Airport', code: 'CDG', country: 'France', cityMr: 'पॅरिस', type: 'city' },
  { city: 'Maldives (Male)', airport: 'Velana International Airport', code: 'MLE', country: 'Maldives', cityMr: 'मालदीव', type: 'city' }
];

export const SearchInput: React.FC<SearchInputProps> = ({
  autoFocus,
  label,
  placeholder = 'Type city, station or code...',
  value,
  onChange,
  mode = 'flights',
  onModeChange,
  showModeToggle = false,
  className = '',
  iconType = 'from',
}) => {
  const [query, setQuery] = useState(value || '');
  const debouncedQuery = useDebounce(query, 100);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync displayed query if value prop changes from outside
  useEffect(() => {
    if (value && value !== query) {
      // Find item
      const item = POPULAR_CITIES_AND_DESTINATIONS.find(
        (c) => c.code.toLowerCase() === value.toLowerCase() || c.city.toLowerCase() === value.toLowerCase()
      );
      if (item) {
        setQuery(mode === 'hotels' || mode === 'buses' || mode === 'cars' ? item.city : item.code);
      } else {
        setQuery(value);
      }
    }
  }, [value, mode]);

  // Build unified dataset for current mode
  const baseDataset = useMemo<LocationItem[]>(() => {
    const list: LocationItem[] = POPULAR_CITIES_AND_DESTINATIONS.filter(item => {
      if (mode === 'flights') return item.type !== 'station';
      if (mode === 'trains') return item.type !== 'airport';
      return true;
    });

    if (mode === 'flights') {
      ALL_AIRPORTS.forEach((a) => {
        if (!list.some((existing) => existing.code === a.code)) {
          list.push({
            city: a.city,
            airport: a.airport,
            code: a.code,
            country: a.country,
            cityMr: a.cityMr,
            type: 'airport',
          });
        }
      });
    } else if (mode === 'trains') {
      ALL_RAILWAY_STATIONS.forEach((s) => {
        if (!list.some((existing) => existing.code === s.code)) {
          list.push({
            city: s.city,
            station: s.station,
            code: s.code,
            country: 'India',
            type: 'station',
          });
        }
      });
    }

    return list;
  }, [mode]);

  // Filter items based on user input
  const filteredResults = useMemo<LocationItem[]>(() => {
    const cleanQuery = debouncedQuery.trim().toLowerCase();
    
    if (cleanQuery.length < 3) {
      return [];
    }

    const matched = baseDataset.filter((item) => {
      if (!item) return false;
      const city = (item.city || '').toLowerCase();
      const code = (item.code || '').toLowerCase();
      const country = (item.country || '').toLowerCase();
      const airport = (item.airport || '').toLowerCase();
      const station = (item.station || '').toLowerCase();
      const cityMr = (item.cityMr || '').toLowerCase();

      return (
        city.includes(cleanQuery) ||
        code.includes(cleanQuery) ||
        country.includes(cleanQuery) ||
        airport.includes(cleanQuery) ||
        station.includes(cleanQuery) ||
        cityMr.includes(cleanQuery)
      );
    });

    // Score & Rank: exact prefix matches first
    matched.sort((a, b) => {
      const aCity = a.city.toLowerCase();
      const bCity = b.city.toLowerCase();
      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();

      const aExact = aCity === cleanQuery || aCode === cleanQuery ? 100 : 0;
      const bExact = bCity === cleanQuery || bCode === cleanQuery ? 100 : 0;

      const aStarts = aCity.startsWith(cleanQuery) || aCode.startsWith(cleanQuery) ? 50 : 0;
      const bStarts = bCity.startsWith(cleanQuery) || bCode.startsWith(cleanQuery) ? 50 : 0;

      return (bExact + bStarts) - (aExact + aStarts);
    });

    return matched.slice(0, 10);
  }, [debouncedQuery, baseDataset]);

  const displayResults = useMemo<LocationItem[]>(() => {
    return filteredResults.slice(0, 15);
  }, [filteredResults]);

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
    const selectedText = (mode === 'hotels' || mode === 'buses' || mode === 'cars') 
      ? item.city.split(' (')[0] // Clean "Goa" from "Goa (Dabolim Airport)"
      : item.code;

    const displayText = (mode === 'hotels' || mode === 'buses' || mode === 'cars')
      ? item.city
      : item.code;

    setQuery(displayText);
    onChange(selectedText, item);
    setIsOpen(false);
  };

  const handleSelectCustom = (customText: string) => {
    if (!customText.trim()) return;
    const clean = customText.trim();
    const item: LocationItem = {
      city: clean,
      code: clean.toUpperCase().slice(0, 4),
      country: 'Custom Location',
      type: 'custom'
    };
    setQuery(clean);
    onChange(clean, item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setIsOpen(true);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'flights':
        return <Plane className={`w-4 h-4 ${iconType === 'from' ? 'text-blue-500' : 'text-purple-500'}`} />;
      case 'trains':
        return <Train className="w-4 h-4 text-amber-500" />;
      case 'hotels':
        return <Building2 className="w-4 h-4 text-rose-500" />;
      case 'buses':
        return <Bus className="w-4 h-4 text-emerald-500" />;
      case 'cars':
        return <Car className="w-4 h-4 text-indigo-500" />;
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
        <div className="shrink-0">
          {getModeIcon()}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filteredResults.length > 0) {
                handleSelect(filteredResults[0]);
              } else if (query.trim()) {
                handleSelectCustom(query.trim());
              }
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
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

      {/* Autocomplete Dropdown List */}
      {isOpen && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white/98 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header indicator */}
          <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <span>
              {mode === 'flights' ? 'Airport & City Matches' : 
               mode === 'hotels' ? 'Hotel & City Destinations' : 
               mode === 'buses' ? 'Bus Stations & Routes' :
               mode === 'cars' ? 'Cab Pick-up & City Locations' :
               'Railway Stations & Cities'}
            </span>
            <span className="text-amber-600 font-mono font-bold">
              {displayResults.length} options
            </span>
          </div>

          {/* Quick select custom query if typed */}
          {query.trim().length >= 3 && (
            <button
              type="button"
              onClick={() => handleSelectCustom(query.trim())}
              className="w-full text-left px-4 py-2.5 bg-amber-50/60 hover:bg-amber-100/80 transition-colors flex items-center justify-between group border-b border-amber-100"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-black text-slate-900 truncate">
                  Use &quot;<span className="text-amber-700 font-extrabold">{query.trim()}</span>&quot; as {label.toLowerCase()}
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-black uppercase text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-md">
                Select
              </span>
            </button>
          )}

          {displayResults.length > 0 ? (
            displayResults.map((item, index) => (
              <button
                key={`${item.code}-${item.city}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-amber-50/80 transition-colors flex items-center justify-between group"
              >
                <div className="min-w-0 pr-3">
                  {/* City Name & Code */}
                  <div className="font-extrabold text-slate-900 text-sm group-hover:text-amber-900 flex items-center gap-2">
                    <span className="truncate">{item.city}</span>
                    {item.code && (
                      <span className="font-black text-amber-600 font-mono text-xs shrink-0">({item.code})</span>
                    )}
                    {item.cityMr && (
                      <span className="text-slate-400 font-bold text-xs truncate">[{item.cityMr}]</span>
                    )}
                  </div>

                  {/* Subtext */}
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {mode === 'flights' ? (
                      <span>{item.airport || 'Airport'}, {item.country || 'India'}</span>
                    ) : mode === 'hotels' ? (
                      <span>{item.country || 'Top Hotel & Travel Destination'}</span>
                    ) : mode === 'buses' ? (
                      <span>{item.country || 'Major Bus Terminal & Hub'}</span>
                    ) : mode === 'cars' ? (
                      <span>{item.country || 'Doorstep Pickup & City Service'}</span>
                    ) : (
                      <span>{item.station || 'Railway Station'}, {item.country || 'Indian Railways'}</span>
                    )}
                  </div>
                </div>

                {/* Badge */}
                {item.code && (
                  <div className="shrink-0 bg-amber-100 group-hover:bg-amber-200 text-amber-800 font-mono font-black text-xs px-2.5 py-1 rounded-xl border border-amber-200/80 shadow-2xs">
                    {item.code}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs font-bold text-slate-600">
                Click above to use &quot;<span className="text-amber-600">{query}</span>&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

