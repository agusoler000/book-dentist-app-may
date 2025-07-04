'use client';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmergencyStatusToggleWithAuth from '@/components/dentist/EmergencyStatusToggleWithAuth';
import Image from 'next/image';
import { Mail, Phone, Pencil, Loader2 } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function DentistProfilePageClient({ profile }: any) {
  const { t } = useLanguage();
  const currentDentist = profile.dentist;
  const profileImageUrl = currentDentist?.profileImageUrl || `https://picsum.photos/seed/${currentDentist?.id}/150/150`;
  const [open, setOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: currentDentist?.phone || '',
      specialty: currentDentist?.specialty || '',
      bio: currentDentist?.bio || '',
      password: '',
      confirmPassword: '',
      profileImage: null as File | null,
      currentPassword: '',
    }
  });
  const onSubmit = async (data: any) => {
    setLoading(true);
    const needsCurrentPassword = (data.email !== profile.email) || (data.password && data.password.length >= 6);
    if (needsCurrentPassword && !data.currentPassword) {
      toast({ title: t('profile.error'), description: t('profile.currentPasswordRequired'), variant: 'destructive' });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/dentists/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          specialty: data.specialty,
          bio: data.bio,
          password: data.password || undefined,
          currentPassword: data.currentPassword || undefined,
        })
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: t('profile.updated'), description: t('profile.updatedDesc'), variant: 'default' });
        setOpen(false);
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
  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Image
              src={previewImg || profileImageUrl}
              alt={`Dr. ${profile.name}`}
              width={150}
              height={150}
              className="rounded-full border-4 border-background shadow-lg"
              data-ai-hint="dentist professional"
            />
            <div className="flex flex-col gap-1 items-start justify-center">
              <div className="flex items-center gap-2">
                <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">{profile.name}</CardTitle>
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
                                  src={previewImg || profileImageUrl}
                                  alt={`Dr. ${profile.name}`}
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
                                  <FormControl><Input {...field} type="email" onBlur={e => setShowCurrentPassword(e.target.value !== profile.email || form.getValues('password').length >= 6)} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField name="phone" control={form.control} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('patientProfile.phone')}</FormLabel>
                                  <FormControl>
                                    <PhoneInput
                                      country={'ar'}
                                      value={field.value}
                                      onChange={value => field.onChange(value)}
                                      inputProps={{ name: 'phone', required: false, disabled: loading }}
                                      inputClass="w-full"
                                      containerClass="w-full"
                                      enableSearch
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField name="specialty" control={form.control} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('dentistProfile.specialty')}</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField name="bio" control={form.control} render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>{t('dentistProfile.biography')}</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField name="password" control={form.control} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.newPassword')}</FormLabel>
                                  <FormControl><Input {...field} type="password" autoComplete="new-password" onBlur={e => setShowCurrentPassword(e.target.value.length >= 6 || form.getValues('email') !== profile.email)} /></FormControl>
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
              {currentDentist?.specialty && (
                <span className="text-lg text-primary-foreground/80 mix-blend-multiply">{currentDentist.specialty}</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{t('dentistProfile.contactInfo')}</h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center"><Mail className="w-5 h-5 mr-2 text-accent" /> {profile.email}</p>
              {currentDentist?.phone && <p className="flex items-center"><Phone className="w-5 h-5 mr-2 text-accent" /> {currentDentist.phone}</p>}
            </div>
          </div>
          {currentDentist?.bio && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t('dentistProfile.biography')}</h3>
              <p className="text-muted-foreground leading-relaxed">{currentDentist.bio}</p>
            </div>
          )}
          <EmergencyStatusToggleWithAuth dentistId={currentDentist?.id || ''} />
          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-2 text-foreground">{t('dentistProfile.manageProfile')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dentistProfile.manageProfileDesc')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 