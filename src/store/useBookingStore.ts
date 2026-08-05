import { create } from 'zustand';

interface BookingStoreState {
  activeTab: 'flights' | 'hotels' | 'trains';
  setActiveTab: (tab: 'flights' | 'hotels' | 'trains') => void;
  flightOrigin: string;
  setFlightOrigin: (origin: string) => void;
  flightDestination: string;
  setFlightDestination: (destination: string) => void;
  flightDepartureDate: string;
  setFlightDepartureDate: (date: string) => void;
  trainOrigin: string;
  setTrainOrigin: (origin: string) => void;
  trainDestination: string;
  setTrainDestination: (destination: string) => void;
  trainDate: string;
  setTrainDate: (date: string) => void;
  trainClass: string;
  setTrainClass: (cls: string) => void;
  hotelCity: string;
  setHotelCity: (city: string) => void;
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  hotelGuests: string;
  setHotelGuests: (guests: string) => void;
}

export const useBookingStore = create<BookingStoreState>((set) => ({
  activeTab: 'flights',
  setActiveTab: (tab) => set({ activeTab: tab }),
  flightOrigin: '',
  setFlightOrigin: (origin) => set({ flightOrigin: origin }),
  flightDestination: '',
  setFlightDestination: (destination) => set({ flightDestination: destination }),
  flightDepartureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  setFlightDepartureDate: (date) => set({ flightDepartureDate: date }),
  trainOrigin: '',
  setTrainOrigin: (origin) => set({ trainOrigin: origin }),
  trainDestination: '',
  setTrainDestination: (destination) => set({ trainDestination: destination }),
  trainDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  setTrainDate: (date) => set({ trainDate: date }),
  trainClass: 'ALL',
  setTrainClass: (cls) => set({ trainClass: cls }),
  hotelCity: '',
  setHotelCity: (city) => set({ hotelCity: city }),
  checkInDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  setCheckInDate: (date) => set({ checkInDate: date }),
  hotelGuests: '2 Guests, 1 Room',
  setHotelGuests: (guests) => set({ hotelGuests: guests })
}));
