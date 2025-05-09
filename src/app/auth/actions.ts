
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Patient, Dentist } from '@prisma/client'; // Import Prisma-generated types
import type { AuthenticatedUser, UserType } from '@/lib/types';

// IMPORTANT: In a real application, passwords should be hashed using a library like bcrypt.
// Storing and comparing plaintext passwords is a major security vulnerability.

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  accountType: z.enum(['patient', 'dentist'], { message: "Account type is required." }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export async function loginAction(
  credentials: LoginInput
): Promise<{ success: boolean; user?: AuthenticatedUser; userType?: UserType; message: string }> {
  const validationResult = LoginSchema.safeParse(credentials);
  if (!validationResult.success) {
    return { success: false, message: validationResult.error.errors.map(e => e.message).join(', ') };
  }

  const { email, password, accountType } = validationResult.data;

  try {
    let user: Patient | Dentist | null = null;
    if (accountType === 'patient') {
      user = await prisma.patient.findUnique({ where: { email } });
    } else {
      user = await prisma.dentist.findUnique({ where: { email } });
    }

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // SECURITY RISK: Plaintext password comparison. Use hashing in production.
    if (user.password !== password) {
      return { success: false, message: 'Invalid password.' };
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;


    return { success: true, user: userWithoutPassword as AuthenticatedUser, userType: accountType, message: 'Login successful!' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred during login.' };
  }
}

const SignupSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  accountType: z.enum(['patient', 'dentist']),
  specialty: z.string().optional(), // Only for dentists
});
export type SignupInput = z.infer<typeof SignupSchema>;

export async function signupAction(
  data: SignupInput
): Promise<{ success: boolean; user?: AuthenticatedUser; userType?: UserType; message: string; errors?: z.ZodIssue[] }> {
  const validationResult = SignupSchema.safeParse(data);
  if (!validationResult.success) {
    return { 
      success: false, 
      message: "Validation failed.",
      errors: validationResult.error.errors,
    };
  }

  const { fullName, email, password, accountType, specialty } = validationResult.data;

  try {
    let existingUser: Patient | Dentist | null = null;
    if (accountType === 'patient') {
      existingUser = await prisma.patient.findUnique({ where: { email } });
    } else {
      if (!specialty) {
        return { success: false, message: "Specialty is required for dentist accounts." };
      }
      existingUser = await prisma.dentist.findUnique({ where: { email } });
    }

    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    let newUser: Patient | Dentist;
    if (accountType === 'patient') {
      newUser = await prisma.patient.create({
        data: {
          name: fullName,
          email,
          password, // SECURITY RISK: Storing plaintext password. Hash in production.
        },
      });
    } else {
      newUser = await prisma.dentist.create({
        data: {
          name: fullName,
          email,
          password, // SECURITY RISK: Storing plaintext password. Hash in production.
          specialty: specialty!, // Validation ensures specialty exists for dentists
          isAvailableForEmergency: false, // Default value
        },
      });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;

    return { success: true, user: userWithoutPassword as AuthenticatedUser, userType: accountType, message: 'Signup successful!' };
  } catch (error) {
    console.error('Signup error:', error);
     if (error instanceof Error && error.message.includes('Unique constraint failed')) {
         return { success: false, message: 'An account with this email already exists.' };
    }
    return { success: false, message: 'An unexpected error occurred during signup.' };
  }
}
