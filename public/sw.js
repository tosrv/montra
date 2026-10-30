/*
 * Montra service worker — makes the app usable offline.
 *
 * - Navigations: network-first, falling back to the cached app shell.
 * - Hashed build assets (/assets/*): cache-first; they are immutable, so old
 *   and new deploys never mix chunks.
 * - Other same-origin GETs (icons, manifest): stale-while-revalidate.
 *
 * Bump CACHE_VERSION to drop every cache on the next activation.
 */
const CACHE_VERSION = 'v2';
const SHELL_CACHE = `montra-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `montra-assets-${CACHE_VERSION}`;
const SHELL_URL = '/index.html';
const PRECACHE_URLS = [SHELL_URL, '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      precacheBuildAssets(),
    ]).then(() => self.skipWaiting())
  );
});

/** Caches every lazy-loaded chunk so routes never visited online still work offline. */
async function precacheBuildAssets() {
  let manifest;
  try {
    const response = await fetch('/asset-manifest.json', { cache: 'no-store' });
    if (!response.ok) return; // e.g. dev server: no build manifest
    manifest = await response.json();
  } catch {
    return;
  }
  const files = new Set();
  for (const entry of Object.values(manifest)) {
    if (entry.file) files.add(`/${entry.file}`);
    for (const css of entry.css || []) files.add(`/${css}`);
  }
  const cache = await caches.open(ASSET_CACHE);
  await cache.addAll([...files]);
}

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Leave cross-origin requests (e.g. analytics) to the browser.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

async function networkFirstShell(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(SHELL_URL, response.clone());
    return response;
  } catch {
    const cached = await cache.match(SHELL_URL);
    return cached || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) void cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}
