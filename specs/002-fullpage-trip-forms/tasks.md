# Implementation Tasks: Full-Page Trip Forms & Solo Trip Option

**Spec Reference**: `specs/002-fullpage-trip-forms/spec.md`  
**Plan Reference**: `specs/002-fullpage-trip-forms/plan.md`  

---

## Phase 1: Smart AI Planner Full-Page Refactoring
- [x] **Task 1.1**: Update `FutureTripModal.tsx` to add `isFullPage` mode so it doesn't render fixed modal backdrop overlay when shown in `FutureTripScreen`.
- [x] **Task 1.2**: Add "Solo Trip" (`solo`: 'सोलो / एकटा प्रवास' / 'Solo Trip') to Trip Type and Companion options in `FutureTripModal.tsx`.
- [x] **Task 1.3**: Verify `FutureTripScreen.tsx` top header with Back button returning to `trips` or `planning`.

## Phase 2: Full-Page New Trip Form Implementation
- [x] **Task 2.1**: Enhance `NewTripScreen.tsx` to be a complete full-page form with Trip Name, Destination, Start/End Dates, Budget, Members, Calculation Mode, and Trip Type including "Solo".
- [x] **Task 2.2**: Update `App.tsx` so `handleSetActive('new-trip')` switches `active` tab to `'new-trip'` and renders `NewTripScreen` in full page with Back button (`onBack={() => setActive('trips')}`).
- [x] **Task 2.3**: Update `CreateTripModal.tsx` or option selects to also include "Solo" trip option.

## Phase 3: Verification & Polish
- [x] **Task 3.1**: Run `lint_applet` to check for syntax or type issues.
- [x] **Task 3.2**: Run `compile_applet` to verify successful compilation.
