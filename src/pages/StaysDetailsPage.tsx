import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HotelBookingCoordinator } from '../premium/booking/HotelBookingCoordinator';

export const StaysDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { hotel?: any; searchParams?: any } | undefined;
  const hotel = state?.hotel;
  
  const searchParams = state?.searchParams || {
    destination: hotel?.city || hotel?.name || 'Goa',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    adults: 2,
    rooms: 1,
  };

  return (
    <HotelBookingCoordinator
      initialSearchParams={searchParams}
      preselectedHotel={hotel}
      initialStep="rooms"
      onClose={() => navigate(-1)}
    />
  );
};

export default StaysDetailsPage;
