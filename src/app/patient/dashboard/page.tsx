// src/app/patient/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { mockAppointments, mockPatients } from '@/lib/mock-data';
import type { Appointment, Patient } from '@/lib/types';
import { format, parseISO, isFuture } from 'date-fns';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, UserCircle, ShieldAlert, PlusCircle, Clock } from 'lucide-react';

export default async function PatientDashboardPage() {
  // 1) Validar sesión en el servidor
  const session = await getServerSession(authOptions);
  console.log({session});
  
  if (!session || session.user.role !== 'PATIENT') {
    redirect('/login?role=patient');
  }



  // 3) Calcular citas próximas (mock)
  const upcomingAppointments: Appointment[] = mockAppointments
    .filter(app =>
      app.patientId === currentPatient.id &&
      app.status === 'SCHEDULED' &&
      isFuture(parseISO(app.date))
    )
    .sort((a, b) =>
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
  const nextAppointment = upcomingAppointments[0];

  // 4) Renderizar UI
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
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Your Next Appointment:
            </h3>
            <div className="p-4 border rounded-lg bg-secondary/30 space-y-1">
              <p className="font-medium text-secondary-foreground">
                <CalendarCheck className="inline w-5 h-5 mr-2 text-accent" />
                {format(parseISO(nextAppointment.date), 'EEEE, MMMM d, yyyy')} at {nextAppointment.time}
              </p>
              <p className="text-sm text-muted-foreground">
                With: {nextAppointment.dentistName}
              </p>
              <p className="text-sm text-muted-foreground">
                Service: {nextAppointment.service}
              </p>
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

      {upcomingAppointments.length > 0 ? (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-6 h-6 mr-2 text-accent" />
              All Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingAppointments.map(app => (
                <li
                  key={app.id}
                  className="p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors"
                >
                  <p className="font-semibold">
                    {format(parseISO(app.date), 'MMMM d, yyyy')} at {app.time} – {app.service}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    With {app.dentistName}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
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
