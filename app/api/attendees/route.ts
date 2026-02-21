// app/api/attendees/route.ts

export const dynamic = 'force-dynamic'; 

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attendees = await prisma.attendee.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(attendees);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}