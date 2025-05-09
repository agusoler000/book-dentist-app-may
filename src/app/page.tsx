import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, CalendarDays, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center space-y-12">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10 rounded-lg shadow-lg">
        <div className="container px-4 md:px-6 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-primary-foreground mix-blend-multiply">
              Welcome to <span className="text-accent">DentalFlow</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Streamline your dental appointments with ease. For patients and dentists,
              DentalFlow is your partner in dental health management.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
                <Link href="/patient/book-appointment">Book an Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-md">
                <Link href="/dentist/dashboard">Dentist Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">Why Choose DentalFlow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <CalendarDays className="w-12 h-12 text-accent mb-2" />
                <CardTitle>Easy Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Find available slots and book your dental appointments in just a few clicks.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <Users className="w-12 h-12 text-accent mb-2" />
                <CardTitle>For Everyone</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Separate portals for patients to manage bookings and dentists to manage schedules.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <ShieldAlert className="w-12 h-12 text-accent mb-2" />
                <CardTitle>Emergency Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Quickly find dentists available for urgent dental needs.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-16 bg-secondary/30 rounded-lg shadow-lg">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-12">
          <Image
            alt="Happy patient at a dental clinic"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last shadow-md"
            data-ai-hint="dental clinic patient"
            height="310"
            src="https://picsum.photos/seed/dentalhero/550/310"
            width="550"
          />
          <div className="flex flex-col justify-center space-y-4">
            <ul className="grid gap-6">
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold flex items-center"><CheckCircle className="w-5 h-5 text-accent mr-2" />Patient Profiles</h3>
                  <p className="text-muted-foreground">
                    Keep track of your appointments and dental history in one place.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold flex items-center"><CheckCircle className="w-5 h-5 text-accent mr-2" />Dentist Schedules</h3>
                  <p className="text-muted-foreground">
                    Manage your calendar, patient appointments, and emergency availability.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold flex items-center"><CheckCircle className="w-5 h-5 text-accent mr-2" />Notifications & Reminders</h3>
                  <p className="text-muted-foreground">
                    Stay informed about upcoming appointments (feature coming soon!).
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
