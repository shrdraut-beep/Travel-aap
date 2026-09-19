# Implementation Tasks: Flight Flow Unified Navigation & Main Page Ads/Coupons

**Feature ID**: `011-flight-flow-unified-pages-and-ads`  
**Status**: PENDING APPROVAL  

---

## Task Checklist

### Phase 1: Shared Core Header & Ads/Coupons Foundation
- [ ] **Task 1.1**: Create `src/components/common/CommonFlowHeader.tsx` with `<` Back, `X` Close, step indicator, subtitle, and visual progress bar.
- [ ] **Task 1.2**: Create `src/components/common/PromotionalAdsRail.tsx` with dynamic promotional cards, seasonal travel deals, and B2B vendor offers.
- [ ] **Task 1.3**: Create `src/components/common/ActiveOfferCouponsGrid.tsx` with interactive copy-to-clipboard, discount tags, and category filters.

### Phase 2: Vendor Sequential Form Coordinators & Flow Pages
- [ ] **Task 2.1**: Implement `src/components/vendor/flows/TourPackageFlowCoordinator.tsx` with 6 sequential steps (Route, Itinerary, Stays, Pricing & dynamic IGST/GST, Policies & Dates, Preview & Submit).
- [ ] **Task 2.2**: Implement `src/components/vendor/flows/CabRegistrationFlowCoordinator.tsx` with 4 sequential steps (Vehicle RC, Pricing & IGST, Driver, Confirmation).
- [ ] **Task 2.3**: Implement `src/components/vendor/flows/BusRegistrationFlowCoordinator.tsx` with 4 sequential steps (Bus Info, Route & Stops, Seat Grid & Tariff, Review).
- [ ] **Task 2.4**: Implement `src/components/vendor/flows/HotelOnboardingFlowCoordinator.tsx` with 4 sequential steps (Identity, Rooms, Tariffs with 12%/18% GST/IGST, Verification).
- [ ] **Task 2.5**: Wire coordinators into `InventoryPanel` in `src/premium/agent/tabs.tsx`, replacing inline forms with clean action triggers (`[ + Add New Package ]`, etc.).

### Phase 3: Converting Vendor, User & Admin Modals to Dedicated Flows
- [ ] **Task 3.1**: Convert Vendor modals (Auto-Bid settings, 3-year financial audit statement, settlement settings) to dedicated full-page flows.
- [ ] **Task 3.2**: Convert User modals (Wallet, Vouchers/Offers, Bill Scanner, Travel Calendar, AI Planner) in `App.tsx` & `PremiumModals.tsx` to dedicated full-page views with `CommonFlowHeader`.
- [ ] **Task 3.3**: Convert Admin modals (Taxation Policy Manager, Pending Payouts Queue, Settlement Cycle, Lifetime Earnings) in `src/premium/admin/tabs.tsx` to dedicated full-page views with `CommonFlowHeader`.

### Phase 4: Main Page Layout Optimization & Ads Integration
- [ ] **Task 4.1**: Embed `PromotionalAdsRail` and `ActiveOfferCouponsGrid` on Vendor `InventoryPanel` & `OverviewPanel` beneath primary action buttons.
- [ ] **Task 4.2**: Embed `PromotionalAdsRail` and `ActiveOfferCouponsGrid` on User `UserLandingPage` beneath booking cards.
- [ ] **Task 4.3**: Ensure zero empty dead-space while maintaining clean visual breathing room.

### Phase 5: Verification & Compliance
- [ ] **Task 5.1**: Run `npx tsc --noEmit` and confirm 0 TypeScript errors.
- [ ] **Task 5.2**: Run `python -m graphify update .` and update knowledge graph.
- [ ] **Task 5.3**: Update `walkthrough.md` with visual breakdown and test results.
