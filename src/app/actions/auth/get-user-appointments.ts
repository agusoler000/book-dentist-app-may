"use server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUserAppointments() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      patient: true,
      dentist: true,
    },
  });
  if (!user) return [];
  if (user.role === "PATIENT" && user.patient) {
    return await prisma.appointment.findMany({
      where: { patientId: user.patient.id },
      include: { dentist: { include: { user: true } } },
      orderBy: { date: "desc" },
    });
  } else if (user.role === "DENTIST" && user.dentist) {
    return await prisma.appointment.findMany({
      where: { dentistId: user.dentist.id },
      include: { patient: { include: { user: true } } },
      orderBy: { date: "desc" },
    });
  }
  return [];
} 