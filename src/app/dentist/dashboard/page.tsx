
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAppointments, mockDentists } from '@/lib/mock-data'; // Appointments and dentists from mock
import type { Dentist } from '@/lib/types';
import { CalendarDays, UserCog, ShieldCheck, Clock, Users, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DentistDashboardPage() {
  const { t } = useLanguage();
  const { currentUser, userType, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && (!currentUser || userType !== 'dentist')) {
      router.push('/login?role=dentist');
    }
  }, [currentUser, userType, isLoadingAuth, router]);

  if (isLoadingAuth || !currentUser || userType !== 'dentist') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  const currentDentist = currentUser as Omit<Dentist, 'password' | 'appointments'>;

  // Real app: fetch appointments from DB for currentDentist.id
  const todayAppointments = mockAppointments
    .filter(app => app.dentistId === currentDentist.id && isToday(parseISO(app.date)) && app.status === 'SCHEDULED')
    .sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());
  
  const upcomingAppointmentsCount = mockAppointments
    .filter(app => app.dentistId === currentDentist.id && isFuture(parseISO(app.date)) && app.status === 'SCHEDULED')
    .length;
  
  // Emergency status should ideally come from the currentUser object fetched from DB
  // For now, find the corresponding mock dentist to get this status or default it.
  const mockDentistDetails = mockDentists.find(d => d.id === currentDentist.id);
  const isAvailableForEmergency = mockDentistDetails ? mockDentistDetails.isAvailableForEmergency : currentDentist.isAvailableForEmergency;


  const emergencyStatusText = isAvailableForEmergency 
    ? "You are currently listed as AVAILABLE for emergencies." 
    : "You are currently NOT listed for emergencies.";
  const emergencyStatusColor = isAvailableForEmergency ? "text-green-600" : "text-red-600";

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">
            Welcome, {currentDentist.name}!
          </CardTitle>
          <CardDescription className={`text-primary-foreground/80 mix-blend-multiply font-medium ${emergencyStatusColor}`}>
            <ShieldCheck className="inline w-5 h-5 mr-1" /> {emergencyStatusText}
          </CardDescription>
        </CardHeader>
         <CardContent className="pt-6">
           <h3 className="text-xl font-semibold mb-2 text-foreground">Quick Overview</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="font-medium text-secondary-foreground flex items-center"><Clock className="w-5 h-5 mr-2 text-accent"/> Appointments Today</p>
                <p className="text-3xl font-bold text-accent">{todayAppointments.length}</p>
            </div>
            <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="font-medium text-secondary-foreground flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-accent"/> Total Upcoming</p>
                <p className="text-3xl font-bold text-accent">{upcomingAppointmentsCount}</p>
            </div>
           </div>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="View Schedule"
          description="Manage your appointments and calendar."
          icon={<CalendarDays className="w-8 h-8 text-accent" />}
          link="/dentist/schedule"
          linkText="Open Schedule"
        />
        <DashboardCard
          title="My Profile"
          description="Update your details and emergency status."
          icon={<UserCog className="w-8 h-8 text-accent" />}
          link="/dentist/profile"
          linkText="Manage Profile"
        />
        <DashboardCard
          title={t('dentistDashboard.registerPatient.title')}
          description={t('dentistDashboard.registerPatient.description')}
          icon={<UserPlus className="w-8 h-8 text-accent" />}
          link="/dentist/register-patient"
          linkText={t('dentistDashboard.registerPatient.linkText')}
        />
         <DashboardCard
          title="Patient Records"
          description="Access patient information (mock feature)."
          icon={<Users className="w-8 h-8 text-accent" />}
          link="#" // Placeholder, no actual patient record page
          linkText="View Patients"
          disabled={true}
        />
      </div>
      
      {todayAppointments.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><Clock className="w-6 h-6 mr-2 text-accent"/>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {todayAppointments.map(app => (
                <li key={app.id} className="p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors">
                  <p className="font-semibold">{app.time} - {app.service}</p>
                  <p className="text-sm text-muted-foreground">Patient: {app.patientName}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {todayAppointments.length === 0 && (
         <Card className="shadow-md">
            <CardContent className="pt-6 text-center text-muted-foreground">
                You have no appointments scheduled for today.
            </CardContent>
         </Card>
       )}


    </div>
  );
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
