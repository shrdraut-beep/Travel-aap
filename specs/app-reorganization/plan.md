# App Reorganization Plan

## Architecture Changes
1. **Remove `BottomNav`**:
   - `src/premium/mobile/BottomNav.tsx` will no longer be rendered by `App.tsx`.
   - Any state dealing with BottomNav `active` (home, trips, explore, etc.) will be replaced.

2. **Refactoring `MainApp` (`App.tsx`)**:
   - Create a central state: `currentLevel` ("global" | "trip").
   - Instead of tracking `active` string, we track `globalTab` ('bargaining' | 'trips' | 'booking' | 'profile') and `tripTab` ('kharch' | 'plan' | 'social' | 'docs').
   - Derive the default level: If `activeTrip` from `useTripContext()` is present, render `TripDashboardView`, otherwise render `GlobalDashboardView`.

3. **GlobalDashboardView**:
   - Shell mimicking `AccountScreen.tsx`.
   - Header: User Profile snippet.
   - Tabs: Bargaining, My Trips, Booking, Profile.
   - Content Area: Render the respective existing components:
     - `BargainingTab` or `AgentBiddingScreen` / `UserBiddingScreen`
     - `MyTripsView` / `AllTripsScreen`
     - `BookingTab` or `DashboardView` (Explore & Book features)
     - `SettingsTab` or `ProfileScreen`

4. **TripDashboardView**:
   - Header: Trip Name, Location, and a "<- Main Menu" button (which clears `activeTrip` or sets state to 'global').
   - Tabs: Kharch, Plan, Social, Docs.
   - Content Area: 
     - `ExpensesTabContainer` / `KharchScreen`
     - `PlannerView` / `SmartDayPlanner`
     - `SocialScreen`
     - `MyTicketsView` / `DocsScreen`

## Component Adjustments
- Convert `AccountScreen.tsx` from an overlay modal to a structural layout pattern.
- Strip internal tab headers inside `PlanningScreen`, `KharchScreen`, `AllTripsScreen` to prevent double-tabs since the Main Shell now handles navigation.

