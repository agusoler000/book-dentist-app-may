import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function NotificationsRedirectPage() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).role) {
    redirect("/login");
  }
  const role = (session.user as any).role;
  if (role === "DENTIST") {
    redirect("/dentist/notifications");
  } else if (role === "PATIENT") {
    redirect("/patient/notifications");
  } else {
    redirect("/login");
  }
  return null;
} 