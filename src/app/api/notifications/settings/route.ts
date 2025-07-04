import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET: Obtener configuración actual del usuario
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        pushEmergencies: true,
        pushAppointments: true,
        pushStatusChanges: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        pushEmergencies: user.pushEmergencies,
        pushAppointments: user.pushAppointments,
        pushStatusChanges: user.pushStatusChanges,
      },
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Actualizar configuración del usuario
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pushEmergencies, pushAppointments, pushStatusChanges } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushEmergencies: Boolean(pushEmergencies),
        pushAppointments: Boolean(pushAppointments),
        pushStatusChanges: Boolean(pushStatusChanges),
      },
      select: {
        pushEmergencies: true,
        pushAppointments: true,
        pushStatusChanges: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        pushEmergencies: updatedUser.pushEmergencies,
        pushAppointments: updatedUser.pushAppointments,
        pushStatusChanges: updatedUser.pushStatusChanges,
      },
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 