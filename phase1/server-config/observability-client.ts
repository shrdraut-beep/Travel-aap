/**
 * src/observability.ts
 *
 * Sentry for the React/Vite frontend (all three roles: end-user, agent, admin apps).
 * Catches crashes ErrorBoundary.tsx doesn't already handle, plus performance data
 * for slow flight/hotel search screens.
 *
 * SETUP:
 *   npm install @sentry/react
 *   Add VITE_SENTRY_DSN to your frontend env (public DSN — safe to expose client-side).
 *
 * USAGE (call once in your app entrypoint, before rendering <App />):
 *   import { initClientObservability } from "./observability.ts";
 *   initClientObservability();
 */

import * as Sentry from "@sentry/react";

export function initClientObservability(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn("[observability] VITE_SENTRY_DSN not set — client error tracking disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Tag which role's UI (user/agent/admin) the error came from, if you expose that in a global
    beforeSend(event) {
      event.tags = { ...event.tags, app_role: (window as any).__ROUTTRIPO_ROLE__ || "unknown" };
      return event;
    },
  });
}

/** Manually report an error from inside ErrorBoundary.tsx's componentDidCatch */
export function reportBoundaryError(error: Error, componentStack: string): void {
  Sentry.captureException(error, { extra: { componentStack } });
}
