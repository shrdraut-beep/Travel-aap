import React from "react";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { Trip } from "@/types";
import { TripDashboard } from "./TripDashboard";
import { AiItineraryGenerator } from "./AiItineraryGenerator";
import { SmartDayPlanner } from "./SmartDayPlanner";

export const PlanningWorkspace: React.FC<{
  onNavigateBack: () => void;
  onNavigateToNewTrip: () => void;
  onNavigateToTripDetail: (tripId: string) => void;
}> = ({ onNavigateBack, onNavigateToNewTrip, onNavigateToTripDetail }) => {
  const { trips, setTrips, loading, setLoading, error, setError } = usePlanningStore();
  const { currentUser } = useAuthStore();
  const user = currentUser as any; // Type workaround for User
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'new-trip' | 'trip-detail'>('dashboard');
  const [selectedTripId, setSelectedTripId] = React.useState<string | null>(null);

  // Load trips from Firestore when user changes or on initial load
  useEffect(() => {
    if (!user) {
      setTrips([]);
      return;
    }

    setLoading(true);
    setError(null);

    const tripsQuery = query(
      collection(db, "trips"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Trip[];
        setTrips(tripsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching trips:", err);
        setError("Failed to load trips");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, setTrips]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-t-2 border-[var(--premium-violet)] w-12 h-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-center text-red-500">
          <p className="mb-2">Error loading trips</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--premium-violet)] hover:bg-premium-violet-soft text-white font-medium py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no user, show message to sign in (handled by parent)
  // In preview mode, we'll show an empty state instead of requiring login
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center">
        <p className="text-center text-red-500">Please log in to access the Planning Workspace</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-transparent">
      {currentView === 'dashboard' && (
        <TripDashboard
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={(tripId) => {
            setSelectedTripId(tripId);
            setCurrentView('trip-detail');
            onNavigateToTripDetail(tripId);
          }}
          onNavigateToNewTrip={onNavigateToNewTrip}
          onNavigateBack={onNavigateBack}
        />
      )}
      {currentView === 'new-trip' && (
        <AiItineraryGenerator
          onCancel={onNavigateBack}
        />
      )}
      {currentView === 'trip-detail' && selectedTripId && (
        <SmartDayPlanner
          tripId={selectedTripId}
          onCancel={onNavigateBack}
        />
      )}
    </div>
  );
};