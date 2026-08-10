/*
 * Firebase Cloud Messaging service worker.
 *
 * Web push REQUIRES a worker at exactly this path: getToken() looks for
 * /firebase-messaging-sw.js and registers it under its own
 * /firebase-cloud-messaging-push-scope, so it coexists with the Workbox
 * service worker (sw.js) that handles offline caching.
 *
 * This file lives in public/ and is therefore NOT processed by Vite - no
 * import.meta.env substitution happens here, so the config below is inlined.
 * These Firebase web config values are public identifiers, not secrets (see the
 * note in src/firebase.ts); access is controlled by security rules and API key
 * restrictions. Keep them in sync with src/firebase.ts if you switch projects.
 *
 * Keep the SDK version below in sync with the `firebase` dependency in
 * package.json (currently 12.16.0) - a mismatch can break token generation.
 */
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: 'gen-lang-client-0070042137',
  appId: '1:974625843598:web:79a85a1f88ddc5fbe95cdf',
  apiKey: 'AIzaSyAqWmoMOZIflucdFRmqV_WJPMvPMBx9LGI',
  authDomain: 'gen-lang-client-0070042137.firebaseapp.com',
  storageBucket: 'gen-lang-client-0070042137.firebasestorage.app',
  messagingSenderId: '974625843598',
});

const messaging = firebase.messaging();

// Fires only for data-only messages while the app is in the background. Messages
// that carry a `notification` payload are displayed by the browser itself; showing
// one here as well would produce a duplicate notification.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;

  const data = payload.data || {};
  const title = data.title || 'प्रवास वाटाघाटी';
  self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || 'pw-push',
    // SOS alerts must stay on screen until acknowledged.
    requireInteraction: data.priority === 'high',
    data: { url: data.url || '/' },
  });
});

// Focus an existing tab rather than opening a duplicate one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client && target !== '/') client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
