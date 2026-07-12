const CACHE_NAME = "nsmissing-app-v4";
const SHELL_FILES = [
  "./",
  "./nsibmistchr.html",
  "./nsmissingS.html",
  "./manifest.webmanifest",
  "./manifest-student.webmanifest",
  "./app-icon.svg",
  "./app-icon-student.svg",
  "./app-icon-teacher-192.png",
  "./app-icon-teacher-512.png",
  "./app-icon-student-192.png",
  "./app-icon-student-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
