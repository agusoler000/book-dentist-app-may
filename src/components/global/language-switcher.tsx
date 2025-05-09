'use client';

import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={toggleLanguage} aria-label="Change language">
            <Globe className="h-5 w-5" />
            <span className="sr-only">
              {locale === 'en' ? t('languageSwitcher.es') : t('languageSwitcher.en')}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{locale === 'en' ? `Switch to ${t('languageSwitcher.es')}` : `Cambiar a ${t('languageSwitcher.en')}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Necessary imports for Tooltip if not already globally available in context
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
