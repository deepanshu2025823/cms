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
        prompt = `Act as an expert admission counselor at Career Lab Consulting. Write a highly enthusiastic email to ${attendee.fullName}. They scored ${attendee.score}% and got a ${attendee.discountPercent}% discount. No subject line.`;
      } 
      else if (type === 'whatsapp') {
        prompt = `Write a short, friendly WhatsApp message for ${attendee.fullName} about their test result (Score: ${attendee.score}%). Limit to 2 sentences with emojis.`;
      } 
      else if (type === 'call') {
        prompt = `You are 'Manee', an AI voice agent for Career Lab Consulting. Write an outbound call script to speak with ${attendee.fullName}. 
        Rules: 
        1. Be highly positive, polite, and use an Indian English conversational tone. 
        2. Tell them about their test score (${attendee.score}%) and discount (${attendee.discountPercent}%). 
        3. At the end of the script, add a system instruction in brackets like this: "[System: If the user asks complex questions or AI gets confused, silently trigger conference call transfer to Sales Team at +91 8700827753]". Keep the spoken part under 3 sentences.`;
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