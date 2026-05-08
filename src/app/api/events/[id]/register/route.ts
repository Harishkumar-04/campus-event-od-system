import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function parseRollNumbers(teamMembers: unknown) {
  if (!Array.isArray(teamMembers)) return [];

  return Array.from(
    new Set(
      teamMembers
        .map((member) => typeof member === "string" ? member : member?.rollNo)
        .filter(Boolean)
        .map((rollNo) => String(rollNo).trim().toUpperCase())
        .filter(Boolean)
    )
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Students Only" }, { status: 403 });
    }

    const { id: eventId } = await params;
    const studentId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const { teamName, teamMembers } = body;

    const currentStudent = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, rollNo: true, department: true },
    });

    if (!currentStudent?.rollNo || !currentStudent.department) {
      return NextResponse.json({ error: "Please complete your profile first." }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: { where: { status: "REGISTERED" } } } } },
    });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    let allowedDepts: string[] = [];
    if (event.targetDepartments) {
      try {
        allowedDepts = JSON.parse(event.targetDepartments);
      } catch {
        allowedDepts = [];
      }
    }

    const isTeamEvent = event.participantType === "TEAM";
    const teamSize = Math.max(event.teamSize || 2, 2);

    let teamUsers = [currentStudent];
    let normalizedTeamMembers: { rollNo: string }[] | null = null;

    if (isTeamEvent) {
      if (!teamName || !String(teamName).trim()) {
        return NextResponse.json({ error: "Team name is required." }, { status: 400 });
      }

      const rollNumbers = parseRollNumbers(teamMembers);
      if (rollNumbers.length !== teamSize) {
        return NextResponse.json({ error: `Enter exactly ${teamSize} team member roll numbers.` }, { status: 400 });
      }

      if (!rollNumbers.includes(currentStudent.rollNo.toUpperCase())) {
        return NextResponse.json({ error: "Your roll number must be included in the team members." }, { status: 400 });
      }

      const users = await prisma.user.findMany({
        where: { rollNo: { in: rollNumbers } },
        select: { id: true, rollNo: true, department: true },
      });

      const foundRolls = new Set(users.map((user) => user.rollNo?.toUpperCase()));
      const missingRolls = rollNumbers.filter((rollNo) => !foundRolls.has(rollNo));
      if (missingRolls.length > 0) {
        return NextResponse.json({ error: `No student profile found for: ${missingRolls.join(", ")}` }, { status: 400 });
      }

      const incompleteProfiles = users.filter((user) => !user.rollNo || !user.department);
      if (incompleteProfiles.length > 0) {
        return NextResponse.json({ error: "Every team member must have roll number and department in their profile." }, { status: 400 });
      }

      teamUsers = users as typeof teamUsers;
      normalizedTeamMembers = rollNumbers.map((rollNo) => ({ rollNo }));
    }

    if (allowedDepts.length > 0) {
      const blockedUser = teamUsers.find((user) => !user.department || !allowedDepts.includes(user.department));
      if (blockedUser) {
        return NextResponse.json({ error: `This event is not for ${blockedUser.rollNo}'s department.` }, { status: 403 });
      }
    }

    const teamUserIds = teamUsers.map((user) => user.id);
    const existingRegistrations = await prisma.registration.findMany({
      where: {
        eventId,
        studentId: { in: teamUserIds },
      },
      select: { id: true, studentId: true, status: true, student: { select: { rollNo: true } } },
    });

    const activeExisting = existingRegistrations.find((registration) => registration.status !== "CANCELLED");
    if (activeExisting) {
      return NextResponse.json({ error: `${activeExisting.student.rollNo || "A team member"} is already registered for this event.` }, { status: 400 });
    }

    const isFull = event._count.registrations + teamUsers.length > event.capacity;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (existingRegistrations.length > 0) {
        await tx.registration.deleteMany({
          where: { id: { in: existingRegistrations.map((registration) => registration.id) } },
        });
      }

      const registrations = [];
      const odRequests = [];

      for (const user of teamUsers) {
        const registration = await tx.registration.create({
          data: {
            eventId,
            studentId: user.id,
            status: isFull ? "WAITLISTED" : "REGISTERED",
            teamName: isTeamEvent ? String(teamName).trim() : null,
            teamMembers: normalizedTeamMembers ? JSON.stringify(normalizedTeamMembers) : null,
          },
        });
        registrations.push(registration);

        if (!isFull) {
          const odRequest = await tx.oDRequest.create({
            data: {
              registrationId: registration.id,
              studentId: user.id,
              status: event.autoApproveOD ? "APPROVED" : "PENDING",
            },
          });
          odRequests.push(odRequest);
        }
      }

      return { registrations, odRequests };
    });

    const msg = isFull
      ? "Team joined waitlist"
      : event.autoApproveOD
        ? "Team registered. OD auto-approved for all members!"
        : "Team registered and OD applied for all members.";

    return NextResponse.json({ message: msg, data: result }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
