// src/context/BookingFlowContext.tsx
import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';

export type FareTier = {
  id: string;
  label: string;              // "Saver (Regular)", "Flexi Plus", "Corporate Fare", "UpFront"
  pricePerAdult: number;
  cabinBaggageKg: number;
  checkinBaggageKg: number;
  refundable: boolean;
  cancellationSlabs: { window: string; fee: number; platformFee?: number }[];
  dateChangeSlabs: { window: string; fee: number; platformFee?: number }[];
  seatsIncluded: 'free' | 'chargeable';
  mealsIncluded: 'complimentary' | 'chargeable';
};

export type SelectedSeat = { legId: string; seatCode: string; type: 'free' | 'xl' | 'paid'; price: number };
export type SelectedMeal = { legId: string; mealId: string; label: string; price: number; legLabel?: string };
export type SelectedBaggage = { legId: string; optionId: string; label: string; kg: number; price: number; qty?: number };

export type Passenger = {
  passengerType: 'Adult' | 'Child' | 'Infant';
  salutation: 'Mr.' | 'Ms.' | 'Mrs.' | 'Mstr.' | 'Miss';
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  dob: string;            // YYYY-MM-DD
  isUnaccompaniedMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
};

export type BookingFlowState = {
  legs: { id: string; from: string; to: string; date: string; departureTime?: string; arrivalTime?: string; flightNo?: string; airline?: string }[];
  selectedFare: FareTier | null;
  seats: SelectedSeat[];
  meals: SelectedMeal[];
  baggage: SelectedBaggage[];
  passengers: Passenger[];
  passengerCount: number;
  billingPhone: string;
  billingEmail: string;
  gstNumber: string | null;
  hasGst: boolean;
  hasInsurance?: boolean;
  holdExpiresAt: number | null; // epoch ms — drives <HoldTimer />
  activeAddonTab: 'seats' | 'meals' | 'baggage';
  currentFlowStep: 'fare' | 'addons' | 'passengers' | 'review' | 'payment';
};

type Action =
  | { type: 'SET_LEGS'; legs: BookingFlowState['legs'] }
  | { type: 'SELECT_FARE'; fare: FareTier }
  | { type: 'SET_PASSENGER_COUNT'; count: number }
  | { type: 'TOGGLE_SEAT'; seat: SelectedSeat }
  | { type: 'TOGGLE_MEAL'; meal: SelectedMeal }
  | { type: 'SET_BAGGAGE_QTY'; legId: string; optionId: string; label: string; kg: number; unitPrice: number; qty: number }
  | { type: 'SET_PASSENGER'; index: number; passenger: Passenger }
  | { type: 'SET_ALL_PASSENGERS'; passengers: Passenger[] }
  | { type: 'SET_BILLING'; phone: string; email: string; gstNumber: string | null; hasGst?: boolean }
  | { type: 'SET_ADDON_TAB'; tab: 'seats' | 'meals' | 'baggage' }
  | { type: 'SET_FLOW_STEP'; step: BookingFlowState['currentFlowStep'] }
  | { type: 'START_HOLD'; minutes: number }
  | { type: 'TOGGLE_INSURANCE' }
  | { type: 'RESET' };

const createInitialPassenger = (): Passenger => ({
  passengerType: 'Adult',
  salutation: 'Mr.',
  firstName: '',
  lastName: '',
  gender: 'Male',
  nationality: 'India',
  dob: '',
  isUnaccompaniedMinor: false,
  guardianName: '',
  guardianPhone: '',
  guardianRelation: ''
});

const initialState: BookingFlowState = {
  legs: [],
  selectedFare: null,
  seats: [],
  meals: [],
  baggage: [],
  passengers: [createInitialPassenger()],
  passengerCount: 1,
  billingPhone: '',
  billingEmail: '',
  gstNumber: null,
  hasGst: false,
  holdExpiresAt: null,
  activeAddonTab: 'seats',
  currentFlowStep: 'fare',
};

function reducer(state: BookingFlowState, action: Action): BookingFlowState {
  switch (action.type) {
    case 'SET_LEGS':
      return { ...state, legs: action.legs };

    case 'SELECT_FARE':
      return { ...state, selectedFare: action.fare };

    case 'SET_PASSENGER_COUNT': {
      const count = Math.max(1, action.count);
      const newPax = [...state.passengers];
      while (newPax.length < count) {
        newPax.push(createInitialPassenger());
      }
      return { ...state, passengerCount: count, passengers: newPax.slice(0, count) };
    }

    case 'TOGGLE_SEAT': {
      const exists = state.seats.find(s => s.legId === action.seat.legId && s.seatCode === action.seat.seatCode);
      const otherLegSeats = state.seats.filter(s => s.legId !== action.seat.legId);
      const currentLegSeats = state.seats.filter(s => s.legId === action.seat.legId);
      
      if (exists) {
        return { ...state, seats: state.seats.filter(s => !(s.legId === action.seat.legId && s.seatCode === action.seat.seatCode)) };
      }
      
      // Limit seats per leg to passengerCount
      if (currentLegSeats.length >= state.passengerCount) {
        // Replace oldest or first
        const updated = [...currentLegSeats.slice(1), action.seat];
        return { ...state, seats: [...otherLegSeats, ...updated] };
      }
      return { ...state, seats: [...state.seats, action.seat] };
    }

    case 'TOGGLE_MEAL': {
      const exists = state.meals.find(m => m.legId === action.meal.legId && m.mealId === action.meal.mealId);
      if (exists) {
        return { ...state, meals: state.meals.filter(m => !(m.legId === action.meal.legId && m.mealId === action.meal.mealId)) };
      }
      return { ...state, meals: [...state.meals, action.meal] };
    }

    case 'SET_BAGGAGE_QTY': {
      const filtered = state.baggage.filter(b => !(b.legId === action.legId && b.optionId === action.optionId));
      if (action.qty <= 0) return { ...state, baggage: filtered };
      return {
        ...state,
        baggage: [
          ...filtered,
          { legId: action.legId, optionId: action.optionId, label: action.label, kg: action.kg * action.qty, price: action.unitPrice * action.qty, qty: action.qty },
        ],
      };
    }

    case 'SET_PASSENGER': {
      const next = [...state.passengers];
      next[action.index] = { ...next[action.index], ...action.passenger };
      return { ...state, passengers: next };
    }

    case 'SET_ALL_PASSENGERS':
      return { ...state, passengers: action.passengers, passengerCount: action.passengers.length };

    case 'SET_BILLING':
      return { 
        ...state, 
        billingPhone: action.phone, 
        billingEmail: action.email, 
        gstNumber: action.gstNumber,
        hasGst: action.hasGst !== undefined ? action.hasGst : state.hasGst
      };

    case 'SET_ADDON_TAB':
      return { ...state, activeAddonTab: action.tab };

    case 'SET_FLOW_STEP':
      return { ...state, currentFlowStep: action.step };

    case 'START_HOLD':
      return { ...state, holdExpiresAt: Date.now() + action.minutes * 60_000 };

    case 'TOGGLE_INSURANCE':
      return { ...state, hasInsurance: !state.hasInsurance };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

type BookingFlowContextValue = {
  state: BookingFlowState;
  dispatch: React.Dispatch<Action>;
  totals: { 
    seats: number; 
    meals: number; 
    baggage: number; 
    insurance: number;
    farePerAdult: number;
    baseFare: number;
    taxesAndFees: number;
    convenienceFee: number;
    convenienceFeeWaived: boolean;
    grandTotal: number;
  };
  isPassengerFormValid: boolean;
  validationErrors: { index: number; field: string; message: string }[];
  buildCheckoutPayload: () => Record<string, any>;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Synchronize passenger array length with passengerCount
  useEffect(() => {
    if (state.passengers.length !== state.passengerCount) {
      const newPax = [...state.passengers];
      while (newPax.length < state.passengerCount) {
        newPax.push(createInitialPassenger());
      }
      if (newPax.length > state.passengerCount) {
        newPax.length = state.passengerCount;
      }
      dispatch({ type: 'SET_ALL_PASSENGERS', passengers: newPax });
    }
  }, [state.passengerCount]);

  const totals = useMemo(() => {
    const seats = state.seats.reduce((sum, s) => sum + s.price, 0);
    const meals = state.meals.reduce((sum, m) => sum + m.price, 0);
    const baggage = state.baggage.reduce((sum, b) => sum + b.price, 0);
    const insurance = state.hasInsurance ? 249 * state.passengerCount : 0;
    const farePerAdult = state.selectedFare?.pricePerAdult ?? 0;
    const baseFare = farePerAdult * state.passengerCount;
    const taxesAndFees = Math.round(baseFare * 0.05); // 5% GST & Platform
    const convenienceFee = 250;
    const convenienceFeeWaived = true; // ₹0 Conv Fee Offer active
    const grandTotal = baseFare + taxesAndFees + seats + meals + baggage + insurance + (convenienceFeeWaived ? 0 : convenienceFee);

    return {
      seats,
      meals,
      baggage,
      insurance,
      farePerAdult,
      baseFare,
      taxesAndFees,
      convenienceFee,
      convenienceFeeWaived,
      grandTotal
    };
  }, [state.seats, state.meals, state.baggage, state.selectedFare, state.passengerCount]);

  // Strict Passenger & Billing Validation
  const { isPassengerFormValid, validationErrors } = useMemo(() => {
    const errors: { index: number; field: string; message: string }[] = [];

    // Validate ALL N passengers
    state.passengers.forEach((pax, i) => {
      if (!pax.firstName || pax.firstName.trim().length < 2) {
        errors.push({ index: i, field: 'firstName', message: `Passenger ${i + 1}: First name is required (min 2 chars)` });
      }
      if (!pax.lastName || pax.lastName.trim().length < 1) {
        errors.push({ index: i, field: 'lastName', message: `Passenger ${i + 1}: Last name is required` });
      }
      if (!pax.dob || pax.dob.trim().length !== 10) {
        errors.push({ index: i, field: 'dob', message: `Passenger ${i + 1}: Date of birth is required (DD/MM/YYYY)` });
      }
      if (!pax.nationality || pax.nationality.trim().length === 0) {
        errors.push({ index: i, field: 'nationality', message: `Passenger ${i + 1}: Nationality is required` });
      }
      if (pax.isUnaccompaniedMinor) {
        if (!pax.guardianName || pax.guardianName.trim().length < 2) {
          errors.push({ index: i, field: 'guardianName', message: `Passenger ${i + 1}: Guardian Name required for minor` });
        }
        if (!pax.guardianPhone || pax.guardianPhone.trim().length < 8) {
          errors.push({ index: i, field: 'guardianPhone', message: `Passenger ${i + 1}: Guardian Contact required for minor` });
        }
      }
    });

    // Validate billing details
    const phoneValid = state.billingPhone.trim().replace(/\D/g, '').length >= 10;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.billingEmail.trim());

    if (!phoneValid) {
      errors.push({ index: -1, field: 'billingPhone', message: 'Valid 10-digit phone number is required' });
    }
    if (!emailValid) {
      errors.push({ index: -1, field: 'billingEmail', message: 'Valid email address is required' });
    }

    const isValid = errors.length === 0;

    return { isPassengerFormValid: isValid, validationErrors: errors };
  }, [state.passengers, state.billingPhone, state.billingEmail]);

  const buildCheckoutPayload = () => ({
    fare: state.selectedFare,
    seats: state.seats,
    meals: state.meals,
    baggage: state.baggage,
    passengers: state.passengers,
    passengerCount: state.passengerCount,
    billing: { 
      phone: state.billingPhone, 
      email: state.billingEmail, 
      gstNumber: state.hasGst ? state.gstNumber : null 
    },
    totals,
    amount: totals.grandTotal,
  });

  return (
    <BookingFlowContext.Provider value={{
      state,
      dispatch,
      totals,
      isPassengerFormValid,
      validationErrors,
      buildCheckoutPayload
    }}>
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const ctx = useContext(BookingFlowContext);
  if (!ctx) throw new Error('useBookingFlow must be used inside <BookingFlowProvider>');
  return ctx;
}
