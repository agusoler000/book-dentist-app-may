// src/lib/firebase.ts
let app: import('firebase/app').FirebaseApp | null = null;
let messaging: import('firebase/messaging').Messaging | null = null;

export async function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null;
  if (!app) {
    const { initializeApp } = await import('firebase/app');
    const { getMessaging } = await import('firebase/messaging');
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
    };
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  }
  return messaging;
}

export async function requestFirebaseNotificationPermission() {
  if (typeof window === 'undefined') return;
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const registration = await window.navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    const messaging = await getFirebaseMessaging();
    if (!messaging) throw new Error('No messaging');
    const { getToken } = await import('firebase/messaging');
    return getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: registration
    });
  }
  throw new Error('Notification permission not granted');
}

export async function onMessageListener() {
  if (typeof window === 'undefined') return;
  const messaging = await getFirebaseMessaging();
  if (!messaging) return;
  const { onMessage } = await import('firebase/messaging');
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      
      // Verificar que tenemos datos válidos
      if (!payload.notification || !payload.notification.title) {
        console.log('Invalid notification payload:', payload);
        return;
      }

      // Evitar duplicados usando el tag
      const notificationTag = 'coec-notification';
      const existingNotifications = document.querySelectorAll(`[data-notification-tag="${notificationTag}"]`);
      if (existingNotifications.length > 0) {
        console.log('Notification already exists, skipping...');
        return;
      }

      // Crear notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(payload.notification.title, {
          body: payload.notification.body || '',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: notificationTag,
          requireInteraction: true,
          data: payload.data || {}
        });

        // Manejar clic en la notificación
        notification.addEventListener('click', () => {
          notification.close();
          window.focus();
          if (payload.data?.url) {
            window.location.href = payload.data.url;
          }
        });

        // Reproducir sonido
        if (typeof window !== 'undefined') {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(err => console.log('Error playing audio:', err));
        }
      }

      resolve(payload);
    });
  });
} 