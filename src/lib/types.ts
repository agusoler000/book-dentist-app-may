export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string; // Date of Birth ISO string e.g. "1990-01-01"
  appointments?: Appointment[]; // Optional: list of appointments
}

export interface Dentist {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone?: string;
  isAvailableForEmergency: boolean;
  profileImageUrl?: string;
  bio?: string;
}

// Aligns with Prisma's AppointmentStatus enum
export type AppointmentStatusType = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id:string;
  patientId: string;
  patientName?: string; // Denormalized for easier display
  dentistId: string;
  dentistName?: string; // Denormalized for easier display
  date: string; // ISO date string e.g. "2024-01-01"
  time: string; // e.g., "10:00 AM"
  service: string; // e.g., "Cleaning", "Check-up" (could be service name or ID)
  notes?: string;
  status: AppointmentStatusType;
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number; // e.g. 30, 60
  description?: string;
}
