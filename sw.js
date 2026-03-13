// اسم الكاش (نسخة التطبيق)
const CACHE_NAME = 'adhan-bouna-v2';

// الملفات التي سيتم تخزينها للعمل أوفلاين
const ASSETS_TO_CACHE = [
    '/',
    'index.html',
    'manifest.json',
    'adhan.mp3',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap'
];

// حدث التثبيت: تخزين الملفات الأساسية
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching essential assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // تفعيل النسخة الجديدة فوراً
    );
});

// حدث التفعيل: تنظيف الكاش القديم
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// حدث الجلب: جلب الملفات من الكاش أولاً، ثم من الشبكة
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // إذا وجد في الكاش، أرجعه
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // وإلا، اجلبه من الشبكة
                return fetch(event.request).catch(() => {
                    // إذا فشلت الشبكة (أوفلاين) وكان الطلب لصفحة HTML، أرجع index.html
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('index.html');
                    }
                });
            })
    );
});