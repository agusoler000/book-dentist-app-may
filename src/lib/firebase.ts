import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export function requestFirebaseNotificationPermission() {
  return Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      return getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: window.navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
      });
    }
    throw new Error('Notification permission not granted');
  });
}

export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
} 