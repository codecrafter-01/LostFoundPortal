/* =============================================================
   SERVICE WORKER — Vignan Lost & Found Portal
   Runs silently in the background, even when the website is closed.
   Receives push notifications from the server and shows them.
   ============================================================= */

const CACHE_NAME = "vignan-lfp-v1";
const APP_URL = self.location.origin;

// ── Install: cache the app shell ──────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
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
