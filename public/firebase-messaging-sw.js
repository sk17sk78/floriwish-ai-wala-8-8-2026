/* eslint-disable no-undef */
// Floriwish Firebase Cloud Messaging Service Worker

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Initialize Firebase in Service Worker
const firebaseConfig = {
  apiKey: "AIzaSyDHyLKETtIIpb4msnGfxM_g6fD0pcP2YLc",
  authDomain: "floriwish-f754e.firebaseapp.com",
  projectId: "floriwish-f754e",
  storageBucket: "floriwish-f754e.firebasestorage.app",
  messagingSenderId: "981114176055",
  appId: "1:981114176055:web:d5314d160920fed31235b2"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Background push notification handler
self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notification = payload.notification || {};
    const data = payload.data || {};

    const title = notification.title || data.title || "Floriwish";
    const body = notification.body || data.body || "New update from Floriwish";
    const image = notification.image || notification.imageUrl || data.image || data.imageUrl || "";
    const url = data.url || data.click_action || "/";
    const icon = "/user.png";
    const badge = "/user.png";

    const options = {
      body: body,
      icon: icon,
      badge: badge,
      data: {
        url: url,
        ...data
      },
      requireInteraction: false,
      tag: data.tag || "floriwish-push-notification",
      renotify: true
    };

    if (image) {
      options.image = image;
    }

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("[FCM SW] Push event error:", err);
  }
});

// Notification Click Handler - Focus tab or Open target URL
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const clickUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there is already an open Floriwish tab
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(clickUrl);
            }
            return client;
          }
        }
        // If no tab is open, open a new window
        if (clients.openWindow) {
          return clients.openWindow(clickUrl);
        }
      })
  );
});
