// context/BookingFlowContext.tsx
// Single source of truth for the new post-search booking steps
// (fare, seats, meals, baggage, passenger, review). Existing search/results
// state stays wherever it already lives — this context only starts once a
// user taps a flight card, and hands off a finished payload to the
// existing checkout/payment flow untouched.

import React, { createContext, useContext, useMemo, useReducer } from 'react';

export type FareTier = {
  id: string;
  label: string;              // "Saver (Regular)", "Flexi Plus", "Corporate Fare", "UpFront"
  pricePerAdult: number;
  cabinBaggageKg: number;
  checkinBaggageKg: number;
  refundable: boolean;
  cancellationSlabs: { window: string; fee: number }[];
  dateChangeSlabs: { window: string; fee: number }[];
  seatsIncluded: 'free' | 'chargeable';
  mealsIncluded: 'complimentary' | 'chargeable';
};

export type SelectedSeat = { legId: string; seatCode: string; type: 'free' | 'xl' | 'paid'; price: number };
export type SelectedMeal = { legId: string; mealId: string; label: string; price: number };
export type SelectedBaggage = { legId: string; optionId: string; label: string; kg: number; price: number };

export type Passenger = {
  salutation: 'Mr.' | 'Ms.' | 'Mrs.';
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;            // DD/MM/YYYY
  isUnaccompaniedMinor: boolean;
};

type BookingFlowState = {
  legs: { id: string; from: string; to: string; date: string }[];
  selectedFare: FareTier | null;
  seats: SelectedSeat[];
  meals: SelectedMeal[];
  baggage: SelectedBaggage[];
  passengers: Passenger[];
  billingPhone: string;
  billingEmail: string;
  gstNumber: string | null;
  holdExpiresAt: number | null; // epoch ms — drives <HoldTimer />
};

type Action =
  | { type: 'SET_LEGS'; legs: BookingFlowState['legs'] }
  | { type: 'SELECT_FARE'; fare: FareTier }
  | { type: 'TOGGLE_SEAT'; seat: SelectedSeat }
  | { type: 'TOGGLE_MEAL'; meal: SelectedMeal }
  | { type: 'SET_BAGGAGE_QTY'; legId: string; optionId: string; label: string; kg: number; unitPrice: number; qty: number }
  | { type: 'SET_PASSENGER'; index: number; passenger: Passenger }
  | { type: 'SET_BILLING'; phone: string; email: string; gstNumber: string | null }
  | { type: 'START_HOLD'; minutes: number }
  | { type: 'RESET' };

const initialState: BookingFlowState = {
  legs: [],
  selectedFare: null,
  seats: [],
  meals: [],
  baggage: [],
  passengers: [],
  billingPhone: '',
  billingEmail: '',
  gstNumber: null,
  holdExpiresAt: null,
};

function reducer(state: BookingFlowState, action: Action): BookingFlowState {
  switch (action.type) {
    case 'SET_LEGS':
      return { ...state, legs: action.legs };

    case 'SELECT_FARE':
      return { ...state, selectedFare: action.fare };

    case 'TOGGLE_SEAT': {
      const exists = state.seats.find(s => s.legId === action.seat.legId && s.seatCode === action.seat.seatCode);
      const withoutLegSeat = state.seats.filter(s => s.legId !== action.seat.legId); // one seat per leg (1 pax)
      return { ...state, seats: exists ? withoutLegSeat : [...withoutLegSeat, action.seat] };
    }

    case 'TOGGLE_MEAL': {
      const exists = state.meals.find(m => m.legId === action.meal.legId && m.mealId === action.meal.mealId);
      const withoutLegMeal = state.meals.filter(m => m.legId !== action.meal.legId);
      return { ...state, meals: exists ? withoutLegMeal : [...withoutLegMeal, action.meal] };
    }

    case 'SET_BAGGAGE_QTY': {
      const filtered = state.baggage.filter(b => !(b.legId === action.legId && b.optionId === action.optionId));
      if (action.qty <= 0) return { ...state, baggage: filtered };
      return {
        ...state,
        baggage: [
          ...filtered,
          { legId: action.legId, optionId: action.optionId, label: action.label, kg: action.kg * action.qty, price: action.unitPrice * action.qty },
        ],
      };
    }

    case 'SET_PASSENGER': {
      const next = [...state.passengers];
      next[action.index] = action.passenger;
      return { ...state, passengers: next };
    }

    case 'SET_BILLING':
      return { ...state, billingPhone: action.phone, billingEmail: action.email, gstNumber: action.gstNumber };

    case 'START_HOLD':
      return { ...state, holdExpiresAt: Date.now() + action.minutes * 60_000 };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

type BookingFlowContextValue = {
  state: BookingFlowState;
  dispatch: React.Dispatch<Action>;
  totals: { seats: number; meals: number; baggage: number; fare: number; grandTotal: number };
  buildCheckoutPayload: () => Record<string, unknown>;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const totals = useMemo(() => {
    const seats = state.seats.reduce((sum, s) => sum + s.price, 0);
    const meals = state.meals.reduce((sum, m) => sum + m.price, 0);
    const baggage = state.baggage.reduce((sum, b) => sum + b.price, 0);
    const fare = state.selectedFare?.pricePerAdult ?? 0;
    return { seats, meals, baggage, fare, grandTotal: fare + seats + meals + baggage };
  }, [state.seats, state.meals, state.baggage, state.selectedFare]);

  // Final payload handed to the EXISTING checkout/Razorpay flow — nothing
  // downstream of this needs to know these screens are new.
  const buildCheckoutPayload = () => ({
    fare: state.selectedFare,
    seats: state.seats,
    meals: state.meals,
    baggage: state.baggage,
    passengers: state.passengers,
    billing: { phone: state.billingPhone, email: state.billingEmail, gstNumber: state.gstNumber },
    amount: totals.grandTotal,
  });

  return (
    <BookingFlowContext.Provider value={{ state, dispatch, totals, buildCheckoutPayload }}>
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const ctx = useContext(BookingFlowContext);
  if (!ctx) throw new Error('useBookingFlow must be used inside <BookingFlowProvider>');
  return ctx;
}
