# Specification: Full-Page Trip Forms & Solo Trip Option

**Spec ID**: 002-fullpage-trip-forms  
**Status**: Approved  
**Author**: AI Studio Agent  
**Created**: 2026-08-25  

---

## 1. Executive Summary & Intent
Convert the "Smart AI Trip Planner" form and "New Trip" creation form from overlay popups/modals into clean, dedicated full-page views with clear Back button navigation. Additionally, introduce "Solo Trip" as an explicit trip type option in both forms while retaining all button color schemes and visual themes.

---

## 2. User Scenarios & Workflows

### Primary User Story
> As a user planning a trip on RouTripO, I want the Smart AI Planner form and New Trip form to open as full pages with a Back button (rather than cramped popups), and I want to select "Solo Trip" as my travel style.

### Key Workflows
1. **Smart AI Planner Full-Page Flow**:
   - User clicks "Smart Trip Planner" or "AI Trip Generator".
   - App navigates to full-screen `FutureTripScreen` view with top header and Back button.
   - Form inputs (Departure, Destination, Dates, Duration, Budget, Travelers, Transport Mode, Trip Type including "Solo") fill the page neatly.
   - User submits to generate AI Itinerary preview directly in full view.
   - User can click the Back button at any time to return to My Trips or Planning screen.

2. **New Trip Full-Page Flow**:
   - User clicks "+ New Trip" or "Start a New Trip".
   - App navigates to full-screen `NewTripScreen` / Full-Page Creation Form with top header and Back button.
   - Includes trip name, destination, dates, budget, calculation mode, members, and "Solo Trip" option.
   - User creates trip or clicks Back button to return to My Trips.

---

## 3. Functional Requirements

* **[FR-01]**: The Smart AI Trip Planner form MUST be rendered as a full-page view (`FutureTripScreen`), removing the modal backdrop popup frame.
* **[FR-02]**: `FutureTripScreen` MUST feature a sticky top navigation header with a prominent Back button (`<ChevronLeft />` or `<ArrowLeft />`) returning to `trips` or `planning`.
* **[FR-03]**: The "New Trip" creation form MUST open as a full-page view (`NewTripScreen` or full-page view) with a Back button, instead of triggering an overlay popup modal.
* **[FR-04]**: Both Smart AI Planner and New Trip forms MUST include "Solo Trip" (सोलो / एकटा प्रवास) as a selectable Trip Type / Travel Companion option.
* **[FR-05]**: All primary button color schemes (`from-indigo-600 via-purple-600 to-pink-600`, coral red `#FF5A5F`, `from-red-500 to-pink-600`, teal/green gradients) MUST remain unchanged.

---

## 4. Acceptance Criteria
- [ ] Smart AI Planner opens in full screen without dark background overlay popups.
- [ ] Top header has a working Back button in Smart AI Planner view.
- [ ] New Trip form opens as a full-screen page with a Back button instead of a popup modal.
- [ ] "Solo Trip" option is available in Trip Type / Companion selections for both forms.
- [ ] Design and button colors are preserved.
- [ ] `lint_applet` and `compile_applet` pass with zero errors.
