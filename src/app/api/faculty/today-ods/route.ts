import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Faculty today's ODs (both event ODs and intercollege ODs)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch approved event ODs for the target date
    const eventODs = await prisma.oDRequest.findMany({
      where: {
        status: "APPROVED",
        registration: {
          event: {
            date: { gte: startOfDay, lte: endOfDay },
          },
        },
      },
      include: {
        student: { select: { name: true, rollNo: true, department: true } },
        registration: {
          include: {
            event: { select: { title: true, date: true, startTime: true, endTime: true, location: true } },
          },
        },
      },
    });

    // Fetch HOD-approved intercollege ODs for the target date
    const intercollegeODs = await prisma.intercollegeODRequest.findMany({
      where: {
        status: "APPROVED",
        eventDate: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        student: { select: { name: true, rollNo: true, department: true } },
      },
    });

    // Normalize into a single list
    const todayODs = [
      ...eventODs.map((od) => ({
        id: od.id,
        type: "EVENT",
        studentName: od.student.name,
        rollNo: od.student.rollNo,
        department: od.student.department,
        eventName: od.registration.event.title,
        eventDate: od.registration.event.date,
        startTime: od.registration.event.startTime,
        endTime: od.registration.event.endTime,
        venue: od.registration.event.location,
      })),
      ...intercollegeODs.map((od) => ({
        id: od.id,
        type: "INTERCOLLEGE",
        label: "HOD Approved",
        studentName: od.student.name,
        rollNo: od.student.rollNo || od.rollNo,
        department: od.student.department || od.department,
        eventName: od.eventName,
        eventDate: od.eventDate,
        startTime: od.startTime,
        endTime: od.endTime,
        venue: "External",
      })),
    ];

    return NextResponse.json(todayODs);
  } catch (error) {
    console.error("Faculty Today ODs Error:", error);
    return NextResponse.json({ error: "Failed to fetch ODs" }, { status: 500 });
  }
}
