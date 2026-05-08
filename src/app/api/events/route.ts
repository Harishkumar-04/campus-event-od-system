import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        club: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST create a new event (Club Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLUB_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const clubUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { administeredClubs: true },
    });

    const club = clubUser?.administeredClubs[0];
    if (!club) {
      return NextResponse.json({ error: "No club assigned to this admin" }, { status: 400 });
    }

    const { title, description, date, startTime, endTime, location, capacity, posterUrls, autoApproveOD, targetDepartments, participantType, teamSize } = await req.json();
    const normalizedParticipantType = participantType || "INDIVIDUAL";

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime: startTime || "",
        endTime: endTime || "",
        location,
        capacity: parseInt(capacity),
        posterUrls: posterUrls ? JSON.stringify(posterUrls) : null,
        autoApproveOD: autoApproveOD || false,
        targetDepartments: targetDepartments && targetDepartments.length > 0 ? JSON.stringify(targetDepartments) : null,
        participantType: normalizedParticipantType,
        teamSize: normalizedParticipantType === "TEAM" ? Math.max(parseInt(teamSize || "2"), 2) : 1,
        clubId: club.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
