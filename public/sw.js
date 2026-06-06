const CACHE_VERSION = "rmvi-gcos-offline-v8";
const APP_SHELL = [
  "/",
  "/app",
  "/admin",
  "/admin/board",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/gcos-icon.svg",
  "/icons/gcos-maskable.svg",
  "/brand/lion-of-judah-logo.jpg"
];
const CACHEABLE_API_PATHS = new Set([
  "/api/bootstrap",
  "/api/status",
  "/api/command-center/briefing",
  "/api/archive/manifest",
  "/api/workflows/digest",
  "/api/escalations/digest",
  "/api/personnel/digest",
  "/api/transfers/digest",
  "/api/offices/digest",
  "/api/hierarchy/digest",
  "/api/audit/digest",
  "/api/events/digest",
  "/api/readiness/digest",
  "/api/sessions/digest",
  "/api/tasks/digest",
  "/api/policies/digest",
  "/api/calendar-events/digest",
  "/api/messages/digest",
  "/api/reports/digest",
  "/api/approvals/digest",
  "/api/ai-drafts/digest"
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationFirst(request));
    return;
  }

  const isAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/offline.html";
  const isCacheableApi = CACHEABLE_API_PATHS.has(url.pathname);

  if (isAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isCacheableApi) {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, shellFallback = "/offline.html") {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put(request, response.clone());
      if (request.mode === "navigate" && new URL(request.url).pathname === "/") await cache.put("/", response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(shellFallback);
  }
}

async function navigationFirst(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put("/", response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_VERSION);
    const shell = await cache.match("/") || await caches.match("/");
    if (shell) return shell;
    return caches.match("/offline.html");
  }
}
