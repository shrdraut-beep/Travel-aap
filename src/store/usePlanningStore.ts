import { create } from 'zustand';
import { Trip, Activity, Accommodation, Transportation, DayPlan } from '../types';

interface PlanningState {
  trips: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;

  // Actions
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  setSelectedTrip: (trip: Trip | null) => void;
  clearSelectedTrip: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Trip modifications
  addActivityToTrip: (tripId: string, activity: Activity) => void;
  updateActivityInTrip: (tripId: string, activityId: string, activity: Activity) => void;
  removeActivityFromTrip: (tripId: string, activityId: string) => void;

  addAccommodationToTrip: (tripId: string, accommodation: Accommodation) => void;
  updateAccommodationInTrip: (tripId: string, accommodationId: string, accommodation: Accommodation) => void;
  removeAccommodationFromTrip: (tripId: string, accommodationId: string) => void;

  addTransportationToTrip: (tripId: string, transportation: Transportation) => void;
  updateTransportationInTrip: (tripId: string, transportationId: string, transportation: Transportation) => void;
  removeTransportationFromTrip: (tripId: string, transportationId: string) => void;

  addDayPlanToTrip: (tripId: string, dayPlan: DayPlan) => void;
  updateDayPlanInTrip: (tripId: string, dayPlanId: string, dayPlan: DayPlan) => void;
  removeDayPlanFromTrip: (tripId: string, dayPlanId: string) => void;
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  trips: [],
  selectedTrip: null,
  loading: false,
  error: null,

  setTrips: (trips) => set({ trips }),
  addTrip: (trip) => set((state) => ({ trips: [...state.trips, trip] })),
  updateTrip: (trip) => set((state) => ({
    trips: state.trips.map((t) => t.id === trip.id ? trip : t),
    selectedTrip: state.selectedTrip?.id === trip.id ? trip : state.selectedTrip
  })),
  deleteTrip: (tripId) => set((state) => ({
    trips: state.trips.filter(trip => trip.id !== tripId),
    selectedTrip: state.selectedTrip?.id === tripId ? null : state.selectedTrip
  })),
  setSelectedTrip: (trip) => set({ selectedTrip: trip }),
  clearSelectedTrip: () => set({ selectedTrip: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addActivityToTrip: (tripId, activity) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const updatedTrip = {
      ...state.trips[tripIndex],
      activities: [...state.trips[tripIndex].activities, activity]
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  updateActivityInTrip: (tripId, activityId, activity) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const activityIndex = trip.activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) return state;

    const updatedActivities = [...trip.activities];
    updatedActivities[activityIndex] = activity;

    const updatedTrip = {
      ...trip,
      activities: updatedActivities
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  removeActivityFromTrip: (tripId, activityId) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const updatedActivities = trip.activities.filter(a => a.id !== activityId);

    const updatedTrip = {
      ...trip,
      activities: updatedActivities
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  addAccommodationToTrip: (tripId, accommodation) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const updatedTrip = {
      ...state.trips[tripIndex],
      accommodations: [...state.trips[tripIndex].accommodations, accommodation]
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  updateAccommodationInTrip: (tripId, accommodationId, accommodation) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const accommodationIndex = trip.accommodations.findIndex(a => a.id === accommodationId);
    if (accommodationIndex === -1) return state;

    const updatedAccommodations = [...trip.accommodations];
    updatedAccommodations[accommodationIndex] = accommodation;

    const updatedTrip = {
      ...trip,
      accommodations: updatedAccommodations
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  removeAccommodationFromTrip: (tripId, accommodationId) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const updatedAccommodations = trip.accommodations.filter(a => a.id !== accommodationId);

    const updatedTrip = {
      ...trip,
      accommodations: updatedAccommodations
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  addTransportationToTrip: (tripId, transportation) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const updatedTrip = {
      ...state.trips[tripIndex],
      transportation: [...state.trips[tripIndex].transportation, transportation]
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  updateTransportationInTrip: (tripId, transportationId, transportation) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const transportationIndex = trip.transportation.findIndex(t => t.id === transportationId);
    if (transportationIndex === -1) return state;

    const updatedTransportation = [...trip.transportation];
    updatedTransportation[transportationIndex] = transportation;

    const updatedTrip = {
      ...trip,
      transportation: updatedTransportation
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  removeTransportationFromTrip: (tripId, transportationId) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const updatedTransportation = trip.transportation.filter(t => t.id !== transportationId);

    const updatedTrip = {
      ...trip,
      transportation: updatedTransportation
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  addDayPlanToTrip: (tripId, dayPlan) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const updatedTrip = {
      ...state.trips[tripIndex],
      dayPlans: [...state.trips[tripIndex].dayPlans, dayPlan]
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  updateDayPlanInTrip: (tripId, dayPlanId, dayPlan) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const dayPlanIndex = trip.dayPlans.findIndex(dp => dp.id === dayPlanId);
    if (dayPlanIndex === -1) return state;

    const updatedDayPlans = [...trip.dayPlans];
    updatedDayPlans[dayPlanIndex] = dayPlan;

    const updatedTrip = {
      ...trip,
      dayPlans: updatedDayPlans
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  }),

  removeDayPlanFromTrip: (tripId, dayPlanId) => set((state) => {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return state;

    const trip = state.trips[tripIndex];
    const updatedDayPlans = trip.dayPlans.filter(dp => dp.id !== dayPlanId);

    const updatedTrip = {
      ...trip,
      dayPlans: updatedDayPlans
    };

    const updatedTrips = [...state.trips];
    updatedTrips[tripIndex] = updatedTrip;

    return {
      trips: updatedTrips,
      selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip
    };
  })
}));