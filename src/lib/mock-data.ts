
import type { Patient, Dentist, Appointment, Service, AppointmentStatusType } from './types';
import { parseISO, format } from 'date-fns';


// These mock objects can be used for frontend components if direct DB access isn't set up yet,
// or for default/fallback values. With a seeded DB, these might become less critical.

export const mockPatients: Patient[] = [
  {
    id: 'patient-1-mock',
    name: 'Alice Wonderland (Mock)',
    email: 'alice.mock@example.com',
    phone: '555-0101',
    // dob is a string in type, Prisma uses DateTime. Convert if using with Prisma types directly.
    dob: format(new Date('1990-05-15'), 'yyyy-MM-dd'), 
  },
  {
    id: 'patient-2-mock',
    name: 'Bob The Builder (Mock)',
    email: 'bob.mock@example.com',
    phone: '555-0102',
    dob: format(new Date('1985-11-20'), 'yyyy-MM-dd'),
  },
];

export const mockDentists: Dentist[] = [
  {
    id: 'dentist-1-mock',
    name: 'Dr. Eve Toothaker (Mock)',
    specialty: 'General Dentistry',
    email: 'dr.eve.mock@dentalflow.com',
    isAvailableForEmergency: true,
    profileImageUrl: 'https://picsum.photos/seed/dentist1mock/200/200',
    bio: 'Mock: Experienced general dentist.',
  },
  {
    id: 'dentist-2-mock',
    name: 'Dr. Adam Smilewright (Mock)',
    specialty: 'Orthodontics',
    email: 'dr.adam.mock@dentalflow.com',
    isAvailableForEmergency: false,
    profileImageUrl: 'https://picsum.photos/seed/dentist2mock/200/200',
    bio: 'Mock: Specializing in beautiful smiles.',
  },
];

export const mockServices: Service[] = [
    { id: 'service-1-mock', name: 'Routine Check-up & Cleaning (Mock)', durationMinutes: 60, description: 'Mock: Comprehensive dental check-up and professional cleaning.' },
    { id: 'service-2-mock', name: 'Cavity Filling (Mock)', durationMinutes: 45, description: 'Mock: Restoration of a tooth damaged by decay.' },
    { id: 'service-3-mock', name: 'Teeth Whitening (Mock)', durationMinutes: 90, description: 'Mock: Professional teeth whitening treatment.' },
    { id: 'service-4-mock', name: 'Orthodontic Consultation (Mock)', durationMinutes: 45, description: 'Mock: Consultation for braces/aligners.'},
    { id: 'service-5-mock', name: 'Emergency Consultation (Mock)', durationMinutes: 30, description: 'Mock: Urgent dental assessment.' },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1-mock',
    patientId: 'patient-1-mock',
    patientName: 'Alice Wonderland (Mock)',
    dentistId: 'dentist-1-mock',
    dentistName: 'Dr. Eve Toothaker (Mock)',
    // date is a string in type, Prisma uses DateTime. Store as ISO string.
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), 
    time: '10:00 AM',
    service: 'Routine Check-up & Cleaning (Mock)', // service name
    status: 'SCHEDULED',
  },
  {
    id: 'appt-2-mock',
    patientId: 'patient-2-mock',
    patientName: 'Bob The Builder (Mock)',
    dentistId: 'dentist-2-mock',
    dentistName: 'Dr. Adam Smilewright (Mock)',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '02:30 PM',
    service: 'Orthodontic Consultation (Mock)', // service name
    status: 'SCHEDULED',
  },
];

export const availableTimeSlots: string[] = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
];

// Helper to convert mock data dates if needed, though types.ts uses string for date currently.
// If types.ts used Date objects, this would be more relevant.
export function ensureDateObjects(appointments: Appointment[]): Appointment[] {
  return appointments.map(app => ({
    ...app,
    date: typeof app.date === 'string' ? parseISO(app.date) : app.date,
  }));
}
