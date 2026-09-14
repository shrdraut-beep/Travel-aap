import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

import * as fs from 'fs';
import * as path from 'path';

const EXCEL_PATH = path.join(process.cwd(), 'src/data/INDIAN FLIGHT DATA.xlsx');
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/flightSchedules.json');

// City to IATA manual map
const CITY_NAME_FIXES: Record<string, string> = {
  "BANGALORE": "BLR",
  "BENGALURU": "BLR",
  "BOMBAY": "BOM",
  "MUMBAI": "BOM",
  "MADRAS": "MAA",
  "CHENNAI": "MAA",
  "CALCUTTA": "CCU",
  "KOLKATA": "CCU",
  "POONA": "PNQ",
  "PUNE": "PNQ",
  "NASIK": "ISK",
  "NASHIK": "ISK",
  "AURANGABAD": "IXU",
  "CHHATRAPATI SAMBHAJINAGAR": "IXU",
  "COCHIN": "COK",
  "KOCHI": "COK",
  "TRIVANDRUM": "TRV",
  "THIRUVANANTHAPURAM": "TRV"
};

function getCityCode(cityName: string): string {
  const normalized = cityName.toUpperCase().trim();
  if (CITY_NAME_FIXES[normalized]) return CITY_NAME_FIXES[normalized];
  
  const common: Record<string, string> = {
    "AHMEDABAD": "AMD",
    "BAGDOGRA": "IXB",
    "DELHI": "DEL",
    "HYDERABAD": "HYD",
    "GOA": "GOI",
    "JAIPUR": "JAI",
    "LUCKNOW": "LKO",
    "PATNA": "PAT",
    "VARANASI": "VNS",
    "GUWAHATI": "GAU",
    "SRINAGAR": "SXR",
    "CHANDIGARH": "IXC"
  };
  
  return common[normalized] || normalized;
}

function parseTime(t: string): number {
  if (!t || !t.includes(':')) return -1;
  const parts = t.split(':').map(Number);
  if (isNaN(parts[0]) || isNaN(parts[1])) return -1;
  return parts[0] * 60 + parts[1];
}

function formatTime(totalMinutes: number): string {
  const normalized = (totalMinutes + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function parseFlights() {
  console.log('🚀 Starting Smart Flight Data Parsing...');

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ Error: Excel file not found at ${EXCEL_PATH}`);
    return;
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headerRow = rows[0] || [];
  const colIdx = {
    flightNo: headerRow.findIndex(h => String(h).toLowerCase().includes("flight no")),
    airline: headerRow.findIndex(h => String(h).toLowerCase().includes("operator code") || String(h).toLowerCase().includes("airline")),
    arrFrom: headerRow.findIndex(h => String(h).toLowerCase().includes("arrival from")),
    arrTime: headerRow.findIndex(h => String(h).toLowerCase().includes("arrival time")),
    depTo: headerRow.findIndex(h => String(h).toLowerCase().includes("departure to")),
    depTime: headerRow.findIndex(h => String(h).toLowerCase().includes("departure time")),
  };

  if (colIdx.flightNo === -1) colIdx.flightNo = 1;
  if (colIdx.airline === -1) colIdx.airline = 2;
  if (colIdx.arrFrom === -1) colIdx.arrFrom = 5;
  if (colIdx.arrTime === -1) colIdx.arrTime = 6;
  if (colIdx.depTo === -1) colIdx.depTo = 7;
  if (colIdx.depTime === -1) colIdx.depTime = 8;

  let current_city_block = "";
  const departuresList: any[] = [];
  const arrivalsList: any[] = [];
  const departuresMap = new Map<string, any[]>();
  const arrivalsMap = new Map<string, any[]>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const colA = String(row[0] || "").trim();
    const flightNo = String(row[colIdx.flightNo] || "").trim();
    const airline = String(row[colIdx.airline] || "").trim();

    if (colA && !flightNo && isNaN(Number(colA)) && !colA.toLowerCase().includes("sl. no")) {
      current_city_block = colA;
      continue;
    }

    if (flightNo && flightNo.toLowerCase() !== "flight no" && flightNo.toLowerCase() !== "flight no.") {
      const originCodeInBlock = getCityCode(current_city_block);
      const depDest = String(row[colIdx.depTo] || "").trim();
      const depTimeStr = String(row[colIdx.depTime] || "").trim();
      const arrOrigin = String(row[colIdx.arrFrom] || "").trim();
      const arrTimeStr = String(row[colIdx.arrTime] || "").trim();

      if (depDest && depDest !== "undefined" && depTimeStr && depTimeStr !== "undefined") {
        const depObj = { flight_no: flightNo, airline, origin: originCodeInBlock, dest: getCityCode(depDest), dep_time: depTimeStr };
        departuresList.push(depObj);
        const list = departuresMap.get(flightNo) || [];
        list.push(depObj);
        departuresMap.set(flightNo, list);
      }

      if (arrOrigin && arrOrigin !== "undefined" && arrTimeStr && arrTimeStr !== "undefined") {
        const arrObj = { flight_no: flightNo, airline, origin: getCityCode(arrOrigin), dest: originCodeInBlock, arr_time: arrTimeStr };
        arrivalsList.push(arrObj);
        const list = arrivalsMap.get(flightNo) || [];
        list.push(arrObj);
        arrivalsMap.set(flightNo, list);
      }
    }
  }

  // PASS 1: Initial Matching & Duration Calculation
  const routeDurations = new Map<string, number[]>();
  const matchedFlights: any[] = [];

  for (const dep of departuresList) {
    const flightNo = dep.flight_no;
    const arrs = arrivalsMap.get(flightNo) || [];
    let bestArr = null;
    let bestDuration = Infinity;

    for (const arr of arrs) {
      if (dep.origin === arr.origin && dep.dest === arr.dest) {
        const depMin = parseTime(dep.dep_time);
        let arrMin = parseTime(arr.arr_time);
        if (depMin === -1 || arrMin === -1) continue;
        
        if (arrMin < depMin) arrMin += 1440;
        const duration = arrMin - depMin;
        
        // Potential valid match
        if (duration >= 30 && duration <= 360 && duration < bestDuration) {
          bestDuration = duration;
          bestArr = arr;
        }
      }
    }

    const routeKey = `${dep.origin}_${dep.dest}`;
    if (bestArr) {
      matchedFlights.push({
        ...dep,
        arrival_time: bestArr.arr_time,
        raw_duration: bestDuration,
        isValid: true
      });
      // PASS 2: Collect valid durations for averages
      const durations = routeDurations.get(routeKey) || [];
      durations.push(bestDuration);
      routeDurations.set(routeKey, durations);
    } else {
      matchedFlights.push({
        ...dep,
        isValid: false
      });
    }
  }

  // Calculate Averages
  const routeAverages = new Map<string, number>();
  for (const [key, durations] of routeDurations.entries()) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    routeAverages.set(key, avg);
  }

  // PASS 3: Apply Smart Fallbacks
  const finalSchedules: any[] = [];
  for (const flight of matchedFlights) {
    const routeKey = `${flight.origin}_${flight.dest}`;
    let duration = flight.raw_duration;
    let arrivalTime = flight.arrival_time;

    // Anomalous or Missing Logic
    if (!flight.isValid || duration < 30 || duration > 360) {
      const avg = routeAverages.get(routeKey) || 120; // fallback to 2h if no route data
      duration = Math.round(avg);
      
      const depMin = parseTime(flight.dep_time);
      arrivalTime = formatTime(depMin + duration);
    }

    finalSchedules.push({
      airline: flight.airline || "Unknown Airline",
      flight_number: flight.flight_no,
      from: flight.origin,
      to: flight.dest,
      time: flight.dep_time,
      arrival_time: arrivalTime,
      duration: formatDuration(duration)
    });
  }

  const uniqueSchedules = Array.from(new Set(finalSchedules.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(uniqueSchedules, null, 2));
  console.log(`✅ Successfully saved ${uniqueSchedules.length} verified flight schedules with smart fallbacks to ${OUTPUT_PATH}`);
}

parseFlights();
