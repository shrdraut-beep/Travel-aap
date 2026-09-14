import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { Express, Request, Response, NextFunction } from 'express';
import { secureLogger } from '../security/logger.ts';

export function initObservability(app: Express) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    secureLogger.warn('[Observability] SENTRY_DSN not provided. Sentry backend tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    environment: process.env.NODE_ENV || 'development'
  });
  
  secureLogger.info('[Observability] Sentry backend observability initialized.');
}

export function sentryErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  next(err);
}
