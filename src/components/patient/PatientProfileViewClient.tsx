'use client';
import PatientProfileView from './patient-profile-view';
import type { Patient, Appointment } from '@/lib/types';

export default function PatientProfileViewClient({
  patient,
  appointments,
}: {
  patient: Patient;
  appointments: Appointment[];
}) {
  return <PatientProfileView patient={patient} appointments={appointments} />;
} 