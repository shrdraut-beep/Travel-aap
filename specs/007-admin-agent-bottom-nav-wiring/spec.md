# 007 — Admin & Agent/Vendor Bottom Navigation & Full Backend Wiring

## Context
The User Account (`AccountScreen.tsx`) has a cohesive theme with a sky gradient header, docked navigation, and rich sub-sections. In contrast, the Admin and Agent portals (`AdminScreen.tsx` and `AgentScreen.tsx`) previously used a top-heavy `PortalShell` with an upper scrolling tab strip and lacked a bottom tab bar. Furthermore, buttons on these panels only emitted mock event strings instead of triggering live backend functionality, even though extensive backend endpoints exist in `server/routes/partnerKyc.ts`, `server/routes/bidding.ts`, `server/modules/admin/routes.ts`, and `server/services/rtaip/`.

## Goal
1. Reorganize Admin and Agent/Vendor portals to match the User Account design language (`AccountScreen.tsx` / `BottomNav.tsx`), featuring a docked bottom navigation bar with 3D icons, active state dots, and badges.
2. Group functions and sub-functions intuitively within 5 primary bottom tabs per portal, using upper sub-pills where appropriate.
3. Wire all frontend buttons to real Express backend endpoints.
4. Fill all gaps: implement frontend interfaces for existing backend endpoints (KYC penny drop, Cab RC validation, fast-track hotel scraping, escrow OTP release, vault compliance) and add missing backend endpoints for frontend actions (metrics, vendor review, payouts release, user status management, support ticket resolution).

## Scope
- `server/modules/admin/routes.ts`
- `server/routes/partnerKyc.ts`
- `src/premium/shared/PortalBottomNav.tsx`
- `src/premium/admin/AdminScreen.tsx` & `src/premium/admin/tabs.tsx`
- `src/premium/agent/AgentScreen.tsx` & `src/premium/agent/tabs.tsx`
- `src/App.tsx`

## Acceptance Criteria
1. Both Admin and Agent portals have a docked bottom navigation bar with icons, labels, active indicator dots, and badges.
2. Every button triggers real, asynchronous backend API calls with visual feedback (spinners/success states/error handling).
3. Zero TypeScript or lint errors (`tsc --noEmit`).
