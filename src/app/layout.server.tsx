import type { Metadata } from 'next';
import ClientRootLayout from './layout';

export const metadata: Metadata = {
  title: 'COEC - Gestor de Citas Dentales',
  description: 'Reserva y gestiona fácilmente tus citas dentales con COEC.',
  icons: null, // Explicitly prevent favicon generation
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientRootLayout>{children}</ClientRootLayout>;
} 