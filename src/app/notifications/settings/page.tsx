"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Loader2, Bell, AlertTriangle, Calendar, Clock, Settings } from 'lucide-react';
import { requestFirebaseNotificationPermission } from '@/lib/firebase';

export default function NotificationSettingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPushButton, setShowPushButton] = useState(false);
  const [activatingPush, setActivatingPush] = useState(false);
  const [settings, setSettings] = useState({
    pushEmergencies: true,
    pushAppointments: true,
    pushStatusChanges: true,
  });

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones push
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setShowPushButton(true);
    }

    // Cargar configuración actual del usuario
    fetch('/api/notifications/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch(() => {
        toast({
          title: t('notifications.error'),
          description: t('notifications.loadError'),
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [t, toast]);

  const handleEnablePush = async () => {
    setActivatingPush(true);
    try {
      const token = await requestFirebaseNotificationPermission();
      if (token) {
        await fetch('/api/save-fcm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        toast({
          title: t('notifications.pushEnabled'),
          description: t('notifications.pushEnabledDesc'),
        });
        // Recargar la página para actualizar el estado
        window.location.reload();
      } else {
        toast({
          title: t('notifications.error'),
          description: t('notifications.pushTokenError'),
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: t('notifications.error'),
        description: t('notifications.pushActivationError'),
        variant: 'destructive',
      });
    } finally {
      setActivatingPush(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: t('notifications.saved'),
          description: t('notifications.settingsSaved'),
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: t('notifications.error'),
        description: t('notifications.saveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            {t('notifications.settings')}
          </CardTitle>
          <CardDescription>
            {t('notifications.settingsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sección de activación de notificaciones push */}
          {showPushButton && Notification.permission !== 'granted' && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{t('notifications.activatePush')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.activatePushDesc')}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleEnablePush} 
                  disabled={activatingPush}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {activatingPush ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('notifications.activating')}
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      {t('notifications.activate')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Estado de notificaciones push */}
          {Notification.permission === 'granted' && (
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium text-green-800">{t('notifications.pushActive')}</h3>
                  <p className="text-sm text-green-600">
                    {t('notifications.pushActiveDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado cuando las notificaciones están bloqueadas */}
          {Notification.permission === 'denied' && (
            <div className="p-4 border rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-medium text-red-800">{t('notifications.pushBlocked')}</h3>
                  <p className="text-sm text-red-600">
                    {t('notifications.pushBlockedDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Configuración de tipos de notificaciones */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{t('notifications.typesTitle')}</h3>
            
            {/* Emergencias */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-medium">{t('notifications.emergencies')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.emergenciesDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.pushEmergencies}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, pushEmergencies: checked }))
                }
              />
            </div>

            {/* Citas */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium">{t('notifications.appointments')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.appointmentsDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.pushAppointments}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, pushAppointments: checked }))
                }
              />
            </div>

            {/* Cambios de estado */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">{t('notifications.statusChanges')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.statusChangesDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.pushStatusChanges}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, pushStatusChanges: checked }))
                }
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('notifications.saving')}
              </>
            ) : (
              t('notifications.save')
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 