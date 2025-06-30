// src/app/patient/layout.tsx
import { getServerSession } from "next-auth/next";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { redirect }         from "next/navigation";
import type { ReactNode }    from "react";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const session:any = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    console.log({session});
    
    // si no hay sesión o no es paciente redirige
    redirect("/login?role=patient");
  }
  // Si pasamos el check, renderiza la UI normal del paciente
  return <>{children}</>;
}
