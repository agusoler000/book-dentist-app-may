import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Dentist } from '@/lib/types';
import { Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

interface DentistCardProps {
  dentist: Dentist;
}

export default function DentistCard({ dentist }: DentistCardProps) {
  const { t, locale } = useLanguage ? useLanguage() : { t: (x: string) => x, locale: 'es' };
  return (
    <Card className="w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="items-center">
        {dentist.profileImageUrl && (
          <Image
            src={dentist.profileImageUrl}
            alt={`Photo of ${dentist.name}`}
            width={100}
            height={100}
            className="rounded-full mb-4 border-2 border-primary shadow-sm"
            data-ai-hint="dentist portrait"
          />
        )}
        <CardTitle>{dentist.name}</CardTitle>
        <CardDescription>{dentist.specialty}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {dentist.bio && <p className="text-sm text-muted-foreground text-center">{dentist.bio}</p>}
        <div className="flex items-center text-sm">
          <Mail className="w-4 h-4 mr-2 text-accent" />
          <span>{dentist.email}</span>
        </div>
        {dentist.phone && (
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-2 text-accent" />
            <span>{dentist.phone}</span>
          </div>
        )}
        <div className={`flex items-center text-sm font-medium ${dentist.isAvailableForEmergency ? 'text-green-600' : 'text-red-600'}`}>
          {dentist.isAvailableForEmergency ? 
            <CheckCircle className="w-4 h-4 mr-2" /> : 
            <XCircle className="w-4 h-4 mr-2" />}
          <span>{dentist.isAvailableForEmergency ? 'Available for Emergencies' : 'Not for Emergencies'}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
          <Link href={`/patient/book-appointment?dentistId=${dentist.id}`}>{locale === 'en' ? 'Request appointment' : 'Solicitar cita'}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
