// Attunr service worker — handles notification clicks and PWA installability.
// Minimal fetch handler (no caching) required for Chrome PWA install prompt.

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Open the app at /journey when the user taps a notification
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus an existing tab if possible
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      return clients.openWindow("/journey");
    })
  );
});

// Ready for future push server integration
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Time to practice";
  const options = {
    body: data.body || "A few minutes of vocal practice can make a big difference.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Fetch handler — pass through to network (no caching).
// Required for Chrome to consider this a valid PWA service worker.
self.addEventListener("fetch", () => {});
