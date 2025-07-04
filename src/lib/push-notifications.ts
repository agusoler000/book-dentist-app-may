import enTranslations from '@/translations/en.json';
import esTranslations from '@/translations/es.json';

type Locale = 'en' | 'es';

interface PushNotificationTranslation {
  title: string;
  message: string;
}

interface AppointmentTranslations {
  booked: PushNotificationTranslation;
  new: PushNotificationTranslation;
  cancelled: PushNotificationTranslation;
}

interface EmergencyTranslations {
  title: string;
  message: string;
}

interface PushNotificationTranslations {
  emergency: EmergencyTranslations;
  appointment: AppointmentTranslations;
}

const translations: Record<Locale, any> = {
  en: enTranslations,
  es: esTranslations,
};

// Función para obtener traducción de notificación push
export function getPushNotificationText(
  locale: Locale,
  type: 'emergency' | 'appointment',
  subtype: 'booked' | 'new' | 'cancelled',
  params: Record<string, string>
): { title: string; message: string } {
  const translation = translations[locale]?.pushNotifications?.[type]?.[subtype] || 
                     translations['en']?.pushNotifications?.[type]?.[subtype] ||
                     { title: '', message: '' };

  let title = translation.title || '';
  let message = translation.message || '';

  // Reemplazar parámetros en el título y mensaje
  Object.entries(params).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    title = title.replace(regex, value);
    message = message.replace(regex, value);
  });

  return { title, message };
}

// Función específica para emergencias
export function getEmergencyNotificationText(
  locale: Locale,
  name: string,
  dni: string,
  phone: string,
  description: string
): { title: string; message: string } {
  const translation = translations[locale]?.pushNotifications?.emergency || 
                     translations['en']?.pushNotifications?.emergency ||
                     { title: '', message: '' };

  let title = translation.title || '';
  let message = translation.message || '';

  // Reemplazar parámetros
  title = title.replace(/{name}/g, name)
               .replace(/{dni}/g, dni)
               .replace(/{phone}/g, phone)
               .replace(/{description}/g, description);
  
  message = message.replace(/{name}/g, name)
                   .replace(/{dni}/g, dni)
                   .replace(/{phone}/g, phone)
                   .replace(/{description}/g, description);

  return { title, message };
}

// Función específica para citas agendadas
export function getAppointmentBookedNotificationText(
  locale: Locale,
  dentistName: string,
  date: string,
  time: string
): { title: string; message: string } {
  return getPushNotificationText(locale, 'appointment', 'booked', {
    dentistName,
    date,
    time,
  });
}

// Función específica para nuevas citas asignadas
export function getNewAppointmentNotificationText(
  locale: Locale,
  patientName: string,
  date: string,
  time: string
): { title: string; message: string } {
  return getPushNotificationText(locale, 'appointment', 'new', {
    patientName,
    date,
    time,
  });
}

// Función específica para citas canceladas
export function getAppointmentCancelledNotificationText(
  locale: Locale,
  dentistName: string,
  reason: string = ''
): { title: string; message: string } {
  return getPushNotificationText(locale, 'appointment', 'cancelled', {
    dentistName,
    reason: reason ? ` Motivo: ${reason}` : '',
  });
} 