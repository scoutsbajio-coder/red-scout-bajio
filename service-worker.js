/* =====================================================
   Explorador Rojo Bajío · Trabajador de Servicios
   -----------------------------------------------------
   Para publicar cambios a todos los usuarios, sube el
   número de VERSIÓN (v1 -> v2 -> v3 ...) en cada despliegue.
   ====================================================== */
const VERSIÓN = 'v3';
const CACHÉ = 'red-scout-' + VERSIÓN;

/* Archivos propios que se guardan al instalar la aplicación */
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
    'icono-192.png',
    'icono-512.png',
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

self.addEventListener('install', (evento) => {
    evento.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        esperar caché.addAll(PRECACHE);
        /* Si una librería externa falla, no se cancela la instalación */
        await Promise.allSettled(CDN_PRECACHE.map(async (url) => {
            const resp = await fetch(new Request(url, { mode: 'cors', credentials: 'omit' }));
            if (resp.ok) { await cache.put(url, resp); }
        }));
        esperar a sí mismo.omitirEspera();
    })());
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil((async () => {
        const nombres = await caches.keys();
        esperar Promise.all(
            nombres
                .filter((n) => n.startsWith('red-scout-') && n !== CACHE)
                .map((n) => caches.delete(n))
        );
        esperar a que los clientes se autoreclamen;
    })());
});

/* Responde con lo guardado y actualizado en segundo plano */
función asíncrona conActualización(solicitud, peticionRed) {
    const cache = await caches.open(CACHE);
    const guardado = await cache.match(request);
    const red = fetch(peticioRojo || solicitud)
        .then((resp) => {
            if (resp && resp.ok) { cache.put(request, resp.clone()); }
            devolver resp;
        })
        .catch(() => null);
    if (guardado) { return guardado; }
    const resp = esperar rojo;
    devolver resp || Response.error();
}


/* Librerías externas: usa la copia guardada si existe y la actualiza en segundo plano.
   Si el servidor no permite descargarla con CORS, la deja pasar tal cual
   (así la página nunca se queda sin estilos por culpa del trabajador de servicio). */
función asíncrona libreriaExterna(evento, solicitud) {
    const cache = await caches.open(CACHE);
    const guardado = await cache.match(request.url);
    const actualizar = fetch(new Request(request.url, { mode: 'cors', credentials: 'omit' }))
        .then((resp) => {
            if (resp && resp.ok) { cache.put(request.url, resp.clone()); }
            devolver resp;
        })
        .catch(() => null);
    si (guardado) {
        evento.waitUntil(actualiza);
        devolver guardado;
    }
    const resp = esperar a actualizar;
    Si (respuesta) { devolver respuesta; }
    devolver fetch(solicitud);
}

self.addEventListener('fetch', (evento) => {
    const solicitud = evento.solicitud;
    if (request.method !== 'GET') { return; }
    const url = nueva URL(solicitud.url);

    /* Páginas: primero internet, y si no hay, la copia guardada */
    si (request.mode === 'navigate') {
        evento.respondWith((async () => {
            intentar {
                const resp = await fetch(request);
                si (resp.ok && url.origin === location.origin) {
                    const cache = await caches.open(CACHE);
                    caché.put(solicitud, resp.clone());
                }
                devolver resp;
            } capturar (error) {
                const cache = await caches.open(CACHE);
                return (await cache.match(request, { ignoreSearch: true })) ||
                       (esperar a que la caché coincida con 'index.html') ||
                       Respuesta.error();
            }
        })());
        devolver;
    }

    /* Archivos propios (datos, scripts, imágenes) */
    Si (url.origin === location.origin) {
        evento.respondWith(conActualización(solicitud));
        devolver;
    }

    /* Librerías externas permitidas (Tailwind, Font Awesome, Leaflet) */
    Si (CDN_HOSTS.includes(url.hostname)) {
        evento.respondWith(libreriaExterna(evento, solicitud));
        devolver;
    }

    /* Todo lo demás (mosaicos del mapa, fotos externas) pasa directo a internet */
});
