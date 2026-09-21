/* =============================================================
   SERVICE WORKER — Vignan Lost & Found Portal
   Runs silently in the background, even when the website is closed.
   Receives push notifications from the server and shows them.
   ============================================================= */

const CACHE_NAME = "vignan-lfp-v2";
const APP_URL = self.location.origin;

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/vignan_logo.jpg",
  "/favicon.svg"
];

// ── Install: pre-cache core assets ────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-caching warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches & claim clients ────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// ── Fetch: Network-first with cache fallback (PWA requirement) ─
self.addEventListener("fetch", (event) => {
  // Ignore non-GET and backend API requests
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
        }
      })
  );
});

// ── Push Event: show notification ─────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "🔔 Vignan Lost & Found",
      body: event.data ? event.data.text() : "You have a new notification.",
    };
  }

  const title  = data.title  || "🔔 Vignan Lost & Found Portal";
  const body   = data.body   || "You have a new notification.";
  const icon   = data.icon   || "/vignan_logo.jpg";
  const badge  = data.badge  || "/vignan_logo.jpg";
  const url    = data.url    || "/";
  const tag    = data.tag    || "vignan-push";
  const vibrate = data.vibrate || [200, 100, 200];

  const options = {
    body,
    icon,
    badge,
    tag,
    vibrate,
    requireInteraction: false,      // auto-dismiss after a few seconds
    renotify: true,
    data: { url: `${APP_URL}${url}` },
    actions: [
      { action: "view",    title: "View"    },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Notification Click: open the portal ───────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || APP_URL;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it
      for (const client of windowClients) {
        if (client.url.startsWith(APP_URL) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
