import React from "react";
import { ChevronRight, MoreHorizontal, Trash2, Share2 } from "lucide-react";
import { Trip } from "@/types";

interface TripCardProps {
  trip: Trip;
  isSelected: boolean;
  onSelect: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  isSelected,
  onSelect,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(trip.id);
  };

  return (
    <div onClick={() => onSelect(trip.id)} className="cursor-pointer">
      <div className={`bg-white rounded-3xl shadow-[0_12px_35px_-15px_rgba(40,32,79,0.15)] p-3.5 hover:shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-shadow cursor-pointer border ${isSelected ? 'border-premium-violet' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800 leading-none">{trip.destination}</h3>
            <p className="text-sm text-gray-500 leading-none mt-0">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </p>
            <p className="text-sm text-gray-600 leading-none mt-0">
              {trip.activities.length} activities • {trip.currency} {trip.budget.toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-1 rounded">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};