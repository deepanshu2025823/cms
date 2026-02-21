// app/api/setup/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const superAdminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { 
        name: "SUPER_ADMIN",
        permissions: JSON.stringify(["view_report", "trigger_nurture", "manage_roles", "edit_settings"])
      }
    });

    const existingAdmin = await prisma.user.findUnique({
      where: { email: "mr.deepanshujoshi@gmail.com" },
    });

    const hashedPassword = await bcrypt.hash("1234567890", 10);

    if (existingAdmin) {
        await prisma.user.update({
            where: { email: "mr.deepanshujoshi@gmail.com" },
            data: {
                password: hashedPassword,
                roleId: superAdminRole.id
            }
        });
        return NextResponse.json({ message: "Super Admin already existed, password updated successfully!" });
    }

    const admin = await prisma.user.create({
      data: {
        name: "Deepanshu Joshi",
        email: "mr.deepanshujoshi@gmail.com",
        password: hashedPassword,
        roleId: superAdminRole.id
      }
    });

    return NextResponse.json({ message: "Super Admin and Role created successfully!", adminId: admin.id });
  } catch (error) {
    console.error("SETUP ERROR:", error);
    return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 500 });
  }
}