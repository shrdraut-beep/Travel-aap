# Technical Plan: Planning Workspace

**Spec Reference**: `specs/planning-workspace/spec.md`  
**Status**: Draft  

---

## 1. Architecture Overview

The Planning Workspace will be implemented as a full-screen route in the Premium Preview App, replacing the "My trips (Trips tab placeholder)". It will consist of:

- **Client-side**: React components built with TypeScript, Tailwind CSS, and Motion for animations
- **State Management**: Zustand for global trip state and UI state
- **Persistence**: Firebase Firestore for cloud storage of trips (with local fallback for offline)
- **AI Integration**: Calls to existing AI itinerary generation endpoints from the Regular App
- **Routing**: New route `/planning` in the app's navigation structure

The workspace will be organized into three main views:
1. Trip Dashboard (overview of all trips)
2. AI Itinerary Generator (input form + results)
3. Smart Day Planner (daily schedule optimization)

---

## 2. Technical Stack & Dependencies

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Motion, Zustand
* **Backend / API**: Express server (`server.ts`) - extends existing AI endpoints
* **State / Storage**: 
  - Global trip state: Zustand store
  - UI state: React hooks + Zustand
  - Persistence: Firebase Firestore (primary), IndexedDB/localStorage (offline fallback)
* **AI Services**: Reuses existing `/api/generate-itinerary` and `/api/optimize-day-plan` endpoints

---

## 3. Data Models & Schemas

```typescript
// Shared Types for Planning Workspace
export interface Trip {
  id: string;
  userId: string;
  destination: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  budget: number;
  currency: string;
  travelers: number;
  tripType: 'solo' | 'family' | 'friends' | 'couple' | 'business';
  theme: string; // e.g., 'adventure', 'relaxation', 'culture'
  activities: Activity[];
  accommodations: Accommodation[];
  transportation: Transportation[];
  dayPlans: DayPlan[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  isArchived: boolean;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  durationMinutes: number;
  cost: number;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'entertainment';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  costPerNight: number;
  totalCost: number;
  rating: number;
  amenities: string[];
}

export interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'ferry';
  provider?: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string; // ISO date string
  arrivalTime: string; // ISO date string
  cost: number;
  durationMinutes: number;
  bookingReference?: string;
}

export interface DayPlan {
  id: string;
  tripId: string;
  dayNumber: number; // 1-indexed
  date: string; // ISO date string
  activities: Activity[];
  totalEstimatedCost: number;
  weatherForecast?: {
    condition: string;
    temperatureMin: number;
    temperatureMax: number;
    precipitationChance: number;
  };
  isOptimized: boolean;
}
```

---

## 4. API & Endpoint Contracts

### Existing Endpoints to Reuse
* **POST `/api/generate-itinerary`**
  - *Request Body*: `{ destination: string, startDate: string, endDate: string, budget: number, travelers: number, tripType: string, theme: string, interests: string[] }`
  - *Response*: `{ success: boolean, itinerary: Trip }`

* **POST `/api/optimize-day-plan`**
  - *Request Body*: `{ activities: Activity[], location: string, date: string, preferences: { startTime: string, endTime: string, maxWalkingDistance: number, avoidTransitBefore: string, preferTransitAfter: string } }`
  - *Response*: `{ success: boolean, optimizedActivities: Activity[], weatherForecast: WeatherForecast }`

### New Endpoints (if needed)
* **GET `/api/trips/:userId`** - Retrieve all trips for a user
* **POST `/api/trips`** - Create a new trip
* **PUT `/api/trips/:tripId`** - Update an existing trip
* **DELETE `/api/trips/:tripId`** - Delete a trip
* **GET `/api/trips/:tripId/export`** - Export trip as iCal/PDF

---

## 5. UI Component Breakdown

### Core Components
* `src/components/planning/PlanningWorkspace.tsx` - Main route component
* `src/components/planning/TripDashboard.tsx` - Overview of all trips
* `src/components/planning/TripCard.tsx` - Individual trip preview card
* `src/components/planning/AiItineraryGenerator.tsx` - AI trip creation form
* `src/components/planning/SmartDayPlanner.tsx` - Daily schedule optimizer
* `src/components/planning/ActivityEditor.tsx` - Edit individual activities
* `src/components/planning/DayPlanView.tsx` - View/optimize a specific day
* `src/components/planning/TripSharingModal.tsx` - Share/export trip options

### Reusable UI Elements
* `src/components/planning/ui/ActivityChip.tsx` - Visual activity tag
* `src/components/planning/ui/DayTabNavigator.tsx` - Tab switcher for multi-day trips
* `src/components/planning/ui/TimeSlotPicker.tsx` - Select start/end times
* `src/components/planning/ui/CostBreakdown.tsx` - Show trip cost analysis
* `src/components/planning/ui/WeatherBadge.tsx` - Display weather forecast

### Layout Components
* `src/components/planning/layout/WorkspaceHeader.tsx` - App bar with navigation
* `src/components/planning/layout/WorkspaceFooter.tsx` - Sticky action buttons
* `src/components/planning/layout/ResponsiveContainer.tsx` - Mobile-optimized container

---

## 6. Risks, Edge Cases & Mitigations

* **Risk 1**: AI generation latency or failures
  - *Mitigation*: Loading skeletons, retry mechanisms, fallback to template-based suggestions, clear error states with manual input option

* **Risk 2**: Offline data synchronization conflicts
  - *Mitigation*: Timestamp-based conflict resolution, manual conflict resolution UI, queue-based sync with exponential backoff

* **Risk 3**: Mobile performance with large trip data
  - *Mitigation*: Virtualized lists for activity/day rendering, pagination for long trips, selective data loading, image optimization

* **Risk 4**: Accessibility compliance in drag-and-drop interfaces
  - *Mitigation*: Keyboard-navigable reordering controls, ARIA labels, screen reader announcements for schedule changes, reduced motion preferences

* **Risk 5**: Data privacy and security
  - *Mitigation*: End-to-end encryption for sensitive trip data, secure Firebase rules, regular security audits, minimal data retention policies

* **Risk 6**: Cross-platform consistency (web vs mobile Capacitor)
  - *Mitigation*: Responsive design testing, Capacitor plugin compatibility checks, platform-specific adaptations where necessary

---

## 7. Implementation Sequence

1. **Foundation**: Set up routing, Zustand store, and Firebase connection
2. **Trip Dashboard**: Build trip listing view with create/edit/delete functionality
3. **AI Itinerary Generator**: Implement form integration with existing AI endpoint
4. **Smart Day Planner**: Create day optimization interface with drag-and-drop
5. **Persistence Layer**: Implement Firestore CRUD operations with offline fallback
6. **Sharing & Export**: Add trip sharing links and export functionality
7. **Polishing**: Animations, accessibility fixes, performance optimization
8. **Testing**: Cross-device testing, accessibility auditing, performance benchmarking

---