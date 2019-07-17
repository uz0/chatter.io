/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/5.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.10.1/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '523602759876',
});

const messaging = firebase.messaging();

self.addEventListener('notificationclick', event => {
  const target = event.notification.data.click_action || '/';
  event.notification.close();

  event.waitUntil(clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then(clientList => {
    for (var i = 0; i < clientList.length; i++) {
      const client = clientList[i];

      if (client.url == target && 'focus' in client) {
        return client.focus();
      }
    }

    return clients.openWindow(target);
  }));
});
/* eslint-enable */
