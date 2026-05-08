import { CalendarCheck2, FileSpreadsheet, ListChecks, Settings2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MetricCard } from "@/components/layout/MetricCard";
import { requireRole } from "@/lib/auth-guard";
import { repairLegacyTeamEvents } from "@/lib/events";
import { getNavItems } from "@/lib/routes";
import prisma from "@/lib/prisma";

import { AdminEventList } from "./components/AdminEventList";
import { CreateEventForm } from "./components/CreateEventForm";
import { ProfileSettings } from "../student/components/ProfileSettings";

export default async function ClubAdminDashboard() {
  const session = await requireRole("CLUB_ADMIN");
  await repairLegacyTeamEvents();

  const userWithClubs = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      rollNo: true,
      avatarUrl: true,
      administeredClubs: true,
    },
  });

  const club = userWithClubs?.administeredClubs[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = club
    ? await prisma.event.findMany({
        where: {
          clubId: club.id,
          date: { gte: today },
        },
        include: {
          _count: { select: { registrations: true } },
          registrations: { select: { status: true } },
        },
        orderBy: { date: "asc" },
      })
    : [];

  const totalRegistrations = events.reduce(
    (sum, event) => sum + event._count.registrations,
    0
  );
  const waitlisted = events.reduce(
    (sum, event) =>
      sum + event.registrations.filter((registration) => registration.status === "WAITLISTED").length,
    0
  );
  const autoApproveCount = events.filter((event) => event.autoApproveOD).length;

  return (
    <AppShell
      role={session.user.role}
      user={session.user}
      items={getNavItems(session.user.role)}
    >
      <div className="section-stack px-1 md:px-0">
        <DashboardHeader
          eyebrow="Club Command Center"
          heading={club ? `${club.name} dashboard` : "Club administration workspace"}
          text={
            club
              ? club.description || "Manage event creation, registrations, and operational details for your organization."
              : "Finish your club setup to start publishing events and managing registrations."
          }
          meta={[
            {
              label: "Organization",
              value: club?.name || "Pending assignment",
            },
            {
              label: "Upcoming Events",
              value: String(events.length),
            },
          ]}
        />

        <section className="surface-grid md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Upcoming Events"
            value={events.length}
            caption="Events your organization is currently running."
            icon={CalendarCheck2}
          />
          <MetricCard
            label="Registrations"
            value={totalRegistrations}
            caption="Confirmed and waitlisted signups combined."
            icon={ListChecks}
          />
          <MetricCard
            label="Waitlisted"
            value={waitlisted}
            caption="Students waiting for open capacity."
            icon={FileSpreadsheet}
          />
          <MetricCard
            label="Auto-Approve ODs"
            value={autoApproveCount}
            caption="Events where OD approval happens automatically."
            icon={Settings2}
          />
        </section>

        {!club ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-4 text-sm text-amber-900 shadow-[0_20px_45px_-34px_rgba(245,158,11,0.45)]">
            Your account is active, but no club is assigned yet. Create or attach a club record to unlock the event workspace.
          </div>
        ) : null}

        <section id="profile" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Profile Settings</h2>
              <p className="section-copy">
                Update the organizer profile that appears across your administration tools.
              </p>
            </div>
          </div>
          {userWithClubs ? <ProfileSettings user={userWithClubs} /> : null}
        </section>

        {club ? (
          <section id="create-event" className="surface-grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="section-stack">
              <div className="section-heading">
                <div>
                  <h2 className="section-title">Create New Event</h2>
                  <p className="section-copy">
                    Publish polished event records with capacity, audience targeting, and OD behavior already built in.
                  </p>
                </div>
              </div>
              <CreateEventForm />
            </div>

            <div id="events" className="section-stack">
              <div className="section-heading">
                <div>
                  <h2 className="section-title">Your Event Pipeline</h2>
                  <p className="section-copy">
                    Edit active events, monitor capacity, and export participation reports.
                  </p>
                </div>
              </div>
              <AdminEventList events={events} />
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
