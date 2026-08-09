const CACHE_NAME = "nsmissing-app-v10";
const SHELL_FILES = [
  "./student/",
  "./student/index.html",
  "./student/manifest.webmanifest",
  "./teacher/",
  "./teacher/index.html",
  "./teacher/manifest.webmanifest",
  "./privacy-policy.html",
  "./school-logo.png",
  "./app-icon.svg",
  "./app-icon-student.svg",
  "./app-icon-teacher-192.png",
  "./app-icon-teacher-512.png",
  "./app-icon-student-192.png",
  "./app-icon-student-512.png"
];
const RETIRED_PATHS = new Set([
  "/nsmissingS/nsmissingS.html",
  "/nsmissingS/nsibmistchr.html",
  "/nsmissingS.html",
  "/nsibmistchr.html"
]);

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
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === self.location.origin && RETIRED_PATHS.has(requestUrl.pathname)) {
    event.respondWith(new Response("", { status: 404 }));
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
