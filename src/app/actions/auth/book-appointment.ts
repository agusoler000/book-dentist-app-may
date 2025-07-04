"use server";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { sendPushNotificationWithPreferences } from "@/lib/send-push";
import { getAppointmentBookedNotificationText, getNewAppointmentNotificationText } from "@/lib/push-notifications";
import { getUserLocale } from "@/lib/get-user-locale";

export type BookAppointmentInput = {
  patientId: string;
  dentistId: string;
  date: string;
  time: string;
  notes?: string;
  serviceName: string;
  durationMinutes: any;
};

export async function bookAppointmentAction(data: BookAppointmentInput) {
  try {
    console.log("🔵 Iniciando creación de cita:", { patientId: data.patientId, dentistId: data.dentistId });
    
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        dentistId: data.dentistId,
        date: new Date(data.date),
        time: data.time,
        notes: data.notes,
        serviceName: data.serviceName,
        status: 'PENDING',
        durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : 30,
      },
    });
    console.log("✅ Cita creada:", appointment.id);

    // Obtener datos de paciente y dentista para personalizar la notificación
    console.log("🔍 Buscando datos de paciente y dentista...");
    const [patient, dentist] = await Promise.all([
      prisma.patient.findUnique({ where: { id: data.patientId }, include: { user: true } }),
      prisma.dentist.findUnique({ where: { id: data.dentistId }, include: { user: true } }),
    ]);
    
    console.log("📋 Datos encontrados:", {
      patient: patient ? { id: patient.id, userId: patient.userId, userName: patient.user?.name } : null,
      dentist: dentist ? { id: dentist.id, userId: dentist.userId, userName: dentist.user?.name } : null
    });
    
    const fecha = new Date(data.date).toLocaleDateString();
    const hora = data.time;
    
    // Notificación para el paciente
    if (patient && dentist) {
      console.log("🔔 Creando notificación para paciente...");
      try {
        await prisma.notification.create({
          data: {
            userId: patient.userId,
            type: 'APPOINTMENT',
            title: 'Cita agendada',
            message: `Tu cita con el Dr. ${dentist.user?.name || 'Dentista'} fue agendada para el ${fecha} a las ${hora}.`,
            link: '/patient/dashboard',
            event: 'appointment',
          },
        });
        console.log("✅ Notificación para paciente creada");
        
        // Enviar notificación push al paciente
        const patientUser = await prisma.user.findUnique({ where: { id: patient.userId } });
        if (patientUser?.fcmToken) {
          const locale = await getUserLocale(patientUser.id);
          const { title, message } = getAppointmentBookedNotificationText(
            locale,
            dentist.user?.name || 'Dentista',
            fecha,
            hora
          );
          await sendPushNotificationWithPreferences(
            patientUser.id,
            patientUser.fcmToken,
            title,
            message,
            'appointment'
          );
        }
      } catch (notifError) {
        console.error("❌ Error creando notificación para paciente:", notifError);
      }
      
      // Notificación para el dentista
      console.log("🔔 Creando notificación para dentista...");
      try {
        await prisma.notification.create({
          data: {
            userId: dentist.userId,
            type: 'APPOINTMENT',
            title: 'Nueva cita asignada',
            message: `Tienes una nueva cita con ${patient.user?.name || 'Paciente'} el ${fecha} a las ${hora}.`,
            link: '/dentist/dashboard',
            event: 'appointment',
          },
        });
        console.log("✅ Notificación para dentista creada");
        
        // Enviar notificación push al dentista
        const dentistUser = await prisma.user.findUnique({ where: { id: dentist.userId } });
        if (dentistUser?.fcmToken) {
          const locale = await getUserLocale(dentistUser.id);
          const { title, message } = getNewAppointmentNotificationText(
            locale,
            patient.user?.name || 'Paciente',
            fecha,
            hora
          );
          await sendPushNotificationWithPreferences(
            dentistUser.id,
            dentistUser.fcmToken,
            title,
            message,
            'appointment'
          );
        }
      } catch (notifError) {
        console.error("❌ Error creando notificación para dentista:", notifError);
      }
    } else {
      console.log("⚠️ No se crearon notificaciones porque:", { patient: !!patient, dentist: !!dentist });
    }
    
    return { success: true, message: "Appointment booked successfully!" };
  } catch (error) {
    console.error("❌ Error general en bookAppointmentAction:", error);
    return { success: false, message: "Failed to book appointment." };
  }
} 