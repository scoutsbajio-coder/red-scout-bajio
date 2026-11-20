/* =====================================================
   Red Scout Bajío · Service Worker
   -----------------------------------------------------
   Para publicar cambios a todos los usuarios, sube el
   número de VERSION (v1 -> v2 -> v3 ...) en cada despliegue.
   ===================================================== */
const VERSION = 'v2';
const CACHE = 'red-scout-' + VERSION;

/* Archivos propios que se guardan al instalar la app */
const PRECACHE = [
    './',
    'index.html',
    'mapa.html',
    'lugares.json',
    'manifest.webmanifest',
    'index.js',
    'mapa.js',
    'pwa.js',
    'favicon-64.png',
    'favicon.ico',
    'icon-192.png',
    'icon-512.png',
    'apple-touch-icon.png',
    'placeholder.svg',
    'banner_movil.webp',
    'banner_optimizado.webp'
];

/* Librerías externas que se guardan para que la app abra sin internet */
const CDN_PRECACHE = [
    'https://cdn.tailwindcss.com/',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'unpkg.com'];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await cache.addAll(PRECACHE);
        /* Si una librería externa falla, no se cancela la instalación */
        await Promise.allSettled(CDN_PRECACHE.map(async (url) => {
            const resp = await fetch(new Request(url, { mode: 'cors', credentials: 'omit' }));
            if (resp.ok) { await cache.put(url, resp); }
        }));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const nombres = await caches.keys();
        await Promise.all(
            nombres
                .filter((n) => n.startsWith('red-scout-') && n !== CACHE)
                .map((n) => caches.delete(n))
        );
        await self.clients.claim();
    })());
});

/* Responde con lo guardado y actualiza en segundo plano */
async function conActualizacion(request, peticionRed) {
    const cache = await caches.open(CACHE);
    const guardado = await cache.match(request);
    const red = fetch(peticionRed || request)
        .then((resp) => {
            if (resp && resp.ok) { cache.put(request, resp.clone()); }
            return resp;
        })
        .catch(() => null);
    if (guardado) { return guardado; }
    const resp = await red;
    return resp || Response.error();
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') { return; }
    const url = new URL(request.url);

    /* Páginas: primero internet, y si no hay, la copia guardada */
    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const resp = await fetch(request);
                if (resp.ok && url.origin === location.origin) {
                    const cache = await caches.open(CACHE);
                    cache.put(request, resp.clone());
                }
                return resp;
            } catch (err) {
                const cache = await caches.open(CACHE);
                return (await cache.match(request, { ignoreSearch: true })) ||
                       (await cache.match('index.html')) ||
                       Response.error();
            }
        })());
        return;
    }

    /* Archivos propios (datos, scripts, imágenes) */
    if (url.origin === location.origin) {
        event.respondWith(conActualizacion(request));
        return;
    }

    /* Librerías externas permitidas (Tailwind, Font Awesome, Leaflet) */
    if (CDN_HOSTS.includes(url.hostname)) {
        event.respondWith(
            conActualizacion(
                request,
                new Request(request.url, { mode: 'cors', credentials: 'omit' })
            )
        );
        return;
    }

    /* Todo lo demás (mosaicos del mapa, fotos externas) pasa directo a internet */
});
