import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DEPARTMENTS } from "@/lib/departments";
import * as xlsx from "xlsx";

function getDateRange(dateParam: string | null) {
  const date = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getDepartmentMatches(departmentsParam: string | null) {
  if (!departmentsParam) return null;

  const values = departmentsParam
    .split(",")
    .map((dept) => dept.trim())
    .filter(Boolean);

  if (values.length === 0) return null;

  const matches = new Set<string>();
  values.forEach((value) => {
    const input = value.toLowerCase();
    matches.add(input);

    DEPARTMENTS.forEach((dept) => {
      const deptValue = dept.value.toLowerCase();
      const deptLabel = dept.label.toLowerCase();
      if (input === deptValue || input === deptLabel || deptLabel.includes(`(${input.toUpperCase()})`.toLowerCase())) {
        matches.add(deptValue);
        matches.add(deptLabel);
      }
    });
  });

  return matches;
}

function matchesDepartment(department: string | null | undefined, matches: Set<string> | null) {
  if (!matches) return true;
  const normalized = (department || "").toLowerCase().trim();
  return matches.has(normalized);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const departmentsParam = searchParams.get("departments");
    const dateParam = searchParams.get("date");
    const { start, end } = getDateRange(dateParam);
    const departmentMatches = getDepartmentMatches(departmentsParam);

    const campusODs = await prisma.oDRequest.findMany({
      where: {
        status: "APPROVED",
        registration: {
          event: {
            date: { gte: start, lte: end },
          },
        },
      },
      include: {
        student: true,
        registration: { include: { event: true } },
        faculty: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const intercollegeODs = await prisma.intercollegeODRequest.findMany({
      where: {
        status: "APPROVED",
        eventDate: { gte: start, lte: end },
      },
      include: {
        student: true,
        hod: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const campusRows = campusODs
      .filter((req) => matchesDepartment(req.student.department, departmentMatches))
      .map((req) => ({
        "Student Name": req.student.name,
        "Roll Number": req.student.rollNo || "N/A",
        Department: req.student.department || "N/A",
        "Event Title": req.registration.event.title,
        "Event Date": req.registration.event.date.toLocaleDateString(),
        Time: `${req.registration.event.startTime || "TBD"} - ${req.registration.event.endTime || "TBD"}`,
        Venue: req.registration.event.location,
        Type: "Campus Event",
        "Approved By": req.faculty?.name || "System",
        "Approved At": req.updatedAt.toLocaleString(),
      }));

    const intercollegeRows = intercollegeODs
      .filter((req) => matchesDepartment(req.student.department || req.department, departmentMatches))
      .map((req) => ({
        "Student Name": req.student.name,
        "Roll Number": req.student.rollNo || req.rollNo,
        Department: req.student.department || req.department,
        "Event Title": req.eventName,
        "Event Date": req.eventDate.toLocaleDateString(),
        Time: "Full Day",
        Venue: "External",
        Type: "Intercollege",
        "Approved By": req.hod?.name || "HOD",
        "Approved At": req.updatedAt.toLocaleString(),
      }));

    const excelData = [...campusRows, ...intercollegeRows];
    const sheetDate = (dateParam || new Date().toISOString().split("T")[0]).replace(/-/g, "");
    const filenameDept = departmentsParam ? `_${departmentsParam.replace(/[^a-zA-Z0-9-]/g, "_")}` : "";

    const worksheet = xlsx.utils.json_to_sheet(
      excelData.length > 0
        ? excelData
        : [{ Notice: "No approved OD students found for the selected date and department." }]
    );
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Today ODs");

    const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Faculty_OD_Report_${sheetDate}${filenameDept}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Faculty Excel Export Error:", error);
    return NextResponse.json({ error: "Failed to generate Excel report" }, { status: 500 });
  }
}
