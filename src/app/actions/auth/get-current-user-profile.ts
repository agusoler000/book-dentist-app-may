"use server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      patient: true,
      dentist: true,
    },
  });
  if (!user) return null;
  if (user.role === "PATIENT") {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      patient: user.patient,
    };
  } else if (user.role === "DENTIST") {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      dentist: user.dentist,
    };
  }
  return null;
} 