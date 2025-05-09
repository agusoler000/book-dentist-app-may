import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a common sans-serif
import './globals.css';
import { cn } from '@/lib/utils';
import Navbar from '@/components/global/navbar';
import Footer from '@/components/global/footer';
import { Toaster } from '@/components/ui/toaster';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Keep variable name as scaffolded for Geist compatibility if needed later
});

export const metadata: Metadata = {
  title: 'DentalFlow - Your Dental Appointment Manager',
  description: 'Easily book and manage your dental appointments with DentalFlow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col',
          fontSans.variable
        )}
      >
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
