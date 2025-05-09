
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Patient, Dentist, AuthenticatedUser, UserType } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: AuthenticatedUser | null;
  userType: UserType | null;
  isLoadingAuth: boolean;
  login: (user: AuthenticatedUser, type: UserType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedUserType = localStorage.getItem('userType') as UserType | null;
      if (storedUser && storedUserType) {
        setCurrentUser(JSON.parse(storedUser));
        setUserType(storedUserType);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userType');
    }
    setIsLoadingAuth(false);
  }, []);

  const login = useCallback((user: AuthenticatedUser, type: UserType) => {
    // Ensure password is not stored in context or localStorage
    const userToStore = { ...user };
    // @ts-ignore
    delete userToStore.password; 

    setCurrentUser(userToStore);
    setUserType(type);
    try {
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      localStorage.setItem('userType', type);
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUserType(null);
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userType');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    router.push('/'); // Redirect to home on logout
  }, [router]);

  return (
    <AuthContext.Provider value={{ currentUser, userType, isLoadingAuth, login, logout }}>
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
