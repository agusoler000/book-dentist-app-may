import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function PATCH(req: NextRequest, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  console.log(session)
  if (!session || (session.user as any)?.role !== 'DENTIST' || (session.user as any)?.id !== params.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { isAvailableForEmergency } = await req.json();
  try {
    const dentist = await prisma.dentist.update({
      where: { userId: (session.user as any)?.id },
      data: { isAvailableForEmergency },
    });
    return NextResponse.json({ success: true, message: 'Emergency status updated', updatedStatus: dentist.isAvailableForEmergency });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to update emergency status' }, { status: 500 });
  }
} 