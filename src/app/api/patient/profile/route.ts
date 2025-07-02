import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "PATIENT") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { patient: true } });
  if (!user || !user.patient) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }
  const data = await req.json();
  const updates: any = {};
  const patientUpdates: any = {};

  // Campos editables
  if (typeof data.name === 'string') updates.name = data.name;
  if (typeof data.email === 'string' && data.email !== user.email) updates.email = data.email;
  if (typeof data.phone === 'string') patientUpdates.phone = data.phone;
  if (typeof data.dni === 'string') patientUpdates.dni = data.dni;
  if (typeof data.dateOfBirth === 'string') patientUpdates.dateOfBirth = new Date(data.dateOfBirth);

  // Cambiar contraseña o email requiere contraseña actual
  const wantsToChangePassword = data.password && data.password.length >= 6;
  const wantsToChangeEmail = data.email && data.email !== user.email;
  if (wantsToChangePassword || wantsToChangeEmail) {
    if (!data.currentPassword) {
      return NextResponse.json({ success: false, error: "Current password required" }, { status: 400 });
    }
    const valid = await compare(data.currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
    }
    if (wantsToChangePassword) {
      updates.password = await hash(data.password, 10);
    }
  }

  // Actualizar usuario y paciente
  if (Object.keys(updates).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: updates });
  }
  if (Object.keys(patientUpdates).length > 0) {
    await prisma.patient.update({ where: { userId }, data: patientUpdates });
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "PATIENT") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, patient });
} 