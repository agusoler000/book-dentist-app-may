import AppointmentForm from '@/components/appointment/appointment-form';
import { Suspense } from 'react';

// Helper component to use useSearchParams
function AppointmentFormWrapper() {
  return <AppointmentForm />;
}

export default function BookAppointmentPage() {
  return (
    <div className="space-y-6">
       {/* Suspense is good practice if AppointmentForm does heavy client-side work or fetching */}
      <Suspense fallback={<div>Loading form...</div>}>
        <AppointmentFormWrapper />
      </Suspense>
    </div>
  );
}
