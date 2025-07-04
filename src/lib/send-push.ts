import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
    }),
  });
}

function isIosToken(token: string) {
  // Safari PWA tokens suelen ser más cortos y empiezan con 'APA91b', pero esto es heurístico
  return token.startsWith('APA91') && token.length < 200;
}

export async function sendPushNotification(token: string, title: string, body: string) {
  try {
    console.log('Enviando push a token:', token);
    let message: any;
    if (isIosToken(token)) {
      // Payload simple para iOS (Safari PWA)
      message = {
        token,
        notification: {
          title,
          body,
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
          },
        },
      };
    } else {
      // Payload completo para Android y otros
      message = {
        token,
        notification: {
          title,
          body,
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            sound: '/notification.mp3',
          },
        },
      };
    }
    const res = await admin.messaging().send(message);
    console.log('Push enviado correctamente:', res);
    return res;
  } catch (err) {
    console.error('Error enviando push:', err);
    throw err;
  }
} 