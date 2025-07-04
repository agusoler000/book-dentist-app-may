'use client'; 

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Briefcase, LogOut, UserCircle, LogIn, UserPlus, Bell, Loader2, Circle, CircleDot, AlertTriangle, IdCard, LayoutDashboard } from 'lucide-react';
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
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  const [allLoaded, setAllLoaded] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Modifica fetchNotifications para paginar correctamente
  useEffect(() => {
    if (!currentUser) return;
    let interval: any;
    const fetchNotifications = (reset = false) => {
      const skip = reset ? 0 : notifications.length;
      const url = `/api/notifications?limit=${PAGE_SIZE}&skip=${skip}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(prev => {
              if (reset) return data.notifications;
              // Evita duplicados
              const ids = new Set(prev.map((n: any) => n.id));
              return [...prev, ...data.notifications.filter((n: any) => !ids.has(n.id))];
            });
            setAllLoaded(data.notifications.length < PAGE_SIZE);
          }
        });
    };
    fetchNotifications(true); // reset on mount
    interval = setInterval(() => fetchNotifications(true), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [currentUser]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !allLoaded && !loadingMore) {
      setLoadingMore(true);
      const skip = notifications.length;
      const url = `/api/notifications?limit=${PAGE_SIZE}&skip=${skip}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(prev => {
              const ids = new Set(prev.map((n: any) => n.id));
              return [...prev, ...data.notifications.filter((n: any) => !ids.has(n.id))];
            });
            setAllLoaded(data.notifications.length < PAGE_SIZE);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    const skip = notifications.length;
    const url = `/api/notifications?limit=${PAGE_SIZE}&skip=${skip}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(prev => {
            const ids = new Set(prev.map((n: any) => n.id));
            return [...prev, ...data.notifications.filter((n: any) => !ids.has(n.id))];
          });
          setAllLoaded(data.notifications.length < PAGE_SIZE);
        }
      })
      .finally(() => setLoadingMore(false));
  };

  // Solo mostrar no leídas y las últimas 2 leídas
  // const unread = notifications.filter(n => !n.read);
  // const read = notifications.filter(n => n.read).slice(0, 2);
  // const displayNotifications = [...unread, ...read];

  // Mostrar todas las notificaciones cargadas (acumuladas)
  const displayNotifications = notifications;

  const markAsRead = async (id: string) => {
    setMarkingRead(id);
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setMarkingRead(null);
  };

  const markAllAsRead = async () => {
    setMarkingRead('all');
    await Promise.all(
      notifications.filter(n => !n.read).map(n =>
        fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' })
      )
    );
    setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
    setMarkingRead(null);
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
        <div className="absolute right-0 mt-2 w-80 max-h-96 min-h-[300px] bg-white border rounded shadow-lg z-50 overflow-y-auto" onScroll={handleScroll}>
          <div className="p-3 border-b font-semibold flex items-center justify-between gap-2">
            <span>{t('notifications.title')}</span>
            <div className="flex gap-2 items-center">
              <button
                onClick={markAllAsRead}
                className={`text-xs text-accent hover:underline bg-transparent border-none p-0 m-0 flex items-center transition-colors ${markingRead === 'all' ? 'opacity-70' : ''}`}
                disabled={unreadCount === 0 || markingRead === 'all'}
                style={{ background: 'none' }}
              >
                {markingRead === 'all' && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
                {t('notifications.markAllRead')}
              </button>
              <a href="/notifications" className="text-xs text-accent hover:underline">{t('notifications.seeAll')}</a>
            </div>
          </div>
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">{t('notifications.loading')}</div>
          ) : displayNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">{t('notifications.empty')}</div>
          ) : (
            <ul>
              {displayNotifications.map(n => (
                <li key={n.id} className={`p-3 border-b last:border-b-0 flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/30 ${!n.read ? 'bg-accent/10' : ''}`}
                >
                  <div className="flex-1" onClick={() => { if (!n.read) markAsRead(n.id); if (n.link) window.location.href = n.link; }}>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); markAsRead(n.id); }}
                    className="ml-2 flex items-center justify-center w-6 h-6 rounded-full focus:outline-none"
                    title={t('notifications.markRead')}
                    disabled={markingRead === n.id || n.read}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    {markingRead === n.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    ) : n.read ? (
                      <Circle className="w-5 h-5 text-gray-400" />
                    ) : (
                      <CircleDot className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                </li>
              ))}
              {!allLoaded && !loadingMore && (
                <li className="p-2 text-center">
                  <button
                    onClick={() => handleLoadMore()}
                    className="text-xs text-accent hover:underline bg-transparent border-none p-0 m-0"
                  >
                    {t('notifications.loadMore')}
                  </button>
                </li>
              )}
              {loadingMore && (
                <li className="p-2 text-center text-xs text-muted-foreground">
                  {t('notifications.loading')}
                </li>
              )}
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
  const [open, setOpen] = useState(false); // <-- Mover aquí

  if (isLoadingAuth) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
      </div>
    ); // Or some loading indicator
  }

  // Cambiar commonLinks para menú móvil: Emergencias con icono rojo, sin 'Reservar ahora' si no logueado
  const commonLinks = (isMobile = false, closeMenu?: () => void) => (
    <>
      {(!currentUser || userType === 'patient') && (
        <Link
          href="/emergencies"
          className={isMobile ? "flex items-center gap-2 text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"}
          onClick={closeMenu}
        >
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>{t('navbar.emergencies')}</span>
        </Link>
      )}
      {/* Solo mostrar 'Reservar ahora' si está logueado como paciente */}
      {currentUser && userType === 'patient' && (
        <Link href="/patient/book-appointment" onClick={closeMenu} className={isMobile ? "flex items-center gap-2 text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"}>
          <UserPlus className="mr-1 h-5 w-5" /> {t('navbar.bookNow')}
        </Link>
      )}
    </>
  );

  // Cambiar authenticatedUserLinks y unauthenticatedUserLinks para menú móvil: solo icono + texto, cerrar menú al click
  const authenticatedUserLinks = (isMobile = false, closeMenu?: () => void) => (
    <>
      {userType === 'patient' && (
        <Link href="/patient/dashboard" className={isMobile ? "flex items-center gap-2 text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"} onClick={closeMenu}>
          <LayoutDashboard className="mr-1 h-5 w-5" /> {t('navbar.patientPortal')}
        </Link>
      )}
      {userType === 'dentist' && (
        <Link href="/dentist/dashboard" className={isMobile ? "flex items-center gap-2 text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"} onClick={closeMenu}>
          <Briefcase className="mr-1 h-5 w-5" /> {t('navbar.dentistPortal')}
        </Link>
      )}
      <Link href={userType === 'patient' ? "/patient/profile" : "/dentist/profile"} className={isMobile ? "flex items-center gap-2 text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"} onClick={closeMenu}>
        <UserCircle className="mr-1 h-5 w-5" /> {t('navbar.myProfile')}
      </Link>
      <Button variant={isMobile ? "outline" : "ghost"} size={isMobile ? "default" : "sm"} onClick={() => { logout(); if (closeMenu) closeMenu(); }} className={isMobile ? "w-full flex items-center gap-2 justify-center" : ""}>
        <LogOut className="mr-1 h-5 w-5" /> {t('navbar.logout')}
      </Button>
    </>
  );

  const unauthenticatedUserLinks = (isMobile = false, closeMenu?: () => void) => (
    <>
      <Link href="/login" className={isMobile ? "flex items-center gap-2 text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"} onClick={closeMenu}>
        <LogIn className="mr-1 h-5 w-5" /> {t('navbar.login')}
      </Link>
      <Link href="/signup" className={isMobile ? "flex items-center gap-2 text-muted-foreground hover:text-foreground" : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"} onClick={closeMenu}>
        <UserPlus className="mr-1 h-5 w-5" /> {t('navbar.signup')}
      </Link>
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
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium mt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent">
                  <path d="M9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.649 14.596 5.7092 15.4584 5.77321 16.3755C5.92401 18.536 6.096 21 7.5 21C8.39898 21 8.79286 19.5857 9.22652 18.0286C9.75765 16.1214 10.3485 14 12 14C13.6515 14 14.2423 16.1214 14.7735 18.0286C15.2071 19.5857 15.601 21 16.5 21C17.904 21 18.076 18.536 18.2268 16.3755C18.2908 15.4584 18.351 14.596 18.5 14C18.6803 13.2788 18.9256 12.6877 19.1656 12.1093C19.5912 11.0838 20 10.0985 20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-foreground">COEC</span>
              </Link>
              {currentUser && (
                <span className="text-base font-medium flex items-center gap-2 mb-2 text-muted-foreground hover:text-foreground">
                  <IdCard className="h-5 w-5" />
                  {currentUser.name || currentUser.email}
                </span>
              )}
              {commonLinks(true, () => setOpen(false))}
              {currentUser ? (
                <>
                  {userType === 'dentist' && (
                    <EmergencyStatusToggle dentistId={currentUser.id} />
                  )}
                  {authenticatedUserLinks(true, () => setOpen(false))}
                </>
              ) : (
                unauthenticatedUserLinks(true, () => setOpen(false))
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
