'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Briefcase, LogIn, AlertTriangle } from 'lucide-react'; // Briefcase for dentist, User for patient
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';

export function HomePage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any).role;
      if (role === 'PATIENT') router.replace('/patient/dashboard');
      else if (role === 'DENTIST') router.replace('/dentist/dashboard');
    }
  }, [session, status, router]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      {/* Emergencia destacado flotante arriba a la derecha en desktop */}
      <div className="hidden md:block">
        <div className="absolute top-10 right-10 w-[260px] z-30">
          <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-900/10 p-4 shadow-xl flex flex-col items-center text-center animate-fade-in">
            <h2 className="text-lg font-bold text-red-700 mb-1 animate-pulse">{t('home.haveEmergency')}</h2>
            <p className="text-xs text-red-800 mb-3">{t('home.emergencyDesc')}</p>
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-base px-4 py-1 animate-bounce">
              <Link href="/emergencies">{t('home.requestEmergency')}</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile: botón flotante colapsable abajo derecha */}
      <MobileEmergencyButton t={t} />
      {/* Contenido principal centrado */}
      <div className="flex flex-col items-center w-full">
        <div className="text-center mb-12">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-accent mb-4">
            <path d="M9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.649 14.596 5.7092 15.4584 5.77321 16.3755C5.92401 18.536 6.096 21 7.5 21C8.39898 21 8.79286 19.5857 9.22652 18.0286C9.75765 16.1214 10.3485 14 12 14C13.6515 14 14.2423 16.1214 14.7735 18.0286C15.2071 19.5857 15.601 21 16.5 21C17.904 21 18.076 18.536 18.2268 16.3755C18.2908 15.4584 18.351 14.596 18.5 14C18.6803 13.2788 18.9256 12.6877 19.1656 12.1093C19.5912 11.0838 20 10.0985 20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
            {t('home.welcome')}
          </h1>
          <p className="mt-4 mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            {t('home.description')}
          </p>
        </div>
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
          <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300 border-2 border-accent/30">
            <CardHeader className="items-center text-center p-8 bg-primary/10 rounded-t-xl">
              <svg className="w-14 h-14 mx-auto mb-2 text-accent" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth="2">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="#fff" />
                <path d="M16 28c1.5 2 4.5 4 8 4s6.5-2 8-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="20" r="2" fill="#22c55e" />
                <circle cx="30" cy="20" r="2" fill="#22c55e" />
              </svg>
              <CardTitle className="text-2xl font-semibold text-primary-foreground mix-blend-multiply">¡Bienvenido a COEC!</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <CardDescription className="mb-6 text-lg text-muted-foreground">
                ¿Eres nuevo en COEC? Regístrate y accede a tu portal para gestionar tus citas, emergencias y mucho más. Si ya tienes cuenta, ingresa para ver tu información personalizada.
              </CardDescription>
              <div className="flex flex-col gap-4">
                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/signup">
                    <LogIn className="mr-2 h-5 w-5" /> Registrarme
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
                  <Link href="/patient/dashboard">
                    <User className="mr-2 h-5 w-5" /> Ya tengo cuenta
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-12 w-full max-w-4xl">
          <Image
            alt="Dental clinic reception"
            className="mx-auto aspect-[2/1] overflow-hidden rounded-xl object-cover shadow-lg"
            data-ai-hint="dental clinic reception"
            height={400}
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            width={800}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;

// Componente para el botón colapsable de emergencia en mobile
function MobileEmergencyButton({ t }: { t: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      {open ? (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-900/10 p-3 shadow-xl flex flex-col items-center text-center animate-fade-in w-[90vw] max-w-xs">
          <div className="flex w-full justify-between items-center mb-1">
            <h2 className="text-base font-bold text-red-700 animate-pulse">{t('home.haveEmergency')}</h2>
            <button onClick={() => setOpen(false)} className="ml-2 text-red-700 text-xl font-bold px-2">×</button>
          </div>
          <p className="text-xs text-red-800 mb-2">{t('home.emergencyDesc')}</p>
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-base px-3 py-1 animate-bounce w-full">
            <Link href="/emergencies">{t('home.requestEmergency')}</Link>
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg px-4 py-2 animate-bounce border-2 border-red-400"
          style={{ minWidth: 0 }}
        >
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="text-base font-semibold">{t('home.haveEmergency')}</span>
        </button>
      )}
    </div>
  );
}
