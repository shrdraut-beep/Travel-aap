# Feature Specification: Flight Flow Unified Navigation & Main Page Ads/Coupons

**Feature ID**: `011-flight-flow-unified-pages-and-ads`  
**Status**: DRAFT / SPECIFIED  
**Created**: 2026-09-19  

---

## 1. Problem Statement & User Intent
Currently, multiple forms and actions across the application (Vendor, User, and Admin portals) open as cramped modals/popups or expand directly on the same page into massive monolithic forms (e.g., Tour Package Form is over 1,300 lines rendered directly inside the inventory tab).

The user explicitly requested:
1. **Study User Flight Booking Flow Chart**: Examine the sequential, multi-step dedicated page flow pattern (`BookingFlowCoordinator` + `BookingStepHeader`) that features clean progressive disclosure, back navigation, and full-page focus.
2. **Dedicated Full Pages / Views**: All popups, modals, and embedded forms when triggered by a button must transition cleanly to dedicated full-page views rather than opening on the same page.
3. **Common Header with Back & Close**: Every page/step must utilize a shared, unified header (`CommonFlowHeader`) that features:
   - `<` Back button (returns to previous step / parent screen)
   - `X` Close button (immediately returns to main portal / dashboard)
   - Step badge (e.g. "Step 2 of 5" with visual indicator)
   - Contextual title and subtitle
4. **Step-by-Step (One-by-One) Sequential Forms**: Forms (like Tour Package upload, Cab, Bus, Hotel onboarding) must NOT be dumped as giant single pages; they must advance step-by-step just like the flight flow.
5. **Main Page Space Optimization (Ads & Offer Coupons)**: On the main dashboard pages where forms/popups previously lived, the freed-up space below action buttons must feature rich promotional Ads, Sponsored Deal banners, and interactive Offer Coupons for both User and Vendor accounts.
6. **Strict Completeness Guarantee**: Every existing button, calculation (including dynamic IGST/CGST/SGST, auto-bid master switch, escrow payout model), and form input must be 100% preserved.

---

## 2. Scope Boundaries

### In Scope
- **Common Header Component (`CommonFlowHeader`)**: Universal header with Back (`<`), Close (`X`), Step badge, title, subtitle, and responsive actions.
- **Sequential Form Flow Coordinators (Vendor)**:
  - `TourPackageFlowCoordinator`: 6 clean sequential steps.
  - `CabRegistrationFlowCoordinator`: 4 clean sequential steps.
  - `BusRegistrationFlowCoordinator`: 4 clean sequential steps.
  - `HotelOnboardingFlowCoordinator`: 4 clean sequential steps.
- **Dedicated Flow Views (Vendor)**:
  - `GlobalAutoBidFlow`: Dedicated view for auto-bid margin floor and undercut rules.
  - `FinancialAuditFlow`: Dedicated view for 3-year audit and ledger download.
  - `SettlementSettingsFlow`: Dedicated view for bank verification & auto-disbursals.
- **Dedicated Flow Views (User)**:
  - `WalletFlowPage`: Balance, add money, passbook, cashback.
  - `VouchersOffersFlowPage`: Filterable coupon cards, copy code, category tabs.
  - `BillScannerFlowPage`: Camera / receipt scanner and expense splitter.
  - `TravelCalendarFlowPage`: Full month itinerary planner.
  - `BargainingHubFlowPage`: Real-time bargaining & bidding console.
- **Dedicated Flow Views (Admin)**:
  - `TaxationPolicyFlowPage`: Full statutory GST Council and IGST configuration.
  - `PendingPayoutsQueueFlowPage`: Batch IMPS/NEFT disbursal manager.
  - `SettlementCycleFlowPage`: Gateway and schedule settings.
- **Main Page Monetization & Engagement**:
  - `PromotionalAdsRail`: Visual ads, sponsored deals, seasonal banners.
  - `ActiveOfferCouponsGrid`: Interactive copyable coupons with discount tags.
  - Vendor B2B Partner Deals & zero-commission growth passes.

### Out of Scope
- Modifying backend GDS flight search engine algorithms (Travelport / Duffel).
- Changing backend Razorpay / Escrow payment gateway core contracts.

---

## 3. Acceptance Criteria
1. **Header Consistency**: Every dedicated flow view displays `CommonFlowHeader` with working Back and Close buttons.
2. **One-by-One Progression**: Tour Package, Cab, Bus, and Hotel registration proceed step-by-step with state preserved between steps.
3. **Zero Loss of Features**: All form fields, VAHAN RC verification, dynamic IGST/CGST/SGST badges, and escrow settlements work without omission.
4. **Main Page Space Utilization**: Main portal pages display promotional Ads and copyable Offer Coupons in the freed-up real estate.
5. **Compilation & Graph**: `npx tsc --noEmit` and `python -m graphify update .` pass with 0 errors.
