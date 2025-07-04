import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import '@/lib/socket-server';
import { sendPushNotificationWithPreferences } from '@/lib/send-push';
import { getAppointmentBookedNotificationText, getNewAppointmentNotificationText } from '@/lib/push-notifications';
import { getUserLocale } from '@/lib/get-user-locale';

export async function POST(req: Request, res: any) {
  const session = await getServerSession(authOptions);
  const formData = await req.formData();
  const userPatientId = formData.get('patientId'); // User.id
  const userDentistId = formData.get('dentistId'); // User.id
  const serviceName = formData.get('serviceName');
  const date = formData.get('date');
  const time = formData.get('time');
  const notes = formData.get('notes');
  const durationMinutes = formData.get('durationMinutes');
  if (!userPatientId || !userDentistId || !serviceName || !date || !time) {
    return NextResponse.json({ success: false, message: 'All fields are required.' });
  }
  // Buscar el perfil Patient y Dentist
  const patient = await prisma.patient.findUnique({ where: { userId: String(userPatientId) } });
  // CAMBIO: buscar por id, no por userId, porque el formulario envía el id de la tabla Dentist
  const dentist = await prisma.dentist.findUnique({ where: { id: String(userDentistId) } });
  if (!patient) {
    return NextResponse.json({ success: false, message: 'Patient profile not found.' });
  }
  if (!dentist) {
    return NextResponse.json({ success: false, message: 'Dentist profile not found.' });
  }
  try {
    let status: AppointmentStatus = AppointmentStatus.PENDING;
    if (session && session.user && (session.user as any).role === 'DENTIST') {
      status = AppointmentStatus.SCHEDULED;
    }
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        dentistId: dentist.id,
        serviceName: String(serviceName),
        date: new Date(String(date)),
        time: String(time),
        notes: notes ? String(notes) : undefined,
        status,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 30,
      },
    });

    // Obtener datos completos de paciente y dentista para personalizar la notificación
    const [patientWithUser, dentistWithUser] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patient.id }, include: { user: true } }),
      prisma.dentist.findUnique({ where: { id: dentist.id }, include: { user: true } }),
    ]);
    
    const fecha = new Date(String(date)).toLocaleDateString();
    const hora = String(time);
    
    // Notificación para el paciente
    if (patientWithUser && dentistWithUser) {
      try {
        await prisma.notification.create({
          data: {
            userId: patientWithUser.userId,
            type: 'appointment',
            event: 'appointment',
            title: 'Cita agendada',
            message: `Tu cita con el Dr. ${dentistWithUser.user?.name || 'Dentista'} fue agendada para el ${fecha} a las ${hora}.`,
            link: '/patient/dashboard',
          },
        });
        
        // Enviar notificación push al paciente
        const patientUser = await prisma.user.findUnique({ where: { id: patientWithUser.userId } });
        if (patientUser?.fcmToken) {
          const locale = await getUserLocale(patientUser.id);
          const { title, message } = getAppointmentBookedNotificationText(
            locale,
            dentistWithUser.user?.name || 'Dentista',
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
      try {
        await prisma.notification.create({
          data: {
            userId: dentistWithUser.userId,
            type: 'appointment',
            event: 'appointment',
            title: 'Nueva cita asignada',
            message: `Tienes una nueva cita con ${patientWithUser.user?.name || 'Paciente'} el ${fecha} a las ${hora}.`,
            link: '/dentist/dashboard',
          },
        });
        
        // Enviar notificación push al dentista
        const dentistUser = await prisma.user.findUnique({ where: { id: dentistWithUser.userId } });
        if (dentistUser?.fcmToken) {
          const locale = await getUserLocale(dentistUser.id);
          const { title, message } = getNewAppointmentNotificationText(
            locale,
            patientWithUser.user?.name || 'Paciente',
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
    }

    // Emitir eventos de WebSocket
    if (global.io) {
      global.io.to('appointments').emit('appointments:update');
      global.io.to('notifications').emit('notifications:update');
    }

    return NextResponse.json({ success: true, message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error("❌ Error general en POST /api/appointments:", error);
    return NextResponse.json({ success: false, message: 'Failed to book appointment.' });
  }
}

// Función para completar citas pasadas
async function completePastAppointments() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  await prisma.appointment.updateMany({
    where: {
      status: 'SCHEDULED',
      date: { lt: today },
    },
    data: { status: 'COMPLETED' },
  });
}

// GET: /api/appointments?dentistId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine');
  const dentistId = searchParams.get('dentistId');
  const session = await getServerSession(authOptions);

  if (mine && session && (session.user as any).role === 'PATIENT') {
    // Citas del paciente logueado
    const patient = await prisma.patient.findUnique({ where: { userId: (session.user as any).id } });
    if (!patient) {
      return NextResponse.json({ success: true, appointments: [] });
    }
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { dentist: { include: { user: true } } },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, appointments });
  }

  if (dentistId) {
    try {
      await completePastAppointments();
      const appointments = await prisma.appointment.findMany({
        where: { dentistId },
        include: { patient: { include: { user: true } } },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json({ success: true, appointments });
    } catch (error) {
      console.error('API GET /api/appointments error:', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch appointments.' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
} 