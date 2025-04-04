importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC-xRaQ86BkMrjWRxZdUm5lpP7tZZGsL6o",
    authDomain: "ionic-2-e5f0a.firebaseapp.com",
    projectId: "ionic-2-e5f0a",
    storageBucket: "ionic-2-e5f0a.firebasestorage.app",
    messagingSenderId: "750611618133",
    appId: "1:750611618133:web:fb0ddb120879c7d04f37dc",
    measurementId: "G-VJMK654YS4"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 Notificación en segundo plano:', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/assets/icon.png'
  });
});
