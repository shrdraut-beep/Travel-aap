# Header Architecture — What's in this zip

## Deleted (dead code, not included since they no longer exist)
- src/components/layout/AppShell.tsx (348 lines, zero usages anywhere)
- src/components/layout/ScreenLayoutWithBack.tsx (used only by withBackButton.tsx)
- src/components/layout/withBackButton.tsx (zero usages anywhere)

Delete these three from your own copy of the repo if you haven't already —
they were confirmed unused anywhere in the codebase (including no dynamic imports).

## Kept as-is (each serves a distinct, actually-used purpose)
- src/components/common/BrandHeader.tsx — the most-adopted shared header (11 files),
  pink gradient style, used for booking-flow sub-pages, results pages, etc.
- src/premium/layouts/PremiumShell.tsx — full-page shell + bottom nav, used by App.tsx
  for the main dashboard. Already has its own scroll-reset-on-tab-change logic.
- src/premium/shared/PortalShell.tsx — shell for Admin/Agent portal screens.
- src/premium/mobile/AppBar.tsx — used by UserLandingPage (rendered in 4 places).

## New
- src/premium/booking/BookingStepHeader.tsx — new shared header for the flight
  booking flow's 6 sequential steps, replacing ~25 lines of copy-pasted markup
  that existed independently in each of the 6 files below.

## Migrated to use BookingStepHeader
- src/premium/booking/FareSelectionStep.tsx
- src/premium/booking/PassengerDetailsStep.tsx
- src/premium/booking/SeatSelectionStep.tsx
- src/premium/booking/MealsSelectionStep.tsx
- src/premium/booking/BaggageSelectionStep.tsx
- src/premium/booking/CheckoutStep.tsx

## Still using their own inline <header> (not touched yet)
20 more files still have custom inline headers outside this cluster — e.g.
FutureTripModal.tsx, PDFLayoutWrapper.tsx, AllTripsScreen.tsx, LoginScreen.tsx,
AccountScreen.tsx, the bargaining views, and the other booking coordinators
(BusBookingCoordinator, CarBookingCoordinator, HolidayBookingCoordinator,
HotelBookingCoordinator, TrainBookingCoordinator, GlobalDashboardView). These
weren't part of this pass — ask if you want them reviewed next.
