import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "CLUB_ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Only Admins can scan QR codes." }, { status: 403 });
    }

    const { id: registrationId } = await params;

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        student: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Optional: Check if the club admin actually owns this event
    if (session.user.role === "CLUB_ADMIN") {
      const club = await prisma.club.findFirst({
        where: { adminId: session.user.id }
      });
      if (!club || club.id !== registration.event.clubId) {
        return NextResponse.json({ error: "You don't have permission for this event." }, { status: 403 });
      }
    }

    if (registration.status !== "REGISTERED") {
      return NextResponse.json({ 
        error: `Cannot check-in. Student status is: ${registration.status}` 
      }, { status: 400 });
    }

    if (registration.attendanceStatus === "ATTENDED") {
      return new NextResponse(`
        <html>
          <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fef08a; color: #854d0e; text-align: center; padding: 20px;">
            <h1 style="margin-bottom: 10px;">⚠️ Already Checked In</h1>
            <p style="font-size: 1.2rem;">${registration.student.name} is already checked in!</p>
            <a href="/club-admin" style="margin-top: 20px; padding: 10px 20px; background: #eab308; color: white; text-decoration: none; border-radius: 5px;">Back to Dashboard</a>
          </body>
        </html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
    }

    // Mark as ATTENDED
    await prisma.registration.update({
      where: { id: registrationId },
      data: { attendanceStatus: "ATTENDED" },
    });

    return new NextResponse(`
        <html>
          <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0fdf4; color: #166534; text-align: center; padding: 20px;">
            <h1 style="margin-bottom: 10px;">✅ Check-in Successful</h1>
            <p style="font-size: 1.2rem;">${registration.student.name} checked in successfully for ${registration.event.title}!</p>
            <a href="/club-admin" style="margin-top: 20px; padding: 10px 20px; background: #16a34a; color: white; text-decoration: none; border-radius: 5px;">Back to Dashboard</a>
          </body>
        </html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
    
  } catch (error) {
    console.error("QR Scan Error:", error);
    return NextResponse.json({ error: "Failed to process QR check-in" }, { status: 500 });
  }
}
