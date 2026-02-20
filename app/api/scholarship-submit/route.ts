// app/api/scholarship-submit/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { status, name, email, phone, score, discount, planName, cheatWarnings } = body;

    const attendee = await prisma.attendee.upsert({
      where: { email },
      update: {
        status,
        score: score || 0,
        discountPercent: discount || 0,
        cheatWarnings: cheatWarnings || 0, 
      },
      create: {
        fullName: name,
        email,
        phone,
        status,
        planName,
        score: score || 0,
        discountPercent: discount || 0,
        cheatWarnings: cheatWarnings || 0, 
      }
    });

    return NextResponse.json({ success: true, attendee });
  } catch (error) {
    console.error("Submit Error:", error);
    return NextResponse.json({ error: "Failed to submit data" }, { status: 500 });
  }
}