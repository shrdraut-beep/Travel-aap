import React from "react";
import { FlightBookingCoordinator } from "./FlightBookingCoordinator";
import type { FlightSearchParams } from "./FlightBookingCoordinator";

export type BookingStep = "results" | "fares" | "passengers" | "seats" | "meals" | "checkout" | "confirmed";

export interface BookingFlowCoordinatorProps {
  initialSearchParams: FlightSearchParams;
  onClose: () => void;
  initialStep?: "results" | "fares" | "passengers" | "seats" | "meals" | "checkout";
  preselectedFlight?: any;
}

/**
 * BookingFlowCoordinator delegating to modern FlightBookingCoordinator (Google Stitch Theme).
 * Applies the clean, unified #0ea5e9 curved header, dynamic flight search, fare tiers,
 * seat map, passenger form, add-on meals, review & Razorpay payment flow.
 */
export const BookingFlowCoordinator: React.FC<BookingFlowCoordinatorProps> = ({
  initialSearchParams,
  onClose,
  initialStep = "results",
  preselectedFlight = null
}) => {
  return (
    <FlightBookingCoordinator
      initialSearchParams={initialSearchParams}
      onClose={onClose}
      initialStep={initialStep}
      preselectedFlight={preselectedFlight}
    />
  );
};
