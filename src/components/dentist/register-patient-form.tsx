'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { registerPatient, type PatientRegistrationInput } from '@/app/dentist/register-patient/actions';
import { useLanguage } from '@/context/language-context';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"


const createPatientFormSchema = (t: Function) => z.object({
  name: z.string().min(1, { message: t('form.field.required') }),
  email: z.string().email({ message: t('form.field.email.invalid') }),
  phone: z.string().optional(),
  dob: z.date().optional(),
});


export default function RegisterPatientForm() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = createPatientFormSchema(t);
  type RegisterPatientFormValues = z.infer<typeof formSchema>;

  const form = useForm<RegisterPatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dob: undefined,
    },
  });

  async function onSubmit(data: RegisterPatientFormValues) {
    setIsLoading(true);
    const patientData: PatientRegistrationInput = {
      ...data,
      dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : undefined,
    };
    
    const result = await registerPatient(patientData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: t('patientRegistration.success'),
        description: `${result.patient?.name} (${result.patient?.email}) has been registered.`,
      });
      form.reset();
    } else {
      toast({
        title: t('patientRegistration.error'),
        description: result.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
      if (result.errors) {
        result.errors.forEach(error => {
          // @ts-ignore
          form.setError(error.path.join('.'), { message: error.message });
        });
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-primary-foreground mix-blend-multiply">{t('patientRegistration.title')}</CardTitle>
        <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
          {t('patientRegistration.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patientRegistration.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patientRegistration.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patientRegistration.phone')}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="555-123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('patientRegistration.dob')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Registrando..." : t('patientRegistration.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
