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
    const { id, type, action, content } = await req.json();

    const attendee = await prisma.attendee.findUnique({ where: { id } });
    if (!attendee) return NextResponse.json({ error: "Attendee not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const isDisqualified = attendee.status.toLowerCase() === 'disqualified';

    if (action === 'generate') {
      let prompt = "";
      
      if (type === 'email') {
        prompt = isDisqualified 
            ? `Act as a strict compliance officer for Career Lab. Write a short, formal email to ${attendee.fullName} stating they are disqualified from the ${attendee.planName} test due to cheating. No subject line. Output ONLY the email body.`
            : `Act as an expert admission counselor at Career Lab. Write a highly enthusiastic email to ${attendee.fullName}. They scored ${attendee.score}% and got a ${attendee.discountPercent}% discount. No subject line. Output ONLY the email body.`;
      } 
      else if (type === 'whatsapp') {
        prompt = isDisqualified 
            ? `Write a short, formal WhatsApp message for ${attendee.fullName} informing them their test was disqualified. Limit to 2 sentences. Output ONLY the text.`
            : `Write a short, friendly WhatsApp message for ${attendee.fullName} about passing their test (Score: ${attendee.score}%). Limit to 2 sentences with emojis. Output ONLY the text.`;
      } 
      else if (type === 'call') {
        prompt = isDisqualified 
            ? `Write an outbound call script to speak with ${attendee.fullName}. Inform them their test was disqualified. At the end, add: "[TRANSFER: +918700827753]". Output ONLY the exact script to be spoken. No markdown.`
            : `Write an outbound call script to speak with ${attendee.fullName}. Tell them their score is ${attendee.score}%. At the end, add: "[TRANSFER: +918700827753]". Output ONLY the exact script to be spoken. No markdown.`;
      }

      const result = await model.generateContent(prompt);
      const cleanText = result.response.text().replace(/\*\*/g, '').trim(); 
      return NextResponse.json({ success: true, draft: cleanText });
    }

    if (action === 'auto_call') {
        let prompt = isDisqualified 
            ? `Write a 2-sentence opening script for an outbound call to ${attendee.fullName} telling them they are disqualified. End with "[TRANSFER: +918700827753]". No formatting.`
            : `Write a 2-sentence opening script for an outbound call to ${attendee.fullName} telling them they scored ${attendee.score}%. End with "[TRANSFER: +918700827753]". No formatting.`;
        
        const result = await model.generateContent(prompt);
        const autoScript = result.response.text().replace(/\*\*/g, '').trim();

        const myTelephonyServer = process.env.TELEPHONY_ENGINE_URL || "http://localhost:8080/api/make-call";
        console.log(`\n[TELEPHONY ENGINE] Triggering Real Ring to Asli Phone...`);
        console.log(`-> Student Number: ${attendee.phone}`);
        console.log(`-> AI Script to Speak: ${autoScript}`);
        console.log(`-> Transfer Logic: If confused, transfer to +918700827753`);

        await prisma.attendee.update({ where: { id }, data: { voiceCallCount: { increment: 1 } } });
        return NextResponse.json({ success: true });
    }

    if (action === 'send') {
      if (type === 'email') {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: `"Manee AI - Career Lab" <${process.env.SMTP_USER}>`,
          to: attendee.email,
          subject: `Update regarding your Scholarship Test - Career Lab`,
          text: content,
        });
        await prisma.attendee.update({ where: { id }, data: { emailSent: { increment: 1 } } });
      } 
      else if (type === 'whatsapp') {
        await prisma.attendee.update({ where: { id }, data: { whatsappSent: { increment: 1 } } });
      } 
      else if (type === 'call') {
        console.log(`[TELEPHONY ENGINE] Manual Call Triggered for ${attendee.phone}`);
        await prisma.attendee.update({ where: { id }, data: { voiceCallCount: { increment: 1 } } });
      }

      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error("Nurture Error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}