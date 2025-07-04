import prisma from './prisma';

export async function getUserLocale(userId: string): Promise<'en' | 'es'> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { locale: true },
    });
    
    if (user?.locale && (user.locale === 'en' || user.locale === 'es')) {
      return user.locale as 'en' | 'es';
    }
    
    return 'es'; // Fallback a español
  } catch (error) {
    console.error('Error getting user locale:', error);
    return 'es'; // Fallback a español
  }
} 