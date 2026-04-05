// HN Coach Service Worker
const CACHE_NAME = 'hn-coach-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'HN Coach';
  const options = {
    body: data.body || 'You have a new message',
    icon: '/assets/favicon.ico',
    badge: '/assets/favicon.ico',
    tag: data.tag || 'hn-coach-notification',
    renotify: true,
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Listen for messages from main thread to show notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title || 'HN Coach', {
      body: body || 'You have a new message',
      icon: '/assets/favicon.ico',
      badge: '/assets/favicon.ico',
      tag: tag || 'hn-coach-notification',
      renotify: true,
    });
  }
});
