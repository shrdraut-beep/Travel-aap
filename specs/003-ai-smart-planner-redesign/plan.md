# Technical Plan: AI Smart Planner Form & Output Page Redesign

## 1. Architecture & Components
- **Primary Target File**: `/src/components/modals/FutureTripModal.tsx`
- **Secondary Target File**: `/src/components/SmartPlanLoadingOverlay.tsx`
- **Related References**: `/src/components/routripo/PlanningScreen.tsx`, `/src/components/modals/CreateTripModal.tsx`

## 2. Technical Modifications
1. **Header & Theme Tokens**:
   - Replace generic indigo-to-purple gradient with Routripo's signature theme: `bg-gradient-to-r from-rose-600 via-rose-700 to-red-800` header with rose backdrop blur badges.
   - Use `LogoName` or brand icon with glowing Sparkles badge.

2. **Step 1: Form Input UI Overhaul**:
   - Add Destination Quick Preset Chips (Goa 🌴, Manali 🏔️, Mahabaleshwar 🍓, Udaipur 🏰, Kerala 🚣, Lonavala ⛰️).
   - Replace standard transport dropdown with interactive radio card pills (✈️ Flight, 🚂 Train, 🚌 Bus, 🚗 Car / Cab) styled with active rose/slate borders and icons.
   - Replace standard trip type dropdown with visual badge grid (👤 Solo, 🌴 Leisure, 🏔️ Adventure, 🛕 Pilgrimage, 👨‍👩‍👧‍👦 Family, 👥 Friends, 👩‍❤️‍👨 Couple).
   - Add duration quick selection pills (2 Days, 3 Days, 5 Days, 7 Days) alongside numeric input.
   - Integrate `SmartBudgetModal` launch button seamlessly inside the budget section.

3. **Step 2: Output Page (Itinerary & Results) Overhaul**:
   - Hero cover image card: Rose-tinted gradient overlay (`from-rose-950 via-slate-900/70 to-transparent`), dynamic Unsplash location image, location tag, duration badge, traveler badge, budget summary banner.
   - Budget & Fuel/Toll Banner: Clean emerald or rose themed container highlighting total cost, distance (km), fuel/toll cost breakdown (for car mode) or ticket cost (for train/flight/bus).
   - Weather & Packing tips banner with sky/blue theme border.
   - Feasibility warning card: Rose-50 background, warning icon, detailed facts, and alternative destination chips.
   - Day-wise timeline view with Day Filter Tabs (`All Days`, `Day 1`, `Day 2`, ...).
   - Morning, Afternoon, Evening cards with custom icon badges (`Sunrise`, `Sun`, `Sunset`), Stay badge (`Hotel`), and Pro Tip badge (`Lightbulb`).
   - Sticky Actions Footer: Primary action "Make This Trip 🚀" with Rose gradient (`from-rose-600 to-red-700`), WhatsApp share button with green styling, and Edit button with slate styling.

4. **Loading Overlay (`SmartPlanLoadingOverlay.tsx`)**:
   - Update color palette to Rose primary theme with smooth step progress animations.

## 3. Verification Plan
- Verify no TypeScript errors using `lint_applet`.
- Verify full app compilation using `compile_applet`.
