import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HotelBookingCoordinator } from '../premium/booking/HotelBookingCoordinator';

export const StaysCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { hotel?: any; roomRate?: any; searchParams?: any } | undefined;
  
  const hotel = state?.hotel || {
    id: "h-grand-hyatt-goa",
    name: "Grand Hyatt Goa Resort & Spa",
    city: "Bambolim, Goa",
    rating: 4.8,
    reviews: 1420
  };

  const searchParams = state?.searchParams || {
    destination: hotel?.city || hotel?.name || 'Goa',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    adults: state?.searchParams?.adults || 2,
    rooms: 1,
  };

  return (
    <HotelBookingCoordinator
      initialSearchParams={searchParams}
      preselectedHotel={hotel}
      initialStep="checkout"
      onClose={() => navigate(-1)}
    />
  );
};

export default StaysCheckoutPage;
