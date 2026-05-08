import { format } from "date-fns";
import { ClipboardList, Download, FileClock, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MetricCard } from "@/components/layout/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth-guard";
import { getNavItems } from "@/lib/routes";
import prisma from "@/lib/prisma";

import { FacultyActions } from "./components/FacultyActions";
import { ODApprovalList } from "./components/ODApprovalList";
import { ProfileSettings } from "../student/components/ProfileSettings";

export default async function FacultyDashboard() {
  const session = await requireRole("FACULTY");

  const facultyUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      rollNo: true,
      avatarUrl: true,
    },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [pendingODs, todayODs, intercollegeODs] = await Promise.all([
    prisma.oDRequest.findMany({
      where: {
        status: "PENDING",
        ...(facultyUser?.department
          ? { student: { department: facultyUser.department } }
          : {}),
      },
      include: {
        student: {
          select: { name: true, rollNo: true, department: true },
        },
        registration: {
          include: {
            event: {
              include: {
                club: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.oDRequest.findMany({
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
            event: {
              select: {
                title: true,
                date: true,
                startTime: true,
                endTime: true,
                location: true,
              },
            },
          },
        },
      },
    }),
    prisma.intercollegeODRequest.findMany({
      where: {
        status: "APPROVED",
        eventDate: { gte: startOfDay, lte: endOfDay },
        ...(facultyUser?.department
          ? { department: facultyUser.department }
          : {}),
      },
      include: {
        student: { select: { name: true, rollNo: true, department: true } },
      },
    }),
  ]);

  return (
    <AppShell
      role={session.user.role}
      user={session.user}
      items={getNavItems(session.user.role)}
    >
      <div className="section-stack px-1 md:px-0">
        <DashboardHeader
          eyebrow="Faculty Operations"
          heading="Review OD approvals and keep today's classroom absences visible."
          text="This view now combines pending campus OD approvals, same-day attendance visibility, and export tools inside one tighter workflow."
          meta={[
            {
              label: "Department",
              value: facultyUser?.department || "Not assigned",
            },
            {
              label: "Today",
              value: format(new Date(), "MMM d, yyyy"),
            },
          ]}
        />

        <section className="surface-grid md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Pending ODs"
            value={pendingODs.length}
            caption="Requests that still need your decision."
            icon={ClipboardList}
          />
          <MetricCard
            label="Approved Today"
            value={todayODs.length}
            caption="Campus-event ODs approved for today's schedule."
            icon={ShieldCheck}
          />
          <MetricCard
            label="External ODs"
            value={intercollegeODs.length}
            caption="Approved intercollege absences for today."
            icon={FileClock}
          />
          <MetricCard
            label="Exports"
            value="Ready"
            caption="Generate filtered reports for daily records."
            icon={Download}
          />
        </section>

        <section className="surface-grid xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div id="profile" className="section-stack">
            <div className="section-heading">
              <div>
                <h2 className="section-title">Profile Settings</h2>
                <p className="section-copy">
                  Keep your faculty identity and department current for role-based filtering.
                </p>
              </div>
            </div>
            {facultyUser ? <ProfileSettings user={facultyUser} /> : null}
          </div>

          <div id="exports" className="section-stack">
            <div className="section-heading">
              <div>
                <h2 className="section-title">Export Records</h2>
                <p className="section-copy">
                  Download today&apos;s approved OD list for classroom and department operations.
                </p>
              </div>
            </div>
            <FacultyActions />
          </div>
        </section>

        <section id="pending-ods" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Pending Campus OD Requests</h2>
              <p className="section-copy">
                Review requests in one queue and approve or reject without leaving the page.
              </p>
            </div>
          </div>
          <ODApprovalList requests={pendingODs} />
        </section>

        <section id="today-ods" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Today&apos;s Approved ODs</h2>
              <p className="section-copy">
                A consolidated attendance-facing view of approved campus and intercollege absences.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{format(new Date(), "MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {todayODs.length === 0 && intercollegeODs.length === 0 ? (
                <div className="px-5 pb-5 text-sm text-muted-foreground">
                  No students are on OD today.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayODs.map((od) => (
                      <TableRow key={od.id}>
                        <TableCell className="font-medium">{od.student.name}</TableCell>
                        <TableCell>{od.student.rollNo || "N/A"}</TableCell>
                        <TableCell>{od.student.department || "N/A"}</TableCell>
                        <TableCell>{od.registration.event.title}</TableCell>
                        <TableCell>
                          {od.registration.event.startTime || "TBD"} - {od.registration.event.endTime || "TBD"}
                        </TableCell>
                        <TableCell>{od.registration.event.location}</TableCell>
                        <TableCell>Campus Event</TableCell>
                      </TableRow>
                    ))}
                    {intercollegeODs.map((od) => (
                      <TableRow key={od.id}>
                        <TableCell className="font-medium">{od.student.name}</TableCell>
                        <TableCell>{od.student.rollNo || od.rollNo}</TableCell>
                        <TableCell>{od.student.department || od.department}</TableCell>
                        <TableCell>{od.eventName}</TableCell>
                        <TableCell>
                          {od.startTime || "TBD"} - {od.endTime || "TBD"}
                        </TableCell>
                        <TableCell>External venue</TableCell>
                        <TableCell>Intercollege</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
