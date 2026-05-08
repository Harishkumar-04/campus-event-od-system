import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOD") {
      return NextResponse.json({ error: "Unauthorized (HOD Only)" }, { status: 403 });
    }
    const { id } = await params;
    const { status } = await req.json();
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const updated = await prisma.intercollegeODRequest.update({
      where: { id },
      data: { status, hodId: session.user.id },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const request = await prisma.intercollegeODRequest.findUnique({
      where: { id },
      include: { student: { select: { name: true, rollNo: true, department: true } } },
    });
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}
