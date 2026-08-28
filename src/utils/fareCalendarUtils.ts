/**
 * Utility to generate realistic daily flight prices for the calendar and date strip
 * based on origin, destination, base prices, day-of-week demand, and holidays.
 */

export interface DailyPriceInfo {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  dayName: string; // 'Thu', 'Fri', 'Sat', etc.
  monthName: string; // 'Aug', 'Sep', etc.
  fullFormatted: string; // 'Fri, 21 Aug'
  price: number; // in INR
  displayPrice: string; // '₹10.8K' or '₹9,450'
  isCheapest?: boolean;
  isExpensive?: boolean;
  isWeekend?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  category?: 'low' | 'average' | 'high'; // 🟢 Green, 🟡 Yellow, 🔴 Red
}

// Client-Side Memory Cache & LocalStorage Cache
const clientFareCache = new Map<string, { timestamp: number; result: any }>();
const CLIENT_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch live fare calendar from server API with multi-tier caching (Memory + LocalStorage + Server)
 */
export async function fetchApiFareCalendar(
  origin: string,
  destination: string,
  year: number,
  month: number
): Promise<{ averagePrice: number; lowThreshold: number; highThreshold: number; dailyFares: Record<string, DailyPriceInfo>; fromCache?: boolean }> {
  const cacheKey = `fare_cal_${origin}_${destination}_${year}_${month}`;
  const now = Date.now();

  // 1. Check In-Memory Cache
  if (clientFareCache.has(cacheKey)) {
    const cached = clientFareCache.get(cacheKey)!;
    if (now - cached.timestamp < CLIENT_CACHE_TTL) {
      return { ...cached.result, fromCache: true };
    }
  }

  // 2. Check LocalStorage Persistent Cache
  try {
    const localSaved = localStorage.getItem(`routripo_${cacheKey}`);
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (now - parsed.timestamp < CLIENT_CACHE_TTL && parsed.result) {
        clientFareCache.set(cacheKey, { timestamp: parsed.timestamp, result: parsed.result });
        return { ...parsed.result, fromCache: true };
      }
    }
  } catch (e) {
    // ignore localstorage error
  }

  try {
    const res = await fetch('/api/flights/fare-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, year, month })
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.dailyFares)) {
      const dailyMap: Record<string, DailyPriceInfo> = {};
      data.dailyFares.forEach((df: any) => {
        const d = new Date(df.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        dailyMap[df.date] = {
          dateStr: df.date,
          dayNum: df.dayNum,
          dayName: dayNames[d.getDay()],
          monthName: monthNames[d.getMonth()],
          fullFormatted: `${dayNames[d.getDay()]}, ${df.dayNum} ${monthNames[d.getMonth()]}`,
          price: df.price,
          displayPrice: `₹${(df.price / 1000).toFixed(1)}K`,
          isWeekend: d.getDay() === 0 || d.getDay() === 6,
          isToday: df.date === new Date().toISOString().split('T')[0],
          isPast: df.isPast,
          category: df.category,
          isCheapest: df.category === 'low',
          isExpensive: df.category === 'high'
        };
      });
      const result = {
        averagePrice: data.averagePrice,
        lowThreshold: data.lowThreshold,
        highThreshold: data.highThreshold,
        dailyFares: dailyMap,
        fromCache: data.fromCache
      };

      // Store in memory & localStorage
      clientFareCache.set(cacheKey, { timestamp: now, result });
      try {
        localStorage.setItem(`routripo_${cacheKey}`, JSON.stringify({ timestamp: now, result }));
      } catch (e) {}

      return result;
    }
  } catch (err) {
    console.warn("Failed to fetch API fare calendar", err);
  }

  return { averagePrice: 0, lowThreshold: 0, highThreshold: 0, dailyFares: {} };
}

// Generate base price according to origin-destination pair
export const getRouteBaseFare = (origin: string = 'BOM', destination: string = 'DEL'): number => {
  const orig = origin.toUpperCase();
  const dest = destination.toUpperCase();
  
  // Metro to Metro
  if ((orig === 'BOM' && dest === 'DEL') || (orig === 'DEL' && dest === 'BOM')) return 5400;
  if ((orig === 'BOM' && dest === 'BLR') || (orig === 'BLR' && dest === 'BOM')) return 4200;
  if ((orig === 'DEL' && dest === 'BLR') || (orig === 'BLR' && dest === 'DEL')) return 6200;
  if ((orig === 'BOM' && dest === 'GOI') || (orig === 'GOI' && dest === 'BOM')) return 3800;
  if ((orig === 'ISK' && dest === 'DEL') || (orig === 'DEL' && dest === 'ISK')) return 10854;
  if ((orig === 'ISK' && dest === 'AMD') || (orig === 'AMD' && dest === 'ISK')) return 4200;

  // Hash-based stable default for any other pair
  const sum = (orig.charCodeAt(0) || 65) + (dest.charCodeAt(0) || 66);
  return 4800 + (sum % 25) * 180;
};

/**
 * Get deterministic daily prices for a given date range
 */
export const getDailyFlightPrices = (
  origin: string,
  destination: string,
  baseDate: Date = new Date(),
  daysBefore: number = 7,
  daysAfter: number = 14
): DailyPriceInfo[] => {
  const baseFare = getRouteBaseFare(origin, destination);
  const result: DailyPriceInfo[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(baseDate);
  start.setDate(start.getDate() - daysBefore);

  const totalDays = daysBefore + daysAfter + 1;
  const dayPrices: number[] = [];

  for (let i = 0; i < totalDays; i++) {
    const cur = new Date(start);
    cur.setDate(cur.getDate() + i);
    cur.setHours(0, 0, 0, 0);

    const isPast = cur.getTime() < today.getTime();
    const dayOfWeek = cur.getDay(); // 0 = Sun, 6 = Sat
    const dayNum = cur.getDate();
    const month = cur.getMonth();
    const year = cur.getFullYear();

    // Weekend hike: Friday, Saturday, Sunday higher
    let factor = 1.0;
    if (dayOfWeek === 5) factor = 1.22; // Fri
    else if (dayOfWeek === 6) factor = 1.28; // Sat
    else if (dayOfWeek === 0) factor = 1.18; // Sun
    else if (dayOfWeek === 2) factor = 0.88; // Tue is cheapest
    else if (dayOfWeek === 3) factor = 0.92; // Wed is cheap
    else factor = 1.0;

    // Small day-of-month pseudo variance
    const variance = ((dayNum * 7 + month * 13) % 17) * 90;
    const finalPrice = Math.round((baseFare * factor + variance) / 50) * 50;
    dayPrices.push(finalPrice);

    const dateStr = cur.toISOString().split('T')[0];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const kPrice = finalPrice >= 10000 
      ? `₹${(finalPrice / 1000).toFixed(1)}K` 
      : `₹${(finalPrice / 1000).toFixed(1)}K`;

    result.push({
      dateStr,
      dayNum,
      dayName: dayNames[dayOfWeek],
      monthName: monthNames[month],
      fullFormatted: `${dayNames[dayOfWeek]}, ${dayNum} ${monthNames[month]}`,
      price: finalPrice,
      displayPrice: kPrice,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: cur.getTime() === today.getTime(),
      isPast
    });
  }

  // Calculate cheapest and expensive thresholds
  const validPrices = result.filter(r => !r.isPast).map(r => r.price);
  if (validPrices.length > 0) {
    const minP = Math.min(...validPrices);
    const maxP = Math.max(...validPrices);
    result.forEach(r => {
      if (r.price === minP) r.isCheapest = true;
      if (r.price > maxP * 0.9) r.isExpensive = true;
    });
  }

  return result;
};

/**
 * Get monthly grid for calendar modal
 */
export const getMonthCalendarDays = (year: number, month: number, origin: string = 'BOM', dest: string = 'DEL') => {
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseFare = getRouteBaseFare(origin, dest);
  const days: Array<DailyPriceInfo | null> = [];

  // Empty slots before 1st of month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  const monthPrices: number[] = [];

  for (let d = 1; d <= lastDate; d++) {
    const cur = new Date(year, month, d);
    cur.setHours(0, 0, 0, 0);
    const isPast = cur.getTime() < today.getTime();
    const dayOfWeek = cur.getDay();

    let factor = 1.0;
    if (dayOfWeek === 5) factor = 1.25;
    else if (dayOfWeek === 6) factor = 1.30;
    else if (dayOfWeek === 0) factor = 1.15;
    else if (dayOfWeek === 2) factor = 0.85;
    else if (dayOfWeek === 3) factor = 0.90;

    const variance = ((d * 11 + month * 7) % 19) * 110;
    const finalPrice = Math.round((baseFare * factor + variance) / 50) * 50;
    monthPrices.push(finalPrice);

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const kPrice = `₹${(finalPrice / 1000).toFixed(1)}K`;

    days.push({
      dateStr,
      dayNum: d,
      dayName: dayNames[dayOfWeek],
      monthName: monthNames[month],
      fullFormatted: `${dayNames[dayOfWeek]}, ${d} ${monthNames[month]}`,
      price: finalPrice,
      displayPrice: kPrice,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: cur.getTime() === today.getTime(),
      isPast
    });
  }

  const minP = Math.min(...monthPrices);
  const maxP = Math.max(...monthPrices);
  const sumP = monthPrices.reduce((a, b) => a + b, 0);
  const avgP = monthPrices.length > 0 ? sumP / monthPrices.length : baseFare;

  days.forEach(day => {
    if (day && !day.isPast) {
      if (day.price <= avgP * 0.92) {
        day.category = 'low'; // 🟢 Green
        day.isCheapest = true;
      } else if (day.price >= avgP * 1.12) {
        day.category = 'high'; // 🔴 Red
        day.isExpensive = true;
      } else {
        day.category = 'average'; // 🟡 Yellow
      }
    }
  });

  return days;
};
