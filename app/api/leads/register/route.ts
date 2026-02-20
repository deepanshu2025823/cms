// app/api/leads/register/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, score, planName } = body;

    const discountPercent = Math.min(Math.floor(score / 1.5), 90); 
    
    const couponCode = `SCHOLAR${Math.random().toString(36).substring(7).toUpperCase()}`;

    const newLead = await prisma.attendee.create({
      data: {
        fullName,
        email,
        phone,
        countryCode: "+91",
        score,
        discountPercent,
        couponCode,
        planName: planName || "Foundation",
        status: score >= 40 ? "PASSED" : "FAILED",
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Score captured by Manee AI", 
      coupon: couponCode 
    });
  } catch (error) {
    return NextResponse.json({ error: "Data Sync Failed" }, { status: 500 });
  }
}