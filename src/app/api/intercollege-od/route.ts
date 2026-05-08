import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: Create intercollege OD request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      eventName,
      eventDate,
      startTime,
      endTime,
      proofUrls,
      odLetterUrls,
      teamMembers,
    } = await req.json();

    if (!eventName || !eventDate) {
      return NextResponse.json({ error: "Event name and date are required." }, { status: 400 });
    }

    if (!Array.isArray(proofUrls) || proofUrls.length === 0) {
      return NextResponse.json({ error: "Please upload proof documents." }, { status: 400 });
    }

    if (!Array.isArray(odLetterUrls) || odLetterUrls.length === 0) {
      return NextResponse.json({ error: "Please upload the OD letter." }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rollNo: true, department: true },
    });

    if (!student?.rollNo || !student?.department) {
      return NextResponse.json({ error: "Please complete your profile (roll number & department) first." }, { status: 400 });
    }

    const rollNumbers = Array.isArray(teamMembers)
      ? teamMembers
          .map((member) => typeof member === "string" ? member : member?.rollNo)
          .filter(Boolean)
      : String(teamMembers || "")
          .split(",")
          .map((rollNo) => rollNo.trim())
          .filter(Boolean);

    const uniqueRollNumbers = Array.from(new Set(rollNumbers.map((rollNo) => rollNo.toUpperCase())));
    if (uniqueRollNumbers.length === 0) {
      return NextResponse.json({ error: "Please enter team member roll numbers." }, { status: 400 });
    }

    if (!uniqueRollNumbers.includes(student.rollNo.toUpperCase())) {
      uniqueRollNumbers.unshift(student.rollNo.toUpperCase());
    }

    const users = await prisma.user.findMany({
      where: { rollNo: { in: uniqueRollNumbers } },
      select: { id: true, rollNo: true, department: true },
    });

    const foundRolls = new Set(users.map((user) => user.rollNo?.toUpperCase()));
    const missingRolls = uniqueRollNumbers.filter((rollNo) => !foundRolls.has(rollNo));
    if (missingRolls.length > 0) {
      return NextResponse.json({ error: `No student profile found for: ${missingRolls.join(", ")}` }, { status: 400 });
    }

    const incompleteProfiles = users.filter((user) => !user.rollNo || !user.department);
    if (incompleteProfiles.length > 0) {
      return NextResponse.json({ error: "Every team member must have roll number and department in their profile." }, { status: 400 });
    }

    const teamMemberPayload = uniqueRollNumbers.map((rollNo) => ({ rollNo }));
    const odRequests = await prisma.$transaction(
      users.map((user) =>
        prisma.intercollegeODRequest.create({
          data: {
            studentId: user.id,
            rollNo: user.rollNo!,
            department: user.department!,
            eventName,
            eventDate: new Date(eventDate),
            startTime: startTime || null,
            endTime: endTime || null,
            proofUrls: JSON.stringify(proofUrls),
            odLetterUrls: JSON.stringify(odLetterUrls),
            teamMembers: JSON.stringify(teamMemberPayload),
            status: "PENDING",
          },
        })
      )
    );

    return NextResponse.json(odRequests, { status: 201 });
  } catch (error) {
    console.error("Intercollege OD error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

// GET: Fetch intercollege OD requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;

    if (role === "STUDENT") {
      const requests = await prisma.intercollegeODRequest.findMany({
        where: { studentId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(requests);
    }

    if (role === "HOD") {
      const hodUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      const requests = await prisma.intercollegeODRequest.findMany({
        where: { 
          status: "PENDING",
          ...(hodUser?.department ? { department: hodUser.department } : {})
        },
        include: { student: { select: { name: true, rollNo: true, department: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(requests);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
