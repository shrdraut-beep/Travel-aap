# Specification: Premium Theme Migration & Rewiring

## 1. Overview
Review all premium pages and account sections in detail, and wire the existing (old) functional logic and sub-functions into the new premium sky-to-pink style theme and UI components. This ensures the app retains all old features while upgrading to the new luxury aesthetic.

## 2. Scope Boundaries
- **In Scope**:
  - Analyzing existing (legacy) components for user accounts, bidding, and dashboard functions.
  - Applying the new premium theme (Tailwind classes, sky-to-pink gradients, modern cards) to these legacy pages.
  - Rewiring existing React state, API calls, and logic functions to the new premium UI elements.
  - Updating navigation and routing to seamlessly transition between premium pages.
- **Out of Scope**:
  - Modifying the underlying backend APIs, Express server logic, or database schemas.
  - Adding completely new functional logic that was not present in the old app.

## 3. Functional Requirements
- **FR1 (Account Pages)**: Legacy user account details (profile, bookings, wallet) must render inside the new premium layout container.
- **FR2 (Logic Rewiring)**: Existing action handlers (e.g., `fetchRequests`, `handleAcceptBid`, `submitOTP`) must be attached to the new premium buttons, modals, and forms without breaking.
- **FR3 (Theme Consistency)**: The premium style tokens (sky-50 to pink-50 gradients, lucide-react icons, motion animations) must be consistently applied across all migrated pages.

## 4. Acceptance Criteria
- [ ] Users can view their account details and past trips in the new premium UI.
- [ ] Users can perform all legacy actions (bidding, chatting, checkout) in the new UI without any JavaScript or API errors.
- [ ] No layout breaks occur on mobile or desktop viewports.
- [ ] `npm run build` and `npm run lint` pass successfully after the migration.
