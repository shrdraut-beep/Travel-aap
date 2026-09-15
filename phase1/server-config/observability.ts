/**
 * server/config/observability.ts
 *
 * Sentry wiring for the Express backend. Catches unhandled errors across all
 * 129+ routes without needing to add try/catch everywhere manually, and gives
 * you alerting + stack traces for production incidents (currently only
 * secureLogger, no aggregation/alerting).
 *
 * SETUP:
 *   npm install @sentry/node @sentry/profiling-node
 *   Add SENTRY_DSN to your secrets (see secrets.ts) — get it from sentry.io project settings.
 *
 * USAGE (in server.ts, as EARLY as possible — before other imports that might throw):
 *   import { initObservability, sentryErrorHandler } from "./server/config/observability.ts";
 *   initObservability(app);
 *   ... all your routes ...
 *   app.use(sentryErrorHandler);   // must be registered AFTER routes, BEFORE your own error handler
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import type { Express } from "express";

const isProduction = process.env.NODE_ENV === "production";

export function initObservability(app: Express): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("[observability] SENTRY_DSN not set — error tracking disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    integrations: [nodeProfilingIntegration()],
    // Sample less in prod to control cost; capture everything in staging/dev
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 1.0,
    beforeSend(event) {
      // Strip anything that could leak payment/PII details into Sentry
      if (event.request?.data) {
        const sensitive = ["cardNumber", "cvv", "razorpay_signature", "password", "otp"];
        for (const key of sensitive) {
          if (typeof event.request.data === "object" && event.request.data[key]) {
            event.request.data[key] = "[REDACTED]";
          }
        }
      }
      return event;
    },
  });
}

// Register AFTER all routes — captures errors thrown/rejected inside route handlers
export const sentryErrorHandler = Sentry.expressErrorHandler();

/** Wrap ad-hoc background/cron jobs so failures aren't silently swallowed. */
export function captureBackgroundError(err: unknown, context?: Record<string, unknown>): void {
  Sentry.captureException(err, { extra: context });
}
