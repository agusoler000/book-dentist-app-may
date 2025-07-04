import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmergencyStatusToggleWithAuth from '@/components/dentist/EmergencyStatusToggleWithAuth';
import Image from 'next/image';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { getCurrentUserProfile } from '@/app/actions/auth/get-current-user-profile';
import { redirect } from 'next/navigation';
import DentistProfilePageClient from './DentistProfilePageClient';

export default async function DentistProfilePage() {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== 'DENTIST') {
    redirect('/login?role=dentist');
  }
  const currentDentist = profile.dentist;
  const profileImageUrl = currentDentist?.profileImageUrl || `https://picsum.photos/seed/${currentDentist?.id}/150/150`;

  return <DentistProfilePageClient profile={profile} />;
}
