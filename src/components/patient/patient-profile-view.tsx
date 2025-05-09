import type { Patient, Appointment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, CalendarDays as UserCalendarIcon, Gift, MapPin, BriefcaseIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';

interface PatientProfileViewProps {
  patient: Patient;
  appointments: Appointment[]; // Pass appointments separately or fetch within
}

export default function PatientProfileView({ patient, appointments }: PatientProfileViewProps) {
  const upcomingAppointments = appointments
    .filter(app => app.status === 'scheduled' && parseISO(app.date) >= new Date())
    .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const pastAppointments = appointments
    .filter(app => app.status !== 'scheduled' || parseISO(app.date) < new Date())
    .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());


  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
            <Image 
                src={`https://picsum.photos/seed/${patient.id}/150/150`} // Placeholder image
                alt={`Profile photo of ${patient.name}`}
                width={120}
                height={120}
                className="rounded-full border-4 border-background shadow-lg"
                data-ai-hint="person avatar"
            />
            <div>
                <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">{patient.name}</CardTitle>
                <CardDescription className="text-lg text-primary-foreground/80 mix-blend-multiply">Patient Profile</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <p className="flex items-center"><Mail className="w-5 h-5 mr-2 text-accent" /> Email: {patient.email}</p>
            {patient.phone && <p className="flex items-center"><Phone className="w-5 h-5 mr-2 text-accent" /> Phone: {patient.phone}</p>}
            {patient.dob && <p className="flex items-center"><Gift className="w-5 h-5 mr-2 text-accent" /> Date of Birth: {format(parseISO(patient.dob), 'MMMM d, yyyy')}</p>}
            {/* Add more fields like address if available */}
            {/* <p className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-accent" /> Address: 123 Smile Street, Dental City</p> */}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">Upcoming Appointments</h3>
          {upcomingAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map(app => (
                  <TableRow key={app.id}>
                    <TableCell>{format(parseISO(app.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{app.time}</TableCell>
                    <TableCell>{app.dentistName || 'N/A'}</TableCell>
                    <TableCell>{app.service}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground italic">No upcoming appointments.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">Appointment History</h3>
           {pastAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastAppointments.slice(0, 5).map(app => ( // Show last 5
                  <TableRow key={app.id}>
                    <TableCell>{format(parseISO(app.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{app.dentistName || 'N/A'}</TableCell>
                    <TableCell>{app.service}</TableCell>
                    <TableCell className="capitalize">{app.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground italic">No past appointments found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
