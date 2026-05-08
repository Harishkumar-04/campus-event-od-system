import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return NextResponse.json({ message: "Database already seeded" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Super Admin
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@college.edu",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    // Create Faculty
    await prisma.user.create({
      data: {
        name: "Dr. Smith",
        email: "smith@college.edu",
        password: hashedPassword,
        department: "Computer Science",
        role: "FACULTY",
      },
    });

    // Create Club Admin
    const clubAdmin = await prisma.user.create({
      data: {
        name: "Tech Club President",
        email: "techclub@college.edu",
        password: hashedPassword,
        department: "Computer Science",
        rollNo: "CS101",
        role: "CLUB_ADMIN",
      },
    });

    // Create Club
    await prisma.club.create({
      data: {
        name: "Tech Club",
        description: "The official technology club of the college.",
        adminId: clubAdmin.id,
      },
    });

    // Create Student
    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john.doe@student.college.edu",
        password: hashedPassword,
        department: "Information Technology",
        rollNo: "IT2024001",
        role: "STUDENT",
      },
    });

    return NextResponse.json({ message: "Database seeded successfully with test users" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ 
      error: "Failed to seed database", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
}
