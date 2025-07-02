'use client';

import DentistScheduleView from '@/components/dentist/dentist-schedule-view';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Appointment } from '@/lib/types';

export default function DentistSchedulePage() {
  const { currentUser, userType, isLoadingAuth } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && (!currentUser || userType !== 'dentist')) {
      router.push('/login?role=dentist');
    }
  }, [currentUser, userType, isLoadingAuth, router]);

  useEffect(() => {
    if (currentUser && userType === 'dentist') {
      setLoadingAppointments(true);
      fetch(`/api/appointments?dentistId=${currentUser.dentistId}`)
        .then(res => res.json())
        .then(data => {
          setAppointments(data.appointments || []);
          setLoadingAppointments(false);
        })
        .catch(() => setLoadingAppointments(false));
    }
  }, [currentUser, userType]);

  if (isLoadingAuth || !currentUser || userType !== 'dentist' || loadingAppointments) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }
  
  const dentistId = currentUser.id;

  return (
    <div className="space-y-6">
      <DentistScheduleView appointments={appointments} dentistName={currentUser.name} />
    </div>
  );
}
