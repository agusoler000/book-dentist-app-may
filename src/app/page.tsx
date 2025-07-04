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
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export default function HomePage() {
  const { t, locale } = useLanguage ? useLanguage() : { t: (x: string) => x, locale: 'es' };
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any).role;
      if (role === 'PATIENT') router.replace('/patient/dashboard');
      else if (role === 'DENTIST') router.replace('/dentist/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="w-16 h-16 rounded-full bg-accent animate-pulse" />
      </div>
    );
  }

  if (status === 'authenticated' && session?.user) {
    return null; // El useEffect se encarga del redirect
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      {/* Emergencia destacado flotante arriba a la derecha en desktop, ahora colapsable y más pequeño */}
      <div className="hidden md:block">
        <div className="absolute top-8 right-8 w-[220px] z-30">
          <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-900/10 p-2 shadow-xl flex flex-col items-center text-center animate-fade-in">
            <button
              className="flex items-center justify-center w-full gap-2 text-red-700 font-bold text-sm mb-1 hover:underline focus:outline-none"
              onClick={() => setEmergencyOpen((v) => !v)}
              aria-expanded={emergencyOpen}
              aria-controls="emergency-float-content"
            >
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              {locale === 'en' ? 'Have an emergency?' : '¿Emergencia?'}
              <span className="ml-auto">{emergencyOpen ? '▲' : '▼'}</span>
            </button>
            {emergencyOpen && (
              <div id="emergency-float-content" className="w-full mt-1">
                <p className="text-xs text-red-800 mb-2">
                  {locale === 'en'
                    ? 'If you have a dental emergency, you can see available doctors and request immediate care. Click the button to access the emergency form.'
                    : 'Si tienes una emergencia dental, puedes ver los doctores disponibles y solicitar atención inmediata. Pulsa el botón para acceder al formulario de emergencia.'}
                </p>
                <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1 animate-bounce w-full">
                  <Link href="/emergencies">
                    {locale === 'en' ? 'Request emergency' : 'Solicitar emergencia'}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile: botón flotante colapsable abajo derecha */}
      <MobileEmergencyButton t={t} />
      {/* Contenido principal centrado */}
      <div className="flex flex-col items-center w-full">
        {/* Cartel de bienvenida */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold mb-2">{locale === 'en' ? 'Welcome to COEC' : 'Bienvenido a COEC'}</h1>
          <p className="text-lg text-muted-foreground">{locale === 'en' ? 'Designed for healthy smiles.' : 'Diseñado para sonrisas saludables.'}</p>
        </div>
        {/* Instrucciones de instalación PWA */}
        <Accordion type="single" collapsible className="w-full max-w-xl mb-4">
          <AccordionItem value="pwa-install">
            <AccordionTrigger>
              {locale === 'en' ? 'How to install the app on your phone? (iOS & Android)' : '¿Cómo instalar la app en tu móvil? (iOS y Android)'}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm text-left">
                {locale === 'en' ? (
                  <>
                    <b>On Android (Chrome):</b>
                    <ol className="list-decimal ml-6 mb-2">
                      <li>Open the app in <b>Google Chrome</b> on your phone.</li>
                      <li>Tap the <b>three dots</b> icon (top right).</li>
                      <li>Select <b>"Install app"</b> or <b>"Add to Home screen"</b>.</li>
                      <li>Confirm the installation. Done! Now you can open the app from the icon on your home screen.</li>
                    </ol>
                    <b>On iPhone (iOS, Safari):</b>
                    <ol className="list-decimal ml-6 mb-2">
                      <li>Open the app in <b>Safari</b> (does not work in Chrome or other browsers).</li>
                      <li>Tap the <b>share</b> icon (<span role="img" aria-label="share">&#x1f4e4;</span>) in the bottom bar.</li>
                      <li>Scroll up and select <b>"Add to Home Screen"</b>.</li>
                      <li>Confirm the name and tap <b>"Add"</b>.</li>
                      <li>Open the app from the new icon on your home screen. Only this way will you receive push notifications.</li>
                    </ol>
                    <b>Why install the app?</b>
                    <ul className="list-disc ml-6">
                      <li>Receive real-time push notifications.</li>
                      <li>Quick access and an experience similar to a native app.</li>
                      <li>Better integration with your device.</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <b>En Android (Chrome):</b>
                    <ol className="list-decimal ml-6 mb-2">
                      <li>Abre la app en <b>Google Chrome</b> en tu móvil.</li>
                      <li>Pulsa el icono de <b>tres puntos</b> (arriba a la derecha).</li>
                      <li>Selecciona <b>"Instalar app"</b> o <b>"Agregar a pantalla de inicio"</b>.</li>
                      <li>Confirma la instalación. ¡Listo! Ahora puedes abrir la app desde el icono en tu pantalla de inicio.</li>
                    </ol>
                    <b>En iPhone (iOS, Safari):</b>
                    <ol className="list-decimal ml-6 mb-2">
                      <li>Abre la app en <b>Safari</b> (no funciona en Chrome ni otros navegadores).</li>
                      <li>Pulsa el icono de <b>compartir</b> (<span role="img" aria-label="compartir">&#x1f4e4;</span>) en la barra inferior.</li>
                      <li>Desliza hacia arriba y selecciona <b>"Agregar a pantalla de inicio"</b>.</li>
                      <li>Confirma el nombre y pulsa <b>"Agregar"</b>.</li>
                      <li>Abre la app desde el nuevo icono en tu pantalla de inicio. Solo así recibirás notificaciones push.</li>
                    </ol>
                    <b>¿Por qué instalar la app?</b>
                    <ul className="list-disc ml-6">
                      <li>Recibe notificaciones push en tiempo real.</li>
                      <li>Acceso rápido y experiencia similar a una app nativa.</li>
                      <li>Mejor integración con tu dispositivo.</li>
                    </ul>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* Card principal de bienvenida (restaurar estilo original pero traducir) */}
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
          <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300 border-2 border-accent/30">
            <CardHeader className="items-center text-center p-8 bg-primary/10 rounded-t-xl">
              <svg className="w-14 h-14 mx-auto mb-2 text-accent" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth="2">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="#fff" />
                <path d="M16 28c1.5 2 4.5 4 8 4s6.5-2 8-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="20" r="2" fill="#22c55e" />
                <circle cx="30" cy="20" r="2" fill="#22c55e" />
              </svg>
              <CardTitle className="text-2xl font-semibold text-primary-foreground mix-blend-multiply">
                {locale === 'en' ? 'Welcome to COEC' : '¡Bienvenido a COEC!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <CardDescription className="mb-6 text-lg text-muted-foreground">
                {locale === 'en'
                  ? 'New to COEC? Register and access your portal to manage your appointments, emergencies, and much more. If you already have an account, log in to see your personalized information.'
                  : '¿Eres nuevo en COEC? Regístrate y accede a tu portal para gestionar tus citas, emergencias y mucho más. Si ya tienes cuenta, ingresa para ver tu información personalizada.'}
              </CardDescription>
              <div className="flex flex-col gap-4">
                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/signup">
                    <LogIn className="mr-2 h-5 w-5" />
                    {locale === 'en' ? 'Register' : 'Registrarme'}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
                  <Link href="/patient/dashboard">
                    <User className="mr-2 h-5 w-5" />
                    {locale === 'en' ? 'I already have an account' : 'Ya tengo cuenta'}
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
