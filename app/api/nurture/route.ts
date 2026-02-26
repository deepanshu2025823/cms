// app/api/nurture/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createNotification } from "@/lib/notifications";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { id, type } = await req.json();

    const attendee = await prisma.attendee.findUnique({ where: { id } });
    if (!attendee) return NextResponse.json({ error: "Attendee not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = "";
    let aiMessage = "";

    if (type === 'email') {
      if (attendee.status.toLowerCase() === 'passed') {
          prompt = `Act as an expert admission counselor at Career Lab Consulting. Write a highly enthusiastic email to ${attendee.fullName}. They just passed the ${attendee.planName} scholarship test with a ${attendee.score}% score and won a ${attendee.discountPercent}% discount. Ask them to use code ${attendee.couponCode} to claim it within 48 hours. Keep it professional and welcoming. No subject line needed in response.`;
      } else if (attendee.status.toLowerCase() === 'disqualified') {
          prompt = `Act as a strict compliance officer for Career Lab Consulting. Write a short, formal email to ${attendee.fullName} stating they are disqualified from the ${attendee.planName} test due to cheating/tab-switching. Inform them their application is blocked. No subject line needed in response.`;
      } else {
          prompt = `Write a short, polite follow-up email to ${attendee.fullName} encouraging them to complete their registration for the ${attendee.planName} program. No subject line needed in response.`;
      }
      
      const result = await model.generateContent(prompt);
      aiMessage = result.response.text();

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Manee AI - Career Lab Consulting" <${process.env.SMTP_USER}>`,
        to: attendee.email,
        subject: `Update regarding your Scholarship Test - Career Lab`,
        text: aiMessage,
      });

      await prisma.attendee.update({
        where: { id },
        data: { emailSent: { increment: 1 } }
      });

      await createNotification(
        "Email Nurtured",
        `Manee AI sent a personalized email to ${attendee.fullName}.`,
        "success"
      );
    }

    if (type === 'whatsapp') {
      prompt = `Write a short, friendly, and persuasive WhatsApp message for ${attendee.fullName} about their ${attendee.planName} test result (Score: ${attendee.score}%). Add a couple of appropriate emojis. Limit to 2 sentences.`;
      
      const result = await model.generateContent(prompt);
      aiMessage = result.response.text();

      console.log(`[WA SIMULATION] Manee sending WhatsApp to ${attendee.phone}: ${aiMessage}`);

      await prisma.attendee.update({
        where: { id },
        data: { whatsappSent: { increment: 1 } }
      });

      await createNotification(
        "WhatsApp Sync",
        `Manee generated a WA message for ${attendee.fullName}.`,
        "info"
      );
    }

    if (type === 'call') {
      prompt = `Write a short, natural-sounding voice call script for an AI telecaller to read to ${attendee.fullName} regarding their ${attendee.planName} test (Score: ${attendee.score}%). It should sound like a real human speaking.`;
      
      const result = await model.generateContent(prompt);
      aiMessage = result.response.text();

      console.log(`[CALL SIMULATION] Manee Voice Agent calling ${attendee.phone} with script: ${aiMessage}`);

      await prisma.attendee.update({
        where: { id },
        data: { voiceCallCount: { increment: 1 } }
      });

      await createNotification(
        "AI Voice Call Triggered",
        `Outbound AI script generated for ${attendee.fullName}.`,
        "warning"
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: aiMessage 
    });

  } catch (error) {
    console.error("Nurture Error:", error);
    return NextResponse.json({ error: "Manee AI could not complete the request." }, { status: 500 });
  }
}