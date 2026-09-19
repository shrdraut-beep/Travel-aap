# Technical Implementation Plan: Flight Flow Unified Navigation & Main Page Ads/Coupons

**Feature ID**: `011-flight-flow-unified-pages-and-ads`  
**Status**: DRAFT / PLANNED  
**Date**: 2026-09-19  

---

## 1. Architectural Architecture & Design Pattern

### Pattern: Coordinator + Sequential Step Subviews (Derived from `BookingFlowCoordinator.tsx`)
```
[Main Portal Page]
  │
  ├── [Action Trigger: "+ Add Package", "Wallet", "Tax Policy"]
  │
  ▼
[Dedicated Full-Page Flow / Coordinator] (fixed inset-0 z-50 overflow-y-auto)
  ├── <CommonFlowHeader>
  │     ├── [ < Back Button ] -> Previous Step or Parent Screen
  │     ├── Title + Subtitle
  │     ├── Step Indicator Badge ("Step X of Y")
  │     └── [ X Close Button ] -> Exit to Main Dashboard
  │
  ├── <Active Step Subview (1..N)> -> Focused, uncluttered form block
  │
  └── <Bottom Sticky Action Bar>
        ├── [ < Previous Step ]
        └── [ Continue / Publish > ]
```

---

## 2. Component Structure & Modular Breakdown

### 2.1 Core Shared Component
- **`src/components/common/CommonFlowHeader.tsx`**:
  - Replaces and generalizes `BookingStepHeader`.
  - Props:
    - `title: React.ReactNode`
    - `subtitle?: React.ReactNode`
    - `currentStep?: number`
    - `totalSteps?: number`
    - `stepLabel?: string` (e.g. "Step 2 of 5" or "Configuration")
    - `onBack: () => void`
    - `onClose: () => void`
    - `rightElement?: React.ReactNode`
    - `showProgress?: boolean` (Renders visual progress bar)

### 2.2 Vendor Multi-Step Flow Coordinators
- **`src/components/vendor/flows/TourPackageFlowCoordinator.tsx`**:
  - Decomposes the 1,353-line `TourPackageUploadForm` into 6 sequential steps:
    - Step 1: `RouteLogisticsStep` (Title, Origin, Destination, Reporting Time, Theme)
    - Step 2: `ItineraryMealsStep` (Day-by-Day dynamic itinerary, activities, meal badges)
    - Step 3: `StaysFleetStep` (Hotel rating, room category, vehicle fleet)
    - Step 4: `PricingGstStep` (Vendor Net B2B, `PriceTaxBreakdownBadge` with dynamic IGST/CGST/SGST, child/triple rates)
    - Step 5: `InclusionsPoliciesStep` (Inclusions, Exclusions, Cancellation Rules, Departure Dates)
    - Step 6: `PreviewSubmitStep` (Photo gallery, live marketplace card preview, publish)
- **`src/components/vendor/flows/CabRegistrationFlowCoordinator.tsx`**:
  - Step 1: Vehicle Details & VAHAN RC check
  - Step 2: Commercials, Daily Base & Per-Km rates with dynamic IGST
  - Step 3: Driver KYC & Operations
  - Step 4: Vehicle Photos & Confirmation
- **`src/components/vendor/flows/BusRegistrationFlowCoordinator.tsx`**:
  - Step 1: Bus Model & Operator Details
  - Step 2: Route, Boarding Points & Timings
  - Step 3: Seat Layout, Weekday/Weekend Net Tariff with dynamic IGST
  - Step 4: Safety Checklist & Publish
- **`src/components/vendor/flows/HotelOnboardingFlowCoordinator.tsx`**:
  - Step 1: Property Identity & SAC 996311
  - Step 2: Rooms & Amenities
  - Step 3: Tariff & Dynamic 12%/18% GST/IGST
  - Step 4: Photos, Cancellation & Submit

### 2.3 Vendor Modals Converted to Dedicated Flows
- **`src/premium/agent/flows/GlobalAutoBidFlow.tsx`**: Dedicated full-page view for auto-bid margin floor, step undercut, and auto-dropout protection.
- **`src/premium/agent/flows/FinancialAuditFlow.tsx`**: Dedicated full-page view for 3-year audit, monthly ledger, and GST/TDS tax invoice downloads.
- **`src/premium/agent/flows/SettlementSettingsFlow.tsx`**: Dedicated full-page view for bank penny drop and auto-payout frequency.

### 2.4 User Modals Converted to Dedicated Flows
- **`src/premium/user/flows/WalletFlowPage.tsx`**: Full-page wallet with balance, quick recharges, cashback records, and voucher ledger.
- **`src/premium/user/flows/VouchersOffersFlowPage.tsx`**: Full-page interactive coupon marketplace with category tabs, discount pills, and 1-click code copying.
- **`src/premium/user/flows/BillScannerFlowPage.tsx`**: Dedicated camera/upload interface with live OCR and group split analysis.
- **`src/premium/user/flows/TravelCalendarFlowPage.tsx`**: Dedicated full calendar and itinerary scheduler.
- **`src/premium/user/flows/AiPlannerFlowPage.tsx`**: Dedicated smart travel itinerary planner.

### 2.5 Admin Modals Converted to Dedicated Flows
- **`src/premium/admin/flows/TaxationPolicyFlowPage.tsx`**: Full statutory taxation engine with live broadcast.
- **`src/premium/admin/flows/PendingPayoutsQueueFlowPage.tsx`**: Batch IMPS/NEFT disbursal manager.
- **`src/premium/admin/flows/SettlementCycleFlowPage.tsx`**: Disbursal gateway and cycle config.
- **`src/premium/admin/flows/LifetimeEarningsFlowPage.tsx`**: All-time platform statement.

### 2.6 Main Page Ads & Offer Coupons Components
- **`src/components/common/PromotionalAdsRail.tsx`**:
  - Responsive visual promotional banners (e.g. Monsoon getaways, Diwali specials, B2B Zero Commission passes).
- **`src/components/common/ActiveOfferCouponsGrid.tsx`**:
  - Interactive coupon cards with `[ COPY CODE ]` button, category filters (Flights, Hotels, Cabs, Buses, Packages), expiry tags, and discount calculations.
- Integrated into:
  - Vendor `InventoryPanel` (underneath "+ Add Package / Fleet" buttons)
  - Vendor `OverviewPanel` (underneath stats cards)
  - User `UserLandingPage` (underneath booking search cards)

---

## 3. Data Flow & State Management
- Existing Zustand stores (`useAuthStore`, `useVendorStore`, `useBookingStore`, `useTripContext`) and services (`taxationConfigService`, `packageService`) remain the single source of truth.
- Step coordinators store intermediate draft state in a clean state container and commit to services upon final confirmation step.
- Scroll position is automatically reset to `(0, 0)` upon advancing or reversing steps.
