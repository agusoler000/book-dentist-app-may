import { useEffect, useRef } from 'react';
import { onMessageListener } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export function usePushNotifications() {
  const lastNotificationId = useRef<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupPushNotifications = async () => {
      try {
        // Configurar listener para notificaciones en primer plano
        const messageListener = await onMessageListener();
        if (messageListener) {
          unsubscribe = messageListener;
        }
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    setupPushNotifications();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Función para mostrar toast de notificación
  const showNotificationToast = (title: string, message: string, type: 'emergency' | 'appointment' = 'appointment') => {
    // Evitar duplicados usando el contenido como identificador
    const notificationId = `${title}-${message}-${Date.now()}`;
    
    if (lastNotificationId.current === notificationId) {
      return;
    }

    lastNotificationId.current = notificationId;

    toast({
      title: title || 'COEC Notificación',
      description: message || 'Tienes una nueva notificación',
      variant: type === 'emergency' ? 'destructive' : 'default',
    });

    // Reproducir sonido
    if (typeof window !== 'undefined') {
      const audio = new Audio(type === 'emergency' ? '/emergency.mp3' : '/notification.mp3');
      audio.play().catch(err => console.log('Error playing audio:', err));
    }
  };

  return { showNotificationToast };
} 