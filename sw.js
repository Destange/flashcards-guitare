var CACHE = 'guitare-v4.6';
var ASSETS = ['./', './manifest.json',
  './icon-192.png', './icon-512.png',
  './icon-192-maskable.png', './icon-512-maskable.png',
  './apple-touch-icon.png', './favicon-32.png',
  './audio/WebAudioFontPlayer.js', './audio/0240_FluidR3_GM_sf2_file.js'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Ne pas intercepter les requêtes CDN externes (audio, polices)
  if (!e.request.url.startsWith(self.location.origin)) return;
  // Stale-while-revalidate : sert le cache tout de suite, met à jour en arrière-plan
  e.respondWith(
    caches.open(CACHE).then(function(c) {
      return c.match(e.request).then(function(cached) {
        var network = fetch(e.request).then(function(resp) {
          if (resp && resp.status === 200) c.put(e.request, resp.clone());
          return resp;
        }).catch(function() { return cached; });
        return cached || network;
      });
    })
  );
});
