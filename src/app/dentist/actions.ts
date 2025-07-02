"use server";
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function updateEmergencyStatus(newStatus: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'DENTIST' || !session.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }
  try {
    const dentist = await prisma.dentist.update({
      where: { userId: session.user.id },
      data: { isAvailableForEmergency: newStatus },
    });
    return { success: true, message: 'Emergency status updated', updatedStatus: dentist.isAvailableForEmergency };
  } catch (e) {
    return { success: false, message: 'Failed to update emergency status' };
  }
} 