"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import EmergencyForm from '@/components/patient/EmergencyForm';

export default function PublicEmergencyPage() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen bg-white py-12">
      <Card className="max-w-lg w-full shadow-2xl border-red-400 border-2 animate-pulse">
        <CardHeader className="flex flex-row items-center gap-2 bg-red-100 rounded-t-lg py-6">
          <AlertTriangle className="w-8 h-8 text-red-600 animate-bounce" />
          <CardTitle className="text-2xl text-red-700 font-extrabold tracking-wider uppercase">{t('publicEmergency.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <EmergencyForm />
        </CardContent>
      </Card>
    </div>
  );
} 