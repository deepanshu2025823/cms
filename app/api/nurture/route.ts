// app/api/nurture/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { id, type, action, content } = await req.json();

    const attendee = await prisma.attendee.findUnique({ where: { id } });
    if (!attendee) return NextResponse.json({ error: "Attendee not found" }, { status: 404 });

    if (action === 'generate') {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      let prompt = "";
      
      if (type === 'email') {
        if (attendee.status.toLowerCase() === 'passed') {
            prompt = `Act as an expert admission counselor at Career Lab Consulting. Write a highly enthusiastic email to ${attendee.fullName}. They just passed the ${attendee.planName} scholarship test with a ${attendee.score}% score and won a ${attendee.discountPercent}% discount. Ask them to use code ${attendee.couponCode} to claim it within 48 hours. Keep it professional. No subject line needed in response.`;
        } else if (attendee.status.toLowerCase() === 'disqualified') {
            prompt = `Act as a strict compliance officer for Career Lab Consulting. Write a short, formal email to ${attendee.fullName} stating they are disqualified from the ${attendee.planName} test due to cheating/tab-switching. Inform them their application is blocked. No subject line needed in response.`;
        } else {
            prompt = `Write a short, polite follow-up email to ${attendee.fullName} encouraging them to complete their registration for the ${attendee.planName} program. No subject line needed.`;
        }
      } 
      else if (type === 'whatsapp') {
        prompt = `Write a short, friendly, and persuasive WhatsApp message for ${attendee.fullName} about their ${attendee.planName} test result (Score: ${attendee.score}%). Add a couple of appropriate emojis. Limit to 2 sentences.`;
      } 
      else if (type === 'call') {
        prompt = `Write a short, natural-sounding voice call script for an AI telecaller to read to ${attendee.fullName} regarding their ${attendee.planName} test (Score: ${attendee.score}%). It should sound exactly like a real human speaking in English.`;
      }

      const result = await model.generateContent(prompt);
      return NextResponse.json({ success: true, draft: result.response.text() });
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
          from: `"Manee AI - Career Lab Consulting" <${process.env.SMTP_USER}>`,
          to: attendee.email,
          subject: `Update regarding your Scholarship Test - Career Lab Consulting`,
          text: content, 
        });
        await prisma.attendee.update({ where: { id }, data: { emailSent: { increment: 1 } } });
      } 
      else if (type === 'whatsapp') {
        await prisma.attendee.update({ where: { id }, data: { whatsappSent: { increment: 1 } } });
      } 
      else if (type === 'call') {
        await prisma.attendee.update({ where: { id }, data: { voiceCallCount: { increment: 1 } } });
      }

      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error("Nurture Error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}