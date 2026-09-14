import React from "react";
import { Activity } from "@/types";

interface CostBreakdownProps {
  activities: Activity[];
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  activities
}) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No activities to break down
      </div>
    );
  }

  // Calculate totals by category
  const categoryTotals = activities.reduce((acc, activity) => {
    const category = activity.category || 'other';
    acc[category] = (acc[category] || 0) + (activity.cost);
    return acc;
  }, {} as Record<string, number>);

  const totalCost = Object.values(categoryTotals).reduce((sum, cost) => sum + cost, 0);

  const categoryLabels: Record<string, string> = {
    sightseeing: "Sightseeing",
    food: "Food & Dining",
    transport: "Transportation",
    accommodation: "Accommodation",
    entertainment: "Entertainment",
    other: "Other"
  };

  return (
    <div className="bg-white rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Estimated Cost:</span>
          <span className="font-medium text-gray-800">₹{totalCost.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-200 pt-3"></div>
        {Object.entries(categoryTotals).map(([category, amount]) => (
          <div key={category} className="flex justify-between text-sm">
            <span className="text-gray-500">{categoryLabels[category] || category}:</span>
            <span className="font-medium text-gray-700">₹{amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};