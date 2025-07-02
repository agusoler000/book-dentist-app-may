"use client";

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/auth-context';
import AppointmentForm from '@/components/appointment/appointment-form';

export default function BookAppointmentPage() {
  return <AppointmentForm />;
}
