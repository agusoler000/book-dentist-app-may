
'use client'; // Add this directive

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Briefcase } from 'lucide-react'; // Removed MountainIcon, using Briefcase
import LanguageSwitcher from './language-switcher';
import { useLanguage } from '@/context/language-context';

// Wrapper component to use hook
function NavbarClientContent() {
  const { t } = useLanguage();

  return (
    <>
      <nav className="hidden md:flex gap-4 items-center">
        {/* Links can be conditional based on auth state later */}
        <Link href="/patient/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          {t('navbar.patientPortal')}
        </Link>
        <Link href="/dentist/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          {t('navbar.dentistPortal')}
        </Link>
        <Link href="/patient/emergencies" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          {t('navbar.emergencies')}
        </Link>
        <Button asChild variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/patient/book-appointment">{t('navbar.bookNow')}</Link>
        </Button>
        <LanguageSwitcher />
      </nav>

      <div className="md:hidden flex items-center gap-2">
        <LanguageSwitcher />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium mt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Briefcase className="h-6 w-6 text-accent" /> {/* Changed icon to Briefcase */}
                <span className="text-foreground">DentalFlow</span>
              </Link>
              <Link href="/patient/dashboard" className="text-muted-foreground hover:text-foreground">
                {t('navbar.patientPortal')}
              </Link>
              <Link href="/dentist/dashboard" className="text-muted-foreground hover:text-foreground">
                {t('navbar.dentistPortal')}
              </Link>
              <Link href="/patient/emergencies" className="text-muted-foreground hover:text-foreground">
                {t('navbar.emergencies')}
              </Link>
              <Button asChild variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full mt-4">
                <Link href="/patient/book-appointment">{t('navbar.bookNow')}</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}


export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-accent" /> {/* Changed icon */}
          <span className="text-xl font-bold text-foreground">DentalFlow</span>
        </Link>
        
        <NavbarClientContent />
      </div>
    </header>
  );
}

