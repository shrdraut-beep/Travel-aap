# RoutTripo — `server.ts` Modularization Plan

Current state: **6,774 lines, single file, 129+ routes.** Route counts by prefix
(counted directly from the file):

| Route group | Count | Target module |
|---|---|---|
| `/api/travelport/*` | 36 | `server/modules/travelport/` |
| `/api/zuelpay/*` | 9 | `server/modules/zuelpay/` |
| `/api/admin/*` | 6 | `server/modules/admin/` |
| `/api/public-apis/*` | 4 | `server/modules/public-apis/` |
| `/api/otaip/*` | 4 | `server/modules/otaip/` |
| `/api/buses/*` | 4 | `server/modules/buses/` |
| `/api/wallet/*`, `/api/checkout/*`, `/api/user/*`, `/api/bookings/*` | 3 each | `server/modules/payments/`, `server/modules/bookings/` |
| `/api/webhooks/*`, `/api/vault/*`, `/api/trips/*`, `/api/trains/*`, `/api/maps/*`, `/api/kyc/*`, `/api/flights/*`, `/api/cars/*`, `/api/ai/*` | 2 each | grouped by domain, see below |
| ~30 single-route misc endpoints (`/api/razorpay/verify`, `/api/generate-itinerary`, `/api/parse-voice-command`, etc.) | 1 each | absorbed into the closest domain module or a `server/modules/misc/` catch-all |

## Why this order (do these first)

1. **`travelport/` first** — 36 routes is more than a quarter of the whole file, and it's
   already partially separated (`server/services/travelport.service.ts` and
   `server/services/travelport.ts` both exist — consolidate into one, then move the routes
   that call it out of `server.ts`).
2. **`payments/`** (wallet + checkout + razorpay + zuelpay) — this is your highest-risk domain
   (money moving), and the CORS/HMAC/bookingId-binding fixes already made are easiest to keep
   correct in a smaller, dedicated file than buried in a 6,774-line one.
3. **`admin/`** — 6 routes, but these carry elevated privileges (`isAdminUser` check) — isolating
   them makes it much easier to audit who can call what, and to add module-level auth middleware
   once instead of per-route.
4. Everything else, in whatever order matches your active feature work — no urgency, just reduces
   file size and merge conflicts as you go.

## Migration pattern (repeat per module)

Don't do a big-bang rewrite — extract one module at a time, verify it still works, then move on.

```
server/
  server.ts                 <- becomes a thin composition root
  modules/
    travelport/
      routes.ts             <- app.post('/api/travelport/...') handlers, moved verbatim
      index.ts               export default function registerTravelportRoutes(app, deps) {...}
    payments/
      routes.ts
      index.ts
    admin/
      routes.ts
      index.ts
    ...
```

**Step-by-step for one module (example: `payments/`):**

1. Create `server/modules/payments/index.ts`:
   ```ts
   import type { Express } from "express";
   import type { Firestore } from "firebase-admin/firestore";
   import Razorpay from "razorpay";

   interface PaymentsDeps {
     app: Express;
     razorpay: Razorpay;
     razorpayKeySecret: string;
     adminDb: () => Firestore | null;
     requireAuth: express.RequestHandler;
   }

   export function registerPaymentRoutes(deps: PaymentsDeps) {
     const { app } = deps;
     // Paste the route handlers here, replacing free variables (razorpay, razorpayKeySecret,
     // adminDb, requireAuth) with deps.razorpay etc.
     app.post('/api/razorpay/verify', express.json(), async (req, res) => { /* ... */ });
     app.post('/api/checkout/create-order', deps.requireAuth, async (req, res) => { /* ... */ });
     // ...
   }
   ```

2. In `server.ts`, replace the moved route blocks with:
   ```ts
   import { registerPaymentRoutes } from "./server/modules/payments/index.ts";
   registerPaymentRoutes({ app, razorpay, razorpayKeySecret, adminDb, requireAuth });
   ```

3. **Test that specific module's endpoints** (Postman/curl or the k6 script's relevant tags)
   before moving to the next module — don't extract all 12+ modules and then test once at the end.

4. Delete the now-dead code from `server.ts` only after the extracted version is confirmed working.

## What to explicitly NOT move yet

- The security middleware block (helmet/CORS/rate limiters) — keep this in `server.ts` itself,
  it's cross-cutting and small; moving it adds indirection without reducing file size meaningfully.
- `adminDb()`, `requireAuth`, `isAdminUser` — these are shared dependencies every module needs.
  Move them to `server/shared/context.ts` and import from there, rather than duplicating.

## Estimated effort

Given 129+ routes and the pattern above, budget roughly 1-2 focused days per major module
(travelport, payments, admin) and a half-day each for the smaller ones — plan for 2-3 weeks
total if this is one person working on it alongside other RoutTripo work, not a dedicated sprint.
