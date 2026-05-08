import { ClipboardList, FileClock, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MetricCard } from "@/components/layout/MetricCard";
import { requireRole } from "@/lib/auth-guard";
import { getNavItems } from "@/lib/routes";
import prisma from "@/lib/prisma";

import { IntercollegeODList } from "./components/IntercollegeODList";
import { ProfileSettings } from "../student/components/ProfileSettings";

export default async function HODDashboard() {
  const session = await requireRole("HOD");

  const hodUser = await prisma.user.findUnique({
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingRequests, recentApprovals] = hodUser?.department
    ? await Promise.all([
        prisma.intercollegeODRequest.findMany({
          where: {
            status: "PENDING",
            department: hodUser.department,
          },
          include: {
            student: { select: { name: true, rollNo: true, department: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.intercollegeODRequest.findMany({
          where: {
            status: "APPROVED",
            hodId: hodUser.id,
            updatedAt: { gte: today },
          },
          include: {
            student: { select: { name: true, rollNo: true, department: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
      ])
    : [[], []];

  return (
    <AppShell
      role={session.user.role}
      user={session.user}
      items={getNavItems(session.user.role)}
    >
      <div className="section-stack px-1 md:px-0">
        <DashboardHeader
          eyebrow="Department Oversight"
          heading={
            hodUser?.department
              ? `${hodUser.department} OD approvals`
              : "Head of Department workspace"
          }
          text="Review intercollege OD submissions, monitor recent approvals, and keep departmental requests moving with less friction."
          meta={[
            {
              label: "Department",
              value: hodUser?.department || "Not added yet",
            },
            {
              label: "Pending Queue",
              value: String(pendingRequests.length),
            },
          ]}
        />

        <section className="surface-grid md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Pending Requests"
            value={pendingRequests.length}
            caption="Applications waiting for your review."
            icon={ClipboardList}
          />
          <MetricCard
            label="Approved Today"
            value={recentApprovals.length}
            caption="Department approvals completed since midnight."
            icon={ShieldCheck}
          />
          <MetricCard
            label="Escalation Focus"
            value={hodUser?.department || "Profile"}
            caption="Department linkage controls which requests appear here."
            icon={FileClock}
          />
        </section>

        {!hodUser?.department ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-4 text-sm text-amber-900 shadow-[0_20px_45px_-34px_rgba(245,158,11,0.45)]">
            Add your department in the profile section below before reviewing intercollege OD requests.
          </div>
        ) : null}

        <section id="profile" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Profile Settings</h2>
              <p className="section-copy">
                Department selection is required for correct routing of intercollege OD approvals.
              </p>
            </div>
          </div>
          {hodUser ? <ProfileSettings user={hodUser} /> : null}
        </section>

        <section id="pending-requests" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Pending Intercollege Requests</h2>
              <p className="section-copy">
                Review proof documents, OD letters, and approve or reject requests without leaving the queue.
              </p>
            </div>
          </div>
          <IntercollegeODList requests={pendingRequests} isPending />
        </section>

        <section id="recent-approvals" className="section-stack">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Recently Approved</h2>
              <p className="section-copy">
                A quick history of the requests you approved today for your department.
              </p>
            </div>
          </div>
          <IntercollegeODList requests={recentApprovals} isPending={false} />
        </section>
      </div>
    </AppShell>
  );
}
