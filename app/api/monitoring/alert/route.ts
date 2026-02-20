// app/api/monitoring/alert/route.ts

import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { studentName, action } = await req.json();

    await createNotification(
      "Cheating Attempt Detected",
      `${studentName} is attempting to ${action} during the test.`,
      "warning"
    );

    return NextResponse.json(
      { success: true, message: "Alert logged." },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to log alert" }, 
      { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}