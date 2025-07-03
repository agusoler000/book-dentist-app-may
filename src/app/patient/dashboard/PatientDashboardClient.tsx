'use client';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, UserCircle, ShieldAlert, PlusCircle, Clock, Bell } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import EmergencyForm from '@/components/patient/EmergencyForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { usePatientNotifications } from '@/hooks/use-patient-notifications';

function getDateObj(date: string | Date) {
  return typeof date === 'string' ? parseISO(date) : date;
}

function DashboardCard({ title, description, icon, link, linkText }: any) {
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

export default function PatientDashboardClient({ profile, appointments }: any) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);
  const [appointmentsState, setAppointmentsState] = useState<any[]>(appointments);
  const currentPatient = profile.patient;
  const upcomingAppointments = appointmentsState
    .filter((app: any) => {
      if (!app.date) return false;
      return app.status === 'SCHEDULED' && getDateObj(app.date) >= new Date();
    })
    .sort((a: any, b: any) => getDateObj(a.date).getTime() - getDateObj(b.date).getTime());
  const nextAppointment = upcomingAppointments[0];

  const reloadEmergencies = () => {
    setLoadingEmergencies(true);
    const patientId = session?.user?.patientId;
    let url = '/api/emergencies?mine=1';
    if (patientId) {
      url = `/api/emergencies?patientId=${patientId}`;
    }
    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.emergencies)) setEmergencies(data.emergencies);
        else setEmergencies([]);
        setLoadingEmergencies(false);
      })
      .catch(() => {
        setEmergencies([]);
        setLoadingEmergencies(false);
      });
  };
  const reloadAppointments = () => {
    fetch('/api/appointments?mine=1')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointmentsState(data.appointments);
      });
  };
  usePatientNotifications({ reloadEmergencies, reloadAppointments });

  useEffect(() => {
    if (session) {
      reloadEmergencies();
    }
  }, [session]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">
            {t('patientDashboard.welcome', { name: currentPatient?.name || profile.name })}
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
            {t('patientDashboard.description')}
          </CardDescription>
        </CardHeader>
        {nextAppointment && (
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {t('patientDashboard.nextAppointment')}
            </h3>
            <div className="p-4 border rounded-lg bg-secondary/30 space-y-1">
              <p className="font-medium text-secondary-foreground">
                <CalendarCheck className="inline w-5 h-5 mr-2 text-accent" />
                {format(getDateObj(nextAppointment.date), 'EEEE, MMMM d, yyyy')} {t('patientDashboard.at')} {nextAppointment.time}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('patientDashboard.withDentist', { name: nextAppointment.dentist?.user?.name || t('patientDashboard.dentist') })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('patientDashboard.service', { name: nextAppointment.serviceName })}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title={t('patientDashboard.bookNewAppointment')}
          description={t('patientDashboard.bookNewAppointmentDesc')}
          icon={<PlusCircle className="w-8 h-8 text-accent" />}
          link="/patient/book-appointment"
          linkText={t('patientDashboard.scheduleNow')}
        />
        <DashboardCard
          title={t('patientDashboard.myProfile')}
          description={t('patientDashboard.myProfileDesc')}
          icon={<UserCircle className="w-8 h-8 text-accent" />}
          link="/patient/profile"
          linkText={t('patientDashboard.viewProfile')}
        />
        <DashboardCard
          title={t('patientDashboard.emergencyCare')}
          description={t('patientDashboard.emergencyCareDesc')}
          icon={<ShieldAlert className="w-8 h-8 text-accent" />}
          link="/patient/emergencies"
          linkText={t('patientDashboard.findHelp')}
        />
        <DashboardCard
          title={t('notifications.title')}
          description={t('patientDashboard.notificationsDesc')}
          icon={<Bell className="w-8 h-8 text-accent" />}
          link="/notifications"
          linkText={t('notifications.seeAll')}
        />
      </div>
      {upcomingAppointments.length > 0 ? (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-6 h-6 mr-2 text-accent" />
              {t('patientDashboard.allUpcomingAppointments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingAppointments.map((app: any) => (
                <li
                  key={app.id}
                  className="p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors"
                >
                  <p className="font-semibold">
                    {format(getDateObj(app.date), 'MMMM d, yyyy')} {t('patientDashboard.at')} {app.time} – {app.serviceName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('patientDashboard.withDentist', { name: app.dentist?.user?.name || t('patientDashboard.dentist') })}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center text-muted-foreground">
            {t('patientDashboard.noUpcomingAppointments')}
          </CardContent>
        </Card>
      )}

      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-accent" />
            {t('patientDashboard.myEmergencies')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="emergency-form">
              <AccordionTrigger>{t('patientDashboard.requestEmergency')}</AccordionTrigger>
              <AccordionContent>
                <EmergencyForm onSuccess={() => {
                  setLoadingEmergencies(false);
                  fetch('/api/emergencies?mine=1', { credentials: 'include' })
                    .then(res => res.json())
                    .then(data => {
                      console.log(data);
                      if (data.success) setEmergencies(data.emergencies);
                      setLoadingEmergencies(false);
                    });
                }} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {loadingEmergencies ? (
            <div className="text-center text-muted-foreground">{t('loading')}</div>
          ) : emergencies.length === 0 ? (
            <div className="text-center text-muted-foreground">{t('patientDashboard.noEmergencies')}</div>
          ) : (
            <ul className="space-y-3 mt-4">
              {emergencies.map((em: any) => (
                <li key={em.id} className={`p-3 border rounded-md flex flex-col gap-1 ${em.status === 'PENDING' ? 'bg-red-50 border-red-400' : 'bg-background'}`}>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${em.status === 'PENDING' ? 'text-red-600 animate-pulse' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-red-700">{t(`emergencyStatus.${em.status.toLowerCase()}`)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(em.createdAt).toLocaleString()}</span>
                  </div>
                  <div><span className="font-medium">{t('publicEmergency.description')}:</span> {em.description}</div>
                  <div><span className="font-medium">{t('publicEmergency.status')}:</span> {t(`emergencyStatus.${em.status.toLowerCase()}`)}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 