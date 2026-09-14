import React, { createContext, useContext, useState, useEffect } from 'react';
import { TripGroup, Expense, Deposit, Member, TripPlan } from '../types';

export const INITIAL_TRIPS: TripGroup[] = [];

const EMPTY_TRIP: TripGroup = {
  id: "no-trip",
  name: "No Active Trip",
  destination: "Create or Select a Trip",
  startDate: new Date().toISOString().substring(0, 10),
  endDate: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
  totalBudget: 0,
  calculationMode: "admin_pooled",
  adminId: "",
  status: "ACTIVE",
  members: [],
  deposits: [],
  expenses: [],
  itinerary: []
};

interface TripContextType {
  activeTrip: TripGroup | null;
  trips: TripGroup[];
  setActiveTrip: (trip: TripGroup) => void;
  selectTripById: (id: string) => void;
  updateActiveTrip: (updated: TripGroup) => void;
  addNewTrip: (newTripData: Partial<TripGroup>) => TripGroup;
  deleteTrip: (id: string) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<TripGroup[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('routripo_user_trips');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed loading trips from storage", e);
      }
    }
    return INITIAL_TRIPS;
  });

  const [activeTrip, setActiveTripState] = useState<TripGroup>(() => {
    return trips.length > 0 ? trips[0] : EMPTY_TRIP;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('routripo_user_trips', JSON.stringify(trips));
      } catch (e) {
        console.error("Failed saving trips to storage", e);
      }
    }
  }, [trips]);

  const setActiveTrip = (trip: TripGroup) => {
    setActiveTripState(trip);
    setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
  };

  const selectTripById = (id: string) => {
    const found = trips.find(t => t.id === id || t.name.toLowerCase().includes(id.toLowerCase()));
    if (found) {
      setActiveTripState(found);
    }
  };

  const updateActiveTrip = (updated: TripGroup) => {
    setActiveTripState(updated);
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const addNewTrip = (newTripData: Partial<TripGroup>): TripGroup => {
    const createdMembers = newTripData.members && newTripData.members.length > 0
      ? newTripData.members
      : [{ id: `m-${Date.now()}-1`, name: "Organizer", color: "#f43f5e", totalDeposited: 0 }];

    const created: TripGroup = {
      id: `trip-${Date.now()}`,
      name: newTripData.name || "New Trip",
      destination: newTripData.destination || "Destination",
      startDate: newTripData.startDate || new Date().toISOString().substring(0, 10),
      endDate: newTripData.endDate || new Date(Date.now() + 86400000 * 5).toISOString().substring(0, 10),
      totalBudget: newTripData.totalBudget || 0,
      calculationMode: newTripData.calculationMode || "admin_pooled",
      adminId: createdMembers[0]?.id || `m-${Date.now()}-1`,
      status: "ACTIVE",
      members: createdMembers,
      deposits: newTripData.deposits || [],
      expenses: newTripData.expenses || [],
      itinerary: newTripData.itinerary || []
    };

    setTrips(prev => [created, ...prev]);
    setActiveTripState(created);
    return created;
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    if (activeTrip && activeTrip.id === id) {
      const remaining = trips.filter(t => t.id !== id);
      setActiveTripState(remaining.length > 0 ? remaining[0] : EMPTY_TRIP);
    }
  };

  return (
    <TripContext.Provider value={{
      activeTrip,
      trips,
      setActiveTrip,
      selectTripById,
      updateActiveTrip,
      addNewTrip,
      deleteTrip
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
};
