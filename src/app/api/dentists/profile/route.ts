import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "DENTIST") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const dentist = await prisma.dentist.findUnique({ where: { userId }, include: { user: true } });
  if (!dentist) {
    return NextResponse.json({ success: false, error: "Dentist profile not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    dentist: {
      id: dentist.id,
      isAvailableForEmergency: dentist.isAvailableForEmergency,
      specialty: dentist.specialty,
      user: { id: dentist.user.id, name: dentist.user.name, email: dentist.user.email }
    }
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "DENTIST") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { dentist: true } });
  if (!user || !user.dentist) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }
  const data = await req.json();
  const updates: any = {};
  const dentistUpdates: any = {};

  // Campos editables
  if (typeof data.name === 'string') updates.name = data.name;
  if (typeof data.email === 'string' && data.email !== user.email) updates.email = data.email;
  if (typeof data.phone === 'string') dentistUpdates.phone = data.phone;
  if (typeof data.specialty === 'string') dentistUpdates.specialty = data.specialty;
  if (typeof data.bio === 'string') dentistUpdates.bio = data.bio;
  // profileImageUrl: pendiente para upload real

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

  // Actualizar usuario y dentista
  if (Object.keys(updates).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: updates });
  }
  if (Object.keys(dentistUpdates).length > 0) {
    await prisma.dentist.update({ where: { userId }, data: dentistUpdates });
  }

  return NextResponse.json({ success: true });
} 