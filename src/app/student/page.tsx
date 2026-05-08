import { CalendarCheck2, ClipboardList, FileClock, UserRoundCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MetricCard } from "@/components/layout/MetricCard";
import { requireRole } from "@/lib/auth-guard";
import { repairLegacyTeamEvents } from "@/lib/events";
import { getNavItems } from "@/lib/routes";
import prisma from "@/lib/prisma";

import { EventList } from "./components/EventList";
import { IntercollegeODForm } from "./components/IntercollegeODForm";
import { ODStatusList } from "./components/ODStatusList";
import { ProfileSettings } from "./components/ProfileSettings";

export default async function StudentDashboard() {
  const session = await requireRole("STUDENT");
  await repairLegacyTeamEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [student, events, registrations, odRequests, intercollegeODs] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          rollNo: true,
          department: true,
          avatarUrl: true,
        },
      }),
      prisma.event.findMany({
        where: {
          date: { gte: today },
        },
        include: {
          club: true,
          _count: {
            select: { registrations: { where: { status: "REGISTERED" } } },
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.registration.findMany({
        where: { studentId: session.user.id },
        select: {
          eventId: true,
          status: true,
        },
      }),
      prisma.oDRequest.findMany({
        where: {
          studentId: session.user.id,
          registration: {
            event: {
              date: { gte: today },
            },
          },
        },
        include: {
          registration: {
            include: { event: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.intercollegeODRequest.findMany({
        where: {
          studentId: session.user.id,
          eventDate: { gte: today },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const isProfileComplete = Boolean(student?.rollNo && student?.department);
  const activeRegistrations = registrations.filter(
    (registration) => registration.status !== "CANCELLED"
  ).length;
  const pendingCount =
    odRequests.filter((request) => request.status === "PENDING").length +
    intercollegeODs.filter((request) => request.status === "PENDING").length;

  return (
    <AppShell
      role={session.user.role}
      user={session.user}
      items={getNavItems(session.user.role)}
    >
      <div className="section-stack px-1 md:px-0">
        <DashboardHeader
          eyebrow="Student Workspace"
          heading="Track registrations, OD requests, and profile readiness in one place."
          text="Your dashboard now keeps event discovery, profile completion, and OD status tightly organized so you can act without hunting through empty space."
          meta={[
            {
              label: "Profile",
              value: isProfileComplete ? "Ready for registration" : "Needs attention",
            },
            {
              label: "Department",
              value: student?.department || "Not added yet",
            },
          ]}
        />

        <section className="surface-grid md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Upcoming Events"
            value={events.length}
            caption="Open campus opportunities available to you."
            icon={CalendarCheck2}
          />
          <MetricCard
            label="Active Registrations"
            value={activeRegistrations}
            caption="Campus events you are currently attending."
            icon={ClipboardList}
          />
          <MetricCard
            label="Pending Requests"
            value={pendingCount}
            caption="OD requests still waiting on approval."
            icon={FileClock}
          />
          <MetricCard
            label="Profile Health"
            value={isProfileComplete ? "100%" : "60%"}
            caption="Complete roll number and department to unlock every workflow."
            icon={UserRoundCheck}
          />
        </section>

        {!isProfileComplete ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-4 text-sm text-amber-900 shadow-[0_20px_45px_-34px_rgba(245,158,11,0.45)]">
            <strong className="font-semibold">Action needed:</strong> add your roll number and department below before registering for events.
          </div>
        ) : null}

        <section id="profile" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Profile Settings</h2>
              <p className="section-copy">
                Keep your academic identity accurate so OD approvals and registrations stay aligned.
              </p>
            </div>
          </div>
          {student ? <ProfileSettings user={student} /> : null}
        </section>

        <section id="events" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Upcoming Campus Events</h2>
              <p className="section-copy">
                Browse opportunities, check capacity, and register directly from the dashboard.
              </p>
            </div>
          </div>
          <EventList
            events={events}
            registrations={registrations}
            studentDept={student?.department || undefined}
          />
        </section>

        <section id="external-od" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Intercollege and External Events</h2>
              <p className="section-copy">
                Submit OD requests for hackathons, symposiums, and other off-campus participation with supporting documents.
              </p>
            </div>
          </div>
          <IntercollegeODForm />
        </section>

        <section id="requests" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">My OD Requests</h2>
              <p className="section-copy">
                Follow approval progress, manage active registrations, and monitor campus and intercollege OD status.
              </p>
            </div>
          </div>
          <ODStatusList odRequests={odRequests} intercollegeODs={intercollegeODs} />
        </section>
      </div>
    </AppShell>
  );
}
