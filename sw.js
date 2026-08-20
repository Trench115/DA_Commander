// Nombre de la caché. Si algún día cambias mucho la app, sube este número
// para forzar que los móviles descarguen la versión nueva.
const CACHE_NAME = 'airsoft-cache-v3';

const FILES_TO_CACHE = [
  './index.html',
  './posesion.html',
  './punto-caliente-extremo.html',
  './captura.html',
  './dominio.html',
  './temporizadores.html',
  './style.css',
  './common.js',
  './script.js',
  './punto-caliente-extremo.js',
  './captura.js',
  './dominio.js',
  './temporizadores.js',
  './manifest.json',
  './icon.png'
];

// Al instalar el Service Worker, guardamos todos los archivos en caché.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Al activarse, borramos cachés antiguas si las hubiera.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Cuando la app pide un archivo, primero miramos si lo tenemos guardado
// (offline), y si no, vamos a la red (online).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});