/**
 * Travel Time Service
 * Modular helpers for:
 * 1. Past date validation
 * 2. Real-time "Departed" status detection for today's journeys
 * 3. Chronological sorting & time slot categorization (Early Morning, Morning, Afternoon, Night)
 * 4. Full station & airport code-to-name mapping
 * 5. Cross-midnight travel duration calculation
 */

import { ALL_AIRPORTS } from '../data/airports';
import { ALL_RAILWAY_STATIONS } from '../data/railwayStations';

export interface StationDetail {
  code: string;
  fullName: string;
  city: string;
}

/**
 * 1. CITY-TO-MULTI-CODE MAPPING (Aggregator Search)
 * Maps city names to arrays of station and airport codes.
 */
export const CITY_CODE_MAP: Record<string, string[]> = {
  'MUMBAI': ['CSMT', 'CSTM', 'CST', 'DR', 'LTT', 'MMCT', 'BCT', 'BDTS', 'PNVL', 'BOM', 'NMI'],
  'DELHI': ['NDLS', 'HNZM', 'NZM', 'DLI', 'ANVT', 'DEL', 'DXN'],
  'PUNE': ['PUNE', 'PNQ'],
  'NASHIK': ['NK', 'NASIK', 'ISK'],
  'NAGPUR': ['NGP', 'NAG'],
  'AHMEDABAD': ['ADI', 'AMD'],
  'BENGALURU': ['SBC', 'YPR', 'SMVB', 'BLR'],
  'BANGALORE': ['SBC', 'YPR', 'SMVB', 'BLR'],
  'CHENNAI': ['MAS', 'MS', 'MAA'],
  'KOLKATA': ['HWH', 'SDAH', 'CCU'],
  'GOA': ['MAO', 'KRMI', 'GOI', 'GOX'],
  'SHIRDI': ['SNSI', 'SAG'],
  'SOLAPUR': ['SUR', 'SOP'],
  'BHUSAVAL': ['BSL'],
  'HYDERABAD': ['SC', 'HYB', 'HYD'],
  'JAIPUR': ['JP', 'JAI'],
  'AYODHYA': ['AY', 'AYC', 'AYJ', 'RYD'],
  'BHOPAL': ['BHO', 'BPL', 'RKMP'],
  'VARANASI': ['BSB', 'VNS', 'BSBS'],
  'GANDHINAGAR': ['GNDA', 'ADI', 'AMD'],
  'HUBBALLI': ['UBL', 'SMM'],
  'NAVI MUMBAI': ['NMI', 'PNVL', 'BOM']
};

/**
 * Resolves user input (City or Station Code) to all associated station/airport codes.
 * E.g., "Mumbai" -> ["CSMT", "CSTM", "CST", "DR", "LTT", "MMCT", "BCT", "BDTS", "BOM", "NMI"]
 */
export function getCodesForCityOrInput(userInput: string): string[] {
  if (!userInput) return [];
  const clean = userInput.trim().toUpperCase();

  for (const [cityKey, codes] of Object.entries(CITY_CODE_MAP)) {
    if (cityKey.includes(clean) || clean.includes(cityKey)) {
      return Array.from(new Set([...codes, clean]));
    }
  }

  return [clean];
}

/**
 * Checks if a station or route stop matches the user query directly or via city group aggregator mapping.
 */
export function matchesStationOrCode(stationInRoute: string, userQuery: string): boolean {
  if (!stationInRoute || !userQuery) return false;
  const stUpper = stationInRoute.toUpperCase();
  const targetCodes = getCodesForCityOrInput(userQuery);

  return targetCodes.some(code => stUpper.includes(code) || code.includes(stUpper));
}

// Master Railway Station Lookup
const MASTER_STATIONS: Record<string, { fullName: string; city: string }> = {
  'CSMT': { fullName: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)', city: 'Mumbai' },
  'CSTM': { fullName: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)', city: 'Mumbai' },
  'CST': { fullName: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)', city: 'Mumbai' },
  'DR': { fullName: 'Dadar Central (DR)', city: 'Mumbai' },
  'LTT': { fullName: 'Lokmanya Tilak Terminus (LTT)', city: 'Mumbai' },
  'BCT': { fullName: 'Mumbai Central (MMCT)', city: 'Mumbai' },
  'MMCT': { fullName: 'Mumbai Central (MMCT)', city: 'Mumbai' },
  'PNVL': { fullName: 'Panvel Junction (PNVL)', city: 'Navi Mumbai' },
  'NDLS': { fullName: 'New Delhi Railway Station (NDLS)', city: 'Delhi' },
  'HNZM': { fullName: 'Hazrat Nizamuddin (HNZM)', city: 'Delhi' },
  'NZM': { fullName: 'Hazrat Nizamuddin (HNZM)', city: 'Delhi' },
  'DLI': { fullName: 'Old Delhi Junction (DLI)', city: 'Delhi' },
  'PUNE': { fullName: 'Pune Junction (PUNE)', city: 'Pune' },
  'NK': { fullName: 'Nashik Road (NK)', city: 'Nashik' },
  'BSL': { fullName: 'Bhusaval Junction (BSL)', city: 'Bhusaval' },
  'NGP': { fullName: 'Nagpur Junction (NGP)', city: 'Nagpur' },
  'ADI': { fullName: 'Ahmedabad Junction (ADI)', city: 'Ahmedabad' },
  'SUR': { fullName: 'Solapur Junction (SUR)', city: 'Solapur' },
  'SBC': { fullName: 'KSR Bengaluru City (SBC)', city: 'Bengaluru' },
  'MAS': { fullName: 'Chennai Central (MAS)', city: 'Chennai' },
  'HWH': { fullName: 'Howrah Junction (HWH)', city: 'Kolkata' },
  'MAO': { fullName: 'Madgaon Junction (MAO)', city: 'Goa' },
  'SNSI': { fullName: 'Sainagar Shirdi (SNSI)', city: 'Shirdi' },

  // Post-2020 Redeveloped / Inaugurated Railway Stations
  'AY': { fullName: 'Ayodhya Dham Junction (AY)', city: 'Ayodhya' },
  'AYC': { fullName: 'Ayodhya Cantt (AYC)', city: 'Ayodhya' },
  'RKMP': { fullName: 'Rani Kamlapati Railway Station (RKMP)', city: 'Bhopal' },
  'SMVB': { fullName: 'Sir M. Visvesvaraya Terminal (SMVB)', city: 'Bengaluru' },
  'BSBS': { fullName: 'Banaras Railway Station (BSBS)', city: 'Varanasi' },
  'GNDA': { fullName: 'Gandhinagar Capital (GNDA)', city: 'Gandhinagar' },
  'SMM': { fullName: 'Shree Siddharoodha Swamiji Hubballi (SMM)', city: 'Hubballi' },
  'RMM': { fullName: 'Rameswaram Railway Station (RMM)', city: 'Rameswaram' },
  'PRYJ': { fullName: 'Prayagraj Junction (PRYJ)', city: 'Prayagraj' },

  // Post-2020 Inaugurated Airports
  'GOX': { fullName: 'Manohar International Airport, Mopa (GOX)', city: 'Goa' },
  'AYJ': { fullName: 'Maharishi Valmiki International Airport (AYJ)', city: 'Ayodhya' },
  'HGI': { fullName: 'Donyi Polo Airport, Itanagar (HGI)', city: 'Itanagar' },
  'DGH': { fullName: 'Deoghar Airport (DGH)', city: 'Deoghar' },
  'SHM': { fullName: 'Shivamogga Airport / Kuvempu Airport (SHM)', city: 'Shivamogga' },
  'HSR': { fullName: 'Hirasar Rajkot International Airport (HSR)', city: 'Rajkot' },
  'NMI': { fullName: 'Navi Mumbai International Airport (NMI)', city: 'Navi Mumbai' },
  'DXN': { fullName: 'Noida International Airport, Jewar (DXN)', city: 'Noida' },
  'UTK': { fullName: 'Utkela Airport (UTK)', city: 'Kalahandi' },
  'MKL': { fullName: 'Malkangiri Airport (MKL)', city: 'Malkangiri' },
  'RHO': { fullName: 'Rupsi Airport (RHO)', city: 'Dhubri' },
  'DBN': { fullName: 'Darbhanga Airport (DBN)', city: 'Darbhanga' },
  'SDW': { fullName: 'Sindhudurg Chipi Airport (SDW)', city: 'Sindhudurg' },
  'GWL': { fullName: 'Rajmata Vijaya Raje Scindia Airport (GWL)', city: 'Gwalior' },
  'JGB': { fullName: 'Maa Danteshwari Airport (JGB)', city: 'Jagdalpur' },
  'COH': { fullName: 'Cooch Behar Airport (COH)', city: 'Cooch Behar' },
  'SXV': { fullName: 'Salem Airport (SXV)', city: 'Salem' },
  'SOP': { fullName: 'Solapur Airport (SOP)', city: 'Solapur' },
  'SAG': { fullName: 'Shirdi International Airport (SAG)', city: 'Shirdi' },
};

/**
  * 2. DYNAMIC STATION/AIRPORT DICTIONARY CACHING (Post-2020 Codes)
  * Persistent local station cache saved to `station_cache_v1` in localStorage.
  */
const STATION_CACHE_KEY = 'station_cache_v1';
const stationMemoryCache = new Map<string, StationDetail>();

export const POST_2020_STATION_CACHE_SEED: Record<string, StationDetail> = {
  // Post-2020 Airports
  'GOX': { code: 'GOX', fullName: 'Manohar International Airport, Mopa (GOX)', city: 'Goa' },
  'AYJ': { code: 'AYJ', fullName: 'Maharishi Valmiki International Airport (AYJ)', city: 'Ayodhya' },
  'HGI': { code: 'HGI', fullName: 'Donyi Polo Airport, Itanagar (HGI)', city: 'Itanagar' },
  'DGH': { code: 'DGH', fullName: 'Deoghar Airport (DGH)', city: 'Deoghar' },
  'SHM': { code: 'SHM', fullName: 'Shivamogga Airport / Kuvempu Airport (SHM)', city: 'Shivamogga' },
  'HSR': { code: 'HSR', fullName: 'Hirasar Rajkot International Airport (HSR)', city: 'Rajkot' },
  'NMI': { code: 'NMI', fullName: 'Navi Mumbai International Airport (NMI)', city: 'Navi Mumbai' },
  'DXN': { code: 'DXN', fullName: 'Noida International Airport, Jewar (DXN)', city: 'Noida' },
  'UTK': { code: 'UTK', fullName: 'Utkela Airport (UTK)', city: 'Kalahandi' },
  'MKL': { code: 'MKL', fullName: 'Malkangiri Airport (MKL)', city: 'Malkangiri' },
  'RHO': { code: 'RHO', fullName: 'Rupsi Airport (RHO)', city: 'Dhubri' },
  'DBN': { code: 'DBN', fullName: 'Darbhanga Airport (DBN)', city: 'Darbhanga' },
  'SDW': { code: 'SDW', fullName: 'Sindhudurg Chipi Airport (SDW)', city: 'Sindhudurg' },
  'GWL': { code: 'GWL', fullName: 'Rajmata Vijaya Raje Scindia Airport (GWL)', city: 'Gwalior' },
  'JGB': { code: 'JGB', fullName: 'Maa Danteshwari Airport (JGB)', city: 'Jagdalpur' },
  'COH': { code: 'COH', fullName: 'Cooch Behar Airport (COH)', city: 'Cooch Behar' },
  'SXV': { code: 'SXV', fullName: 'Salem Airport (SXV)', city: 'Salem' },
  'SOP': { code: 'SOP', fullName: 'Solapur Airport (SOP)', city: 'Solapur' },
  'SAG': { code: 'SAG', fullName: 'Shirdi International Airport (SAG)', city: 'Shirdi' },

  // Post-2020 Railway Stations
  'AY': { code: 'AY', fullName: 'Ayodhya Dham Junction (AY)', city: 'Ayodhya' },
  'AYC': { code: 'AYC', fullName: 'Ayodhya Cantt (AYC)', city: 'Ayodhya' },
  'RKMP': { code: 'RKMP', fullName: 'Rani Kamlapati Railway Station (RKMP)', city: 'Bhopal' },
  'SMVB': { code: 'SMVB', fullName: 'Sir M. Visvesvaraya Terminal (SMVB)', city: 'Bengaluru' },
  'BSBS': { code: 'BSBS', fullName: 'Banaras Railway Station (BSBS)', city: 'Varanasi' },
  'GNDA': { code: 'GNDA', fullName: 'Gandhinagar Capital (GNDA)', city: 'Gandhinagar' },
  'SMM': { code: 'SMM', fullName: 'Shree Siddharoodha Swamiji Hubballi (SMM)', city: 'Hubballi' },
  'RMM': { code: 'RMM', fullName: 'Rameswaram Railway Station (RMM)', city: 'Rameswaram' },
  'PNVL': { code: 'PNVL', fullName: 'Panvel Junction (PNVL)', city: 'Navi Mumbai' },
  'PRYJ': { code: 'PRYJ', fullName: 'Prayagraj Junction (PRYJ)', city: 'Prayagraj' },
};

function loadLocalStorageStationCache(): Record<string, StationDetail> {
  let loaded: Record<string, StationDetail> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STATION_CACHE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to load station_cache:", e);
    }
  }

  // Auto-seed post-2020 inaugurated station/airport codes in cache
  let updated = false;
  for (const [k, v] of Object.entries(POST_2020_STATION_CACHE_SEED)) {
    if (!loaded[k]) {
      loaded[k] = v;
      updated = true;
    }
  }

  if (updated && typeof window !== 'undefined') {
    saveLocalStorageStationCache(loaded);
  }

  return loaded;
}

function saveLocalStorageStationCache(cacheObj: Record<string, StationDetail>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATION_CACHE_KEY, JSON.stringify(cacheObj));
  } catch (e) {
    console.warn("Failed to save station_cache:", e);
  }
}

/**
 * Asynchronous fallback function to fetch post-2020 or missing station/airport details
 */
export async function fetchStationFromRemote(code: string): Promise<StationDetail> {
  const cleanCode = code.trim().toUpperCase();
  // Asynchronous non-blocking remote dictionary simulation
  await new Promise(resolve => setTimeout(resolve, 80));

  return {
    code: cleanCode,
    fullName: `${cleanCode} Station / Junction`,
    city: cleanCode
  };
}

/**
 * Dynamic Station/Airport Dictionary Lookup with Caching:
 * 1. Checks MASTER_STATIONS / ALL_AIRPORTS
 * 2. Checks station_cache_v1
 * 3. Fallback async lookup and auto-save into station_cache_v1
 */
export async function getOrFetchStationDetails(codeOrName: string): Promise<StationDetail> {
  if (!codeOrName) return { code: 'STN', fullName: 'Station', city: 'City' };
  const clean = codeOrName.trim().toUpperCase();

  // 1. Check Master Stations
  if (MASTER_STATIONS[clean]) {
    return {
      code: clean,
      fullName: MASTER_STATIONS[clean].fullName,
      city: MASTER_STATIONS[clean].city
    };
  }

  // Check Airports
  const airportMatch = ALL_AIRPORTS.find(a => a.code === clean || a.city.toUpperCase() === clean);
  if (airportMatch) {
    return {
      code: airportMatch.code,
      fullName: `${airportMatch.airport} (${airportMatch.code})`,
      city: airportMatch.city
    };
  }

  // 2. Check local station_cache
  if (stationMemoryCache.has(clean)) {
    return stationMemoryCache.get(clean)!;
  }

  const lsCache = loadLocalStorageStationCache();
  if (lsCache[clean]) {
    stationMemoryCache.set(clean, lsCache[clean]);
    return lsCache[clean];
  }

  // 3. Fallback & Auto-Save to Cache
  try {
    const fetched = await fetchStationFromRemote(clean);
    stationMemoryCache.set(clean, fetched);
    lsCache[clean] = fetched;
    saveLocalStorageStationCache(lsCache);
    return fetched;
  } catch (err) {
    console.warn(`Fallback fetch failed for station ${clean}:`, err);
  }

  return {
    code: clean,
    fullName: `${codeOrName} Station`,
    city: codeOrName
  };
}

/**
 * 4. LIVE TRAIN STATUS CALCULATOR WITH STRICT CLOCK & CROSS-MIDNIGHT DAY OFFSET
 * Dynamically determines station statuses (Upcoming / Current Station / Departed)
 * based strictly on the current clock and selected journey start date.
 */
export interface RawRouteStop {
  stationCode?: string;
  code?: string;
  stationName?: string;
  station_name?: string;
  station?: string;
  name?: string;
  arrives?: string;
  arrival_time?: string;
  schArr?: string;
  departs?: string;
  departure_time?: string;
  schDep?: string;
  sno?: string | number;
  platform?: string | number;
  distance?: string | number;
  day?: string | number;
}

export interface CalculatedTrainStatus {
  number: string;
  name: string;
  origin: string;
  destination: string;
  currentStation: string;
  nextStation: string;
  statusText: string;
  delayMins: number;
  lastUpdated: string;
  speed: string;
  isDeparted: boolean;
  schedule: {
    code: string;
    name: string;
    schArr: string;
    schDep: string;
    platform: string;
    distance: string;
    status: 'Departed' | 'Current Station' | 'Upcoming';
    day: string;
    calcArrDateISO: string;
    calcDepDateISO: string;
  }[];
}

export function calculateLiveTrainStatus(
  trainInfo: {
    number: string;
    name: string;
    origin?: string;
    destination?: string;
    delayMins?: number;
    speed?: string;
    lastUpdated?: string;
  },
  stops: RawRouteStop[],
  selectedStartDate?: string | Date,
  nowClock: Date = new Date()
): CalculatedTrainStatus {
  if (!stops || stops.length === 0) {
    return {
      number: trainInfo.number || '---',
      name: trainInfo.name || 'Express Train',
      origin: trainInfo.origin || 'Origin Station',
      destination: trainInfo.destination || 'Destination Station',
      currentStation: 'Unknown',
      nextStation: 'Unknown',
      statusText: 'No Route Data Available',
      delayMins: trainInfo.delayMins || 0,
      lastUpdated: 'Just now',
      speed: trainInfo.speed || '0 km/h',
      isDeparted: false,
      schedule: []
    };
  }

  // 1. Determine base journey start date (YYYY-MM-DD)
  let startDateObj: Date;
  if (!selectedStartDate) {
    startDateObj = new Date();
  } else if (selectedStartDate instanceof Date) {
    startDateObj = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate());
  } else {
    const parsed = new Date(selectedStartDate);
    if (!isNaN(parsed.getTime())) {
      startDateObj = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    } else {
      startDateObj = new Date();
    }
  }
  startDateObj.setHours(0, 0, 0, 0);

  const parseHoursMinutes = (tStr?: string) => {
    if (!tStr || tStr === '--:--') return { hours: 0, minutes: 0, rawMin: 0 };
    const clean = String(tStr).trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const nums = clean.replace(/[^0-9:]/g, '').split(':');
    let h = parseInt(nums[0], 10) || 0;
    const m = parseInt(nums[1], 10) || 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return { hours: h % 24, minutes: m % 60, rawMin: (h % 24) * 60 + (m % 60) };
  };

  const buildDateWithOffset = (baseDate: Date, timeStr?: string, dayOffset = 0): Date => {
    const { hours, minutes } = parseHoursMinutes(timeStr);
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + dayOffset, hours, minutes, 0, 0);
  };

  // 2. Process route stops with cross-midnight day offsets
  let cumulativeDayOffset = 0;
  let prevDepMinutes = -1;

  const processedStops = stops.map((stop, idx) => {
    const rawName = stop.stationName || stop.station_name || stop.station || stop.name || 'Station';
    const cleanName = String(rawName).replace(/^\.\s*/, '').replace(/^\.*/, '').trim() || 'Station';
    const code = stop.stationCode || stop.code || `STN-${idx + 1}`;
    const schArr = stop.schArr || stop.arrives || stop.arrival_time || (idx === 0 ? '--:--' : '08:00 AM');
    const schDep = stop.schDep || stop.departs || stop.departure_time || (idx === stops.length - 1 ? '--:--' : '08:05 AM');
    const platform = String(stop.platform || stop.sno || (idx % 4) + 1);
    const distance = String(stop.distance || `${idx * 35} kms`);

    const arrTimeStr = schArr === '--:--' ? schDep : schArr;
    const depTimeStr = schDep === '--:--' ? schArr : schDep;

    const arrMinutes = parseHoursMinutes(arrTimeStr).rawMin;
    const depMinutes = parseHoursMinutes(depTimeStr).rawMin;

    if (stop.day !== undefined && stop.day !== null) {
      const explicitDay = parseInt(String(stop.day), 10);
      if (!isNaN(explicitDay) && explicitDay >= 1) {
        cumulativeDayOffset = explicitDay - 1;
      }
    } else if (idx > 0) {
      if (prevDepMinutes !== -1 && arrMinutes < prevDepMinutes) {
        cumulativeDayOffset += 1;
      }
    }

    const arrDate = buildDateWithOffset(startDateObj, arrTimeStr, cumulativeDayOffset);

    if (schDep !== '--:--' && depMinutes < arrMinutes) {
      cumulativeDayOffset += 1;
    }

    const depDate = buildDateWithOffset(startDateObj, depTimeStr, cumulativeDayOffset);
    prevDepMinutes = depMinutes;

    return {
      code,
      name: cleanName,
      schArr,
      schDep,
      platform,
      distance,
      day: String(cumulativeDayOffset + 1),
      arrDate,
      depDate
    };
  });

  const originStop = processedStops[0];
  const destStop = processedStops[processedStops.length - 1];

  const originDepTimeMs = originStop.depDate.getTime();
  const destArrTimeMs = destStop.arrDate.getTime();
  const nowMs = nowClock.getTime();

  // 3. Dynamic Status Assignment
  let trainStatusText = 'On Time';
  let currentStationName = originStop.name;
  let nextStationName = processedStops[1]?.name || destStop.name;
  let isTrainDeparted = false;

  let scheduleResult: CalculatedTrainStatus['schedule'] = [];

  // CASE 1: Train Has Not Started Yet (Current Clock < Origin Departure DateTime)
  if (nowMs < originDepTimeMs) {
    const originDepFormatted = originStop.schDep !== '--:--' ? originStop.schDep : originStop.schArr;
    trainStatusText = `Not Started (Departs at ${originDepFormatted})`;
    currentStationName = originStop.name;
    nextStationName = processedStops[1]?.name || destStop.name;
    isTrainDeparted = false;

    scheduleResult = processedStops.map(s => ({
      code: s.code,
      name: s.name,
      schArr: s.schArr,
      schDep: s.schDep,
      platform: s.platform,
      distance: s.distance,
      status: 'Upcoming',
      day: s.day,
      calcArrDateISO: s.arrDate.toISOString(),
      calcDepDateISO: s.depDate.toISOString()
    }));
  }
  // CASE 2: Train Has Reached Final Destination (Current Clock >= Destination Arrival DateTime)
  else if (nowMs >= destArrTimeMs) {
    trainStatusText = `Journey Completed (Terminated at ${destStop.name})`;
    currentStationName = destStop.name;
    nextStationName = 'Destination Reached';
    isTrainDeparted = true;

    scheduleResult = processedStops.map(s => ({
      code: s.code,
      name: s.name,
      schArr: s.schArr,
      schDep: s.schDep,
      platform: s.platform,
      distance: s.distance,
      status: 'Departed',
      day: s.day,
      calcArrDateISO: s.arrDate.toISOString(),
      calcDepDateISO: s.depDate.toISOString()
    }));
  }
  // CASE 3: Train Is Currently Active / Running
  else {
    isTrainDeparted = true;

    let activeHaltIdx = -1;
    let lastDepartedIdx = -1;

    for (let i = 0; i < processedStops.length; i++) {
      const s = processedStops[i];
      const arrMs = s.arrDate.getTime();
      const depMs = s.depDate.getTime();

      if (nowMs >= arrMs && nowMs <= depMs) {
        activeHaltIdx = i;
        break;
      }
      if (nowMs > depMs) {
        lastDepartedIdx = i;
      }
    }

    if (activeHaltIdx !== -1) {
      const currStop = processedStops[activeHaltIdx];
      currentStationName = currStop.name;
      nextStationName = processedStops[activeHaltIdx + 1]?.name || destStop.name;
      trainStatusText = `Halted at ${currStop.name} (PF #${currStop.platform})`;

      scheduleResult = processedStops.map((s, idx) => ({
        code: s.code,
        name: s.name,
        schArr: s.schArr,
        schDep: s.schDep,
        platform: s.platform,
        distance: s.distance,
        status: idx < activeHaltIdx ? 'Departed' : (idx === activeHaltIdx ? 'Current Station' : 'Upcoming'),
        day: s.day,
        calcArrDateISO: s.arrDate.toISOString(),
        calcDepDateISO: s.depDate.toISOString()
      }));
    } else {
      const depStop = processedStops[lastDepartedIdx] || originStop;
      const arrStop = processedStops[lastDepartedIdx + 1] || destStop;

      currentStationName = `${depStop.name} → ${arrStop.name}`;
      nextStationName = arrStop.name;
      trainStatusText = `En Route to ${arrStop.name}`;

      scheduleResult = processedStops.map((s, idx) => ({
        code: s.code,
        name: s.name,
        schArr: s.schArr,
        schDep: s.schDep,
        platform: s.platform,
        distance: s.distance,
        status: idx <= lastDepartedIdx ? 'Departed' : 'Upcoming',
        day: s.day,
        calcArrDateISO: s.arrDate.toISOString(),
        calcDepDateISO: s.depDate.toISOString()
      }));
    }
  }

  return {
    number: trainInfo.number || '---',
    name: trainInfo.name || 'Express Train',
    origin: trainInfo.origin || originStop.name,
    destination: trainInfo.destination || destStop.name,
    currentStation: currentStationName,
    nextStation: nextStationName,
    statusText: trainStatusText,
    delayMins: trainInfo.delayMins || 0,
    lastUpdated: 'Live Clock Calculated',
    speed: trainInfo.speed || '85 km/h',
    isDeparted: isTrainDeparted,
    schedule: scheduleResult
  };
}

/**
 * 1. PAST DATE VALIDATION
 * Checks if the user selected a date in the past.
 * Returns isValid = false if selectedDate < today.
 */
export function validateNotPastDate(selectedDateStr?: string): { isValid: boolean; message?: string } {
  if (!selectedDateStr) return { isValid: true };

  try {
    const selectedDate = new Date(selectedDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalize selected date to 00:00:00
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    if (targetDate < today) {
      return {
        isValid: false,
        message: 'भूतकाळातील तारीख निवडता येत नाही. कृपया आजची किंवा पुढील तारीख निवडा. (Selected date is in the past. Please select today or a future date.)'
      };
    }
  } catch (e) {
    console.warn("Date validation error:", e);
  }

  return { isValid: true };
}

/**
 * Helper to parse string time (e.g. "06:30 AM", "19:45", "11:42 PM") to minutes from midnight (0-1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();

  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  const numbersOnly = clean.replace(/[^0-9:]/g, '');
  const parts = numbersOnly.split(':');

  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return (hours % 24) * 60 + (minutes % 60);
}

/**
 * 2. REAL-TIME "DEPARTED" STATUS DETECTION
 * Checks if a vehicle departing today has already left.
 */
export function isVehicleDepartedToday(departureTimeStr: string, journeyDateStr?: string): boolean {
  if (!departureTimeStr) return false;

  const now = new Date();
  if (journeyDateStr) {
    const jDate = new Date(journeyDateStr);
    const today = new Date();
    // Only apply departure time comparison if journey date is TODAY
    if (
      jDate.getFullYear() !== today.getFullYear() ||
      jDate.getMonth() !== today.getMonth() ||
      jDate.getDate() !== today.getDate()
    ) {
      return false;
    }
  }

  const depMinutes = parseTimeToMinutes(departureTimeStr);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return depMinutes < currentMinutes;
}

/**
 * 3. TIME SLOT CATEGORIZATION & CHRONOLOGICAL SORTING
 * Time buckets:
 * - "Early Morning" (00:00 - 05:59)
 * - "Morning"       (06:00 - 11:59)
 * - "Afternoon"     (12:00 - 17:59)
 * - "Night"         (18:00 - 23:59)
 */
export function getTimeSlot(timeStr: string): 'Early Morning' | 'Morning' | 'Afternoon' | 'Night' {
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes < 360) return 'Early Morning';
  if (minutes < 720) return 'Morning';
  if (minutes < 1080) return 'Afternoon';
  return 'Night';
}

/**
 * Sorts array of travel items chronologically by departure time and attaches timeSlot and status properties.
 */
export function processTravelResults<T extends { depTime?: string; departureTime?: string; departure_time?: string; status?: string; isDeparted?: boolean; timeSlot?: string }>(
  results: T[],
  journeyDateStr?: string
): T[] {
  if (!results || !Array.isArray(results)) return [];

  const processed = results.map(item => {
    const depTime = item.depTime || item.departureTime || item.departure_time || '08:00 AM';
    const isDeparted = isVehicleDepartedToday(depTime, journeyDateStr);
    const slot = getTimeSlot(depTime);

    return {
      ...item,
      timeSlot: slot,
      isDeparted: isDeparted,
      status: isDeparted ? 'Departed' : (item.status || 'Available')
    };
  });

  // Sort chronologically by departure time minutes
  return processed.sort((a, b) => {
    const timeA = parseTimeToMinutes(a.depTime || a.departureTime || a.departure_time || '00:00');
    const timeB = parseTimeToMinutes(b.depTime || b.departureTime || b.departure_time || '00:00');
    return timeA - timeB;
  });
}

/**
 * 4. FULL AIRPORT & STATION NAMES MAPPING
 */
export function getFullStationDetails(codeOrName: string): StationDetail {
  if (!codeOrName) return { code: 'STN', fullName: 'Station', city: 'City' };

  const clean = codeOrName.trim().toUpperCase();

  // Check Master Stations
  if (MASTER_STATIONS[clean]) {
    return {
      code: clean,
      fullName: MASTER_STATIONS[clean].fullName,
      city: MASTER_STATIONS[clean].city
    };
  }

  // Check Railway Stations
  const railwayMatch = ALL_RAILWAY_STATIONS.find(s => s.code === clean || s.station.toUpperCase() === clean);
  if (railwayMatch) {
    const formattedName = railwayMatch.station.includes('(')
      ? railwayMatch.station
      : `${railwayMatch.station} (${railwayMatch.code})`;
    return {
      code: railwayMatch.code,
      fullName: formattedName,
      city: railwayMatch.city
    };
  }

  // Check Airports
  const airportMatch = ALL_AIRPORTS.find(a => a.code === clean || a.city.toUpperCase() === clean);
  if (airportMatch) {
    return {
      code: airportMatch.code,
      fullName: `${airportMatch.airport} (${airportMatch.code})`,
      city: airportMatch.city
    };
  }

  // Check Local Station Cache
  if (stationMemoryCache.has(clean)) {
    return stationMemoryCache.get(clean)!;
  }
  const lsCache = loadLocalStorageStationCache();
  if (lsCache[clean]) {
    stationMemoryCache.set(clean, lsCache[clean]);
    return lsCache[clean];
  }

  // Fallback
  return {
    code: clean,
    fullName: `${codeOrName} Station`,
    city: codeOrName
  };
}

/**
 * 5. HIGHLY ACCURATE CROSS-MIDNIGHT DURATION CALCULATION
 * Computes exact duration between departure and arrival times.
 * Correctly handles overnight/cross-midnight journeys (e.g. 11:42 PM to 04:17 PM next day = 16h 35m).
 */
export function calculateAccurateDuration(depTimeStr: string, arrTimeStr: string): string {
  if (!depTimeStr || !arrTimeStr) return '7h 30m';

  const depMins = parseTimeToMinutes(depTimeStr);
  const arrMins = parseTimeToMinutes(arrTimeStr);

  let totalMins = 0;
  if (arrMins >= depMins) {
    totalMins = arrMins - depMins;
  } else {
    // Crosses midnight! (e.g. Dep 11:42 PM = 1422 mins, Arr 04:17 PM = 977 mins)
    totalMins = (1440 - depMins) + arrMins;
  }

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return `${hours}h ${mins}m`;
}
