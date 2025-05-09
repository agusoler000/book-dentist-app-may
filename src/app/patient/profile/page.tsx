
'use client';

import PatientProfileView from '@/components/patient/patient-profile-view';
import { mockAppointments, mockPatients } from '@/lib/mock-data'; // Still using mock data for appointments
import type { Patient } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PatientProfilePage() {
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

  // Cast currentUser to Patient type (without password)
  // In a real app, you'd fetch full patient details if needed,
  // but for now, currentUser from AuthContext should suffice if it has all necessary display fields.
  const currentPatient = currentUser as Omit<Patient, 'password'>;


  // Filter appointments for the current patient from mock data
  // In a real app, fetch appointments for currentPatient.id from DB
  const patientAppointments = mockAppointments.filter(app => app.patientId === currentPatient.id);

  return (
    <div className="space-y-6">
      <PatientProfileView patient={currentPatient} appointments={patientAppointments} />
    </div>
  );
}
