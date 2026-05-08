import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET OD Requests based on role
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    const userId = session.user.id;

    if (role === "STUDENT") {
      const odRequests = await prisma.oDRequest.findMany({
        where: { studentId: userId },
        include: {
          registration: {
            include: { event: { include: { club: true } } },
          },
          faculty: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(odRequests);
    } 
    
    if (role === "FACULTY") {
      const pendingOdRequests = await prisma.oDRequest.findMany({
        where: { status: "PENDING" }, // Or filter by department if needed
        include: {
          student: true,
          registration: {
            include: { event: { include: { club: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(pendingOdRequests);
    }

    if (role === "SUPER_ADMIN" || role === "CLUB_ADMIN") {
        // Club admins might want to see ODs for their events. We'll simplify for now.
        const allOds = await prisma.oDRequest.findMany({
            include: {
                student: true,
                registration: {
                include: { event: { include: { club: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(allOds);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch OD requests" }, { status: 500 });
  }
}
