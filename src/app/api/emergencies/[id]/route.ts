import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
  if (status === 'APPROVED') {
    if (emergency.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
    }
    // Asignar dentista
    const updated = await prisma.emergency.update({
      where: { id: params.id },
      data: { status, dentistId: dentist.id },
    });
    return NextResponse.json({ success: true, emergency: updated });
  } else if (status === 'CANCELLED') {
    if (emergency.status !== 'PENDING' && emergency.dentistId !== dentist.id) {
      return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
    }
    const updated = await prisma.emergency.update({
      where: { id: params.id },
      data: { status, dentistId: null },
    });
    return NextResponse.json({ success: true, emergency: updated });
  } else if (status === 'FINISHED') {
    if (emergency.status !== 'APPROVED' || emergency.dentistId !== dentist.id) {
      return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
    }
    const updated = await prisma.emergency.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json({ success: true, emergency: updated });
  }
} 