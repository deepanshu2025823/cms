// lib/manee.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

/**
 * 1. Email Content Generation
 */
export async function generateNurtureContent(name: string, score: number, discount: number, plan: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are Manee AI, a sophisticated autonomous assistant for Career Lab Consulting.
    Student: ${name}, Score: ${score}/100, Discount: ${discount}%, Plan: ${plan}.
    Goal: Write a premium, high-conversion email under 150 words.
    Return ONLY the email body.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * 2. WhatsApp Message Generation (Short & Catchy)
 */
export async function generateWhatsAppManee(name: string, score: number, discount: number) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Create a short, urgent WhatsApp message for ${name}. 
    They scored ${score}% and got a ${discount}% scholarship at Career Lab.
    Include emojis, a sense of urgency, and a call to action. 
    Constraint: Under 40 words. No subject line.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * 3. Voice Call Script Generation (For AI Calling)
 */
export async function generateVoiceScript(name: string, score: number, discount: number) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Write a 30-second phone call script for an AI assistant named Manee. 
    Calling student ${name} who scored ${score}%. 
    Pitch the ${discount}% scholarship and ask them to register before the slot fills up.
    Keep the tone natural and helpful.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}