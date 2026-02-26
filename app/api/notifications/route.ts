// app/api/notifications/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 
    });
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action } = body;

    if (action === 'markAllRead') {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true }
      });
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (error) {
    console.error("Notifications PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { action } = await req.json();

    if (action === 'clearRead') {
      await prisma.notification.deleteMany({
        where: { read: true }
      });
      return NextResponse.json({ success: true, message: "Cleared read notifications" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notifications DELETE Error:", error);
    return NextResponse.json({ error: "Failed to clear notifications" }, { status: 500 });
  }
}