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

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
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
