# Server Modularization Plan

Currently, the `server.ts` file is extremely large (over 6800 lines) and handles numerous responsibilities including authentication, payments (Razorpay), searching (Travelport), emails, DB interactions, and Vite middleware.

## Objective
To improve maintainability, testing, and readability by splitting `server.ts` into a modular architecture.

## Proposed Structure

```text
/server
  ├── /config          # Environment and external service configs (Secrets, Observability, Razorpay)
  ├── /controllers     # Route handlers (Request parsing, business logic orchestration, responses)
  │     ├── bookingController.ts
  │     ├── searchController.ts
  │     ├── paymentController.ts
  │     └── userController.ts
  ├── /routes          # Express router definitions mapping paths to controllers
  │     ├── apiRouter.ts
  │     ├── privacy.ts # (Completed in Phase 1)
  │     └── paymentRoutes.ts
  ├── /services        # Core business logic and external integrations (Travelport API, Email, DB queries)
  │     ├── TravelportService.ts
  │     ├── PaymentService.ts
  │     └── EmailService.ts
  ├── /middleware      # Express middleware (Auth checking, error handling, rate limiting)
  │     ├── authMiddleware.ts
  │     └── errorMiddleware.ts
  ├── /security        # Specialized security rules (Webhook validation, sanitization)
  └── server.ts        # Primary entry point (Express app setup, middleware mounting, route attachment)
```

## Migration Strategy
1. **Extract Configurations**: Move singleton setups (Razorpay, Sentry, Secrets) to `/server/config`. *(Completed in Phase 1)*
2. **Extract Middleware**: Move `requireAuth` and `sentryErrorHandler` to `/server/middleware`.
3. **Move Routes**: Move logical blocks of `app.post(...)` or `app.get(...)` into separate router files in `/server/routes`.
4. **Isolate Services**: Extract massive inline logic (like PDF generation or complex API orchestrations) into `/server/services`.
5. **Clean `server.ts`**: The final `server.ts` should only contain the Express app initialization, Vite middleware, and `app.use('/api', apiRouter)`.
