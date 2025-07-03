import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/notifications
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ success: true, notifications });
}

// POST /api/notifications
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const body = await req.json();
  const { type, title, message, link, event } = body;
  if (!type || !title || !message) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, link, event },
  });
  return NextResponse.json({ success: true, notification });
}
