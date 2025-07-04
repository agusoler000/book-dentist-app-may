import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import '@/lib/socket-server';
import { sendWhatsApp } from '@/lib/send-whatsapp';
import { sendPushNotificationWithPreferences } from '@/lib/send-push';
import { getEmergencyNotificationText } from '@/lib/push-notifications';
import { getUserLocale } from '@/lib/get-user-locale';

function emitSocketEvent(event: string) {
  // @ts-ignore
  if (globalThis.io) {
    globalThis.io.to('emergencies').emit('emergencies:update');
    if (event === 'notifications:update') {
      globalThis.io.to('notifications').emit('notifications:update');
    }
  }
}

export async function POST(req: Request, res: any) {
  let session = await getServerSession(authOptions);
  let body = await req.json();
  let { description, name, phone, dni, dentistId } = body;

  if (!description || !name || !dni) {
    return NextResponse.json({ success: false, error: "Description, name, and dni are required." }, { status: 400 });
  }

  let patientId: string | undefined = undefined;
  // Si está logueado como paciente, usa sus datos
  if (session && (session.user as any).role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: (session.user as any).id }, include: { user: true } });
    if (patient) {
      name = patient.user?.name || name;
      phone = patient.phone || phone;
      dni = patient.dni || dni;
      patientId = patient.id;
    }
  }

  const emergency = await prisma.emergency.create({
    data: {
      description,
      name,
      phone: phone || '',
      dni,
      status: 'PENDING',
      patientId,
      dentistId: dentistId && dentistId !== 'ALL' ? dentistId : undefined,
    },
  });

  if (dentistId && dentistId !== 'ALL') {
    // Notificar solo al dentista seleccionado
    const dentist = await prisma.dentist.findUnique({ where: { id: dentistId }, include: { user: true } });
    if (dentist && dentist.user) {
      await prisma.notification.create({
        data: {
          userId: dentist.userId,
          type: 'emergency',
          event: 'emergency',
          title: 'Nueva emergencia recibida',
          message: `¡Nueva urgencia! Paciente: ${name}, DNI: ${dni}, Tel: ${phone}. Descripción: ${description}`,
          link: '/dentist/dashboard',
        }
      });
      // Enviar notificación push si tiene fcmToken
      const user = await prisma.user.findUnique({ where: { id: dentist.userId } });
      if (user?.fcmToken) {
        const locale = await getUserLocale(user.id);
        const { title, message } = getEmergencyNotificationText(locale, name, dni, phone, description);
        await sendPushNotificationWithPreferences(
          user.id,
          user.fcmToken,
          title,
          message,
          'emergency'
        );
      }
      // Enviar WhatsApp si tiene teléfono
      console.log('[Depuración] Teléfono del dentista:', dentist.phone);
      if (dentist.phone) {
        await sendWhatsApp(
          dentist.phone,
          `Nueva urgencia:\nPaciente: ${name}\nDNI: ${dni}\nTel: ${phone}\nDescripción: ${description}`
        );
      }
    }
  } else {
    // Notificar a todos los dentistas disponibles para emergencias
    const dentists = await prisma.dentist.findMany({
      where: { isAvailableForEmergency: true },
      include: { user: true },
    });
    await Promise.all(dentists.map(async dentist => {
      await prisma.notification.create({
        data: {
          userId: dentist.userId,
          type: 'emergency',
          event: 'emergency',
          title: 'Nueva emergencia recibida',
          message: `¡Nueva urgencia! Paciente: ${name}, DNI: ${dni}, Tel: ${phone}. Descripción: ${description}`,
          link: '/dentist/dashboard',
        }
      });
      // Enviar notificación push si tiene fcmToken
      const user = await prisma.user.findUnique({ where: { id: dentist.userId } });
      if (user?.fcmToken) {
        const locale = await getUserLocale(user.id);
        const { title, message } = getEmergencyNotificationText(locale, name, dni, phone, description);
        await sendPushNotificationWithPreferences(
          user.id,
          user.fcmToken,
          title,
          message,
          'emergency'
        );
      }
      // Enviar WhatsApp si tiene teléfono
      console.log('[Depuración] Teléfono del dentista:', dentist.phone);
      if (dentist.phone) {
        await sendWhatsApp(
          dentist.phone,
          `Nueva urgencia:\nPaciente: ${name}\nDNI: ${dni}\nTel: ${phone}\nDescripción: ${description}`
        );
      }
    }));
  }

  // Emitir eventos de WebSocket
  if (global.io) {
    global.io.to('emergencies').emit('emergencies:update');
    global.io.to('notifications').emit('notifications:update');
  }

  return NextResponse.json({ success: true, emergency });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const mine = url.searchParams.get('mine');
  const patientId = url.searchParams.get('patientId');

  if (patientId) {
    // Buscar emergencias por patientId explícito
    const emergencies = await prisma.emergency.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, emergencies });
  }

  if (mine && session && (session.user as any).role === 'PATIENT') {
    // Emergencias del paciente logueado
    const patient = await prisma.patient.findUnique({ where: { userId: (session.user as any).id } });
    if (!patient) {
      return NextResponse.json({ success: true, emergencies: [] });
    }
    const emergencies = await prisma.emergency.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, emergencies });
  }
  if (!session || (session.user as any).role !== "DENTIST") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  // Buscar el perfil del dentista
  const dentist = await prisma.dentist.findUnique({ where: { userId } });
  if (!dentist) {
    return NextResponse.json({ success: false, error: "Dentist profile not found" }, { status: 404 });
  }
  // Emergencias PENDING o asignadas a este dentista (que no estén finalizadas)
  const emergencies = await prisma.emergency.findMany({
    where: {
      AND: [
        { status: { not: 'FINISHED' } },
        {
          OR: [
            { status: 'PENDING' },
            { dentistId: dentist.id }
          ]
        }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: { patient: { include: { user: true } }, dentist: true },
  });
  return NextResponse.json({ success: true, emergencies });
}
// Nota: Las notificaciones de tipo EMERGENCY ya se crean en el POST y deben ser resaltadas en la UI (color, ícono, etc). 