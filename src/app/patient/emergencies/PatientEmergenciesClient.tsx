'use client';
import { useLanguage } from '@/context/language-context';
import DentistCard from '@/components/dentist/dentist-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function PatientEmergenciesClient({ availableDentists }: any) {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('emergencies.title')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('emergencies.description')}
        </p>
      </div>
      {availableDentists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDentists.map((dentist: any) => (
            <DentistCard key={dentist.id} dentist={{
              ...dentist,
              name: dentist.user?.name || '',
              email: dentist.user?.email || '',
              phone: dentist.phone || undefined,
              profileImageUrl: dentist.profileImageUrl || undefined,
              bio: dentist.bio || undefined,
            }} />
          ))}
        </div>
      ) : (
        <Alert variant="default" className="max-w-xl mx-auto border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
          <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
          <AlertTitle className="font-semibold">{t('emergencies.noDentists')}</AlertTitle>
          <AlertDescription>
            {t('emergencies.noDentistsDesc')}
          </AlertDescription>
        </Alert>
      )}
      <Alert className="mt-8 max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('emergencies.importantNotice')}</AlertTitle>
        <AlertDescription>
          {t('emergencies.importantNoticeDesc')}
        </AlertDescription>
      </Alert>
    </div>
  );
} 