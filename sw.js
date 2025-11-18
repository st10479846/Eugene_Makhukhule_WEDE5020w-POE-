// ================================
// SERVICE WORKER - AGANG SA WEBSITE
// Caching for Performance
// ================================

const CACHE_NAME = 'agang-sa-v1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/about.html',
    '/news.html',
    '/campaign.html',
    '/getinvolved.html',
    '/donate.html',
    '/contact.html',
    '/events.html',
    '/gallery.html',
    '/styles.css',
    '/script.js',
    '/_images/logo.png'
];

// Install event - cache core files
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});