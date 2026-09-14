# Technical Plan — Spec 007: Admin & Agent Bottom Navigation & Backend Wiring

## Architecture
- Replace `PortalShell` with an `AccountScreen`-style self-contained layout.
- Introduce `PortalBottomNav.tsx` component in `src/premium/shared/` to provide consistent docked bottom navigation.
- Implement API service helpers or direct `fetch` calls in `AdminScreen` and `AgentScreen` with loading indicators and toast feedback.
- Extend `server/modules/admin/routes.ts` with missing administrative endpoints.
- Extend `server/routes/partnerKyc.ts` with agent finance endpoints.

## API Contracts

### Admin APIs
- `GET /api/admin/metrics` -> `{ success: true, metrics: { grossRevenue, commission, usersCount, packagesCount, trend: [...] } }`
- `GET /api/admin/vendors` -> `{ success: true, vendors: [...] }`
- `POST /api/admin/vendors/review` -> Body: `{ vendorId: string, action: 'approve' | 'reject' }`
- `GET /api/admin/payouts` -> `{ success: true, payouts: [...], balance: number }`
- `POST /api/admin/payouts/release` -> Body: `{ payoutId?: string, releaseAll?: boolean }`
- `GET /api/admin/users` -> `{ success: true, users: [...] }`
- `POST /api/admin/users/update` -> Body: `{ userId: string, role?: string, status?: 'Active' | 'Suspended' }`
- `GET /api/admin/tickets` -> `{ success: true, tickets: [...] }`
- `POST /api/admin/tickets/resolve` -> Body: `{ ticketId: string, resolution: string }`

### Agent APIs
- Existing `/api/bids/*`, `/api/partner/*`, `/api/rtaip/*` endpoints utilized.
- `GET /api/partner/earnings` -> `{ success: true, balance, pending, transactions: [...] }`
- `POST /api/partner/withdraw` -> Body: `{ amount: number, account: string }`
