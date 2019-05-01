importScripts('https://www.gstatic.com/firebasejs/5.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.10.1/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '523602759876',
});

const messaging = firebase.messaging();