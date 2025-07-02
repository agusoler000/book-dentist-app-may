"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import EmergencyForm from '@/components/patient/EmergencyForm';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export default function PatientEmergenciesPage() {
  const { data: session } = useSession();
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const reloadEmergencies = () => {
    setLoading(true);
    fetch('/api/emergencies?mine=1')
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmergencies(data.emergencies);
        setLoading(false);
      });
  };

  useEffect(() => {
    reloadEmergencies();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Accordion type="single" collapsible className="max-w-lg w-full" value={open ? 'emergency-form' : undefined} onValueChange={v => setOpen(v === 'emergency-form')}>
        <AccordionItem value="emergency-form">
          <AccordionTrigger>Solicitar nueva emergencia</AccordionTrigger>
          <AccordionContent>
            <EmergencyForm onSuccess={() => { reloadEmergencies(); setOpen(false); }} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Card className="max-w-lg w-full shadow-2xl border-red-400 border-2">
        <CardHeader className="flex flex-row items-center gap-2 bg-red-100 rounded-t-lg py-6">
          <AlertTriangle className="w-8 h-8 text-red-600 animate-bounce" />
          <CardTitle className="text-2xl text-red-700 font-extrabold tracking-wider uppercase">Mis Emergencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {loading ? (
            <div className="text-center text-muted-foreground">Cargando...</div>
          ) : emergencies.length === 0 ? (
            <div className="text-center text-muted-foreground">No has enviado ninguna emergencia.</div>
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
        </CardContent>
      </Card>
    </div>
  );
}
