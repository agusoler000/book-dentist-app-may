'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Patient } from '@prisma/client';

const PatientRegistrationSchema = z.object({
  name: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  dob: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date of birth.",
  }),
});

export type PatientRegistrationInput = z.infer<typeof PatientRegistrationSchema>;

export async function registerPatient(
  data: PatientRegistrationInput
): Promise<{ success: boolean; message: string; patient?: Patient; errors?: z.ZodIssue[] }> {
  const validationResult = PatientRegistrationSchema.safeParse(data);

  if (!validationResult.success) {
    return { 
      success: false, 
      message: "Validation failed.",
      errors: validationResult.error.errors,
    };
  }

  const { name, email, phone, dob } = validationResult.data;

  try {
    const existingPatient = await prisma.patient.findUnique({
      where: { email },
    });

    if (existingPatient) {
      return { success: false, message: 'A patient with this email already exists.' };
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        phone: phone || null,
        dob: dob ? new Date(dob) : null,
      },
    });
    return { success: true, message: 'Patient registered successfully!', patient };
  } catch (error) {
    console.error('Failed to register patient:', error);
    // Differentiate between known errors (like unique constraint) and unknown
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
         return { success: false, message: 'A patient with this email already exists.' };
    }
    return { success: false, message: 'An unexpected error occurred while registering the patient.' };
  }
}
