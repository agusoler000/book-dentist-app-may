import type { Patient, Dentist, Appointment, Service, AppointmentStatusType } from './types';

export const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    phone: '555-0101',
    dob: '1990-05-15',
  },
  {
    id: 'patient-2',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    phone: '555-0102',
    dob: '1985-11-20',
  },
];

export const mockDentists: Dentist[] = [
  {
    id: 'dentist-1',
    name: 'Dr. Eve Toothaker',
    specialty: 'General Dentistry',
    email: 'dr.eve@dentalflow.com',
    isAvailableForEmergency: true,
    profileImageUrl: 'https://picsum.photos/seed/dentist1/200/200',
    bio: 'Experienced general dentist with a passion for preventative care.',
  },
  {
    id: 'dentist-2',
    name: 'Dr. Adam Smilewright',
    specialty: 'Orthodontics',
    email: 'dr.adam@dentalflow.com',
    isAvailableForEmergency: false,
    profileImageUrl: 'https://picsum.photos/seed/dentist2/200/200',
    bio: 'Specializing in creating beautiful smiles with advanced orthodontic treatments.',
  },
  {
    id: 'dentist-3',
    name: 'Dr. Grace Periodontal',
    specialty: 'Periodontics',
    email: 'dr.grace@dentalflow.com',
    isAvailableForEmergency: true,
    profileImageUrl: 'https://picsum.photos/seed/dentist3/200/200',
    bio: 'Focused on gum health and treating periodontal diseases.',
  },
];

export const mockServices: Service[] = [
    { id: 'service-1', name: 'Routine Check-up & Cleaning', durationMinutes: 60, description: 'Comprehensive dental check-up and professional cleaning.' },
    { id: 'service-2', name: 'Cavity Filling', durationMinutes: 45, description: 'Restoration of a tooth damaged by decay.' },
    { id: 'service-3', name: 'Teeth Whitening', durationMinutes: 90, description: 'Professional teeth whitening treatment for a brighter smile.' },
    { id: 'service-4', name: 'Emergency Consultation', durationMinutes: 30, description: 'Urgent assessment of dental emergencies.' },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    patientId: 'patient-1',
    patientName: 'Alice Wonderland',
    dentistId: 'dentist-1',
    dentistName: 'Dr. Eve Toothaker',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    time: '10:00 AM',
    service: 'Routine Check-up & Cleaning',
    status: 'SCHEDULED',
  },
  {
    id: 'appt-2',
    patientId: 'patient-2',
    patientName: 'Bob The Builder',
    dentistId: 'dentist-2',
    dentistName: 'Dr. Adam Smilewright',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    time: '02:30 PM',
    service: 'Orthodontic Consultation',
    status: 'SCHEDULED',
  },
  {
    id: 'appt-3',
    patientId: 'patient-1',
    patientName: 'Alice Wonderland',
    dentistId: 'dentist-1',
    dentistName: 'Dr. Eve Toothaker',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    time: '09:00 AM',
    service: 'Cavity Filling',
    status: 'COMPLETED',
  },
];

export const availableTimeSlots: string[] = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
];
