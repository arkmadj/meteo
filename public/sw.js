/**
 * Service Worker for Push Notification Handling
 * React Weather App
 */

// Service Worker version for cache management
const SW_VERSION = '1.0.0';
const CACHE_NAME = `weather-app-v${SW_VERSION}`;

// Install event - set up caches
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker version:', SW_VERSION);
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('weather-app-') && cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);

  let notificationData = {
    title: 'Weather Alert',
    body: 'You have a new weather update',
    icon: '/favicon-32x32.png',
    badge: '/favicon-16x16.png',
    tag: 'weather-notification',
    requireInteraction: false,
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  // Parse push event data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        requireInteraction: payload.requireInteraction ?? notificationData.requireInteraction,
        data: {
          ...notificationData.data,
          ...payload.data,
          url: payload.url || payload.data?.url || notificationData.data.url,
        },
        // Additional notification options
        ...(payload.image && { image: payload.image }),
        ...(payload.vibrate && { vibrate: payload.vibrate }),
        ...(payload.actions && { actions: payload.actions }),
        ...(payload.silent !== undefined && { silent: payload.silent }),
        ...(payload.renotify !== undefined && { renotify: payload.renotify }),
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
      // Try to use text data as notification body
      const textData = event.data.text();
      if (textData) {
        notificationData.body = textData;
      }
    }
  }

  const { title, ...options } = notificationData;

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle action buttons if present
  if (action) {
    console.log('[SW] Notification action clicked:', action);
    // Post message to client about the action
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NOTIFICATION_ACTION',
            action: action,
            data: data,
          });
        });
      })
    );
    return;
  }

  // Default click behavior - open or focus the app
  const urlToOpen = data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate existing window to the URL
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event - track dismissed notifications
self.addEventListener('notificationclose', event => {
  console.log('[SW] Notification closed:', event);
  const data = event.notification.data || {};

  // Post message to client about dismissed notification
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_CLOSED',
          tag: event.notification.tag,
          data: data,
        });
      });
    })
  );
});

// Push subscription change event - handle subscription renewals
self.addEventListener('pushsubscriptionchange', event => {
  console.log('[SW] Push subscription changed:', event);

  event.waitUntil(
    // Notify clients about subscription change
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PUSH_SUBSCRIPTION_CHANGED',
          oldSubscription: event.oldSubscription,
          newSubscription: event.newSubscription,
        });
      });
    })
  );
});
