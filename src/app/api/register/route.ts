import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, department, rollNo, facultyId } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Role-specific unique constraints (e.g., student roll numbers)
    if (role === "STUDENT" && rollNo) {
      const existingStudent = await prisma.user.findUnique({ where: { rollNo } });
      if (existingStudent) {
        return NextResponse.json({ error: "Roll number already registered" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          department,
          rollNo: role === "STUDENT" ? rollNo : null,
          facultyId: (role === "FACULTY" || role === "HOD") ? facultyId : null,
        },
      });

      // Automatically create a Club shell if they register as a Club Admin
      if (role === "CLUB_ADMIN") {
        await tx.club.create({
          data: {
            name: `${name}'s Organization`,
            description: "Please update your club details in your dashboard settings.",
            adminId: newUser.id,
          }
        });
      }

      return newUser;
    });

    return NextResponse.json({ message: "Registration successful!", user: { id: result.id, email: result.email } }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
