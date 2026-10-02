import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CarBookingCoordinator } from '../premium/booking/CarBookingCoordinator';

export const CarResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { searchParams?: any; car?: any; quote?: any } | undefined;

  const searchParams = state?.searchParams || {
    location: "Goa",
    origin: "Mumbai",
    destination: "Goa",
    pickupDate: new Date().toISOString().split("T")[0] + ", 08:30 AM",
    passengers: 2
  };

  const preselectedCar = state?.car || state?.quote;

  return (
    <CarBookingCoordinator
      initialSearchParams={searchParams}
      preselectedCar={preselectedCar}
      initialStep={preselectedCar ? 2 : 1}
      onClose={() => navigate(-1)}
    />
  );
};

export default CarResultsPage;
