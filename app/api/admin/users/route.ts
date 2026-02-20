// app/api/admin/users/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }, 
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, roleName, permissions } = await req.json();

    const targetRole = await prisma.role.upsert({
      where: { name: roleName.toUpperCase() },
      update: { permissions }, 
      create: { name: roleName.toUpperCase(), permissions }
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: targetRole.id
      }
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}