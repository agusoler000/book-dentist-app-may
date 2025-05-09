import PatientProfileView from '@/components/patient/patient-profile-view';
import { mockPatients, mockAppointments } from '@/lib/mock-data';

export default function PatientProfilePage() {
  // In a real app, this would be fetched based on the logged-in user
  const currentPatient = mockPatients[0];
  if (!currentPatient) {
    return <p>Patient not found.</p>;
  }

  // Filter appointments for the current patient
  const patientAppointments = mockAppointments.filter(app => app.patientId === currentPatient.id);

  return (
    <div className="space-y-6">
      <PatientProfileView patient={currentPatient} appointments={patientAppointments} />
    </div>
  );
}
