
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAppointments, mockPatients } from '@/lib/mock-data'; // Still using mock data for appointments
import type { AppointmentStatusType, Patient } from '@/lib/types';
import { CalendarCheck, UserCircle, ShieldAlert, PlusCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, isFuture } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PatientDashboardPage() {
  const { currentUser, userType, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && (!currentUser || userType !== 'patient')) {
      router.push('/login?role=patient');
    }
  }, [currentUser, userType, isLoadingAuth, router]);

  if (isLoadingAuth || !currentUser || userType !== 'patient') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  const currentPatient = currentUser as Omit<Patient, 'password' | 'appointments'>;


  const upcomingAppointments = mockAppointments // Real app: fetch from DB for currentPatient.id
    .filter(app => app.patientId === currentPatient.id && app.status === 'SCHEDULED' && isFuture(parseISO(app.date)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  
  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">
            Welcome, {currentPatient.name}!
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
            Manage your dental health with DentalFlow.
          </CardDescription>
        </CardHeader>
        {nextAppointment && (
           <CardContent className="pt-6">
             <h3 className="text-xl font-semibold mb-2 text-foreground">Your Next Appointment:</h3>
             <div className="p-4 border rounded-lg bg-secondary/30 space-y-1">
               <p className="font-medium text-secondary-foreground">
                 <CalendarCheck className="inline w-5 h-5 mr-2 text-accent" /> 
                 {format(parseISO(nextAppointment.date), 'EEEE, MMMM d, yyyy')} at {nextAppointment.time}
               </p>
               <p className="text-sm text-muted-foreground">With: {nextAppointment.dentistName}</p>
               <p className="text-sm text-muted-foreground">Service: {nextAppointment.service}</p>
             </div>
           </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Book New Appointment"
          description="Find a slot that works for you."
          icon={<PlusCircle className="w-8 h-8 text-accent" />}
          link="/patient/book-appointment"
          linkText="Schedule Now"
        />
        <DashboardCard
          title="My Profile"
          description="View and manage your personal details."
          icon={<UserCircle className="w-8 h-8 text-accent" />}
          link="/patient/profile"
          linkText="View Profile"
        />
        <DashboardCard
          title="Emergency Care"
          description="Find dentists available for urgent needs."
          icon={<ShieldAlert className="w-8 h-8 text-accent" />}
          link="/patient/emergencies"
          linkText="Find Help"
        />
      </div>
      
      {upcomingAppointments.length > 0 && ( // Show all if any, next is already highlighted
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><Clock className="w-6 h-6 mr-2 text-accent"/>All Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingAppointments.map(app => (
                <li key={app.id} className="p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors">
                  <p className="font-semibold">{format(parseISO(app.date), 'MMMM d, yyyy')} at {app.time} - {app.service}</p>
                  <p className="text-sm text-muted-foreground">With {app.dentistName}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
       {upcomingAppointments.length === 0 && !nextAppointment && (
         <Card className="shadow-md">
            <CardContent className="pt-6 text-center text-muted-foreground">
                You have no upcoming appointments.
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
