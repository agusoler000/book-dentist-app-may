export interface Patient {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional, for form data, not stored in auth context/client
  phone?: string;
  dni: string;
  dateOfBirth: string; // ISO date string e.g. "1990-01-01". Prisma: DateTime
  // appointments are typically fetched via relation, not embedded directly unless denormalized
}

export interface Dentist {
  id: string;
  name: string;
  specialty: string;
  email: string;
  password?: string; // Optional, for form data, not stored in auth context/client
  phone?: string;
  isAvailableForEmergency: boolean;
  profileImageUrl?: string;
  bio?: string;
  // appointments are typically fetched via relation
}

// Aligns with Prisma's AppointmentStatus enum
export type AppointmentStatusType = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; // Denormalized for easier display if not fetching full patient object
  dentistId: string;
  dentistName?: string; // Denormalized for easier display if not fetching full dentist object
  serviceId: string; // Foreign key to Service
  service: string; // Name of the service (denormalized or joined)
  date: string; // ISO date string e.g. "2024-01-01". Prisma: DateTime
  time: string; // e.g., "10:00 AM"
  notes?: string;
  status: AppointmentStatusType;
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number; // e.g. 30, 60
  description?: string;
}

// For auth context - remove password and relational fields that aren't directly stored
export type AuthenticatedUser = 
  | Omit<Patient, 'password' | 'appointments'> 
  | Omit<Dentist, 'password' | 'appointments'>;

export type UserType = 'patient' | 'dentist';

export type NotificationType = 'regular' | 'emergency' | 'appointment';
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  event?: 'emergency' | 'appointment' | string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
