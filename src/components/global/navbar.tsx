import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MountainIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MountainIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">DentalFlow</span>
        </Link>
        
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/patient/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Patient Portal
          </Link>
          <Link href="/dentist/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dentist Portal
          </Link>
          <Link href="/patient/emergencies" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Emergencies
          </Link>
          <Button asChild variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/patient/book-appointment">Book Now</Link>
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium mt-8">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <MountainIcon className="h-6 w-6 text-primary" />
                <span className="sr-only">DentalFlow</span>
            </Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link href="/patient/dashboard" className="text-muted-foreground hover:text-foreground">
                Patient Portal
              </Link>
              <Link href="/dentist/dashboard" className="text-muted-foreground hover:text-foreground">
                Dentist Portal
              </Link>
              <Link href="/patient/emergencies" className="text-muted-foreground hover:text-foreground">
                Emergencies
              </Link>
              <Button asChild variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
                <Link href="/patient/book-appointment">Book Now</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
