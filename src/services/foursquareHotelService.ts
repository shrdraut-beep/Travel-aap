import { HotelOption } from '../components/travel/api';

export interface FetchFoursquareHotelParams {
  destination: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  onRawData?: (data: any) => void;
  onRequestParams?: (params: any) => void;
}

export async function fetchFoursquareHotels(params: FetchFoursquareHotelParams): Promise<HotelOption[]> {
  const destination = (params.destination || 'Goa').trim();

  const payload = {
    destination,
    city: destination,
  };

  if (params.onRequestParams) {
    params.onRequestParams(payload);
  }

  try {
    let res = await fetch('/api/search-hotels-foursquare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      res = await fetch(`/api/foursquare-hotels?city=${encodeURIComponent(destination)}`);
    }

    const data = await res.json().catch(() => ({}));
    if (params.onRawData) params.onRawData(data);

    if (data?.success && Array.isArray(data?.hotels) && data.hotels.length > 0) {
      const hotels = data.hotels;
      
      // Ranking Logic: If destination contains a hotel name, find it and move to top
      const searchTerms = destination.toLowerCase().split(' ').filter(word => word.length > 3);
      
      const rankedHotels = [...hotels].sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        const aScore = searchTerms.filter(term => aName.includes(term)).length;
        const bScore = searchTerms.filter(term => bName.includes(term)).length;
        
        return bScore - aScore;
      });
      
      return rankedHotels;
    }
  } catch (err: any) {
    console.warn('Foursquare Hotel service notice:', err?.message || err);
  }

  return [];
}
