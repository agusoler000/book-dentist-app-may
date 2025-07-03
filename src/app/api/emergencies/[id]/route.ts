import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import '@/lib/socket-server';

function emitSocketEvent(event: string) {
  // @ts-ignore
  if (globalThis.io) {
    globalThis.io.to('emergencies').emit('emergencies:update');
    if (event === 'notifications:update') {
      globalThis.io.to('notifications').emit('notifications:update');
    }
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }, res: any) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "DENTIST") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const dentist = await prisma.dentist.findUnique({ where: { userId } });
  if (!dentist) {
    return NextResponse.json({ success: false, error: "Dentist profile not found" }, { status: 404 });
  }
  const { status } = await req.json();
  if (!['APPROVED', 'CANCELLED', 'FINISHED'].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }
  const emergency = await prisma.emergency.findUnique({ where: { id: params.id } });
  if (!emergency) {
    return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
  }
  // Solo puede aprobar si está pendiente, cancelar si está pendiente o asignada, finalizar si está asignada a él y está APPROVED
  const io = getIO(res);
  if (status === 'APPROVED') {
    try {
      const updated = await prisma.emergency.update({
        where: { id: params.id, status: 'PENDING' },
        data: { status, dentistId: dentist.id },
      });
      if (global.io) {
        global.io.to('emergencies').emit('emergencies:update');
        global.io.to('notifications').emit('notifications:update');
      }
      return NextResponse.json({ success: true, emergency: updated });
    } catch (e) {
      return NextResponse.json({ success: false, error: "Esta emergencia ya ha sido tomada por otro médico." }, { status: 409 });
    }
  } else if (status === 'CANCELLED') {
    if (emergency.status !== 'PENDING' && emergency.dentistId !== dentist.id) {
      return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
    }
    const updated = await prisma.emergency.update({
      where: { id: params.id },
      data: { status, dentistId: null },
    });
    if (global.io) {
      global.io.to('emergencies').emit('emergencies:update');
      global.io.to('notifications').emit('notifications:update');
    }
    return NextResponse.json({ success: true, emergency: updated });
  } else if (status === 'FINISHED') {
    if (emergency.status !== 'APPROVED' || emergency.dentistId !== dentist.id) {
      return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
    }
    const updated = await prisma.emergency.update({
      where: { id: params.id },
      data: { status },
    });
    if (global.io) {
      global.io.to('emergencies').emit('emergencies:update');
      global.io.to('notifications').emit('notifications:update');
    }
    return NextResponse.json({ success: true, emergency: updated });
  }
} 