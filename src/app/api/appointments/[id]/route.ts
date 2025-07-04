// @ts-nocheck
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { sendPushNotificationWithPreferences } from '@/lib/send-push';
import { getAppointmentCancelledNotificationText } from '@/lib/push-notifications';
import { getUserLocale } from '@/lib/get-user-locale';

export async function PATCH(req: NextRequest, { params }: { params:  any }) {
  const id = params.id;
  if (!id) return NextResponse.json({ success: false, error: 'Missing appointment id' }, { status: 400 });
  const data = await req.json();
  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.notes) updateData.notes = data.notes;
  if (data.justification) updateData.notes = (updateData.notes ? updateData.notes + '\n' : '') + '[Cancelación]: ' + data.justification;
  if (data.durationMinutes) updateData.durationMinutes = data.durationMinutes;
  // Otros campos editables...
  try {
    const updated = await prisma.appointment.update({ where: { id }, data: updateData });
    // Si la cita fue cancelada, notificar al paciente
    if (updateData.status === 'CANCELLED') {
      // Buscar datos completos de la cita, paciente y dentista
      const fullAppointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          patient: { include: { user: true } },
          dentist: { include: { user: true } },
        },
      });
      if (fullAppointment && fullAppointment.patient?.user) {
        let motivo = data.justification ? ` Motivo: ${data.justification}` : '';
        await prisma.notification.create({
          data: {
            userId: fullAppointment.patient.userId,
            type: 'appointment',
            event: 'appointment', // <-- para que el toast se muestre
            title: 'Cita cancelada',
            message: `Tu cita con el Dr. ${fullAppointment.dentist?.user?.name || 'Dentista'} fue cancelada.${motivo}`,
            link: '/patient/dashboard',
          }
        });
        
        // Enviar notificación push al paciente
        const patientUser = await prisma.user.findUnique({ where: { id: fullAppointment.patient.userId } });
        if (patientUser?.fcmToken) {
          const locale = await getUserLocale(patientUser.id);
          const { title, message } = getAppointmentCancelledNotificationText(
            locale,
            fullAppointment.dentist?.user?.name || 'Dentista',
            data.justification || ''
          );
          await sendPushNotificationWithPreferences(
            patientUser.id,
            patientUser.fcmToken,
            title,
            message,
            'statusChange'
          );
        }
      }
    }
    return NextResponse.json({ success: true, appointment: updated });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Error updating appointment' }, { status: 500 });
  }
} 