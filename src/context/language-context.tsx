// src/context/language-context.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import enTranslations from '@/translations/en.json';
import esTranslations from '@/translations/es.json';

type Locale = 'en' | 'es';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: enTranslations,
  es: esTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es'); // Default to Spanish

  useEffect(() => {
    // You could also try to get locale from localStorage or browser settings here
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'es')) {
      setLocaleState(storedLocale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation = translations[locale][key] || translations['en'][key] || key; // Fallback to English then key
      if (params) {
        Object.keys(params).forEach((paramKey) => {
          translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
        });
      }
      return translation;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
