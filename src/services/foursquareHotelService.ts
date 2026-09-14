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
  console.warn('fetchFoursquareHotels is deprecated. Foursquare and Pexels removed as requested.');
  return [];
}
