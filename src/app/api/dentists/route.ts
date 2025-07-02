import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const dentists = await prisma.dentist.findMany({
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });
  return NextResponse.json(dentists);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'DENTIST' || session.user?.id !== params.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { isAvailableForEmergency } = await req.json();
  try {
    const dentist = await prisma.dentist.update({
      where: { userId: params.id },
      data: { isAvailableForEmergency },
    });
    return NextResponse.json({ success: true, message: 'Emergency status updated', updatedStatus: dentist.isAvailableForEmergency });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to update emergency status' }, { status: 500 });
  }
} 