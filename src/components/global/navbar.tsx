
'use client'; 

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Briefcase, LogOut, UserCircle, LogIn, UserPlus } from 'lucide-react';
import LanguageSwitcher from './language-switcher';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context'; // Import useAuth

function NavbarClientContent() {
  const { t } = useLanguage();
  const { currentUser, userType, logout, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
      </div>
    ); // Or some loading indicator
  }

  const commonLinks = (isMobile = false) => (
    <>
      <Link href="/patient/emergencies" className={isMobile ? "text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}>
        {t('navbar.emergencies')}
      </Link>
      {!currentUser && (
        <Button asChild variant={isMobile ? "default" : "default"} className={isMobile ? "w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" : "bg-accent text-accent-foreground hover:bg-accent/90"}>
          <Link href="/patient/book-appointment">{t('navbar.bookNow')}</Link>
        </Button>
      )}
      {currentUser && userType === 'patient' && (
         <Button asChild variant={isMobile ? "default" : "default"} className={isMobile ? "w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" : "bg-accent text-accent-foreground hover:bg-accent/90"}>
            <Link href="/patient/book-appointment">{t('navbar.bookNow')}</Link>
        </Button>
      )}
    </>
  );
  
  const authenticatedUserLinks = (isMobile = false) => (
    <>
      {userType === 'patient' && (
        <Link href="/patient/dashboard" className={isMobile ? "text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}>
          {t('navbar.patientPortal')}
        </Link>
      )}
      {userType === 'dentist' && (
        <Link href="/dentist/dashboard" className={isMobile ? "text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}>
          {t('navbar.dentistPortal')}
        </Link>
      )}
       <Link href={userType === 'patient' ? "/patient/profile" : "/dentist/profile"} className={isMobile ? "text-muted-foreground hover:text-foreground flex items-center" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"}>
        <UserCircle className="mr-1 h-5 w-5" /> My Profile
      </Link>
      <Button variant={isMobile ? "outline" : "ghost"} size={isMobile ? "default" : "sm"} onClick={logout} className={isMobile ? "w-full" : ""}>
        <LogOut className="mr-1 h-5 w-5" /> Logout
      </Button>
    </>
  );

  const unauthenticatedUserLinks = (isMobile = false) => (
    <>
       <Link href="/login" className={isMobile ? "text-muted-foreground hover:text-foreground flex items-center" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"}>
         <LogIn className="mr-1 h-5 w-5" /> Login
      </Link>
      <Button asChild variant={isMobile ? "default" : "default"} size={isMobile ? "default" : "sm"} className={isMobile ? "w-full bg-primary text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}>
        <Link href="/signup"><UserPlus className="mr-1 h-5 w-5" />Sign Up</Link>
      </Button>
    </>
  );

  return (
    <>
      <nav className="hidden md:flex gap-4 items-center">
        {commonLinks()}
        {currentUser ? authenticatedUserLinks() : unauthenticatedUserLinks()}
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
                <Briefcase className="h-6 w-6 text-accent" />
                <span className="text-foreground">DentalFlow</span>
              </Link>
              {commonLinks(true)}
              {currentUser ? authenticatedUserLinks(true) : unauthenticatedUserLinks(true)}
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
          <Briefcase className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold text-foreground">DentalFlow</span>
        </Link>
        <NavbarClientContent />
      </div>
    </header>
  );
}
