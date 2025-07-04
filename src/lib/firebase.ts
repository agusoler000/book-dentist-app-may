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
      resolve(payload);
    });
  });
} 