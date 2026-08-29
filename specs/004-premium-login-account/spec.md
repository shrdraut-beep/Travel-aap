# Feature Specification: Premium Login Screen & 4-Tab User Account Screen

## 1. Overview & Objectives
Design a Login/Sign-up screen and rebuild the User Account screen of the premium
preview (`/premium.html`) strictly in the visual language of the supplied travel-app
interface design kit (`4089613.jpg`, `4089614.ai`, `4089615.eps`, D-DIN font).

Extracted design language (sampled from the reference artwork):
- Sky `#44C6F7` panels with white cloud silhouettes, white content sheets on top.
- Violet `#7B3FF2` as the interactive accent (icons, outlined pills, active states).
- Ink navy `#28204F` headings, muted `#8E8CA3` captions.
- Very large corner radii (~26px cards, fully rounded pills), soft diffused shadows.
- Outlined violet pill buttons ("Chekout", Filter/Sort dropdowns) and line icons.
- Typography: D-DIN (regular + bold), bold headings over light captions.
- Product requirement on top of the kit: pink `#FF4FA3` as a secondary accent inside
  the User Account screen.

## 2. Requirements & Scope
### Screen 1 — Login / Sign-up
- Single screen toggling between Log in and Sign up.
- Email **or** phone identifier input, password input with show/hide, name field on sign-up.
- Remember me, forgot password, primary Login/Create-account button.
- Social login: Google, Facebook, Apple.
- Guest continue, and a switch between the two modes.
- Client-side validation with inline errors; no dead controls.

### Screen 2 — User Account (Dashboard)
Every existing user-account function must remain reachable, grouped into exactly four tabs.

- **Bargaining** (primary): post custom trip requirement, my requests, offers received /
  caught deals, bargain chat with agents, secret vendor offers, customised offers &
  coupons, locked escrow vouchers & OTP, budget advisory.
- **Expenses Manager** (primary): budget tracking with a spend gauge, category and daily
  charts, trip expense log, add expense, smart receipt scanner, split & pool deposits,
  wallet, budget alerts.
- **Booking**: current / upcoming / past bookings, tickets, hotel reservations,
  cancellations & refunds, travel calendar, packages, wishlist, planning, memories, community.
- **Setting**: profile details, notification preferences, privacy & legal vault, language,
  currency, SOS broadcast, orchestrator, help center, feedback, about & policies,
  agent portal, admin dashboard, delete account, logout.

## 3. Non-Functional Requirements
- Preview only: no production screen, route, API or backend logic is modified.
- Every action is exposed through typed callbacks (`onAccountItem`, `onLogin`, ...) so the
  existing app logic can be wired to the new UI without layout changes.
- Strict TypeScript, no implicit `any`; passes `npm run lint` and `tsc --noEmit`.
- Phone-first layout only (max width 520px), thumb-sized controls.

## 4. Acceptance Criteria
- Login screen validates input and emits typed payloads for password, social and guest flows.
- Account screen renders four tabs; every `AccountItemId` in the union is reachable from a
  control inside one of the tabs.
- Palette, radii, shadows and D-DIN typography match the reference kit.
