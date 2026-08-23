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

  days.forEach(day => {
    if (day && !day.isPast) {
      if (day.price <= minP * 1.05) day.isCheapest = true;
      if (day.price >= maxP * 0.92) day.isExpensive = true;
    }
  });

  return days;
};
