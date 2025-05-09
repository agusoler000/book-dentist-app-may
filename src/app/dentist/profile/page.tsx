
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDentists } from '@/lib/mock-data'; // Used for mock emergency status if not on currentUser
import EmergencyStatusToggle from '@/components/dentist/emergency-status-toggle';
import Image from 'next/image';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Dentist } from '@/lib/types';

export default function DentistProfilePage() {
  const { currentUser, userType, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && (!currentUser || userType !== 'dentist')) {
      router.push('/login?role=dentist');
    }
  }, [currentUser, userType, isLoadingAuth, router]);

  if (isLoadingAuth || !currentUser || userType !== 'dentist') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }
  
  // Cast currentUser to Dentist type (without password)
  const currentDentist = currentUser as Omit<Dentist, 'password'>;
  
  // For fields not in the basic AuthenticatedUser type from context (like bio, full isAvailableForEmergency status)
  // we might need to fetch them or rely on mock data for now.
  // Here, we use currentDentist from context, which has basic fields.
  // isAvailableForEmergency on AuthenticatedUser (Dentist variant) should be up-to-date.
  const profileImageUrl = currentDentist.profileImageUrl || `https://picsum.photos/seed/${currentDentist.id}/150/150`;


  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Image
              src={profileImageUrl}
              alt={`Dr. ${currentDentist.name}`}
              width={150}
              height={150}
              className="rounded-full border-4 border-background shadow-lg"
              data-ai-hint="dentist professional"
            />
            <div>
              <CardTitle className="text-3xl font-bold text-primary-foreground mix-blend-multiply">{currentDentist.name}</CardTitle>
              <CardDescription className="text-lg text-primary-foreground/80 mix-blend-multiply">{currentDentist.specialty}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Contact Information</h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center"><Mail className="w-5 h-5 mr-2 text-accent" /> {currentDentist.email}</p>
              {currentDentist.phone && <p className="flex items-center"><Phone className="w-5 h-5 mr-2 text-accent" /> {currentDentist.phone}</p>}
            </div>
          </div>
          
          {currentDentist.bio && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Biography</h3>
              <p className="text-muted-foreground leading-relaxed">{currentDentist.bio}</p>
            </div>
          )}

          <EmergencyStatusToggle 
            dentistId={currentDentist.id} 
            initialStatus={currentDentist.isAvailableForEmergency} 
          />
          
          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Manage Profile</h3>
            <p className="text-sm text-muted-foreground">
              Further profile editing options (e.g., updating bio, contact info, specialty) would be available here.
              (Note: Profile updates are not implemented in this version).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
