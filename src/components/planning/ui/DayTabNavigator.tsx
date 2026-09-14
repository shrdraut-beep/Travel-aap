import React from "react";

interface DayTabNavigatorProps {
  days: any[]; // Array of day plan objects
  selectedDay: number;
  onDayChange: (dayNumber: number) => void;
}

export const DayTabNavigator: React.FC<DayTabNavigatorProps> = ({
  days,
  selectedDay,
  onDayChange
}) => {
  if (!days || days.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="overflow-x-auto whitespace-nowrap">
        <div className="inline-flex space-x-2">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => onDayChange(day.dayNumber)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedDay === day.dayNumber
                  ? "premium-gradient-pink text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Day {day.dayNumber}
              {day.date && (
                <span className="ml-1 text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};