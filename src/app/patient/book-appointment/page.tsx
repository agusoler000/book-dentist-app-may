"use client";

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/auth-context';
import AppointmentForm from '@/components/appointment/appointment-form';
import { useLanguage } from '@/context/language-context';

export default function BookAppointmentPage() {
  const { t, locale } = useLanguage ? useLanguage() : { t: (x: string) => x, locale: 'es' };
  return <AppointmentForm />;
}
