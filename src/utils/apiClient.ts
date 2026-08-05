import { addToSyncQueue, getSyncQueue, clearSyncQueue, removeFromSyncQueue } from '../offline';

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
    return response;
  } catch (error) {
    console.warn(`[apiClient] Network request failed for ${url}:`, error);

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

export const apiClient = {
  fetch: apiFetch,
  syncOfflineActions,
};

export default apiClient;
