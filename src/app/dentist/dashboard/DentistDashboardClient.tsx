'use client';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, UserCog, ShieldCheck, Clock, Users, UserPlus, AlertTriangle, Check, XCircle, Bell } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { useEffect, useState } from "react";
import { useDentistEmergencyState } from "@/context/global-store";
import { useToast } from '@/hooks/use-toast';
import { getSocket } from '@/lib/socket';
import { useDentistNotifications } from '@/hooks/use-dentist-notifications';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function getDateObj(date: string | Date) {
  return typeof date === 'string' ? parseISO(date) : date;
}

function DashboardCard({ title, description, icon, link, linkText, disabled = false }: any) {
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

export default function DentistDashboardClient({ profile, appointments, initialEmergencyAvailable }: any) {
  const setIsAvailable = useDentistEmergencyState(s => s.setIsAvailableForEmergency);
  const isAvailable = useDentistEmergencyState(s => s.isAvailableForEmergency);
  const { t, locale } = useLanguage();
  const currentDentist = profile.dentist;
  const [appointmentsState, setAppointmentsState] = useState<any[]>(appointments);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [rejectModal, setRejectModal] = useState<{ open: boolean, appointmentId: string | null }>({ open: false, appointmentId: null });
  const [rejectReason, setRejectReason] = useState('');

  const reloadEmergencies = () => {
    fetch('/api/emergencies', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmergencies(data.emergencies);
      });
  };
  const reloadAppointments = () => {
    fetch(`/api/appointments?dentistId=${currentDentist.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointmentsState(data.appointments);
      });
  };
  useDentistNotifications({ reloadEmergencies, reloadAppointments });

  useEffect(() => {
    setIsAvailable(initialEmergencyAvailable);
    const socket = getSocket();
    const fetchEmergencies = () => {
      fetch('/api/emergencies', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setEmergencies(data.emergencies);
        });
    };
    const fetchAppointments = () => {
      fetch(`/api/appointments?dentistId=${currentDentist.id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setAppointmentsState(data.appointments);
        });
    };
    fetchEmergencies();
    fetchAppointments();
    socket.emit('join', 'emergencies');
    socket.emit('join', 'appointments');
    socket.on('emergencies:update', fetchEmergencies);
    socket.on('appointments:update', fetchAppointments);
    return () => {
      socket.off('emergencies:update', fetchEmergencies);
      socket.off('appointments:update', fetchAppointments);
      socket.emit('leave', 'emergencies');
      socket.emit('leave', 'appointments');
    };
  }, [initialEmergencyAvailable, setIsAvailable, currentDentist.id]);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'CANCELLED' | 'FINISHED') => {
    setLoadingId(id);
    const res = await fetch(`/api/emergencies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.status === 409) {
      toast({
        title: t('dentistDashboard.emergency', {}),
        description: t('emergency.alreadyClaimed'),
        variant: 'destructive',
      });
    }
    // Refetch
    fetch('/api/emergencies')
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmergencies(data.emergencies);
      });
    setLoadingId(null);
  };

  const todayAppointments = appointmentsState
    .filter((app: any) => {
      if (!app.date) return false;
      return isToday(getDateObj(app.date)) && app.status === 'SCHEDULED';
    })
    .sort((a: any, b: any) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());
  const upcomingAppointmentsCount = appointmentsState
    .filter((app: any) => {
      if (!app.date) return false;
      return isFuture(getDateObj(app.date)) && app.status === 'SCHEDULED';
    })
    .length;

  // Citas pendientes
  const pendingAppointments = appointmentsState.filter((app: any) => app.status === 'PENDING');

  const handleAcceptAppointment = async (id: string) => {
    setLoadingId(id);
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SCHEDULED' }),
    });
    reloadAppointments();
    setLoadingId(null);
  };

  const handleRejectAppointment = async (id: string, reason: string) => {
    setLoadingId(id);
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED', justification: reason }),
    });
    reloadAppointments();
    setLoadingId(null);
  };

  function RejectAppointmentDialog({ appointmentId, onReject, loading, iconOnly }: { appointmentId: string, onReject: (id: string, reason: string) => void, loading: boolean, iconOnly?: boolean }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {iconOnly ? (
            <button
              type="button"
              aria-label={t('dentistDashboard.reject')}
              className="transition-colors p-1 rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 focus:outline-none"
              style={{ fontSize: 28, lineHeight: 1 }}
              disabled={loading}
              onClick={() => setOpen(true)}
            >
              <XCircle className="w-7 h-7" />
            </button>
          ) : (
            <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              <XCircle className="w-4 h-4 mr-1" /> {t('dentistDashboard.reject')}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dentistDashboard.rejectTitle')}</DialogTitle>
          </DialogHeader>
          <div>
            <label className="block mb-2 font-medium">{t('dentistDashboard.rejectReason')}</label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder={t('dentistDashboard.rejectReasonPlaceholder')} disabled={loading} />
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                if (reason.trim().length < 5) {
                  setError(t('dentistDashboard.rejectReasonValidation'));
                  return;
                }
                setError('');
                onReject(appointmentId, reason);
                setOpen(false);
              }}
            >
              {t('dentistDashboard.confirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function formatDateLocalized(date: Date, locale: string) {
    return locale === 'es'
      ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : format(date, 'MMMM d, yyyy');
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">
            {t('dentistDashboard.welcome', { name: profile.name })}
          </CardTitle>
          <CardDescription className={`text-primary-foreground/80 mix-blend-multiply font-medium ${isAvailable ? "text-green-600" : "text-red-600"}`}>
            <ShieldCheck className="inline w-5 h-5 mr-1" /> {isAvailable ? t('dentistDashboard.availableForEmergencies') : t('dentistDashboard.notAvailableForEmergencies')}
          </CardDescription>
        </CardHeader>
         <CardContent className="pt-6">
           <h3 className="text-xl font-semibold mb-2 text-foreground">{t('dentistDashboard.quickOverview')}</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="font-medium text-secondary-foreground flex items-center"><Clock className="w-5 h-5 mr-2 text-accent"/> {t('dentistDashboard.appointmentsToday')}</p>
                <p className="text-3xl font-bold text-accent">{todayAppointments.length}</p>
            </div>
            <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="font-medium text-secondary-foreground flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-accent"/> {t('dentistDashboard.totalUpcoming')}</p>
                <p className="text-3xl font-bold text-accent">{upcomingAppointmentsCount}</p>
            </div>
           </div>
         </CardContent>
      </Card>
      {/* Citas de hoy */}
      {todayAppointments.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><Clock className="w-6 h-6 mr-2 text-accent"/>{t('dentistDashboard.todaysAppointments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {todayAppointments.map((app: any) => (
                <li key={app.id} className="p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors">
                  <p className="font-semibold">{app.time} - {app.serviceName}</p>
                  <p className="text-sm text-muted-foreground">{t('dentistDashboard.patient')}: {app.patient?.user?.name || t('dentistDashboard.patient')}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {todayAppointments.length === 0 && (
         <Card className="shadow-md">
            <CardContent className="pt-6 text-center text-muted-foreground">
                {t('dentistDashboard.noAppointmentsToday')}
            </CardContent>
         </Card>
       )}
      {/* Próximas citas */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="w-6 h-6 mr-2 text-accent"/>{t('dentistDashboard.upcomingAppointments')}</CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsState.filter((app: any) => getDateObj(app.date) > new Date() && app.status === 'SCHEDULED')
            .sort((a: any, b: any) => getDateObj(a.date).getTime() - getDateObj(b.date).getTime())
            .length > 0 ? (
            <ul className="space-y-3">
              {appointmentsState.filter((app: any) => getDateObj(app.date) > new Date() && app.status === 'SCHEDULED')
                .sort((a: any, b: any) => getDateObj(a.date).getTime() - getDateObj(b.date).getTime())
                .map((app: any) => (
                  <li key={app.id} className="p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors">
                    <p className="font-semibold">{formatDateLocalized(getDateObj(app.date), locale)} {t('dentistDashboard.at')} {app.time} - {app.serviceName}</p>
                    <p className="text-base font-medium text-foreground">{t('dentistDashboard.patient')}: {app.patient?.user?.name || t('dentistDashboard.patient')}</p>
                    <p className="text-xs text-muted-foreground">{t('dentistDashboard.status')}: {t(`appointmentStatus.${app.status.toLowerCase()}`)}</p>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="pt-6 text-center text-muted-foreground">
              {t('dentistDashboard.noUpcomingAppointments')}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Citas pendientes */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-6 h-6 mr-2 text-accent" />
            {t('dentistDashboard.pendingAppointments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAppointments.length > 0 ? (
            <ul className="space-y-3">
              {pendingAppointments.map((app: any) => (
                <li key={app.id} className="p-3 border rounded-md bg-background flex items-center gap-2 justify-between">
                  <div>
                    <div className="text-lg font-bold text-foreground">{t('dentistDashboard.patient')}: {app.patient?.user?.name || t('dentistDashboard.patient')}</div>
                    <div className="text-base font-medium text-foreground">{formatDateLocalized(getDateObj(app.date), locale)} {t('dentistDashboard.at')} {app.time}</div>
                    <div className="text-sm font-medium text-foreground mt-2">{app.serviceName}</div>
                    {app.notes && (
                      <div className="text-xs text-muted-foreground mt-1 block">{app.notes}</div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleAcceptAppointment(app.id)}
                            aria-label={t('dentistDashboard.accept')}
                            className="transition-colors p-1 rounded-md text-green-600 hover:bg-green-100 hover:text-green-800 focus:outline-none"
                            style={{ fontSize: 28, lineHeight: 1 }}
                          >
                            <Check className="w-7 h-7" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{t('dentistDashboard.accept')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <RejectAppointmentDialog appointmentId={app.id} onReject={handleRejectAppointment} loading={loadingId === app.id} iconOnly />
                        </TooltipTrigger>
                        <TooltipContent>{t('dentistDashboard.reject')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pt-6 text-center text-muted-foreground">{t('dentistDashboard.noPendingAppointments')}</div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title={t('dentistDashboard.viewSchedule')}
          description={t('dentistDashboard.viewScheduleDesc')}
          icon={<CalendarDays className="w-8 h-8 text-accent" />}
          link="/dentist/schedule"
          linkText={t('dentistDashboard.openSchedule')}
        />
        <DashboardCard
          title={t('dentistDashboard.myProfile')}
          description={t('dentistDashboard.myProfileDesc')}
          icon={<UserCog className="w-8 h-8 text-accent" />}
          link="/dentist/profile"
          linkText={t('dentistDashboard.manageProfile')}
        />
        <DashboardCard
          title={t('dentistDashboard.registerPatient')}
          description={t('dentistDashboard.registerPatientDesc')}
          icon={<UserPlus className="w-8 h-8 text-accent" />}
          link="/dentist/register-patient"
          linkText={t('dentistDashboard.register')}
        />
        <DashboardCard
          title={t('dentistDashboard.patientRecords')}
          description={t('dentistDashboard.patientRecordsDesc')}
          icon={<Users className="w-8 h-8 text-accent" />}
          link="#"
          linkText={t('dentistDashboard.viewPatients')}
          disabled={true}
        />
        <DashboardCard
          title={t('notifications.title')}
          description={t('dentistDashboard.notificationsDesc', { defaultValue: 'View and manage your notifications and appointment requests.' })}
          icon={<Bell className="w-8 h-8 text-accent" />}
          link="/dentist/notifications"
          linkText={t('notifications.seeAll')}
        />
        <DashboardCard
          title={t('appointments.manageTitle')}
          description={t('dentistDashboard.viewScheduleDesc')}
          icon={<CalendarDays className="w-8 h-8 text-accent" />}
          link="/dentist/appointments"
          linkText={t('appointments.manageTitle')}
        />
      </div>
      {/* Emergencias */}
      <Card className="shadow-md border-4 border-red-600">
        <CardHeader className="bg-gradient-to-r from-red-600 via-red-400 to-yellow-200 flex flex-row items-center gap-2 rounded-t-lg py-6">
          <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
          <CardTitle className="text-2xl text-white font-extrabold drop-shadow-lg tracking-wider uppercase">{t('dentistDashboard.emergencies')}</CardTitle>
        </CardHeader>
        <CardContent>
          {emergencies.length === 0 ? (
            <div className="pt-6 text-center text-muted-foreground">{t('dentistDashboard.noEmergencies')}</div>
          ) : (
            <ul className="space-y-3">
              {emergencies.map((em: any) => (
                <li key={em.id} className={`p-3 border rounded-md flex flex-col gap-1 ${em.status === 'PENDING' ? 'bg-red-50 border-red-400' : 'bg-background'}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${em.status === 'PENDING' ? 'text-red-600' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-red-700">{em.status === 'PENDING' ? t('dentistDashboard.urgent') : t('dentistDashboard.emergency')}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{format(new Date(em.createdAt), 'PPpp')}</span>
                  </div>
                  <div><span className="font-medium">{t('dentistDashboard.patient')}:</span> {em.name} ({em.dni})</div>
                  <div><span className="font-medium">{t('dentistDashboard.phone')}:</span> {em.phone}</div>
                  <div><span className="font-medium">{t('dentistDashboard.description')}:</span> {em.description}</div>
                  <div><span className="font-medium">{t('dentistDashboard.status')}:</span> {t('emergencyStatus.' + em.status.toLowerCase())}</div>
                  {em.status === 'PENDING' && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white" disabled={loadingId === em.id} onClick={() => handleUpdateStatus(em.id, 'APPROVED')}>
                        <Check className="w-4 h-4 mr-1" /> {t('dentistDashboard.approve')}
                      </Button>
                      <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" disabled={loadingId === em.id} onClick={() => handleUpdateStatus(em.id, 'CANCELLED')}>
                        <XCircle className="w-4 h-4 mr-1" /> {t('dentistDashboard.cancel')}
                      </Button>
                    </div>
                  )}
                  {em.status === 'APPROVED' && em.dentistId === currentDentist.id && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loadingId === em.id} onClick={() => handleUpdateStatus(em.id, 'FINISHED')}>
                        <Check className="w-4 h-4 mr-1" /> {t('dentistDashboard.finish')}
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 