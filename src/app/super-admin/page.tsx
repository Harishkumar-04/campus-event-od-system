import { Building2, CalendarCheck2, ClipboardList, Users2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MetricCard } from "@/components/layout/MetricCard";
import { requireRole } from "@/lib/auth-guard";
import { getNavItems } from "@/lib/routes";
import prisma from "@/lib/prisma";

import {
  ClubsTable,
  EventsTable,
  OdsTable,
  RegistrationsTable,
  UsersTable,
} from "./components/AdminTables";

export default async function SuperAdminDashboard() {
  const session = await requireRole("SUPER_ADMIN");

  const [allUsers, allClubs, allEvents, allODs, recentActivity] =
    await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.club.findMany({
        include: { admin: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        include: {
          club: true,
          _count: { select: { registrations: true } },
        },
        orderBy: { date: "asc" },
      }),
      prisma.oDRequest.findMany({
        include: {
          student: true,
          registration: { include: { event: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.registration.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { name: true } },
          event: { select: { title: true } },
        },
      }),
    ]);

  const approvedCount = allODs.filter((od) => od.status === "APPROVED").length;
  const pendingCount = allODs.filter((od) => od.status === "PENDING").length;

  return (
    <AppShell
      role={session.user.role}
      user={session.user}
      items={getNavItems(session.user.role)}
    >
      <div className="section-stack px-1 md:px-0">
        <DashboardHeader
          eyebrow="Platform Control"
          heading="Monitor users, clubs, events, and OD activity from one streamlined admin view."
          text="This workspace is reorganized for quicker scanning: overview metrics stay dense while operational tables remain easy to search and review."
          meta={[
            { label: "Pending ODs", value: String(pendingCount) },
            { label: "Approved ODs", value: String(approvedCount) },
          ]}
        />

        <section className="surface-grid md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Users"
            value={allUsers.length}
            caption="All active role accounts across the system."
            icon={Users2}
          />
          <MetricCard
            label="Active Clubs"
            value={allClubs.length}
            caption="Organizations currently connected to the platform."
            icon={Building2}
          />
          <MetricCard
            label="Total Events"
            value={allEvents.length}
            caption="Published campus events in the current catalog."
            icon={CalendarCheck2}
          />
          <MetricCard
            label="OD Applications"
            value={allODs.length}
            caption="Combined volume of all campus OD submissions."
            icon={ClipboardList}
          />
        </section>

        <section id="users" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Users</h2>
              <p className="section-copy">
                Search people by name, email, department, or role.
              </p>
            </div>
          </div>
          <UsersTable users={allUsers} />
        </section>

        <section id="clubs" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Clubs</h2>
              <p className="section-copy">
                Review organizations, ownership, and descriptions across campus groups.
              </p>
            </div>
          </div>
          <ClubsTable clubs={allClubs} />
        </section>

        <section id="events" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Events</h2>
              <p className="section-copy">
                Track publishing volume, club ownership, and registration capacity.
              </p>
            </div>
          </div>
          <EventsTable events={allEvents} />
        </section>

        <section id="ods" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">OD Requests</h2>
              <p className="section-copy">
                Inspect OD activity across students, events, and approval status.
              </p>
            </div>
          </div>
          <OdsTable ods={allODs} />
        </section>

        <section id="activity" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Recent Activity</h2>
              <p className="section-copy">
                A quick view of the latest registrations flowing through the platform.
              </p>
            </div>
          </div>
          <RegistrationsTable registrations={recentActivity} />
        </section>
      </div>
    </AppShell>
  );
}
