// src/app/patient/layout.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect }         from "next/navigation";
import type { ReactNode }    from "react";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "PATIENT") {
    redirect("/login");
  }
  // Si pasamos el check, renderiza la UI normal del paciente
  return <>{children}</>;
}
