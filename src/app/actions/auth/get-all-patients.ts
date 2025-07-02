"use server";
import prisma from "@/lib/prisma";

export async function getAllPatients() {
  return await prisma.patient.findMany({
    include: {
      user: true,
    },
    orderBy: { user: { name: "asc" } },
  });
} 