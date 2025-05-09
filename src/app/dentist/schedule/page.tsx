import DentistScheduleView from '@/components/dentist/dentist-schedule-view';
import { mockDentists } from '@/lib/mock-data'; // For getting a dentist ID

export default function DentistSchedulePage() {
  // In a real app, this ID would come from the authenticated dentist's session
  const dentistId = mockDentists[0]?.id || 'dentist-1'; 

  return (
    <div className="space-y-6">
      <DentistScheduleView dentistId={dentistId} />
    </div>
  );
}
