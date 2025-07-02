'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Patient } from '@prisma/client';
import { hash } from 'bcryptjs';

const PatientRegistrationSchema = z.object({
  name: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  dni: z.string().min(1, { message: "DNI is required." }),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth.",
  }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
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

  const { name, email, phone, dni, dateOfBirth, password } = validationResult.data;

  try {
    // Check if user or patient already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { patient: { dni } },
        ],
      },
    });
    if (existingUser) {
      return { success: false, message: 'A user or patient with this email or DNI already exists.' };
    }

    // Create user
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PATIENT',
      },
    });

    // Create patient profile
    const patient = await prisma.patient.create({
      data: {
        dni,
        phone: phone || null,
        dateOfBirth: new Date(dateOfBirth),
        user: { connect: { id: user.id } },
      },
    });
    return { success: true, message: 'Patient registered successfully!', patient: { ...patient, name: user.name, email: user.email } };
  } catch (error) {
    console.error('Failed to register patient:', error);
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return { success: false, message: 'A user or patient with this email or DNI already exists.' };
    }
    return { success: false, message: 'An unexpected error occurred while registering the patient.' };
  }
}
