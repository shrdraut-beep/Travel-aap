export interface Activity {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  cost?: number;
  location?: string;
  category?: string;
  type?: string;
  priority?: string;
  notes?: string;
  dayId?: string;
}

export interface DayPlan {
  id: string;
  date: string;
  dayNumber?: number;
  weatherForecast?: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  destination?: string;
  destinations?: string[];
  days?: DayPlan[];
  dayPlans?: DayPlan[];
  accommodations?: any[];
  transportation?: any[];
  activities?: Activity[];
  currency?: string;
  budget?: number;
  totalCost?: number;
}
