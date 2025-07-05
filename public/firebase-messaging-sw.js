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

// Cache para evitar duplicados
const notificationCache = new Set();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);
  
  // Verificar que tenemos datos válidos
  if (!payload.notification || !payload.notification.title) {
    console.log('Invalid notification payload:', payload);
    return;
  }

  // Crear un identificador único para la notificación
  const notificationId = `${payload.notification.title}-${payload.notification.body}-${Date.now()}`;
  
  // Evitar duplicados
  if (notificationCache.has(notificationId)) {
    console.log('Duplicate notification, skipping...');
    return;
  }
  
  notificationCache.add(notificationId);
  
  // Limpiar cache después de 5 segundos
  setTimeout(() => {
    notificationCache.delete(notificationId);
  }, 5000);

  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'coec-notification', // Evita duplicados
    requireInteraction: true, // Mantiene la notificación visible
    data: payload.data || {},
    silent: false, // Asegura que se reproduzca el sonido
    vibrate: [200, 100, 200], // Vibración para Android
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  // Agregar sonido solo si está disponible
  if (payload.notification.sound) {
    notificationOptions.sound = payload.notification.sound;
  }

  return self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});

// Manejar clics en la notificación
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Abrir la aplicación
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Manejar instalación del service worker
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Manejar activación del service worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
}); 