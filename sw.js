const CACHE_NAME = 'goldensteal-dj-studio-entry-14';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './src/main.js',
  './src/pilot-kit.js',
  './src/studio-upgrades.js',
  './src/video-mixer.js',
  './src/dj-guide.js',
  './src/crate-picker.js',
  './src/coach-voice-questions.js',
  './src/studio-controls.js',
  './src/dj-guide.css',
  './src/studio-controls.css',
  './src/deck-performance.css',
  './src/starter-crate.js',
  './src/starter-crate.css',
  './assets/starter-crate/manifest.json',
  './src/audio-engine.js',
  './manifest.webmanifest',
  './assets/goldensteal-mark.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('goldensteal-dj-studio-') && key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Do not put multi-megabyte starter audio files in the app-shell cache.
  // They are fetched on demand and saved through the per-device IndexedDB crate.
  const starterAudioPath = new URL('./assets/starter-crate/', self.registration.scope).pathname;
  if (url.pathname.startsWith(starterAudioPath) && !url.pathname.endsWith('/manifest.json')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});