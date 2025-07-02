"use server";
import prisma from "@/lib/prisma";

export async function getAllDentists() {
  return await prisma.dentist.findMany({
    include: {
      user: true,
    },
    orderBy: { user: { name: "asc" } },
  });
} 