# Feature Specification: AI Smart Planner Form & Output Page Redesign

## 1. Overview & Objectives
Redesign the **AI Smart Planner Form** and **Output Page** (`FutureTripModal.tsx` and related components) to completely align with Routripo's signature theme identity:
- Primary theme colors: Deep Rose (`rose-600`, `rose-700`, `rose-950`), Crimson, Warm Amber, Emerald green accents, and slate neutrals.
- Typography: Bold tracking, clear hierarchy, uppercase tracked badges (`text-[10px] font-black uppercase tracking-widest`).
- Form layout: Interactive visual selectors (Pill buttons for Transport, Chip grid for Trip Types, quick preset destination chips, embedded Smart Budget calculator, clean inputs with lead icons).
- Output page: Premium brochure hero banner with destination imagery, duration/traveler pills, budget comparison gauge, day-wise timeline tabs (Morning/Afternoon/Evening/Stay), interactive spots preview gallery, practicality warning alert, and bottom sticky actions (Make This Trip, WhatsApp Share, Edit).

## 2. Requirements & Scope
- **Language Support**: Marathi (`mr`) and English (`en`) support throughout all form inputs, validation messages, and output views.
- **Form Inputs**:
  - Departure & Destination inputs with icons (`MapPin`, `Compass`) + quick destination preset chips (Goa 🌴, Manali 🏔️, Mahabaleshwar 🍓, Udaipur 🏰, Kerala 🚣).
  - Date & Duration pickers + quick duration preset buttons (2 Days, 3 Days, 5 Days, 7 Days).
  - Budget & Travelers inputs with embedded Smart Budget modal helper trigger button.
  - Interactive Transport Mode Selector with icons (✈️ Flight, 🚂 Train, 🚌 Bus, 🚗 Car/Cab).
  - Interactive Trip Type Selector with visual badges (👤 Solo, 🌴 Leisure, 🏔️ Adventure, 🛕 Pilgrimage, 👨‍👩‍👧‍👦 Family, 👥 Friends, 👩‍❤️‍👨 Couple).
- **Output Page**:
  - Hero summary brochure card with Unsplash dynamic cover image, destination badge, duration, travelers, budget status (Within Budget / Short by ₹X).
  - Weather & Packing tips card.
  - Feasibility / Geographic impracticality alert card (when trip is unfeasible) with smart alternative destination buttons.
  - Day-by-Day Detailed Itinerary with Morning (☀️), Afternoon (🌤️), Evening (🌙), Stay (🏨), and Pro Tips (💡).
  - Day filter tab buttons to easily view Day 1, Day 2, Day 3 or All Days.
  - Action buttons: "Make This Trip 🚀" (converts to active trip), "Share on WhatsApp 💬" (formats itinerary text), "Edit Details" (resets form).
- **Loading Overlay**:
  - Theme-aligned `SmartPlanLoadingOverlay` with step status indicators (Calculating route, checking transport, finding spots, finding stay).

## 3. Non-Functional Requirements
- Strictly maintain existing backend integration (`/api/generate-future-trip-plan`).
- Maintain existing callback APIs (`onConvertSmartTrip`, `onConvertAITrip`).
- Fully responsive on mobile (iOS/Android frame) and desktop viewports.
- Pass `lint_applet` and `compile_applet`.
