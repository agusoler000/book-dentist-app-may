import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/notifications/[id]/read
export async function PATCH(req: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const id = params.id;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    return NextResponse.json({ success: false, error: "Not found or forbidden" }, { status: 404 });
  }
  await prisma.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ success: true });
} 