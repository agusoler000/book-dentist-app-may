import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, UserCog, ShieldCheck, Clock, Users, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { getCurrentUserProfile } from '@/app/actions/auth/get-current-user-profile';
import { getUserAppointments } from '@/app/actions/auth/get-user-appointments';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DentistDashboardClient from './DentistDashboardClient';

// Utilidad para robustez de fechas
function getDateObj(date: string | Date) {
  return typeof date === 'string' ? parseISO(date) : date;
}

export default async function DentistDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "DENTIST") {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== 'DENTIST') {
    redirect('/login?role=dentist');
  }
  const appointments = await getUserAppointments();
  const currentDentist = profile.dentist;

  // Citas de hoy
  const todayAppointments = appointments
    .filter(app => isToday(getDateObj(app.date)) && app.status === 'SCHEDULED')
    .sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());

  // Citas próximas
  const upcomingAppointmentsCount = appointments
    .filter(app => isFuture(getDateObj(app.date)) && app.status === 'SCHEDULED')
    .length;

  const isAvailableForEmergency = currentDentist?.isAvailableForEmergency;

  return <DentistDashboardClient profile={profile} appointments={appointments} />;
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
  disabled?: boolean;
}

function DashboardCard({ title, description, icon, link, linkText, disabled = false }: DashboardCardProps) {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardContent className="mt-auto">
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={disabled}>
          <Link href={disabled ? '#' : link}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
