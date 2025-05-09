'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EmergencyStatusToggleProps {
  dentistId: string;
  initialStatus: boolean;
}

// Mock server action
async function updateEmergencyStatus(dentistId: string, newStatus: boolean): Promise<{ success: boolean, message: string }> {
  console.log(`Updating emergency status for dentist ${dentistId} to ${newStatus}`);
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      // For demo purposes, let's occasionally simulate a failure
      // if (Math.random() > 0.8) {
      //   resolve({ success: false, message: "Failed to update status. Please try again." });
      // } else {
        resolve({ success: true, message: `Emergency availability ${newStatus ? 'activated' : 'deactivated'}.` });
      // }
    }, 1000);
  });
}


export default function EmergencyStatusToggle({ dentistId, initialStatus }: EmergencyStatusToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = !isAvailable;
    
    // Here you would typically call a server action
    // For now, we'll use a mock function
    const result = await updateEmergencyStatus(dentistId, newStatus);

    if (result.success) {
      setIsAvailable(newStatus);
      toast({
        title: "Status Updated",
        description: result.message,
        variant: "default",
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.message,
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
      </div>
      <p className="text-xs text-muted-foreground">
        Toggle this switch to indicate whether you are currently accepting emergency appointments.
      </p>
      {/* The Button is part of the Switch now (onCheckedChange), this is just for explicit action if needed */}
      {/* <Button onClick={handleToggle} disabled={isLoading} size="sm">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Status
      </Button> */}
    </div>
  );
}
