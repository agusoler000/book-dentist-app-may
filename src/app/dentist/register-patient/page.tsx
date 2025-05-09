import RegisterPatientForm from '@/components/dentist/register-patient-form';
import { Suspense } from 'react';

export default function RegisterPatientPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading form...</div>}>
        <RegisterPatientForm />
      </Suspense>
    </div>
  );
}
