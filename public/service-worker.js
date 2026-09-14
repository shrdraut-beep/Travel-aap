const CACHE_NAME = 'pravas-wataghati-v11-bypass';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests with http/https scheme
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      // On network failure, try serving from cache or fallback index.html for navigate mode
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      if (event.request.mode === 'navigate') {
        const indexMatch = await caches.match('/index.html');
        if (indexMatch) return indexMatch;
      }

      return new Response('Network offline or resource unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

// Support manual skipWaiting instruction via postMessage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

