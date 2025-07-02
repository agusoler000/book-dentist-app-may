// src/app/auth/actions.ts
"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
export type SignupInput = {
  fullName:    string;
  email:       string;
  password:    string;
  accountType: "patient" | "dentist";
  phone?:      string;
  dni?:        string;
  dateOfBirth?: string;
  specialty?:  string;
  bio?:        string;
};

export async function signupAction(data: SignupInput) {
  // 1) Validaciones
  if (!data.fullName.trim()) {
    return { success: false, message: "Full name is required." };
  }
  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    return { success: false, message: "Invalid email address." };
  }
  if (!data.accountType) {
    return { success: false, message: "Account type is required." };
  }
  if (data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters." };
  }
  if (data.accountType === "patient") {
    if (!data.dni) return { success: false, message: "DNI is required for patients." };
    if (!data.dateOfBirth) return { success: false, message: "Date of birth is required for patients." };
  }

  // 2) Duplicados
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) {
    return { success: false, message: "That email is already registered." };
  }

  // 3) Crear user + perfil
  const hashed = await hash(data.password, 10);
  const roleUpper = data.accountType.toUpperCase() as "PATIENT" | "DENTIST";

  await prisma.user.create({
    data: {
      email:    data.email,
      password: hashed,
      name:     data.fullName,
      role:     roleUpper,
      patient:  data.accountType === "patient"
        ? { create: {
            phone: data.phone,
            dni: data.dni!,
            dateOfBirth: new Date(data.dateOfBirth!),
          } }
        : undefined,
      dentist:  data.accountType === "dentist"
        ? { create: { phone: data.phone, specialty: data.specialty || "", bio: data.bio } }
        : undefined,
    }
  });

  // 4) Redirige a /login
  redirect("/login");
}
