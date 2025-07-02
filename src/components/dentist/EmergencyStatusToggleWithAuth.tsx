"use client";
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/auth-context';
import EmergencyStatusToggle from './emergency-status-toggle';

export default function EmergencyStatusToggleWithAuth(props: React.ComponentProps<typeof EmergencyStatusToggle>) {
  return <EmergencyStatusToggle {...props} />;
} 