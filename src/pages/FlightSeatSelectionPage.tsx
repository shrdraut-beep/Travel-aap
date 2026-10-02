import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FlightBookingCoordinator } from '../premium/booking/FlightBookingCoordinator';

export const FlightSeatSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    flight?: any;
    searchParams?: any;
    adults?: number;
    children?: number;
    infants?: number;
  } | undefined;

  const flight = state?.flight;
  const searchParams = state?.searchParams || flight?.searchParams || {
    origin: flight?.origin || 'BOM',
    destination: flight?.destination || 'GOI',
    departDate: new Date().toISOString().split('T')[0],
    adults: state?.adults || 1,
    children: state?.children || 0,
    cabinClass: 'Economy'
  };

  return (
    <FlightBookingCoordinator
      initialSearchParams={searchParams}
      preselectedFlight={flight}
      initialStep="seats"
      onClose={() => navigate(-1)}
    />
  );
};

export default FlightSeatSelectionPage;
