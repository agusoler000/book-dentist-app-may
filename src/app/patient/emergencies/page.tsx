import DentistCard from '@/components/dentist/dentist-card';
import { mockDentists } from '@/lib/mock-data';
import type { Dentist } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EmergencyDentistsPage() {
  const availableDentists = mockDentists.filter(d => d.isAvailableForEmergency);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Emergency Dental Care</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find dentists currently available for urgent appointments.
        </p>
      </div>

      {availableDentists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDentists.map((dentist: Dentist) => (
            <DentistCard key={dentist.id} dentist={dentist} />
          ))}
        </div>
      ) : (
        <Alert variant="default" className="max-w-xl mx-auto border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
          <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
          <AlertTitle className="font-semibold">No Dentists Currently Available for Emergencies</AlertTitle>
          <AlertDescription>
            Please check back later or contact local emergency services if your situation is critical.
          </AlertDescription>
        </Alert>
      )}
       <Alert className="mt-8 max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          If you are experiencing a life-threatening emergency, please call your local emergency number immediately or visit the nearest emergency room. This service is for urgent dental care.
        </AlertDescription>
      </Alert>
    </div>
  );
}
