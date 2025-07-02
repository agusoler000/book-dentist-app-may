'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { UserType } from '@/lib/types';

interface AuthContextType {
  currentUser: any | null;
  userType: UserType | null;
  isLoadingAuth: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user || null;
  const userType = (user as any)?.role ? (user as any).role.toLowerCase() : null;
  const isLoadingAuth = status === 'loading';

  let userWithDentistId = user;
  if (user && userType === 'dentist' && (user as any).dentistId) {
    userWithDentistId = { ...user, dentistId: (user as any).dentistId };
  }

  const login = () => signIn();
  const logout = () => signOut({ callbackUrl: '/' });

  return (
    <AuthContext.Provider value={{ currentUser: userWithDentistId, userType, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
