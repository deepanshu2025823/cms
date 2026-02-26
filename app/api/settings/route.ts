// app/api/settings/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: { id: "global" }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookUrl, fallbackNumber, emailAlerts, whatsappAlerts, webhookLogs } = body;

    const updatedSettings = await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: {
        webhookUrl,
        fallbackNumber,
        emailAlerts,
        whatsappAlerts,
        webhookLogs
      },
      create: {
        id: "global",
        webhookUrl,
        fallbackNumber,
        emailAlerts,
        whatsappAlerts,
        webhookLogs
      }
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error("Settings POST Error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}