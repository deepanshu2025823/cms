// app/api/change-password/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    await prisma.user.update({
      where: { email: email },
      data: { password: newPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}