
'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button'; // Button removed as toggle is direct action
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import type { AuthenticatedUser } from '@/lib/types';

interface EmergencyStatusToggleProps {
  dentistId: string; // remains useful for the server action
  initialStatus: boolean;
}

// Mock server action
async function updateEmergencyStatus(dentistId: string, newStatus: boolean): Promise<{ success: boolean, message: string, updatedStatus?: boolean }> {
  console.log(`Updating emergency status for dentist ${dentistId} to ${newStatus}`);
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
        resolve({ success: true, message: `Emergency availability ${newStatus ? 'activated' : 'deactivated'}.`, updatedStatus: newStatus });
    }, 1000);
  });
}


export default function EmergencyStatusToggle({ dentistId, initialStatus }: EmergencyStatusToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser, login, userType } = useAuth(); // Use login to update context

  useEffect(() => {
    setIsAvailable(initialStatus);
  }, [initialStatus]);

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = !isAvailable;
    
    const result = await updateEmergencyStatus(dentistId, newStatus);

    if (result.success && result.updatedStatus !== undefined) {
      setIsAvailable(result.updatedStatus);
      toast({
        title: "Status Updated",
        description: result.message,
        variant: "default",
      });
      // If there's a logged-in dentist, update their status in the AuthContext
      if (currentUser && userType === 'dentist' && currentUser.id === dentistId) {
        const updatedDentist = { ...currentUser, isAvailableForEmergency: result.updatedStatus } as AuthenticatedUser;
        login(updatedDentist, 'dentist'); // Re-call login to update context and localStorage
      }
    } else {
      toast({
        title: "Update Failed",
        description: result.message || "Could not update status.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-start space-y-4 p-6 border rounded-lg shadow-sm bg-card">
      <Label htmlFor={`emergency-toggle-${dentistId}`} className="text-lg font-semibold text-foreground">
        Emergency Availability
      </Label>
      <div className="flex items-center space-x-3">
        <Switch
          id={`emergency-toggle-${dentistId}`}
          checked={isAvailable}
          onCheckedChange={handleToggle}
          disabled={isLoading}
          aria-label="Toggle emergency availability"
        />
        <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
          {isLoading ? 'Updating...' : (isAvailable ? 'Available for Emergencies' : 'Not Available for Emergencies')}
        </span>
         {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      </div>
      <p className="text-xs text-muted-foreground">
        Toggle this switch to indicate whether you are currently accepting emergency appointments.
      </p>
    </div>
  );
}
