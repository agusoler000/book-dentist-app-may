'use client';
// layout.tsx
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Navbar from '@/components/global/navbar';
import Footer from '@/components/global/footer';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { requestFirebaseNotificationPermission } from '@/lib/firebase';
import { Bell } from 'lucide-react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const [showPushButton, setShowPushButton] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  // const [debugToken, setDebugToken] = useState<string | null>(null); // <-- Eliminar debug

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setShowPushButton(true);
    }
  }, []);

  const handleEnablePush = async () => {
    try {
      const token = await requestFirebaseNotificationPermission();
      // setDebugToken(token || 'NO TOKEN'); // <-- Eliminar debug
      if (token) {
        await fetch('/api/save-fcm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        setPushEnabled(true);
        alert('¡Notificaciones push activadas!');
      } else {
        alert('No se pudo obtener el token de notificación.');
      }
    } catch (err) {
      alert('No se pudo activar notificaciones push.');
    }
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col',
          fontSans.variable
        )}
      >
        <SessionProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              {showPushButton && !pushEnabled && (
                <button
                  onClick={handleEnablePush}
                  style={{
                    position: 'fixed',
                    bottom: 24,
                    left: 24,
                    zIndex: 1000,
                    background: 'white',
                    color: '#0ea5e9',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '0.5rem 0.7rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  aria-label="Activar notificaciones push"
                >
                  <Bell size={22} style={{ marginRight: 4 }} />
                </button>
              )}
              <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
              <Footer />
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
