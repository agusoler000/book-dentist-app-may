import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { locale } = await req.json();
    
    if (!locale || (locale !== 'en' && locale !== 'es')) {
      return NextResponse.json({ success: false, message: 'Invalid locale' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { locale },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user locale:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 