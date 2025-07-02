"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Bell } from "lucide-react";

export default function DentistNotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
      else setError(data.error || "Error");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleAppointmentAction(notification: any, status: "SCHEDULED" | "CANCELLED") {
    if (!notification.link) return;
    setActionLoading(notification.id);
    try {
      // Extraer appointmentId del link (ej: /api/appointments/123)
      const match = notification.link.match(/appointments\/(\w+)/);
      const appointmentId = match ? match[1] : null;
      if (!appointmentId) throw new Error("Invalid appointment link");
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error");
      await fetchNotifications();
    } catch (e: any) {
      setError(e.message);
    }
    setActionLoading(null);
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="w-7 h-7 text-accent" />
          <CardTitle>{t("notifications.title")}</CardTitle>
        </CardHeader>
      </Card>
      {loading ? (
        <div className="flex justify-center items-center py-10"><Loader2 className="animate-spin w-8 h-8 text-accent" /></div>
      ) : error ? (
        <div className="text-center text-destructive py-6">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-muted-foreground py-6">{t("notifications.empty")}</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map(n => (
            <li key={n.id} className={`p-4 border rounded-lg shadow-sm bg-white ${!n.read ? "bg-accent/10" : ""}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {/* Si es notificación de cita pendiente, mostrar acciones */}
                {n.type === "APPOINTMENT" && n.link && n.message?.toLowerCase().includes("pending") && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={actionLoading === n.id}
                      onClick={() => handleAppointmentAction(n, "SCHEDULED")}
                    >
                      {actionLoading === n.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4 mr-1" />} {t("dentistDashboard.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === n.id}
                      onClick={() => handleAppointmentAction(n, "CANCELLED")}
                    >
                      {actionLoading === n.id ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle className="w-4 h-4 mr-1" />} {t("dentistDashboard.cancel")}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 