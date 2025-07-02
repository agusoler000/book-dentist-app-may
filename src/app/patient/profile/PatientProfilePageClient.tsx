'use client';
import { useLanguage } from '@/context/language-context';
import PatientProfileViewClient from '@/components/patient/PatientProfileViewClient';

export default function PatientProfilePageClient({ role, profile, appointments }: any) {
  const { t } = useLanguage();
  if (!profile) {
    return <div className="text-center text-red-500 mt-10">{t('profile.noData')}</div>;
  }
  if (role === 'PATIENT') {
    return (
      <div className="space-y-6">
        <PatientProfileViewClient patient={profile} appointments={appointments} />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="text-center text-lg mt-10">{t('profile.dentistLoaded')}</div>
      <pre className="bg-muted p-4 rounded text-left overflow-x-auto">{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
} 