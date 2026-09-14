import React, { useState, useEffect } from "react";
import { usePlanningStore } from "@/store/usePlanningStore";
import { ActivityChip } from "./ui/ActivityChip";
import { DayTabNavigator } from "./ui/DayTabNavigator";
import { TimeSlotPicker } from "./ui/TimeSlotPicker";
import { CostBreakdown } from "./ui/CostBreakdown";
import { WeatherBadge } from "./ui/WeatherBadge";
import { db } from "@/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

interface SmartDayPlannerProps {
  hideHeader?: boolean;
  tripId: string;
  onCancel?: () => void;
}

export const SmartDayPlanner: React.FC<SmartDayPlannerProps> = ({
  tripId,
  onCancel
}) => {
  const { selectedTrip, setSelectedTrip, updateTrip } = usePlanningStore();

  const [dayPlans, setDayPlans] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<any>(null);

  // Load trip data when component mounts or tripId changes
  useEffect(() => {
    if (!tripId) return;

    const loadTrip = async () => {
      try {
        const tripRef = doc(db, "trips", tripId);
        const tripSnap = await getDoc(tripRef);

        if (tripSnap.exists()) {
          const tripData = tripSnap.data();
          setSelectedTrip(tripData as any);

          // Initialize day plans if not present
          if (!tripData.dayPlans || tripData.dayPlans.length === 0) {
            // Create default day plans based on trip duration
            const startDate = new Date(tripData.startDate);
            const endDate = new Date(tripData.endDate);
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const defaultDayPlans = Array.from({ length: diffDays }, (_, i) => ({
              id: `day-${i + 1}`,
              tripId: tripId,
              dayNumber: i + 1,
              date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              activities: [],
              totalEstimatedCost: 0,
              isOptimized: false
            }));

            await updateDoc(tripRef, { dayPlans: defaultDayPlans });
            setDayPlans(defaultDayPlans);
          } else {
            setDayPlans(tripData.dayPlans);
          }
        }
      } catch (err) {
        console.error("Error loading trip:", err);
      }
    };

    loadTrip();
  }, [tripId]);

  // Update selected day when trip data loads
  useEffect(() => {
    if (selectedTrip && selectedTrip.dayPlans && selectedTrip.dayPlans.length > 0) {
      setDayPlans(selectedTrip.dayPlans);
      // Set to first day by default, or last viewed day
      setSelectedDay(1);
    }
  }, [selectedTrip]);

  const handleDayChange = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  const handleActivityDragEnd = (activityId: string, newPosition: number) => {
    // Handle drag and drop reordering of activities within a day
    // This would update the activity order in the day's activities array
    // Implementation depends on the drag-and-drop library used
    console.log(`Moving activity ${activityId} to position ${newPosition}`);
  };

  const handleOptimizeDay = async () => {
    const currentDayPlan = dayPlans.find((plan) => plan.dayNumber === selectedDay);
    if (!currentDayPlan || currentDayPlan.activities.length === 0) {
      setOptimizationError("No activities to optimize for this day");
      return;
    }

    setIsOptimizing(true);
    setOptimizationError(null);

    try {
      // Call the existing day plan optimization endpoint
      const response = await fetch("/api/optimize-day-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activities: currentDayPlan.activities,
          location: currentDayPlan.location || "",
          date: currentDayPlan.date,
          preferences: {
            startTime: "09:00",
            endTime: "19:00",
            maxWalkingDistance: 5, // km
            avoidTransitBefore: "08:00",
            preferTransitAfter: "20:00"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to optimize day plan");
      }

      const result = await response.json();

      if (result.success && result.text) {
        let optimizationResult;
        try {
          optimizationResult = JSON.parse(result.text);
        } catch (parseError) {
          console.error("Failed to parse optimization response:", parseError);
          throw new Error("Invalid optimization response");
        }

        // Update the day plan with optimized activities
        const optimizedActivities = optimizationResult.optimizedActivities || currentDayPlan.activities;
        const updatedDayPlan = {
          ...currentDayPlan,
          activities: optimizedActivities,
          totalEstimatedCost: optimizationResult.totalEstimatedCost || currentDayPlan.totalEstimatedCost,
          weatherForecast: optimizationResult.weatherForecast || null,
          isOptimized: true
        };

        // Update in local state
        setDayPlans(prev =>
          prev.map(plan =>
            plan.dayNumber === selectedDay ? updatedDayPlan : plan
          )
        );

        // Update in Firestore
        if (selectedTrip) {
          const tripRef = doc(db, "trips", selectedTrip.id);
          await updateDoc(tripRef, { dayPlans: [...dayPlans] });

          // Update selected trip in store
          updateTrip({
            ...selectedTrip,
            dayPlans: [...dayPlans]
          });
        }
      } else {
        throw new Error("Invalid response from optimization service");
      }
    } catch (err: any) {
      console.error("Error optimizing day plan:", err);
      setOptimizationError(err.message || "Failed to optimize day plan. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!selectedTrip) {
    // In a real implementation, we'd navigate back to the trip list
    // For now, we'll just return null or show an error
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-transparent">
      <div className="p-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Smart Day Planner</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onCancel?.();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Trips
            </button>
            <button
              onClick={handleOptimizeDay}
              disabled={isOptimizing}
              className={`bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2 px-4 rounded-xl shadow-sm transition-colors ${
                isOptimizing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full border-4 border-t-2 border-white w-4 h-4 inline-block mr-2"></div>
                  Optimizing...
                </>
              ) : (
                "Optimize Day"
              )}
            </button>
          </div>
        </div>

        {optimizationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {optimizationError}
          </div>
        )}

        {/* Day Tab Navigator */}
        <DayTabNavigator
          days={dayPlans}
          selectedDay={selectedDay}
          onDayChange={handleDayChange}
        />

        {/* Weather Forecast */}
        {weatherForecast && (
          <div className="mb-4">
            <WeatherBadge forecast={weatherForecast} />
          </div>
        )}

        {/* Current Day Plan */}
        <div className="bg-white rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Day {selectedDay} Plan
          </h2>

          {/* Time Slots and Activities */}
          <div className="space-y-4">
            {/* This would be replaced with actual drag-and-drop time slot implementation */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-700 mb-3">Activities</h3>
              {dayPlans.find((plan) => plan.dayNumber === selectedDay)?.activities.map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-premium-violet-soft0 rounded-full mt-1"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                    <p className="text-sm text-gray-600">{activity.location}</p>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                        {activity.startTime} - {activity.endTime}
                      </span>
                      <ActivityChip category={activity.category} />
                      <span className="text-gray-500">₹{activity.cost}</span>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">
                  No activities planned for this day yet. Add activities from your itinerary.
                </p>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <CostBreakdown
              activities={dayPlans.find((plan) => plan.dayNumber === selectedDay)?.activities || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};