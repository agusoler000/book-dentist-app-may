import type { Patient, Appointment, AppointmentStatusType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, Gift, BriefcaseIcon, IdCard, Pencil } from 'lucide-react'; // Removed UserCalendarIcon, MapPin
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { enUS, es } from 'date-fns/locale';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PatientProfileViewProps {
  patient: Patient;
  appointments: Appointment[]; // Pass appointments separately or fetch within
}

export default function PatientProfileView({ patient, appointments }: PatientProfileViewProps) {
  const { t, locale } = useLanguage();
  const dateLocale = locale === 'es' ? es : enUS;
  const [open, setOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dni: patient.dni,
      dateOfBirth: patient.dateOfBirth,
      password: '',
      confirmPassword: '',
      profileImage: null as File | null,
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    const needsCurrentPassword = (data.email !== patient.email) || (data.password && data.password.length >= 6);
    if (needsCurrentPassword && !data.currentPassword) {
      toast({ title: t('profile.error'), description: t('profile.currentPasswordRequired'), variant: 'destructive' });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          dni: data.dni,
          dateOfBirth: data.dateOfBirth,
          password: data.password || undefined,
          currentPassword: data.currentPassword || undefined,
        })
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: t('profile.updated'), description: t('profile.updatedDesc'), variant: 'success' });
        setOpen(false);
        // Opcional: refrescar la página o los datos
        window.location.reload();
      } else {
        toast({ title: t('profile.error'), description: result.error || t('profile.updateFailed'), variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: t('profile.error'), description: t('profile.updateFailed'), variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
      form.setValue('profileImage', file);
    }
  };

  const upcomingAppointments = appointments
    .filter(app => app.status === 'SCHEDULED' && typeof app.date === 'string' && parseISO(app.date) >= new Date())
    .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const pastAppointments = appointments
    .filter(app => (app.status !== 'SCHEDULED' || (typeof app.date === 'string' && parseISO(app.date) < new Date())))
    .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <div>
      <Card className="w-full shadow-xl">
        <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Image 
              src={`https://picsum.photos/seed/${patient.id}/150/150`} // Placeholder image
              alt={t('patientProfile.avatarAlt', { name: patient.name })}
              width={120}
              height={120}
              className="rounded-full border-4 border-background shadow-lg"
              data-ai-hint="person avatar"
            />
            <div className="flex items-center gap-2">
              <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">{patient.name}</CardTitle>
              <TooltipProvider>
                <Dialog open={open} onOpenChange={setOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label={t('profile.edit')}>
                          <Pencil className="w-5 h-5" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{t('profile.edit')}</TooltipContent>
                  </Tooltip>
                  <DialogContent className="max-w-2xl md:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{t('profile.editProfileTitle')}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <label htmlFor="profileImage" className="cursor-pointer">
                              <Image
                                src={previewImg || `https://picsum.photos/seed/${patient.id}/150/150`}
                                alt={t('patientProfile.avatarAlt', { name: patient.name })}
                                width={120}
                                height={120}
                                className="rounded-full border-4 border-background shadow-lg"
                              />
                            </label>
                            <input
                              id="profileImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <FormField name="name" control={form.control} render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>{t('patientProfile.name')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField name="email" control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('patientProfile.email')}</FormLabel>
                                <FormControl><Input {...field} type="email" onBlur={e => setShowCurrentPassword(e.target.value !== patient.email || form.getValues('password').length >= 6)} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField name="phone" control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('patientProfile.phone')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField name="dni" control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('patientProfile.dni')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField name="dateOfBirth" control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('patientProfile.dob')}</FormLabel>
                                <FormControl><Input {...field} type="date" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField name="password" control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.newPassword')}</FormLabel>
                                <FormControl><Input {...field} type="password" autoComplete="new-password" onBlur={e => setShowCurrentPassword(e.target.value.length >= 6 || form.getValues('email') !== patient.email)} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                                <FormControl><Input {...field} type="password" autoComplete="new-password" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            {showCurrentPassword && (
                              <FormField name="currentPassword" control={form.control} render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>{t('profile.currentPassword')}</FormLabel>
                                  <FormControl><Input {...field} type="password" autoComplete="current-password" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>{t('profile.cancel')}</Button>
                          </DialogClose>
                          <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            {t('profile.save')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">{t('patientProfile.personalInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              <p className="flex items-center"><Mail className="w-5 h-5 mr-2 text-accent" /> <span className="font-semibold mr-1">{t('patientProfile.email')}:</span> <span>{patient.email}</span></p>
              {patient.phone && <p className="flex items-center"><Phone className="w-5 h-5 mr-2 text-accent" /> <span className="font-semibold mr-1">{t('patientProfile.phone')}:</span> <span>{patient.phone}</span></p>}
              <p className="flex items-center"><IdCard className="w-5 h-5 mr-2 text-accent" /> <span className="font-semibold mr-1">{t('patientProfile.dni')}:</span> <span>{patient.dni}</span></p>
              {patient.dateOfBirth && <p className="flex items-center"><Gift className="w-5 h-5 mr-2 text-accent" /> <span className="font-semibold mr-1">{t('patientProfile.dob')}:</span> <span>{format(parseISO(patient.dateOfBirth), 'PPP', { locale: dateLocale })}</span></p>}
              {/* Add more fields like address if available */}
              {/* <p className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-accent" /> Address: 123 Smile Street, Dental City</p> */}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">{t('patientProfile.upcomingAppointments')}</h3>
            {upcomingAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('patientProfile.date')}</TableHead>
                    <TableHead>{t('patientProfile.time')}</TableHead>
                    <TableHead>{t('patientProfile.dentist')}</TableHead>
                    <TableHead>{t('patientProfile.service')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingAppointments.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>{format(parseISO(app.date), 'PPP', { locale: dateLocale })}</TableCell>
                      <TableCell>{app.time}</TableCell>
                      <TableCell>{app.dentistName || 'N/A'}</TableCell>
                      <TableCell>{app.service}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground italic">{t('patientProfile.noUpcomingAppointments')}</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">{t('patientProfile.history')}</h3>
             {pastAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('patientProfile.date')}</TableHead>
                    <TableHead>{t('patientProfile.dentist')}</TableHead>
                    <TableHead>{t('patientProfile.service')}</TableHead>
                    <TableHead>{t('patientProfile.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastAppointments.slice(0, 5).map(app => ( // Show last 5
                    <TableRow key={app.id}>
                      <TableCell>{format(parseISO(app.date), 'PPP', { locale: dateLocale })}</TableCell>
                      <TableCell>{app.dentistName || 'N/A'}</TableCell>
                      <TableCell>{app.service}</TableCell>
                      <TableCell className="capitalize">{t(`appointmentStatus.${app.status.toLowerCase()}`)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground italic">{t('patientProfile.noHistory')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}