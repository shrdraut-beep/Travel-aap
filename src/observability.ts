import * as Sentry from '@sentry/react';

export function initClientObservability() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn('[Observability] VITE_SENTRY_DSN not provided. Sentry frontend tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0, 
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0, 
    environment: import.meta.env.MODE || 'development'
  });
  
  console.info('[Observability] Sentry frontend observability initialized.');
}
