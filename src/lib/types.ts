export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string; // Date of Birth
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

export interface Appointment {
  id:string;
  patientId: string;
  patientName?: string; // Denormalized for easier display
  dentistId: string;
  dentistName?: string; // Denormalized for easier display
  date: string; // ISO date string
  time: string; // e.g., "10:00 AM"
  service: string; // e.g., "Cleaning", "Check-up"
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number; // e.g. 30, 60
  description?: string;
}
