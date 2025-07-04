import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ success: false, error: "No token provided" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { fcmToken: token },
  });
  return NextResponse.json({ success: true });
} 