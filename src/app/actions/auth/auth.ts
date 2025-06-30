// src/app/auth/actions.ts
"use server";


import { hash, compare } from "bcrypt";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";  
export type SignupInput = {
  fullName:    string;
  email:       string;
  password:    string;
  accountType: "patient" | "dentist";
  phone?:      string;
  dob?:        string;
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

  // 2) Duplicaos
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
        ? { create: { phone: data.phone, dob: data.dob ? new Date(data.dob) : undefined } }
        : undefined,
      dentist:  data.accountType === "dentist"
        ? { create: { phone: data.phone, specialty: data.specialty, bio: data.bio } }
        : undefined,
    }
  });

  // 4) Redirige a /login
  redirect("/login");
}

export type LoginInput = {
  email:       string;
  password:    string;
  accountType: "patient" | "dentist";
};

export async function loginAction(data: LoginInput) {
  // 1) Validaciones
  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    return { success: false, message: "Invalid email address." };
  }
  if (!data.password) {
    return { success: false, message: "Password is required." };
  }
  if (!data.accountType) {
    return { success: false, message: "Account type is required." };
  }

  // 2) Buscar user
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || user.role.toLowerCase() !== data.accountType) {
    return { success: false, message: "Invalid credentials." };
  }

  // 3) Verificar contraseña
  const valid = await compare(data.password, user.password);
  if (!valid) {
    return { success: false, message: "Invalid credentials." };
  }

  // 4) Generar JWT y guardarlo
  const token = await signToken({ sub: user.id, role: user.role });
  (await cookies()).set({
    name:     "session",
    value:    token,
    httpOnly: true,
    path:     "/",
    maxAge:   60 * 60 * 24 * 7,
  });

  return {
    success:  true,
    user,
    userType: data.accountType,
    message:  "Login successful."
  };
}
