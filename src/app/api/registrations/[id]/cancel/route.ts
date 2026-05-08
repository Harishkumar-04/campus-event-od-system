import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: registrationId } = await params;
    const studentId = session.user.id;

    // Find the registration to cancel
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.studentId !== studentId) {
      return NextResponse.json({ error: "Unauthorized to cancel this registration" }, { status: 403 });
    }

    if (registration.status === "CANCELLED") {
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Mark current registration as CANCELLED
      await tx.registration.update({
        where: { id: registrationId },
        data: { status: "CANCELLED" },
      });

      // 2. If the user had an OD Request, mark it as REJECTED or delete it
      const odReq = await tx.oDRequest.findUnique({ where: { registrationId } });
      if (odReq) {
        await tx.oDRequest.delete({ where: { id: odReq.id } });
      }

      // 3. If they were REGISTERED (taking up a slot), check the waitlist!
      if (registration.status === "REGISTERED") {
        const oldestWaitlisted = await tx.registration.findFirst({
          where: { 
            eventId: registration.eventId,
            status: "WAITLISTED"
          },
          orderBy: { createdAt: "asc" }
        });

        if (oldestWaitlisted) {
          // Promote waitlisted student
          await tx.registration.update({
            where: { id: oldestWaitlisted.id },
            data: { status: "REGISTERED" }
          });

          // Generate an OD Request for the promoted student
          // We need a faculty member to approve it, let's find one
          const faculty = await tx.user.findFirst({ where: { role: "FACULTY" } });
          
          if (faculty) {
            await tx.oDRequest.create({
              data: {
                registrationId: oldestWaitlisted.id,
                studentId: oldestWaitlisted.studentId,
                facultyId: faculty.id,
                status: "PENDING",
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ message: "Registration cancelled successfully" }, { status: 200 });
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json({ error: "Failed to cancel registration" }, { status: 500 });
  }
}
