"use strict";
const CACHE = "mirage-city-v7";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/bg.webp",
  "./assets/avatar.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: "no-cache" });
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
      if (request.mode === "navigate") {
        cache.put("./index.html", response.clone()).catch(() => {});
      }
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request, {
      ignoreSearch: request.mode === "navigate",
    });
    if (cached) return cached;
    if (request.mode === "navigate") {
      return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(networkFirst(request));
});
