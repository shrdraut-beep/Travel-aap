# App Reorganization Specification

## Objective
Restructure the application's navigation and layout to eliminate the bottom navigation bar and adopt a top-tab "pill-shaped" premium layout globally (inspired by `AccountScreen.tsx`).

## Core Rules & Conditions
1. **Level 1 (No Active Trip):**
   - The default view of the app.
   - Tabs: 
     1. Bargaining (Default active tab)
     2. My Trips (Lists trips; selecting one activates Level 2)
     3. Booking (Flights, Hotels, Tickets)
     4. Profile (Settings, Language, Logout)
   
2. **Level 2 (Active Trip Dashboard):**
   - If a user has an active trip (or activates one from "My Trips"), this becomes the default home screen.
   - Includes a "Back to Main Menu" button in the header.
   - Tabs:
     1. Kharch (Expenses for this trip)
     2. Plan (Itinerary & Planning)
     3. Social (Members, Chat, Polls)
     4. Docs (Tickets/Vouchers for the trip)

3. **Premium Visuals:**
   - Unified header with user profile snippet (or Trip details in Level 2).
   - "Pill-shaped" top tab bar (`premium-card` containing flex items with `premium-gradient-pink` for active states).
   - Solid `#eef1f6` page background.
   
## Constraints
- Do NOT delete existing features (AI planner, expenses, booking engine, chats).
- Ensure all screens wire into this new shell correctly.
