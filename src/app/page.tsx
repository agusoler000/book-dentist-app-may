'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Briefcase, LogIn } from 'lucide-react'; // Briefcase for dentist, User for patient
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <div className="text-center mb-12">
        <Briefcase className="h-16 w-16 mx-auto text-accent mb-4" />
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
          {t('home.welcome')}
        </h1>
        <p className="mt-4 mx-auto max-w-[600px] text-muted-foreground md:text-xl">
          {t('home.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="items-center text-center p-6 bg-primary/10">
            <User className="w-12 h-12 text-primary-foreground mix-blend-multiply mb-2" />
            <CardTitle className="text-2xl font-semibold text-primary-foreground mix-blend-multiply">{t('home.areYouPatient')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <CardDescription className="mb-6">
              Accede a tu portal para ver tus citas, historial y más.
            </CardDescription>
            <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/patient/dashboard">
                <LogIn className="mr-2 h-5 w-5" /> {t('home.patientPortal')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="items-center text-center p-6 bg-secondary/20">
             <Briefcase className="w-12 h-12 text-secondary-foreground mix-blend-multiply mb-2" />
            <CardTitle className="text-2xl font-semibold text-secondary-foreground mix-blend-multiply">{t('home.areYouDentist')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <CardDescription className="mb-6">
              Gestiona tu agenda, pacientes y disponibilidad para emergencias.
            </CardDescription>
            <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/dentist/dashboard">
                <LogIn className="mr-2 h-5 w-5" /> {t('home.dentistPortal')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12 w-full max-w-4xl">
         <Image
            alt="Dental clinic reception"
            className="mx-auto aspect-[2/1] overflow-hidden rounded-xl object-cover shadow-lg"
            data-ai-hint="dental clinic reception"
            height={400}
            src="https://picsum.photos/seed/dentalhome/800/400" 
            width={800}
          />
      </div>
    </div>
  );
}
