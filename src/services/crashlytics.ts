// src/services/crashlytics.ts
// Firebase Crashlytics & Real-Time Error Reporting Engine

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';

export interface Breadcrumb {
  timestamp: string;
  message: string;
  category: 'navigation' | 'ui' | 'network' | 'payment' | 'auth' | 'system';
  data?: Record<string, any>;
}

export interface CrashReport {
  id?: string;
  timestamp: any;
  message: string;
  stack?: string;
  name?: string;
  isFatal: boolean;
  userId: string | null;
  deviceId: string;
  url: string;
  userAgent: string;
  customKeys: Record<string, any>;
  breadcrumbs: Breadcrumb[];
  appVersion: string;
  platform: 'web' | 'android' | 'ios';
}

class CrashlyticsService {
  private static instance: CrashlyticsService;
  private isEnabled: boolean = true;
  private userId: string | null = null;
  private customKeys: Record<string, any> = {
    app: 'RouTripO',
    version: '2.4.0',
    environment: import.meta.env.MODE || 'production',
  };
  private breadcrumbs: Breadcrumb[] = [];
  private readonly MAX_BREADCRUMBS = 40;
  private initialized = false;

  private constructor() {}

  public static getInstance(): CrashlyticsService {
    if (!CrashlyticsService.instance) {
      CrashlyticsService.instance = new CrashlyticsService();
    }
    return CrashlyticsService.instance;
  }

  /**
   * Initializes global uncaught error and unhandled rejection listeners
   */
  public init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    this.log('Crashlytics telemetry initialized', 'system');

    // 1. Uncaught global JavaScript runtime errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.recordError(
        event.error || new Error(event.message || 'Uncaught runtime error'),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: 'window.onerror',
        },
        true // Fatal
      );
    });

    // 2. Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      if (event.defaultPrevented) return; // Ignore suppressed rejections

      let err: Error;
      if (event.reason instanceof Error) {
        err = event.reason;
      } else if (typeof event.reason === 'string') {
        err = new Error(event.reason);
      } else {
        // Try to get more info from the object if it's not a string or Error
        const reasonString = typeof event.reason === 'object' 
          ? JSON.stringify(event.reason, Object.getOwnPropertyNames(event.reason))
          : String(event.reason);
        err = new Error(`Unhandled Promise Rejection: ${reasonString}`);
      }

      this.recordError(
        err,
        {
          source: 'window.onunhandledrejection',
          reasonType: typeof event.reason,
        },
        false // Non-fatal
      );
    });

    // 3. User Navigation / History tracking
    window.addEventListener('popstate', () => {
      this.log(`Navigation to ${window.location.pathname}`, 'navigation', {
        href: window.location.href,
      });
    });
  }

  /**
   * Toggle crashlytics data collection
   */
  public setCrashlyticsCollectionEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Associate an authenticated user with all subsequent crash reports
   */
  public setUserId(uid: string | null) {
    this.userId = uid;
    if (uid) {
      this.log(`User session attached: ${uid.substring(0, 8)}***`, 'auth');
    }
  }

  /**
   * Set custom key-value pairs to provide context for diagnostics
   */
  public setCustomKey(key: string, value: any) {
    this.customKeys[key] = value;
  }

  /**
   * Logs a lightweight timestamped breadcrumb to trace user session context prior to a crash
   */
  public log(
    message: string,
    category: Breadcrumb['category'] = 'system',
    data?: Record<string, any>
  ) {
    if (!this.isEnabled) return;

    const crumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      message,
      category,
      data,
    };

    this.breadcrumbs.push(crumb);
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Reports a fatal or non-fatal exception to Firestore and telemetry endpoint
   */
  public async recordError(
    error: Error | string,
    context?: Record<string, any>,
    isFatal: boolean = false
  ) {
    if (!this.isEnabled) return;

    try {
      const parsedError = typeof error === 'string' ? new Error(error) : error;
      const deviceId = await getDeviceFingerprint();

      const platform = (window as any)?.Capacitor?.isNativePlatform?.()
        ? ((window as any)?.Capacitor?.getPlatform?.() || 'android')
        : 'web';

      const crashPayload: CrashReport = {
        timestamp: new Date().toISOString(),
        message: parsedError.message || 'Unknown error',
        stack: parsedError.stack || '',
        name: parsedError.name || 'Error',
        isFatal,
        userId: this.userId,
        deviceId,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        customKeys: {
          ...this.customKeys,
          ...(context || {}),
        },
        breadcrumbs: [...this.breadcrumbs],
        appVersion: '2.4.0',
        platform,
      };

      // 1. Send to server telemetry route for centralized error logging
      try {
        fetch('/api/telemetry/crash-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(crashPayload),
          keepalive: true, // Guarantees request delivery even if page unloads
        }).catch(() => {});
      } catch (e) {}

      // 2. Direct Firestore persistence if db is online
      try {
        if (db) {
          await addDoc(collection(db, 'crash_reports'), {
            ...crashPayload,
            createdAt: serverTimestamp(),
          });
        }
      } catch (dbErr) {
        // Fallback silently if offline
      }

      console.error('[Crashlytics Recorded Error]:', parsedError.message, {
        isFatal,
        context,
      });
    } catch (e) {
      console.warn('[Crashlytics Failure]:', e);
    }
  }

  /**
   * Returns current recorded breadcrumbs
   */
  public getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }
}

export const crashlytics = CrashlyticsService.getInstance();
export const initCrashlytics = () => crashlytics.init();
