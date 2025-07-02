"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';

export default function AppointmentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, userType, isLoadingAuth } = useAuth();
  const { t } = useLanguage();
  const [dentists, setDentists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dentists").then(res => res.json()).then(setDentists);
  }, []);

  // Horarios fijos por ahora
  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch("/api/appointments", {
      method: "POST",
      body: formData,
    });
    setIsLoading(false);
    const result = await res.json();
    if (result.success) {
      toast({ title: "Success!", description: result.message });
      router.push("/patient/dashboard?booked=1");
    } else {
      toast({ title: "Booking Failed", description: result.message, variant: "destructive" });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-primary-foreground mix-blend-multiply">{t('appointmentForm.title')}</CardTitle>
        <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
          {t('appointmentForm.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block font-medium mb-1">{t('appointmentForm.patient')}</label>
            <Input name="patientId" value={currentUser?.id || ''} readOnly className="bg-muted/50" />
            <div className="text-sm text-muted-foreground">{t('appointmentForm.bookingFor', { name: currentUser?.name, email: currentUser?.email })}</div>
          </div>
          <div>
            <label className="block font-medium mb-1">{t('appointmentForm.dentist')}</label>
            <Select name="dentistId" required defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder={t('appointmentForm.selectDentist')} />
              </SelectTrigger>
              <SelectContent>
                {dentists.map((dentist) => (
                  <SelectItem key={dentist.id} value={dentist.userId}>
                    {dentist.user?.name || 'No Name'} - {dentist.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">{t('appointmentForm.service')}</label>
            <Input name="serviceName" type="text" required placeholder={t('appointmentForm.servicePlaceholder') || 'Ej: Limpieza, Consulta, Ortodoncia...'} />
          </div>
          <div>
            <label className="block font-medium mb-1">{t('appointmentForm.date')}</label>
            <Input name="date" type="date" required min={format(new Date(), 'yyyy-MM-dd')} />
          </div>
          <div>
            <label className="block font-medium mb-1">{t('appointmentForm.time')}</label>
            <Select name="time" required defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder={t('appointmentForm.selectTime')} />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">{t('appointmentForm.notes')}</label>
            <Textarea name="notes" placeholder={t('appointmentForm.notesPlaceholder')} className="resize-none" />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('appointmentForm.submitting') : t('appointmentForm.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
