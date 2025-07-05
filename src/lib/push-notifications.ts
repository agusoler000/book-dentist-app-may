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

// Función para obtener traducción de notificación push con fallbacks
export function getPushNotificationText(
  locale: Locale,
  type: 'emergency' | 'appointment',
  subtype: 'booked' | 'new' | 'cancelled',
  params: Record<string, string>
): { title: string; message: string } {
  // Obtener traducción con fallbacks
  const translation = translations[locale]?.pushNotifications?.[type]?.[subtype] || 
                     translations['en']?.pushNotifications?.[type]?.[subtype] ||
                     { title: '', message: '' };

  // Valores por defecto si no hay traducción
  let title = translation.title || '';
  let message = translation.message || '';

  // Si no hay traducción, usar valores por defecto
  if (!title || !message) {
    switch (type) {
      case 'emergency':
        title = locale === 'es' ? 'Nueva emergencia recibida' : 'New emergency received';
        message = locale === 'es' ? 'Tienes una nueva emergencia dental' : 'You have a new dental emergency';
        break;
      case 'appointment':
        switch (subtype) {
          case 'booked':
            title = locale === 'es' ? 'Cita agendada' : 'Appointment booked';
            message = locale === 'es' ? 'Tu cita ha sido agendada exitosamente' : 'Your appointment has been successfully booked';
            break;
          case 'new':
            title = locale === 'es' ? 'Nueva cita asignada' : 'New appointment assigned';
            message = locale === 'es' ? 'Tienes una nueva cita asignada' : 'You have a new appointment assigned';
            break;
          case 'cancelled':
            title = locale === 'es' ? 'Cita cancelada' : 'Appointment cancelled';
            message = locale === 'es' ? 'Tu cita ha sido cancelada' : 'Your appointment has been cancelled';
            break;
        }
        break;
    }
  }

  // Reemplazar parámetros en el título y mensaje
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'undefined') {
      const regex = new RegExp(`{${key}}`, 'g');
      title = title.replace(regex, value);
      message = message.replace(regex, value);
    }
  });

  // Limpiar valores undefined restantes
  title = title.replace(/undefined/g, '').trim();
  message = message.replace(/undefined/g, '').trim();

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

  // Si no hay traducción, usar valores por defecto
  if (!title || !message) {
    title = locale === 'es' ? 'Nueva emergencia recibida' : 'New emergency received';
    message = locale === 'es' ? 'Tienes una nueva emergencia dental' : 'You have a new dental emergency';
  }

  // Reemplazar parámetros solo si no son undefined
  const safeName = name && name !== 'undefined' ? name : 'Paciente';
  const safeDni = dni && dni !== 'undefined' ? dni : 'N/A';
  const safePhone = phone && phone !== 'undefined' ? phone : 'N/A';
  const safeDescription = description && description !== 'undefined' ? description : 'Sin descripción';

  title = title.replace(/{name}/g, safeName)
               .replace(/{dni}/g, safeDni)
               .replace(/{phone}/g, safePhone)
               .replace(/{description}/g, safeDescription);
  
  message = message.replace(/{name}/g, safeName)
                   .replace(/{dni}/g, safeDni)
                   .replace(/{phone}/g, safePhone)
                   .replace(/{description}/g, safeDescription);

  // Limpiar valores undefined restantes
  title = title.replace(/undefined/g, '').trim();
  message = message.replace(/undefined/g, '').trim();

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
    dentistName: dentistName || 'Dr. Dentista',
    date: date || 'fecha por confirmar',
    time: time || 'hora por confirmar',
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
    patientName: patientName || 'Paciente',
    date: date || 'fecha por confirmar',
    time: time || 'hora por confirmar',
  });
}

// Función específica para citas canceladas
export function getAppointmentCancelledNotificationText(
  locale: Locale,
  dentistName: string,
  reason: string = ''
): { title: string; message: string } {
  return getPushNotificationText(locale, 'appointment', 'cancelled', {
    dentistName: dentistName || 'Dr. Dentista',
    reason: reason && reason !== 'undefined' ? ` Motivo: ${reason}` : '',
  });
} 