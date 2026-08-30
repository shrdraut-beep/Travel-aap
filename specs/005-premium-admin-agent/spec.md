# 005 — Premium Admin Dashboard & Agent Portal

## Context

The premium redesign (spec 004) delivered the phone-first Login screen and the
four-tab User Account dashboard in the design-kit visual language (sky blue,
violet, pink, D-DIN, large radii, soft shadows).

Admin and Agent still use the old dull styling in
`src/components/views/AdminDashboardView.tsx` and
`src/components/views/AgentPortalView.tsx`.

## Goal

Rebuild both portals as phone-first premium previews using the exact same
design tokens and components as the user portal, so all three roles look like
one product. Backend wiring stays out of scope: every control is exposed
through typed callbacks for later connection.

## Scope

In scope:

- `src/premium/admin/*` — Admin dashboard preview.
- `src/premium/agent/*` — Agent portal preview.
- Reaching both portals from the user Account → Setting tab in the preview.

Out of scope:

- Editing the existing production views or any backend logic.
- Live data. Preview numbers are illustrative.

## Functional requirements

### Admin dashboard

Eight sections, mirroring the tabs of the existing admin view:

| Tab | Must cover |
| --- | --- |
| Analytics | Platform stats, total registered users, gross revenue, total commission earned, active packages, open support tickets, revenue trend |
| Security | PentAGI & Codex security posture, scan runs, findings by severity |
| Vendors | Pending vendor approvals with count badge, approve partner, reject, approved partners, GST number |
| Payouts | Commission & payouts, current cycle, pending payouts, awaiting release, payment release, platform service fee, lifetime platform earnings |
| Ads | Active ads & offers, banner ad rules, published state |
| APIs | API & system health, latency, response time, last sync, HTTP method, ping all, execute live ping test, database status |
| Support | Support & vault, open tickets, zero-trust legal writ / court warrant ID, admin master secret token, target user ID, masked email (PII) |
| Users | User directory, user name, role, status, masked email, reset filters & refresh |

### Agent portal

Nine sections, mirroring the tabs of the existing agent view:

| Tab | Must cover |
| --- | --- |
| Overview | Total inquiries / leads, confirmed bookings, gross revenue, active listings, hotel onboarding, create new package, markups & bookings, partner services |
| Offers | Bidding / lead offers, respond to a lead, quote a price |
| Inventory | Packages list, create new tour package (title, destination, duration, price), published state |
| Bookings | Customer name, package, travel date, amount, payment status, payment protected |
| Earnings | Earnings & statement, wallet balance, add money, recent transactions, withdraw |
| Markups | Markup engine, global rule, per-package markup |
| Marketing | Ad manager, campaign spend |
| Support | Agency support, raise a ticket |
| Profile | Agency name, GST number, base city, email, phone, verified / B2B partner badges, KYC, save profile settings |

## Acceptance criteria

1. Both portals render only the kit palette, radii, shadows and D-DIN font.
2. No black page backgrounds; phone-first layout, no desktop shell.
3. Every listed feature is reachable and emits a typed callback id.
4. `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.
5. The existing production views and backend logic are untouched.
