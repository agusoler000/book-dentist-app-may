import { useEffect, useRef } from 'react';

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