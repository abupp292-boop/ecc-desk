// ECC Desk service worker: makes the Home screen installable and quick on slow internet.
// Pages: always try the internet first (so updates show at once), fall back to the saved copy.
// Hashed files in assets/: saved copy first (their names change when their content changes).
// Never touches data requests (Supabase is another website, so it is not handled here).
const CACHE = 'ecc-desk-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const save = (res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };
  if (url.pathname.includes('/assets/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(save)));
  } else {
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then((hit) => hit || Response.error())));
  }
});
