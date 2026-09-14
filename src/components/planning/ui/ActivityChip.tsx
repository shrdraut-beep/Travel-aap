import React from "react";

interface ActivityChipProps {
  category?: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'entertainment' | string;
  label?: string;
}

export const ActivityChip: React.FC<ActivityChipProps> = ({
  category,
  label
}) => {
  const categoryLabels: Record<string, string> = {
    sightseeing: "Sightseeing",
    food: "Food & Dining",
    transport: "Transportation",
    accommodation: "Accommodation",
    entertainment: "Entertainment"
  };

  const categoryColors: Record<string, string> = {
    sightseeing: "bg-premium-violet-soft text-premium-violet",
    food: "bg-pink-100 text-pink-800",
    transport: "bg-rose-100 text-rose-800",
    accommodation: "bg-purple-100 text-purple-800",
    entertainment: "bg-pink-100 text-pink-800"
  };

  const displayLabel = label || (category && categoryLabels[category]) || category || "Activity";
  const bgColor = (category && categoryColors[category]) || "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
      {displayLabel}
    </span>
  );
};