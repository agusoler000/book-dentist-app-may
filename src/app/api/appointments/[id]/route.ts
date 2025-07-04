import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "DENTIST") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const dentist = await prisma.dentist.findUnique({ where: { userId } });
  if (!dentist) {
    return NextResponse.json({ success: false, error: "Dentist profile not found" }, { status: 404 });
  }
  const { status, justification } = await req.json();
  if (!['SCHEDULED', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }
  // Solo puede aprobar si está pendiente y asignada a él
  // Puede cancelar si está pendiente o aprobada y asignada a él
  const appointment = await prisma.appointment.findUnique({ where: { id: params.id }, include: { patient: { include: { user: true } }, dentist: { include: { user: true } } } });
  if (!appointment || appointment.dentistId !== dentist.id) {
    return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
  }
  if (status === 'SCHEDULED' && appointment.status !== 'PENDING') {
    return NextResponse.json({ success: false, error: "Can only approve from PENDING" }, { status: 403 });
  }
  if (status === 'CANCELLED' && !['PENDING', 'SCHEDULED'].includes(appointment.status)) {
    return NextResponse.json({ success: false, error: "Can only cancel from PENDING or SCHEDULED" }, { status: 403 });
  }
  // Si cancela una cita aprobada, debe haber justificación
  let notes = appointment.notes || '';
  if (status === 'CANCELLED' && appointment.status === 'SCHEDULED') {
    if (!justification || justification.trim().length < 5) {
      return NextResponse.json({ success: false, error: "Justification required to cancel an approved appointment" }, { status: 400 });
    }
    notes += `\n[Cancelación justificada]: ${justification}`;
  }
  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status, notes },
  });
  // Notificar al paciente si el estado NO es COMPLETED
  if (status !== 'COMPLETED' && appointment.patient?.user) {
    let notifTitle = '';
    let notifMsg = '';
    if (status === 'SCHEDULED') {
      notifTitle = 'Cita aprobada';
      notifMsg = `Tu cita con el Dr. ${appointment.dentist?.user?.name || ''} fue aprobada.`;
    } else if (status === 'CANCELLED') {
      notifTitle = 'Cita cancelada';
      notifMsg = `Tu cita con el Dr. ${appointment.dentist?.user?.name || ''} fue cancelada.`;
    }
    if (notifTitle && notifMsg) {
      // Si es cancelación y hay justificación, inclúyela en el mensaje
      if (status === 'CANCELLED' && appointment.status === 'SCHEDULED' && justification) {
        notifMsg += ` Motivo: ${justification}`;
      }
      await prisma.notification.create({
        data: {
          userId: appointment.patient.user.id,
          type: 'APPOINTMENT',
          title: notifTitle,
          message: notifMsg,
          link: '/patient/dashboard',
          event: 'appointment',
        },
      });
    }
  }
  return NextResponse.json({ success: true, appointment: updated });
} 