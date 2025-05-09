
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { mockDentists, mockServices, availableTimeSlots, mockPatients } from "@/lib/mock-data";
import type { Dentist, Service, Patient } from "@/lib/types";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from "@/context/auth-context"; // Import useAuth

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required."),
  dentistId: z.string().min(1, "Please select a dentist."),
  serviceId: z.string().min(1, "Please select a service."),
  date: z.date({ required_error: "Please select a date." }),
  time: z.string().min(1, "Please select a time slot."),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Mock server action (replace with actual Prisma call in a real app)
async function bookAppointment(data: AppointmentFormValues): Promise<{ success: boolean, message: string, appointmentId?: string }> {
  console.log("Booking appointment with data:", data);
  // Simulate API call to create appointment in DB
  // mockAppointments.push({ ...data, id: `appt-${Date.now()}`, status: 'SCHEDULED', date: format(data.date, "yyyy-MM-dd"), patientName: mockPatients.find(p=>p.id === data.patientId)?.name || 'N/A', dentistName: mockDentists.find(d=>d.id === data.dentistId)?.name || 'N/A', service: mockServices.find(s=>s.id === data.serviceId)?.name || 'N/A' });
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, message: "Appointment booked successfully! (Mock)", appointmentId: `appt-${Math.random().toString(36).substr(2, 9)}` });
    }, 1500);
  });
}

export default function AppointmentForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const preselectedDentistId = searchParams.get('dentistId');
  const { currentUser, userType, isLoadingAuth } = useAuth();

  const defaultPatientId = (userType === 'patient' && currentUser) ? currentUser.id : (mockPatients[0]?.id || '');

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: defaultPatientId,
      dentistId: preselectedDentistId || '',
      serviceId: '',
      time: '',
      notes: '',
    },
  });
  
  useEffect(() => {
    if (preselectedDentistId) {
      form.setValue('dentistId', preselectedDentistId);
    }
  }, [preselectedDentistId, form]);

  useEffect(() => {
    // If user logs in/out while on this page, or auth state loads
    if (!isLoadingAuth && userType === 'patient' && currentUser) {
      form.setValue('patientId', currentUser.id);
    } else if (!isLoadingAuth && userType !== 'patient') {
       // If not a patient or not logged in, reset to default or allow selection
       // For now, if not a patient, allow selection using mockPatients
       form.setValue('patientId', mockPatients[0]?.id || '');
    }
  }, [currentUser, userType, isLoadingAuth, form]);


  async function onSubmit(data: AppointmentFormValues) {
    setIsLoading(true);
    const result = await bookAppointment(data);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      form.reset({
        patientId: (userType === 'patient' && currentUser) ? currentUser.id : (mockPatients[0]?.id || ''),
        dentistId: preselectedDentistId || '',
        serviceId: '',
        date: undefined,
        time: '',
        notes: '',
      });
    } else {
      toast({
        title: "Booking Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  const isPatientLoggedIn = !isLoadingAuth && userType === 'patient' && currentUser;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-primary-foreground mix-blend-multiply">Book an Appointment</CardTitle>
        <CardDescription className="text-primary-foreground/80 mix-blend-multiply">
          Fill out the form below to schedule your visit.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  {isPatientLoggedIn ? (
                    <>
                      <Input value={currentUser.name} disabled className="bg-muted/50" />
                      <FormDescription>Booking for yourself: {currentUser.email}</FormDescription>
                    </>
                  ) : (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoadingAuth} // Disable while auth is loading
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dentistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dentist</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dentist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockDentists.map((dentist: Dentist) => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.name} - {dentist.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockServices.map((service: Service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.durationMinutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Appointment Date</FormLabel>
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
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific concerns or information for the dentist..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
