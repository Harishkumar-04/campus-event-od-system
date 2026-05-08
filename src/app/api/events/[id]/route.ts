import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        club: true,
        registrations: { include: { student: true, odRequest: true } },
      },
    });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLUB_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const clubUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { administeredClubs: { select: { id: true } } },
    });
    const clubIds = clubUser?.administeredClubs.map((club) => club.id) || [];
    const existingEvent = await prisma.event.findUnique({ where: { id }, select: { clubId: true, participantType: true } });
    if (!existingEvent || !clubIds.includes(existingEvent.clubId)) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const updateData: Prisma.EventUpdateInput = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.capacity !== undefined) updateData.capacity = parseInt(body.capacity);
    if (body.posterUrls !== undefined) updateData.posterUrls = JSON.stringify(body.posterUrls);
    if (body.autoApproveOD !== undefined) updateData.autoApproveOD = body.autoApproveOD;
    if (body.targetDepartments !== undefined) updateData.targetDepartments = body.targetDepartments.length > 0 ? JSON.stringify(body.targetDepartments) : null;
    const participantType = body.participantType ?? existingEvent.participantType;
    if (body.participantType !== undefined) updateData.participantType = body.participantType;
    if (body.teamSize !== undefined || body.participantType !== undefined) {
      updateData.teamSize = participantType === "TEAM" ? Math.max(parseInt(body.teamSize || "2"), 2) : 1;
    }
    const event = await prisma.event.update({ where: { id }, data: updateData });
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLUB_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const clubUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { administeredClubs: { select: { id: true } } },
    });
    const clubIds = clubUser?.administeredClubs.map((club) => club.id) || [];
    const existingEvent = await prisma.event.findUnique({ where: { id }, select: { clubId: true } });
    if (!existingEvent || !clubIds.includes(existingEvent.clubId)) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "Event deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
