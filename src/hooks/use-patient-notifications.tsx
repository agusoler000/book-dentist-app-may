import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export function usePatientNotifications({ reloadEmergencies, reloadAppointments }: {
  reloadEmergencies: () => void,
  reloadAppointments: () => void,
}) {
  const lastNotificationId = useRef<string | null>(null);

  useEffect(() => {
    let interval: any;
    const fetchNotifications = async () => {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && data.notifications.length > 0) {
        const n = data.notifications[0];
        if (n.id !== lastNotificationId.current) {
          if (lastNotificationId.current !== null) {
            // Sonido
            if (typeof window !== 'undefined') {
              const audio = new Audio(n.event === 'emergency' ? '/emergency.mp3' : '/notification.mp3');
              audio.play();
            }
            // Toast visual
            toast({
              title: n.title,
              description: n.message,
              variant: n.event === 'emergency' ? 'destructive' : 'default',
            });
          }
          lastNotificationId.current = n.id;
          if (n.event === 'emergency') reloadEmergencies();
          if (n.event === 'appointment') reloadAppointments();
        }
      }
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [reloadEmergencies, reloadAppointments]);
} 