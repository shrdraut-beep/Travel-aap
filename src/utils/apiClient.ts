import { addToSyncQueue, getSyncQueue, clearSyncQueue, removeFromSyncQueue } from '../offline';
import { crashlytics } from '../services/crashlytics';

export interface OfflineAction {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
}

/**
 * Automatically syncs queued offline actions when network is restored.
 */
export async function syncOfflineActions(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  const queue = await getSyncQueue();
  if (!queue.length) return;

  console.log(`[OfflineSync] Processing ${queue.length} offline queued actions...`);

  for (const item of queue) {
    try {
      const res = await fetch(item.payload.url, {
        method: item.payload.method,
        headers: item.payload.headers,
        body: typeof item.payload.body === 'object' ? JSON.stringify(item.payload.body) : item.payload.body,
      });

      if (res.ok || res.status < 500) {
        await removeFromSyncQueue(item.id);
      }
    } catch (err) {
      console.warn(`[OfflineSync] Action failed for ${item.payload.url}, keeping in queue:`, err);
    }
  }
}

// Auto-register online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineActions();
  });
}

/**
 * Global API Interceptor (`apiFetch`)
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutation = method !== 'GET';

  // Check network offline state before fetching
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    if (isMutation) {
      await addToSyncQueue({
        type: 'trip_update', // Simplified type
        payload: {
          url,
          method,
          headers: options.headers as Record<string, string>,
          body: options.body,
        },
      });
    }

    // Return mock success response so caller UI updates smoothly
    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: '✈️ Saved offline locally (IndexedDB)',
      }),
      {
        status: 200,
        statusText: 'OK (Offline Mode)',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok && response.status >= 500 && !url.includes('/telemetry/')) {
      crashlytics.recordError(
        new Error(`HTTP ${response.status} from ${url}`),
        { url, method, status: response.status },
        false
      );
    }
    return response;
  } catch (error: any) {
    console.warn(`[apiClient] Network request failed for ${url}:`, error);
    if (!url.includes('/telemetry/')) {
      crashlytics.log(`Network request failed: ${method} ${url}`, 'network', {
        error: error?.message || 'Fetch error',
      });
    }

    // If fetch failed due to network / offline transition
    if (isMutation) {
      await addToSyncQueue({
        type: 'trip_update',
        payload: {
          url,
          method,
          headers: options.headers as Record<string, string>,
          body: options.body,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: '✈️ Network error handled, saved offline locally (IndexedDB)',
      }),
      {
        status: 200,
        statusText: 'OK (Offline Mode)',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Returns the current user's Firebase ID token, or null when signed out.
 * Firebase refreshes the token automatically when it is close to expiry.
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const { getAuthSafe } = await import('../firebase');
    const user = getAuthSafe().currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (err) {
    console.warn('[apiClient] Could not obtain ID token:', err);
    return null;
  }
}

/**
 * fetch() wrapper that attaches the Firebase ID token. Use for any endpoint the
 * server protects with requireAuth / requireAdmin.
 */
export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Fetch and inject App Check validation token
  try {
    const { appCheck, getAppCheckToken } = await import('../firebase');
    if (appCheck) {
      const appCheckTokenResult = await getAppCheckToken(appCheck, false);
      if (appCheckTokenResult && appCheckTokenResult.token) {
        headers.set('X-Firebase-AppCheck', appCheckTokenResult.token);
      }
    }
  } catch (appCheckErr) {
    console.warn('[apiClient] Could not fetch App Check token:', appCheckErr);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...options, headers });
}

export const apiClient = {
  fetch: apiFetch,
  authedFetch,
  getIdToken,
  syncOfflineActions,
};

export default apiClient;
