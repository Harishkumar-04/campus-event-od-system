import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLUB_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.club.adminId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission for this event." }, { status: 403 });
    }

    // Find all unapproved OD requests for this event
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      select: { id: true }
    });

    const regIds = registrations.map((r: { id: string }) => r.id);

    // Update the pending ones to approved
    const result = await prisma.oDRequest.updateMany({
      where: {
        registrationId: { in: regIds },
        status: "PENDING"
      },
      data: {
        status: "APPROVED"
      }
    });

    return NextResponse.json({ 
      message: `Successfully approved ${result.count} pending OD requests for this event.` 
    }, { status: 200 });

  } catch (error) {
    console.error("Bulk Approve Event OD Error:", error);
    return NextResponse.json({ error: "Failed to bulk approve OD requests" }, { status: 500 });
  }
}
