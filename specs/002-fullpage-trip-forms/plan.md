# Technical Plan: Full-Page Trip Forms & Solo Trip Option

**Spec Reference**: `specs/002-fullpage-trip-forms/spec.md`  
**Status**: Ready for Implementation  

---

## 1. Architecture Overview
- **Routing & Active Tab State**:
  - In `src/App.tsx`, update `handleSetActive` so that setting `'new-trip'` sets `active = 'new-trip'` (rendering full-screen `NewTripScreen`) rather than setting `isCreateTripOpen = true`.
  - Ensure `active = 'smart-planner'` renders `FutureTripScreen` as a full-page view without modal container constraints.
- **Components to Update**:
  1. `src/components/modals/FutureTripModal.tsx`:
     - Refactor container styles to support full-page inline embedding or adapt `FutureTripScreen.tsx` so `FutureTripModal` renders as a full-page view without modal overlay/backdrop (`fixed inset-0 bg-slate-900/60`).
     - Add "Solo Trip" (`solo`: 'सोलो / एकटा प्रवास' / 'Solo Trip') to `tripType` and `companions` options.
  2. `src/components/routripo/NewTripScreen.tsx` / `src/components/modals/CreateTripModal.tsx`:
     - Upgrade `NewTripScreen.tsx` into a comprehensive full-page trip creation form supporting calculation mode, total budget, members, trip type ("Solo", "Family", "Friends", "Couple", "Business"), theme color, and currency.
     - Ensure Back button (`<ChevronLeft />`) returns to `trips` or `planning`.
  3. `src/App.tsx`:
     - Render `NewTripScreen` when `active === 'new-trip'` with `onBack={() => setActive('trips')}` and `onCreate={handleCreateTrip}`.
     - Ensure `active === 'smart-planner'` renders `FutureTripScreen` with `onBack={() => setActive('trips')}`.

---

## 2. Design & Styling Maintenance
- Preserve button colors:
  - Smart AI Planner button: `bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600`
  - New Trip button: `bg-gradient-to-r from-red-500 to-pink-600` or `#FF5A5F`
  - Green / Teal action buttons for trip confirmation.
