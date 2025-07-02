'use client'; 

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Briefcase, LogOut, UserCircle, LogIn, UserPlus, Bell } from 'lucide-react';
import LanguageSwitcher from './language-switcher';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import EmergencyStatusToggle from '@/components/dentist/emergency-status-toggle';
import { useEffect, useState } from 'react';

function NotificationsBell() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Polling cada 5 segundos
  useEffect(() => {
    if (!currentUser) return;
    let interval: any;
    const fetchNotifications = () => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success) setNotifications(data.notifications);
        });
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        aria-label={t('notifications.openPanel')}
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Bell className="h-6 w-6 text-accent" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white border rounded shadow-lg z-50 overflow-y-auto">
          <div className="p-3 border-b font-semibold flex items-center justify-between">
            <span>{t('notifications.title')}</span>
            <a href="/notifications" className="text-xs text-accent hover:underline">{t('notifications.seeAll')}</a>
          </div>
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">{t('notifications.loading')}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">{t('notifications.empty')}</div>
          ) : (
            <ul>
              {notifications.map(n => (
                <li key={n.id} className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/30 ${!n.read ? 'bg-accent/10' : ''}`}
                  onClick={() => { if (!n.read) markAsRead(n.id); if (n.link) window.location.href = n.link; }}>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

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
      {(!currentUser || userType === 'patient') && (
        <Link href="/emergencies" className={isMobile ? "text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}>
          {t('navbar.emergencies')}
        </Link>
      )}
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
        <UserCircle className="mr-1 h-5 w-5" /> {t('navbar.myProfile')}
      </Link>
      <Button variant={isMobile ? "outline" : "ghost"} size={isMobile ? "default" : "sm"} onClick={logout} className={isMobile ? "w-full" : ""}>
        <LogOut className="mr-1 h-5 w-5" /> {t('navbar.logout')}
      </Button>
    </>
  );

  const unauthenticatedUserLinks = (isMobile = false) => (
    <>
       <Link href="/login" className={isMobile ? "text-muted-foreground hover:text-foreground flex items-center" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"}>
         <LogIn className="mr-1 h-5 w-5" /> {t('navbar.login')}
      </Link>
      <Button asChild variant={isMobile ? "default" : "default"} size={isMobile ? "default" : "sm"} className={isMobile ? "w-full bg-primary text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}>
        <Link href="/signup"><UserPlus className="mr-1 h-5 w-5" />{t('navbar.signup')}</Link>
      </Button>
    </>
  );

  return (
    <>
      <nav className="hidden md:flex gap-4 items-center">
        {commonLinks()}
        {currentUser ? (
          <>
            <span className="text-sm font-medium text-primary flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              {currentUser.name || currentUser.email}
            </span>
            {userType === 'dentist' && (
              <EmergencyStatusToggle dentistId={currentUser.id} />
            )}
            {authenticatedUserLinks()}
            <NotificationsBell />
          </>
        ) : (
          unauthenticatedUserLinks()
        )}
        <LanguageSwitcher />
      </nav>

      <div className="md:hidden flex items-center gap-2">
        <LanguageSwitcher />
        <NotificationsBell />
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
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent">
                  <path d="M9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.649 14.596 5.7092 15.4584 5.77321 16.3755C5.92401 18.536 6.096 21 7.5 21C8.39898 21 8.79286 19.5857 9.22652 18.0286C9.75765 16.1214 10.3485 14 12 14C13.6515 14 14.2423 16.1214 14.7735 18.0286C15.2071 19.5857 15.601 21 16.5 21C17.904 21 18.076 18.536 18.2268 16.3755C18.2908 15.4584 18.351 14.596 18.5 14C18.6803 13.2788 18.9256 12.6877 19.1656 12.1093C19.5912 11.0838 20 10.0985 20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-foreground">COEC</span>
              </Link>
              {commonLinks(true)}
              {currentUser ? (
                <>
                  <span className="text-base font-medium text-primary flex items-center gap-2 mb-2">
                    <UserCircle className="h-5 w-5" />
                    {currentUser.name || currentUser.email}
                  </span>
                  {userType === 'dentist' && (
                    <EmergencyStatusToggle dentistId={currentUser.id} />
                  )}
                  {authenticatedUserLinks(true)}
                  <NotificationsBell />
                </>
              ) : (
                unauthenticatedUserLinks(true)
              )}
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
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent">
            <path d="M9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.649 14.596 5.7092 15.4584 5.77321 16.3755C5.92401 18.536 6.096 21 7.5 21C8.39898 21 8.79286 19.5857 9.22652 18.0286C9.75765 16.1214 10.3485 14 12 14C13.6515 14 14.2423 16.1214 14.7735 18.0286C15.2071 19.5857 15.601 21 16.5 21C17.904 21 18.076 18.536 18.2268 16.3755C18.2908 15.4584 18.351 14.596 18.5 14C18.6803 13.2788 18.9256 12.6877 19.1656 12.1093C19.5912 11.0838 20 10.0985 20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-xl font-bold text-foreground">COEC</span>
        </Link>
        <NavbarClientContent />
      </div>
    </header>
  );
}
