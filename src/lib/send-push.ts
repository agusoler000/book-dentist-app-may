import admin from 'firebase-admin';
import prisma from './prisma';

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

// Nueva función que verifica las preferencias del usuario
export async function sendPushNotificationWithPreferences(
  userId: string, 
  token: string, 
  title: string, 
  body: string, 
  notificationType: 'emergency' | 'appointment' | 'statusChange'
) {
  try {
    // Verificar las preferencias del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pushEmergencies: true,
        pushAppointments: true,
        pushStatusChanges: true,
      },
    });

    if (!user) {
      console.log('Usuario no encontrado, no se envía notificación push');
      return null;
    }

    // Verificar si el usuario tiene habilitado este tipo de notificación
    let shouldSend = false;
    switch (notificationType) {
      case 'emergency':
        shouldSend = user.pushEmergencies;
        break;
      case 'appointment':
        shouldSend = user.pushAppointments;
        break;
      case 'statusChange':
        shouldSend = user.pushStatusChanges;
        break;
    }

    if (!shouldSend) {
      console.log(`Notificación push de tipo ${notificationType} deshabilitada para el usuario ${userId}`);
      return null;
    }

    // Si está habilitada, enviar la notificación
    return await sendPushNotification(token, title, body);
  } catch (error) {
    console.error('Error verificando preferencias o enviando push:', error);
    throw error;
  }
} 