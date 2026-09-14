export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
}

export const fetchPublicHolidays = async (year: number, countryCode: string = 'IN'): Promise<PublicHoliday[]> => {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
};

export const checkHolidaysDuringTrip = async (startDate: string, endDate: string, countryCode: string = 'IN'): Promise<PublicHoliday[]> => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const year = start.getFullYear();
  
  const holidays = await fetchPublicHolidays(year, countryCode);
  
  return holidays.filter(holiday => {
    const hDate = new Date(holiday.date);
    return hDate >= start && hDate <= end;
  });
};
