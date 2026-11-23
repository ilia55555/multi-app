const CACHE_NAME = 'multi-app-hub-v7';
const APP_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './apps.json',
  './apps/streambox/index.html',
  './apps/streambox/styles.css',
  './apps/streambox/app.js',
  './apps/rigidmesh/index.html',
  './apps/rigidmesh/styles.css',
  './apps/rigidmesh/app.js',
  './apps/frameforge/index.html',
  './apps/frameforge/styles.css',
  './apps/frameforge/app.js',
  './apps/multipic/index.html',
  './apps/sfxstudio/index.html',
  './apps/sfxstudio/styles.css',
  './apps/sfxstudio/app.js',
  './apps/sfxstudio/vendor/lame.min.js',
  './LiveWebStudio-Tuner/index.html',
  './secretchat/index.html',
  './naghshe-Tuner/index.html',
  './Generator-Color-Palette--Tuner/full.html',
  './Element-Samples-Tuner/index.html',
  './tr%20file/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
});
