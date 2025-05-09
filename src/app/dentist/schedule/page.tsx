
'use client';

import DentistScheduleView from '@/components/dentist/dentist-schedule-view';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DentistSchedulePage() {
  const { currentUser, userType, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && (!currentUser || userType !== 'dentist')) {
      router.push('/login?role=dentist');
    }
  }, [currentUser, userType, isLoadingAuth, router]);

  if (isLoadingAuth || !currentUser || userType !== 'dentist') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }
  
  const dentistId = currentUser.id;

  return (
    <div className="space-y-6">
      <DentistScheduleView dentistId={dentistId} />
    </div>
  );
}
