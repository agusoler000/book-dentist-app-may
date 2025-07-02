"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell } from "lucide-react";

export default function PatientNotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 