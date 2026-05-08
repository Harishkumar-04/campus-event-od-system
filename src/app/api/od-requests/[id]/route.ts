import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized (Faculty Only)" }, { status: 403 });
    }

    const { status } = await req.json(); // "APPROVED" or "REJECTED"
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { id } = await params;

    const updatedOdRequest = await prisma.oDRequest.update({
      where: { id },
      data: {
        status,
        facultyId: session.user.id,
      },
    });

    return NextResponse.json(updatedOdRequest, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update OD status" }, { status: 500 });
  }
}
