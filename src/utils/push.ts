import { Capacitor } from '@capacitor/core';

/**
 * Push notification registration, for both the native Android app and the web/PWA build.
 *
 * The two platforms cannot share one implementation:
 *  - Native (Capacitor) gets its FCM token from the Firebase Android SDK via
 *    @capacitor/push-notifications. It needs android/app/google-services.json and no
 *    VAPID key. Web push does not work inside the Android WebView.
 *  - Web/PWA uses firebase/messaging with a VAPID key and the
 *    public/firebase-messaging-sw.js service worker.
 *
 * Both paths end up writing the token to `fcm_tokens` through saveFcmToken(), which the
 * security rules bind to the signed-in uid.
 *
 * The @capacitor/push-notifications import is dynamic so the native plugin is never
 * pulled into the web bundle.
 */

export type PushResult =
  | { status: 'registered'; token: string; platform: 'android' | 'ios' | 'web/pwa' }
  | { status: 'denied' }
  | { status: 'unsupported' }
  | { status: 'unconfigured'; reason: string }
  | { status: 'error'; error: unknown };

export function isNativePush(): boolean {
  return Capacitor.isNativePlatform();
}

async function registerNative(userId?: string): Promise<PushResult> {
  const { PushNotifications } = await import('@capacitor/push-notifications');
  const { saveFcmToken } = await import('../firebase');

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== 'granted') return { status: 'denied' };

  const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';

  // register() is fire-and-forget; the token arrives on the 'registration' event, so
  // wait for whichever of registration/registrationError fires first.
  return new Promise<PushResult>((resolve) => {
    let settled = false;
    const finish = (result: PushResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    PushNotifications.addListener('registration', async (token) => {
      await saveFcmToken(token.value, userId, platform);
      finish({ status: 'registered', token: token.value, platform });
    });

    PushNotifications.addListener('registrationError', (err) => {
      // Almost always a missing/mismatched google-services.json.
      console.error('[push] native registration failed:', err);
      finish({ status: 'error', error: err });
    });

    PushNotifications.register().catch((err) => finish({ status: 'error', error: err }));

    // Don't leave the caller hanging if neither event ever fires.
    setTimeout(
      () => finish({ status: 'unconfigured', reason: 'Native registration timed out. Is android/app/google-services.json present?' }),
      15000
    );
  });
}

async function registerWeb(userId?: string): Promise<PushResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { status: 'unsupported' };
  }

  const env = (import.meta as any).env || {};
  if (!env.VITE_FIREBASE_VAPID_KEY) {
    return { status: 'unconfigured', reason: 'VITE_FIREBASE_VAPID_KEY is not set' };
  }

  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return { status: 'denied' };

  const { requestAndSaveFCMToken } = await import('../firebase');
  const token = await requestAndSaveFCMToken(userId);
  return token
    ? { status: 'registered', token, platform: 'web/pwa' }
    : { status: 'error', error: new Error('Web token registration failed') };
}

/**
 * Requests notification permission and registers this device for push.
 * Safe to call repeatedly - FCM returns the existing token.
 */
export async function enablePushNotifications(userId?: string): Promise<PushResult> {
  try {
    return isNativePush() ? await registerNative(userId) : await registerWeb(userId);
  } catch (error) {
    console.error('[push] enablePushNotifications failed:', error);
    return { status: 'error', error };
  }
}

/**
 * Native-only push listeners. No-op on web, where public/firebase-messaging-sw.js does
 * the equivalent.
 *
 * Android suppresses FCM notification payloads while the app is in the foreground, so
 * `onForeground` is where the app should surface the message itself (an in-app toast, or
 * sendAppNotification from ./notifications). Rendering it as a system notification would
 * need @capacitor/local-notifications, which is deliberately not a dependency yet.
 */
export async function initNativePushListeners(handlers: {
  onForeground?: (payload: { title: string; body: string; data: Record<string, any> }) => void;
  onTap?: (data: Record<string, any>) => void;
} = {}): Promise<void> {
  if (!isNativePush()) return;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    handlers.onForeground?.({
      title: notification.title || 'राऊट्रिपो',
      body: notification.body || '',
      data: notification.data || {},
    });
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    handlers.onTap?.(action.notification?.data || {});
  });
}
