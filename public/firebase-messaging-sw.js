importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAz9aH343qFVEsMyRRzGCEmHBrfamy9mO8",
  authDomain: "dentistas-app-c69bc.firebaseapp.com",
  projectId: "dentistas-app-c69bc",
  messagingSenderId: "858807071538",
  appId: "1:858807071538:web:e0e5ec8abdf1feb4cb9d2b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/icons/icon-192x192.png'
    }
  );
}); 