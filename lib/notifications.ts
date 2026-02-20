// lib/notifications.ts

import { prisma } from "@/lib/prisma";

export async function createNotification(title: string, desc: string, type: 'success' | 'warning' | 'info' = 'info') {
  try {
    const notification = await prisma.notification.create({
      data: { title, desc, type }
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}