'use client';

import { useLanguage } from '@/context/language-context';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <select
        className="border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        value={locale}
        onChange={e => setLocale(e.target.value as 'en' | 'es')}
        aria-label={t('languageSwitcher.label')}
      >
        <option value="es">{t('languageSwitcher.spanish')}</option>
        <option value="en">{t('languageSwitcher.english')}</option>
      </select>
    </div>
  );
}
