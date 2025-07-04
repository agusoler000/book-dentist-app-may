import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import PatientProfileViewClient from '@/components/patient/PatientProfileViewClient';
import { getUserAppointments } from '@/app/actions/auth/get-user-appointments';
import prisma from "@/lib/prisma";
import PatientProfilePageClient from './PatientProfilePageClient';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let profile: any = null;
  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (patient) {
      // Buscar el usuario para obtener name/email
      const user = await prisma.user.findUnique({ where: { id: userId } });
      profile = {
        id: patient.id,
        name: user?.name || '',
        email: user?.email || '',
        phone: patient.phone || '',
        dni: patient.dni,
        dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
      };
    }
  } else if (role === "DENTIST") {
    const dentist = await prisma.dentist.findUnique({ where: { userId } });
    if (dentist) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      profile = {
        id: dentist.id,
        name: user?.name || '',
        email: user?.email || '',
        phone: dentist.phone || '',
        specialty: dentist.specialty || '',
        isAvailableForEmergency: dentist.isAvailableForEmergency,
        profileImageUrl: dentist.profileImageUrl || '',
        bio: dentist.bio || '',
      };
    }
  }

  if (!profile) {
    return <div className="text-center text-red-500 mt-10">No data found</div>;
  }

  // Si es paciente, mostrar PatientProfileView con citas
  if (role === "PATIENT") {
    // Mapear las citas a tipo Appointment
    const rawAppointments = await getUserAppointments();
    const appointments = rawAppointments.map((app: any) => ({
      id: app.id,
      patientId: app.patientId,
      patientName: profile.name,
      dentistId: app.dentistId,
      dentistName: app.dentist?.user?.name || '',
      serviceId: app.serviceId,
      service: typeof app.service === 'string' ? app.service : app.service?.name || '',
      date: app.date instanceof Date ? app.date.toISOString().split('T')[0] : app.date,
      time: app.time,
      notes: app.notes,
      status: app.status,
    }));
    return <PatientProfilePageClient role={role} profile={profile} appointments={appointments} />;
  }

  // Si es dentista, mostrar una vista simple (no pasar 'patient' a PatientProfileView)
  return (
    <div className="space-y-6">
      <div className="text-center text-lg mt-10">Dentist loaded</div>
      <pre className="bg-muted p-4 rounded text-left overflow-x-auto">{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
