import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as xlsx from "xlsx";

type ExportRow = Record<string, string>;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "CLUB_ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id: eventId } = await params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: { status: "REGISTERED", odRequest: { status: "APPROVED" } },
          include: { student: true, odRequest: true },
        },
      },
    });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const sortedRegs = [...event.registrations].sort((a, b) => {
      const deptA = (a.student.department || "").toLowerCase();
      const deptB = (b.student.department || "").toLowerCase();
      if (deptA !== deptB) return deptA.localeCompare(deptB);
      return (a.student.rollNo || "").localeCompare(b.student.rollNo || "");
    });

    const excelData: ExportRow[] = sortedRegs.map((reg) => ({
      "Roll Number": reg.student.rollNo || "N/A",
      "Student Name": reg.student.name,
      "Department": reg.student.department || "N/A",
      "Event Name": event.title,
      "Date": event.date.toLocaleDateString(),
      "Start Time": event.startTime || "N/A",
      "End Time": event.endTime || "N/A",
      "Team Name": reg.teamName || "N/A",
    }));

    if (excelData.length === 0) {
      excelData.push({ Notice: "No OD-approved students found." });
    }

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Participants");
    const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${event.title.replace(/\s+/g, '_')}_Report.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch {
    return NextResponse.json({ error: "Export Failed" }, { status: 500 });
  }
}
