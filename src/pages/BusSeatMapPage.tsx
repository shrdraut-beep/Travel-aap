import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BusBookingCoordinator } from '../premium/booking/BusBookingCoordinator';

export const BusSeatMapPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { bus?: any; searchParams?: any };

  const bus = state?.bus;
  const searchParams = state?.searchParams || {
    origin: 'Mumbai',
    destination: 'Goa',
    date: '15 Oct 2026',
    passengers: 2
  };

  return (
    <BusBookingCoordinator
      initialSearchParams={searchParams}
      preselectedBus={bus}
      initialStep="seatmap"
      onClose={() => navigate(-1)}
    />
  );
};
