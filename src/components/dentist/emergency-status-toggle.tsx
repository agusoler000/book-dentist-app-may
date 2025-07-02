'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button'; // Button removed as toggle is direct action
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import type { AuthenticatedUser } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { useDentistEmergencyState } from '@/context/global-store';

interface EmergencyStatusToggleProps {
  dentistId: string;
}

export default function EmergencyStatusToggle({ dentistId }: EmergencyStatusToggleProps) {
  const { currentUser, userType } = useAuth();
  const { t } = useLanguage();
  const isAvailable = useDentistEmergencyState(s => s.isAvailableForEmergency);
  const setIsAvailable = useDentistEmergencyState(s => s.setIsAvailableForEmergency);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch valor real de la DB al montar
  useEffect(() => {
    fetch('/api/dentists/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) setIsAvailable(data.dentist.isAvailableForEmergency);
      });
    // eslint-disable-next-line
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = !isAvailable;
    try {
      const res = await fetch('/api/dentists/emergency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailableForEmergency: newStatus }),
        credentials: 'same-origin',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsAvailable(result.updatedStatus);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`emergency-toggle-${dentistId}`}
        checked={isAvailable}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        type="button"
        aria-label={t('dentist.toggleEmergencyAvailability')}
      />
      <span className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
        {isLoading ? t('dentist.updating') : (isAvailable ? t('dentist.availableForEmergencies') : t('dentist.notAvailableForEmergencies'))}
      </span>
    </div>
  );
}
