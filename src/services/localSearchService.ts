import { loadLocalData } from './dataLoader';
import { ALL_AIRPORTS } from '../data/airports';
import { getTrainFromCatalog } from './trainCatalogService';
import {
  getFromCache,
  saveToCache,
  enrichTrainDetails,
  enrichFlightDetails,
  getOrFetchRealTrainName
} from './travelCacheService';
import {
  validateNotPastDate,
  processTravelResults,
  getFullStationDetails,
  calculateAccurateDuration,
  matchesStationOrCode,
  getCodesForCityOrInput,
  getOrFetchStationDetails,
  calculateLiveTrainStatus
} from './travelTimeService';

export interface LocalFlightResult {
  airline: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  originFullName?: string;
  destinationFullName?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: string;
  direct: boolean;
  deepLink: string;
  logo: string;
  isDeparted?: boolean;
  status?: string;
  timeSlot?: string;
}

export interface LocalBusResult {
  id: string;
  operator: string;
  busType: string;
  originCode: string;
  destinationCode: string;
  originFullName?: string;
  destinationFullName?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  direct: boolean;
  deepLink: string;
  logo: string;
  isDeparted?: boolean;
  status?: string;
  timeSlot?: string;
}

export interface LocalTrainResult {
  number: string;
  name: string;
  accommodation?: string;
  accommodationTypes?: string[];
  origin: string;
  destination: string;
  originFullName?: string;
  destinationFullName?: string;
  depTime: string;
  arrTime: string;
  duration: string;
  price: number;
  classes: { code: string; price: number; status: string }[];
  isDeparted?: boolean;
  status?: string;
  timeSlot?: string;
}

const AIRLINE_LOGOS: Record<string, string> = {
  '6E': 'https://images.kiwi.com/airlines/64/6E.png',
  'AI': 'https://images.kiwi.com/airlines/64/AI.png',
  'UK': 'https://images.kiwi.com/airlines/64/UK.png',
  'SG': 'https://images.kiwi.com/airlines/64/SG.png',
  'QP': 'https://images.kiwi.com/airlines/64/QP.png',
  'IndiGo': 'https://images.kiwi.com/airlines/64/6E.png',
  'Air India': 'https://images.kiwi.com/airlines/64/AI.png',
  'Vistara': 'https://images.kiwi.com/airlines/64/UK.png',
  'SpiceJet': 'https://images.kiwi.com/airlines/64/SG.png',
  'Akasa Air': 'https://images.kiwi.com/airlines/64/QP.png',
};

/**
 * Search local bus dataset (Pan-India_Bus_Routes.csv)
 */
export async function searchLocalBuses(origin: string, destination: string, journeyDate?: string): Promise<LocalBusResult[]> {
  // 1. PAST DATE VALIDATION
  const dateCheck = validateNotPastDate(journeyDate);
  if (!dateCheck.isValid) {
    throw new Error(dateCheck.message);
  }

  const origCodes = getCodesForCityOrInput(origin).map(c => c.toLowerCase());
  const destCodes = getCodesForCityOrInput(destination).map(c => c.toLowerCase());
  const origDetail = getFullStationDetails(origin);
  const destDetail = getFullStationDetails(destination);

  const busData = await loadLocalData('buses');
  if (!Array.isArray(busData) || !busData.length) return [];

  // Aggregator match: From matches any origin code AND To matches any destination code
  let matches = busData.filter((b: any) => {
    if (!b.From || !b.To) return false;
    const fromLow = b.From.toLowerCase();
    const toLow = b.To.toLowerCase();
    const matchesOrig = origCodes.some(c => fromLow.includes(c) || c.includes(fromLow));
    const matchesDest = destCodes.some(c => toLow.includes(c) || c.includes(toLow));
    return matchesOrig && matchesDest;
  });

  // If no direct pair, match either origin or destination
  if (matches.length === 0) {
    matches = busData.filter((b: any) => {
      if (!b.From || !b.To) return false;
      const fromLow = b.From.toLowerCase();
      const toLow = b.To.toLowerCase();
      const matchesOrig = origCodes.some(c => fromLow.includes(c));
      const matchesDest = destCodes.some(c => toLow.includes(c));
      return matchesOrig || matchesDest;
    });
  }

  const mappedResults: LocalBusResult[] = matches.slice(0, 20).map((b: any, idx: number) => {
    const distNum = Number(b.Distance) || 350;
    const price = Math.max(350, Math.round(distNum * 1.6));
    const depTime = b.Departure || '08:00 PM';
    const arrTime = b.Arrival || '06:00 AM';
    const durationStr = calculateAccurateDuration(depTime, arrTime);

    return {
      id: `bus-${idx}`,
      operator: b.Operator || 'Express Travels',
      busType: b['Bus Type'] || 'A/C Sleeper (2+1)',
      originCode: b.From || origin,
      destinationCode: b.To || destination,
      originFullName: origDetail.fullName,
      destinationFullName: destDetail.fullName,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: durationStr,
      price: price,
      direct: true,
      deepLink: 'https://bitli.in/1HdfW4l',
      logo: 'https://cdn-icons-png.flaticon.com/512/2855/2855582.png'
    };
  });

  return processTravelResults(mappedResults, journeyDate);
}

function matchStationAlias(stNameInRoute: string, userQuery: string): boolean {
  if (!stNameInRoute || !userQuery) return false;
  return matchesStationOrCode(stNameInRoute, userQuery);
}

/**
 * Search local train dataset (EXP-TRAINS, SF-TRAINS, PASS-TRAINS JSONs & Schedules CSV)
 * Uses smart caching & fallback enrichment mechanism.
 */
export async function searchLocalTrains(fromStation: string, toStation: string, journeyDate?: string): Promise<LocalTrainResult[]> {
  // 1. PAST DATE VALIDATION
  const dateCheck = validateNotPastDate(journeyDate);
  if (!dateCheck.isValid) {
    throw new Error(dateCheck.message);
  }

  const fromClean = (fromStation || '').trim().toUpperCase();
  const toClean = (toStation || '').trim().toUpperCase();
  const cacheKey = `search_local_trains_${fromClean}_${toClean}_${journeyDate || 'any'}`;

  const fromDetail = getFullStationDetails(fromStation);
  const toDetail = getFullStationDetails(toStation);

  // Check instant cache first
  const cached = getFromCache<LocalTrainResult[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return processTravelResults(cached, journeyDate);
  }

  const trainData = await loadLocalData('trains');
  if (!trainData) return [];

  const allTrainLists = [
    ...(trainData.exp || []),
    ...(trainData.sf || []),
    ...(trainData.pass || [])
  ];

  const rawResults: LocalTrainResult[] = [];

  for (const t of allTrainLists) {
    if (!t.trainRoute || !Array.isArray(t.trainRoute)) continue;

    let fromIdx = -1;
    let toIdx = -1;

    t.trainRoute.forEach((st: any, idx: number) => {
      const stName = (st.stationName || '').toUpperCase();
      if (matchStationAlias(stName, fromClean)) fromIdx = idx;
      if (matchStationAlias(stName, toClean) && (fromIdx === -1 || idx > fromIdx)) toIdx = idx;
    });

    if (fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx) {
      const depSt = t.trainRoute[fromIdx];
      const arrSt = t.trainRoute[toIdx];

      const distFrom = parseInt(depSt.distance) || 0;
      const distTo = parseInt(arrSt.distance) || 0;
      const totalDist = Math.max(40, distTo - distFrom);

      const depTime = depSt.departs || depSt.arrives || '06:00 AM';
      const arrTime = arrSt.arrives || arrSt.departs || '02:00 PM';
      const durationStr = calculateAccurateDuration(depTime, arrTime);

      const catalog = getTrainFromCatalog(t.trainNumber);
      const mappedClasses = catalog.classes.map(c => ({
        code: c.code,
        price: Math.max(120, Math.round(totalDist * c.priceMultiplier)),
        status: 'AVAILABLE'
      }));

      rawResults.push({
        number: catalog.trainNumber || t.trainNumber || '12345',
        name: catalog.trainName,
        accommodation: catalog.accommodation,
        accommodationTypes: catalog.accommodationTypes,
        origin: depSt.stationName || fromStation,
        destination: arrSt.stationName || toStation,
        originFullName: fromDetail.fullName,
        destinationFullName: toDetail.fullName,
        depTime: depTime,
        arrTime: arrTime,
        duration: durationStr,
        price: Math.max(120, Math.round(totalDist * 0.75)),
        classes: mappedClasses
      });

      if (rawResults.length >= 20) break;
    }
  }

  // Fallback match by train route text or name if specific station code wasn't matched
  if (rawResults.length === 0) {
    for (const t of allTrainLists) {
      const rName = (t.route || t.trainName || '').toUpperCase();
      if (rName.includes(fromClean) || rName.includes(toClean)) {
        const depSt = t.trainRoute?.[0] || {};
        const arrSt = t.trainRoute?.[t.trainRoute.length - 1] || {};
        const depTime = depSt.departs || '07:00 AM';
        const arrTime = arrSt.arrives || '08:30 PM';
        const durationStr = calculateAccurateDuration(depTime, arrTime);

        const catalog = getTrainFromCatalog(t.trainNumber);
        const mappedClasses = catalog.classes.map(c => ({
          code: c.code,
          price: Math.max(180, Math.round(300 * c.priceMultiplier)),
          status: 'AVAILABLE'
        }));

        rawResults.push({
          number: catalog.trainNumber || t.trainNumber || '12345',
          name: catalog.trainName,
          accommodation: catalog.accommodation,
          accommodationTypes: catalog.accommodationTypes,
          origin: depSt.stationName || fromStation,
          destination: arrSt.stationName || toStation,
          originFullName: fromDetail.fullName,
          destinationFullName: toDetail.fullName,
          depTime: depTime,
          arrTime: arrTime,
          duration: durationStr,
          price: 380,
          classes: mappedClasses
        });
        if (rawResults.length >= 10) break;
      }
    }
  }

  // 2. Apply Smart Cache & Catalog Enrichment for train names and accommodation
  const enrichedResults: LocalTrainResult[] = [];
  for (const r of rawResults) {
    const enrichedObj = enrichTrainDetails({
      train_number: r.number,
      train_name: r.name,
      origin: r.origin,
      destination: r.destination,
      from_station: fromStation,
      to_station: toStation,
      travel_time: r.duration
    });

    enrichedResults.push({
      ...r,
      name: enrichedObj.train_name,
      accommodation: enrichedObj.accommodation || r.accommodation,
      accommodationTypes: enrichedObj.accommodationTypes || r.accommodationTypes,
      duration: enrichedObj.travel_time
    });
  }

  // 3. Save to cache
  if (enrichedResults.length > 0) {
    saveToCache(cacheKey, enrichedResults);
  }

  // 4. Real-time departed status, time slot tagging, and chronological sorting
  return processTravelResults(enrichedResults, journeyDate);
}

/**
 * Search local train details or live status by train number
 * Uses smart caching & fallback enrichment mechanism.
 */
export async function searchLocalTrainStatus(trainNumberInput: string) {
  const numClean = trainNumberInput.trim();
  const cacheKey = `search_local_status_${numClean}`;

  // 1. Check instant cache first
  const cached = getFromCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const trainData = await loadLocalData('trains');
  if (!trainData) return null;

  const allTrainLists = [
    ...(trainData.exp || []),
    ...(trainData.sf || []),
    ...(trainData.pass || [])
  ];

  const found = allTrainLists.find((t: any) => t.trainNumber === numClean || (t.trainName && t.trainName.includes(numClean)));
  if (!found) return null;

  const route = found.trainRoute || [];
  const rawStatus = calculateLiveTrainStatus(
    {
      number: found.trainNumber || numClean,
      name: found.trainName || `Express Train #${numClean}`,
      speed: '85 km/h',
      delayMins: 0,
      lastUpdated: 'Live CSV/JSON Data'
    },
    route,
    new Date()
  );

  // 2. Apply Fallback Enrichment
  const enrichedTrain = enrichTrainDetails({
    train_number: rawStatus.number,
    train_name: rawStatus.name,
    origin: rawStatus.origin,
    destination: rawStatus.destination
  });

  const finalStatus = {
    ...rawStatus,
    name: enrichedTrain.train_name
  };

  // 3. Save to cache
  saveToCache(cacheKey, finalStatus);

  return finalStatus;
}

/**
 * Search local flight dataset (routes.csv / airports.csv)
 * Uses smart caching & fallback enrichment mechanism.
 */
export async function searchLocalFlights(origin: string, destination: string, journeyDate?: string): Promise<LocalFlightResult[]> {
  // 1. PAST DATE VALIDATION
  const dateCheck = validateNotPastDate(journeyDate);
  if (!dateCheck.isValid) {
    throw new Error(dateCheck.message);
  }

  const origUpper = (origin || 'BOM').trim().toUpperCase();
  const destUpper = (destination || 'DEL').trim().toUpperCase();
  const origCodes = getCodesForCityOrInput(origUpper).map(c => c.toUpperCase());
  const destCodes = getCodesForCityOrInput(destUpper).map(c => c.toUpperCase());
  const cacheKey = `search_local_flights_${origCodes.join('_')}_${destCodes.join('_')}_${journeyDate || 'any'}`;

  const origDetail = getFullStationDetails(origin || 'BOM');
  const destDetail = getFullStationDetails(destination || 'DEL');

  // 1. Check instant cache first
  const cached = getFromCache<LocalFlightResult[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return processTravelResults(cached, journeyDate);
  }

  const flightData = await loadLocalData('flights');
  const routes = flightData?.routes || [];

  // Aggregator match: Source_Airport matches ANY origCode AND Destination_Airport matches ANY destCode
  let matches = routes.filter((r: any) => 
    origCodes.includes(r.Source_Airport) && destCodes.includes(r.Destination_Airport)
  );

  let rawResults: LocalFlightResult[] = [];

  // If no direct code match in routes.csv, match by airports list
  if (matches.length === 0) {
    const origAirport = ALL_AIRPORTS.find(a => a.code === origUpper || a.city.toUpperCase().includes(origUpper) || a.airport.toUpperCase().includes(origUpper));
    const destAirport = ALL_AIRPORTS.find(a => a.code === destUpper || a.city.toUpperCase().includes(destUpper) || a.airport.toUpperCase().includes(destUpper));

    const srcCode = origAirport?.code || origUpper.slice(0, 3);
    const dstCode = destAirport?.code || destUpper.slice(0, 3);

    const airlines = [
      { name: 'IndiGo', code: '6E', flNo: '6E-204', dep: '06:00 AM', arr: '08:15 AM', price: 4200 },
      { name: 'Air India', code: 'AI', flNo: 'AI-865', dep: '09:30 AM', arr: '11:45 AM', price: 4850 },
      { name: 'SpiceJet', code: 'SG', flNo: 'SG-112', dep: '01:15 PM', arr: '03:30 PM', price: 3990 },
      { name: 'Akasa Air', code: 'QP', flNo: 'QP-1304', dep: '05:45 PM', arr: '08:00 PM', price: 4100 },
      { name: 'Vistara', code: 'UK', flNo: 'UK-922', dep: '08:30 PM', arr: '10:45 PM', price: 5400 },
    ];

    rawResults = airlines.map((a) => {
      const durationStr = calculateAccurateDuration(a.dep, a.arr);
      return {
        airline: a.name,
        flightNumber: a.flNo,
        originCode: srcCode,
        destinationCode: dstCode,
        originFullName: origDetail.fullName,
        destinationFullName: destDetail.fullName,
        departureTime: a.dep,
        arrivalTime: a.arr,
        duration: durationStr,
        price: a.price,
        stops: 'Non-stop',
        direct: true,
        deepLink: 'https://bitli.in/1HdfW4l',
        logo: AIRLINE_LOGOS[a.code] || AIRLINE_LOGOS['6E']
      };
    });
  } else {
    rawResults = matches.map((r: any, idx: number) => {
      const depTime = r.DepTime || '07:00 AM';
      const arrTime = r.ArrTime || '09:20 AM';
      const durationStr = calculateAccurateDuration(depTime, arrTime);

      return {
        airline: r.Airline || 'IndiGo',
        flightNumber: r.Route_ID || `FL-${100 + idx}`,
        originCode: r.Source_Airport || origUpper,
        destinationCode: r.Destination_Airport || destUpper,
        originFullName: origDetail.fullName,
        destinationFullName: destDetail.fullName,
        departureTime: depTime,
        arrivalTime: arrTime,
        duration: durationStr,
        price: Number(r.Price) || 4500,
        stops: r.Stops === '0' ? 'Non-stop' : `${r.Stops} Stop`,
        direct: r.Stops === '0',
        deepLink: 'https://bitli.in/1HdfW4l',
        logo: AIRLINE_LOGOS[r.Airline] || AIRLINE_LOGOS['6E']
      };
    });
  }

  // 2. Apply Fallback Enrichment
  const enrichedResults = rawResults.map(f => {
    const enriched = enrichFlightDetails(f);
    return {
      ...f,
      airline: enriched.airline,
      duration: enriched.duration
    };
  });

  // 3. Save to cache
  if (enrichedResults.length > 0) {
    saveToCache(cacheKey, enrichedResults);
  }

  return processTravelResults(enrichedResults, journeyDate);
}

/**
 * Multi-modal transit search for TransitSchedules component
 */
export async function searchLocalTransitSchedules(source: string, destination: string) {
  const [buses, trains, flights] = await Promise.all([
    searchLocalBuses(source, destination),
    searchLocalTrains(source, destination),
    searchLocalFlights(source, destination)
  ]);

  return {
    trains: trains.map(t => ({
      trainName: `${t.name} (${t.number})`,
      departureTime: t.depTime,
      arrivalTime: t.arrTime,
      duration: t.duration
    })),
    buses: buses.map(b => ({
      operatorName: b.operator,
      busType: b.busType,
      departureTime: b.departureTime,
      arrivalTime: b.arrivalTime,
      duration: b.duration
    })),
    flights: flights.map(f => ({
      airlineName: `${f.airline} (${f.flightNumber}) [${f.originCode} ➔ ${f.destinationCode}]`,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      duration: f.duration
    }))
  };
}
