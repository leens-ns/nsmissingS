const CACHE_NAME = "nsmissing-app-v16";
const SHELL_FILES = [
  "./student/",
  "./student/index.html",
  "./student/manifest.webmanifest",
  "./teacher/",
  "./teacher/index.html",
  "./teacher/manifest.webmanifest",
  "./cursor-pagination.js",
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
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(SHELL_FILES);
      await self.skipWaiting();
    } catch (error) {
      // A failed update must leave the previous worker and usable cache intact.
      await caches.delete(CACHE_NAME).catch(() => {});
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const shell = await Promise.all(SHELL_FILES.map(file => cache.match(file)));
    if (shell.some(response => !response)) throw new Error("Incomplete application shell; old caches preserved");
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("nsmissing-app-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
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
