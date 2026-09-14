import React, { useState } from "react";

interface TimeSlotPickerProps {
  onTimeChange: (startTime: string, endTime: string) => void;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  onTimeChange,
  defaultStartTime = "09:00",
  defaultEndTime = "19:00"
}) => {
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    onTimeChange(e.target.value, endTime);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
    onTimeChange(startTime, e.target.value);
  };

  return (
    <div className="bg-white rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Day Planning Hours</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={handleEndTimeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Set your preferred planning hours for activity optimization
      </p>
    </div>
  );
};