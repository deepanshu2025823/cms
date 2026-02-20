// app/api/nurture/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import nodemailer from "nodemailer";
import { 
  generateNurtureContent, 
  generateWhatsAppManee, 
  generateVoiceScript 
} from "@/lib/manee";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { id, type } = await req.json();

    const attendee = await prisma.attendee.findUnique({ where: { id } });
    if (!attendee) return NextResponse.json({ error: "Attendee not found" }, { status: 404 });

    if (type === 'email') {
      const aiMessage = await generateNurtureContent(
        attendee.fullName, 
        attendee.score, 
        attendee.discountPercent, 
        attendee.planName
      );

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
        from: `"Manee - Career Lab Consulting" <${process.env.SMTP_USER}>`,
        to: attendee.email,
        subject: `Exclusive: Your ${attendee.discountPercent}% Scholarship expires soon!`,
        text: aiMessage,
      });

      await prisma.attendee.update({
        where: { id },
        data: { emailSent: { increment: 1 } }
      });

      await createNotification(
        "Email Nurtured",
        `Manee AI sent a personalized scholarship email to ${attendee.fullName}.`,
        "success"
      );
    }

    if (type === 'whatsapp') {
      const waMessage = await generateWhatsAppManee(
        attendee.fullName, 
        attendee.score, 
        attendee.discountPercent
      );

      console.log(`Manee sending WhatsApp to ${attendee.phone}: ${waMessage}`);

      await prisma.attendee.update({
        where: { id },
        data: { whatsappSent: { increment: 1 } }
      });

      await createNotification(
        "WhatsApp Sync",
        `Lead ${attendee.fullName} has been reached via Manee WhatsApp automation.`,
        "info"
      );
    }

    if (type === 'call') {
      const callScript = await generateVoiceScript(
        attendee.fullName, 
        attendee.score, 
        attendee.discountPercent
      );

      console.log(`Manee Voice Agent calling ${attendee.phone} with script: ${callScript}`);

      await prisma.attendee.update({
        where: { id },
        data: { voiceCallCount: { increment: 1 } }
      });

      await createNotification(
        "AI Voice Call Triggered",
        `Outbound script generated and call initiated for ${attendee.fullName}.`,
        "warning"
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Manee AI ${type.toUpperCase()} Nurturing triggered successfully!` 
    });

  } catch (error) {
    console.error("Nurture Error:", error);
    return NextResponse.json({ error: "Manee AI could not complete the request." }, { status: 500 });
  }
}