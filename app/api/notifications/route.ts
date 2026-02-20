// app/api/notifications/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10 
  });
  return NextResponse.json(notifications);
}

export async function PATCH(req: Request) {
  const { id } = await req.json();
  await prisma.notification.update({
    where: { id },
    data: { read: true }
  });
  return NextResponse.json({ success: true });
}