// src/app/patient/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { mockAppointments, mockPatients } from '@/lib/mock-data';
import type { Appointment, Patient } from '@/lib/types';
import { format, parseISO, isFuture } from 'date-fns';
import Link from 'next/link';
import { getCurrentUserProfile } from '@/app/actions/auth/get-current-user-profile';
import { getUserAppointments } from '@/app/actions/auth/get-user-appointments';
import PatientDashboardClient from './PatientDashboardClient';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, UserCircle, ShieldAlert, PlusCircle, Clock } from 'lucide-react';

// Utilidad para robustez de fechas
function getDateObj(date: string | Date) {
  return typeof date === 'string' ? parseISO(date) : date;
}

export default async function PatientDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "PATIENT") {
    redirect("/login");
  }
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect("/login");
  }
  const appointments = await getUserAppointments();
  const currentPatient = profile.patient;

  // 3) Calcular citas próximas
  const upcomingAppointments = appointments
    .filter(app =>
      app.status === 'SCHEDULED' &&
      isFuture(getDateObj(app.date))
    )
    .sort((a, b) =>
      getDateObj(a.date).getTime() - getDateObj(b.date).getTime()
    );
  const nextAppointment = upcomingAppointments[0];

  // 4) Renderizar UI
  return <PatientDashboardClient profile={profile} appointments={appointments} />;
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}

function DashboardCard({ title, description, icon, link, linkText }: DashboardCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardContent className="mt-auto">
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href={link}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
