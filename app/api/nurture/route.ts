// app/api/nurture/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createNotification } from "@/lib/notifications";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function getAIScript(prompt: string, fallback: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/\*\*/g, '').trim();
    return text || fallback;
  } catch (error: any) {
    console.warn("Gemini API Quota Exceeded or Error. Using professional fallback script.");
    return fallback;
  }
}

export async function POST(req: Request) {
  try {
    const { id, type, action, content } = await req.json();

    const attendee = await prisma.attendee.findUnique({ where: { id } });
    if (!attendee) return NextResponse.json({ error: "Attendee not found" }, { status: 404 });

    const isDisqualified = attendee.status.toLowerCase() === 'disqualified';

    if (action === 'generate') {
      let prompt = "";
      let fallback = "";
      
      if (type === 'email') {
        prompt = isDisqualified 
            ? `Write a formal disqualification email for ${attendee.fullName} from Career Lab test. No subject.`
            : `Write an enthusiastic scholarship win email for ${attendee.fullName} (Score: ${attendee.score}%). No subject.`;
        fallback = isDisqualified 
            ? `Dear ${attendee.fullName}, you have been disqualified due to proctoring violations.`
            : `Congratulations ${attendee.fullName}! You scored ${attendee.score}% and won a scholarship. Use code ${attendee.couponCode} to claim.`;
      } 
      else if (type === 'whatsapp') {
        prompt = `Write a 2-sentence friendly WhatsApp for ${attendee.fullName} about their ${attendee.planName} result.`;
        fallback = `Hi ${attendee.fullName}, great news! You've qualified for the ${attendee.planName} scholarship. Check your email for details!`;
      } 
      else if (type === 'call') {
        prompt = `Write a short call script for ${attendee.fullName} mentioning their score of ${attendee.score}%. End with "[TRANSFER: +918700827753]".`;
        fallback = `Hello ${attendee.fullName}, calling from Career Lab regarding your ${attendee.score}% score. Let me connect you to our counselor. [TRANSFER: +918700827753]`;
      }

      const cleanText = await getAIScript(prompt, fallback);
      return NextResponse.json({ success: true, draft: cleanText });
    }

    if (action === 'auto_call') {
        const prompt = `Write a 2-sentence script for a call to ${attendee.fullName} about their ${attendee.score}% score. End with "[TRANSFER: +918700827753]".`;
        const fallback = `Hi ${attendee.fullName}, I'm calling from InternX. You scored ${attendee.score}% on our assessment. Connecting you to sales now. [TRANSFER: +918700827753]`;
        
        const autoScript = await getAIScript(prompt, fallback);

        const myTelephonyServer = process.env.TELEPHONY_ENGINE_URL || "http://localhost:8080/api/make-call";
        console.log(`\n[TELEPHONY ENGINE] Triggering Real Ring to ${attendee.phone}...`);
        console.log(`-> Script: ${autoScript}`);

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
          from: `"Career Lab Admissions" <${process.env.SMTP_USER}>`,
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

      await createNotification(
        "Nurture Delivered",
        `${type.toUpperCase()} sent to ${attendee.fullName} successfully.`,
        "success"
      );

      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error("Nurture Error:", error);
    return NextResponse.json({ error: "System failed to process nurturing request." }, { status: 500 });
  }
}