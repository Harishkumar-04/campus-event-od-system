import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { requestIds } = await req.json();

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return NextResponse.json({ error: "No requests specified" }, { status: 400 });
    }

    // Update all specified requests
    await prisma.oDRequest.updateMany({
      where: {
        id: { in: requestIds },
        status: "PENDING", // Only approve pending ones
      },
      data: {
        status: "APPROVED",
        facultyId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Requests bulk approved successfully" }, { status: 200 });

  } catch (error) {
    console.error("Bulk Approve Error:", error);
    return NextResponse.json({ error: "Failed to bulk approve requests" }, { status: 500 });
  }
}
