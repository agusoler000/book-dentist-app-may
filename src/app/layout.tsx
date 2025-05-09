import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a common sans-serif
import './globals.css';
import { cn } from '@/lib/utils';
import Navbar from '@/components/global/navbar';
import Footer from '@/components/global/footer';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/context/language-context';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Keep variable name as scaffolded for Geist compatibility if needed later
});

export const metadata: Metadata = {
  title: 'DentalFlow - Gestor de Citas Dentales',
  description: 'Reserva y gestiona fácilmente tus citas dentales con DentalFlow.',
  icons: null, // Explicitly prevent favicon generation
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col',
          fontSans.variable
        )}
      >
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <Footer />
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}

