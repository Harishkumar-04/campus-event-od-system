import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rollNo = searchParams.get("rollNo");

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number required" }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { rollNo },
      select: { id: true, name: true, rollNo: true, department: true, email: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: "Failed to lookup student" }, { status: 500 });
  }
}
