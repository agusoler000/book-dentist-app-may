"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import EmergencyForm from '@/components/patient/EmergencyForm';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useLanguage } from '@/context/language-context';
import { usePatientNotifications } from '@/hooks/use-patient-notifications';

export default function PatientEmergenciesPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const reloadEmergencies = () => {
    const patientId = session?.user?.patientId;
    let url = '/api/emergencies?mine=1';
    if (patientId) {
      url = `/api/emergencies?patientId=${patientId}`;
    }
    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('Emergencias API response:', data);
        if (data && Array.isArray(data.emergencies)) setEmergencies(data.emergencies);
        else setEmergencies([]);
      })
      .catch((err) => {
        console.error('Emergencias API error:', err);
        setEmergencies([]);
      });
  };

  useEffect(() => {
    if (session) {
      reloadEmergencies();
    }
  }, [session]);

  usePatientNotifications({ reloadEmergencies, reloadAppointments: () => {} });

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return t('emergencyStatus.pending');
      case 'APPROVED': return t('emergencyStatus.approved');
      case 'CANCELLED': return t('emergencyStatus.cancelled');
      case 'FINISHED': return t('emergencyStatus.finished');
      default: return status;
    }
  };

  return (
    <div className="flex flex-col min-h-screen py-8 px-2 md:px-8 gap-6 w-full">
      <Accordion type="single" collapsible className="w-full" value={open ? 'emergency-form' : undefined} onValueChange={v => setOpen(v === 'emergency-form')}>
        <AccordionItem value="emergency-form">
          <AccordionTrigger>{t('patientEmergencies.requestNew')}</AccordionTrigger>
          <AccordionContent>
            <EmergencyForm onSuccess={() => { reloadEmergencies(); setOpen(false); }} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="w-full border-2 border-red-400 bg-white">
        <div className="flex flex-row items-center gap-2 bg-red-100 py-6 border-b-2 border-red-400">
          <AlertTriangle className="w-8 h-8 text-red-600 animate-bounce" />
          <span className="text-2xl text-red-700 font-extrabold tracking-wider uppercase">{t('patientEmergencies.title')}</span>
        </div>
        <div className="space-y-4 p-6">
          {emergencies.length === 0 ? (
            <div className="text-center text-muted-foreground">{t('patientEmergencies.noEmergencies')}</div>
          ) : (
            <ul className="space-y-3">
              {emergencies.map((em: any) => (
                <li key={em.id} className={`p-3 border rounded-md flex flex-col gap-1 ${em.status === 'PENDING' ? 'bg-red-50 border-red-400' : 'bg-background'}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${em.status === 'PENDING' ? 'text-red-600 animate-pulse' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-red-700">{em.status}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(em.createdAt).toLocaleString()}</span>
                  </div>
                  <div><span className="font-medium">Descripción:</span> {em.description}</div>
                  <div><span className="font-medium">Estado:</span> {em.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
