import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDentists } from '@/lib/mock-data';
import EmergencyStatusToggle from '@/components/dentist/emergency-status-toggle';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react'; // Removed Briefcase as it's not used here

// In a real app, you'd fetch this based on the logged-in dentist's ID
const currentDentist = mockDentists[0]; 

export default function DentistProfilePage() {
  if (!currentDentist) {
    return <p>Dentist profile not found.</p>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="bg-primary/10 p-6 rounded-t-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {currentDentist.profileImageUrl && (
              <Image
                src={currentDentist.profileImageUrl}
                alt={`Dr. ${currentDentist.name}`}
                width={150}
                height={150}
                className="rounded-full border-4 border-background shadow-lg"
                data-ai-hint="dentist professional"
              />
            )}
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
          
          {/* Placeholder for more profile editing features */}
          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Manage Profile</h3>
            <p className="text-sm text-muted-foreground">
              Further profile editing options (e.g., updating bio, contact info, specialty) would be available here.
            </p>
            {/* <Button variant="outline" className="mt-2">Edit Profile Details</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
