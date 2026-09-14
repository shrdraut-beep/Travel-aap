import React from "react";
import { usePlanningStore } from "@/store/usePlanningStore";
import { TripCard } from "./TripCard";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { FiShare2 } from "react-icons/fi";
import { Trip } from "@/types";

export const TripDashboard: React.FC<{
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  onNavigateToNewTrip: () => void;
  onNavigateBack: () => void;
}> = ({ trips, selectedTripId, onSelectTrip, onNavigateToNewTrip, onNavigateBack }) => {
  const { deleteTrip } = usePlanningStore();

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(tripId);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
        <div className="flex space-x-3">
          <button
            onClick={onNavigateToNewTrip}
            className="bg-[var(--premium-violet)] hover:bg-premium-violet-soft text-white font-medium py-2 px-4 rounded"
          >
            <AiOutlinePlus className="mr-2" /> New Trip
          </button>
          <button
            onClick={() => {
              // Handle sharing all trips or exporting
              alert("Share/Export functionality coming soon");
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
          >
            <FiShare2 className="mr-2" /> Share
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No trips yet. Create your first trip!</p>
          <button
            onClick={onNavigateToNewTrip}
            className="mt-4 inline-block bg-[var(--premium-violet)] hover:bg-premium-violet-soft text-white font-medium py-2 px-4 rounded"
          >
            Create First Trip
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isSelected={selectedTripId === trip.id}
              onSelect={() => onSelectTrip(trip.id)}
              onDelete={() => handleDeleteTrip(trip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};