'use client';

import { useLanguage } from '@/context/language-context';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>{t('footer.copy', { year: currentYear })}</p>
        <p className="mt-1">{t('footer.tagline')}</p>
      </div>
    </footer>
  );
}
