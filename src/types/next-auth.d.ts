import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      role?: string;
      dentistId?: string;
      patientId?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // agrega aquí cualquier otro campo custom que uses
    }
  }
  interface User {
    id: string;
    role: string;
    dentistId?: string;
    patientId?: string;
    // agrega aquí cualquier otro campo custom que uses
  }
} 