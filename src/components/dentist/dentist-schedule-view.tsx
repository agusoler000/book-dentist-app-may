'use client';

import { useState, useEffect } from 'react';
import type { Appointment, AppointmentStatusType } from '@/lib/types';
import { mockAppointments, mockDentists } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, AlertCircle, BriefcaseIcon } from 'lucide-react';
import { format, parseISO, startOfDay, isSameDay, isFuture, isPast } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from '../ui/button';
import { useLanguage } from '@/context/language-context';
import { es, enUS } from 'date-fns/locale';

interface DentistScheduleViewProps {
  appointments: Appointment[];
  dentistName?: string;
}

function getDateObj(date: string | Date) {
  if (typeof date === 'string') {
    // Si es string, parsea como ISO
    return parseISO(date);
  }
  return date;
}

function isSameDayRobust(dateA: Date, dateB: Date) {
  // Compara solo año, mes y día (ignora hora y zona)
  return dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();
}

export default function DentistScheduleView({ appointments, dentistName }: DentistScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { t, locale } = useLanguage();
  const dateFnsLocale = locale === 'es' ? es : enUS;

  const appointmentsForSelectedDate = appointments
    .filter(app => selectedDate && isSameDayRobust(getDateObj(app.date), selectedDate))
    .sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());

  const getStatusBadgeVariant = (status: AppointmentStatusType) => {
    switch (status) {
      case 'SCHEDULED':
        return 'default';
      case 'COMPLETED':
        return 'secondary'; // Using secondary as a "success" like variant
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getStatusIcon = (status: AppointmentStatusType, date: string) => {
    const appDate = parseISO(date);
    if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'CANCELLED') return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === 'SCHEDULED' && isFuture(appDate)) return <Clock className="w-4 h-4 text-blue-500" />;
    if (status === 'SCHEDULED' && isPast(appDate) && !isSameDay(appDate, new Date())) return <AlertCircle className="w-4 h-4 text-yellow-500" />; // Past due
    return <Clock className="w-4 h-4 text-blue-500" />;
  };


  return (
    <Card className="shadow-xl w-full">
      <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-primary-foreground mix-blend-multiply">
          {t('dentistSchedule.title', { name: dentistName || t('dentistDashboard.dentist') })}
        </CardTitle>
        <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
          {t('dentistSchedule.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border shadow-sm bg-card"
            disabled={(date) => date < new Date("1900-01-01")}
            initialFocus
            locale={dateFnsLocale}
            modifiers={{ 
              hasAppointment: appointments.map(app => getDateObj(app.date)) 
            }}
            modifiersStyles={{ 
              hasAppointment: { border: "2px solid hsl(var(--accent))", borderRadius: 'var(--radius)' } 
            }}
          />
           <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setSelectedDate(new Date())}
          >
            Go to Today
          </Button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            {t('dentistSchedule.appointmentsFor', { date: selectedDate ? format(selectedDate, 'PPP', { locale: dateFnsLocale }) : t('dentistSchedule.noDateSelected') })}
          </h3>
          {appointmentsForSelectedDate.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dentistDashboard.time')}</TableHead>
                  <TableHead>{t('dentistDashboard.patient')}</TableHead>
                  <TableHead>{t('dentistDashboard.service')}</TableHead>
                  <TableHead>{t('dentistDashboard.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentsForSelectedDate.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium flex items-center">
                       {getStatusIcon(app.status, typeof app.date === 'string' ? app.date : ((app.date as Date).toISOString ? (app.date as Date).toISOString() : ''))}
                       <span className="ml-2">{app.time}</span>
                    </TableCell>
                    <TableCell><User className="w-4 h-4 inline mr-1 text-muted-foreground" />{(app as any).patient?.user?.name || 'N/A'}</TableCell>
                    <TableCell><BriefcaseIcon className="w-4 h-4 inline mr-1 text-muted-foreground" />{(app as any).serviceName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(app.status)} className="capitalize">
                        {app.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground itempt-4 text-center py-8 border border-dashed rounded-md">
              {t('dentistSchedule.noAppointmentsForDay')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
