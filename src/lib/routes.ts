export type AppRole =
  | "STUDENT"
  | "CLUB_ADMIN"
  | "FACULTY"
  | "SUPER_ADMIN"
  | "HOD";

export type DashboardNavIcon =
  | "layout-dashboard"
  | "calendar-check"
  | "file-clock"
  | "clipboard-list"
  | "user-round-cog"
  | "square-plus"
  | "file-spreadsheet"
  | "scroll-text"
  | "shield-check"
  | "users"
  | "building"
  | "graduation-cap"
  | "activity";

export type DashboardNavItem = {
  label: string;
  href: string;
  description: string;
  icon: DashboardNavIcon;
};

export const DASHBOARD_ROUTES: Record<AppRole, string> = {
  STUDENT: "/student",
  CLUB_ADMIN: "/club-admin",
  FACULTY: "/faculty",
  SUPER_ADMIN: "/super-admin",
  HOD: "/hod",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  STUDENT: "Student",
  CLUB_ADMIN: "Club Admin",
  FACULTY: "Faculty",
  SUPER_ADMIN: "Super Admin",
  HOD: "Head of Department",
};

export const DASHBOARD_NAV_ITEMS: Record<AppRole, DashboardNavItem[]> = {
  STUDENT: [
    {
      label: "Overview",
      href: "/student#overview",
      description: "Summary and profile health",
      icon: "layout-dashboard",
    },
    {
      label: "Events",
      href: "/student#events",
      description: "Browse campus opportunities",
      icon: "calendar-check",
    },
    {
      label: "External OD",
      href: "/student#external-od",
      description: "Apply for intercollege events",
      icon: "file-clock",
    },
    {
      label: "My Requests",
      href: "/student#requests",
      description: "Track OD approvals and status",
      icon: "clipboard-list",
    },
    {
      label: "Profile",
      href: "/student#profile",
      description: "Keep your academic details current",
      icon: "user-round-cog",
    },
  ],
  CLUB_ADMIN: [
    {
      label: "Overview",
      href: "/club-admin#overview",
      description: "Club performance snapshot",
      icon: "layout-dashboard",
    },
    {
      label: "Create Event",
      href: "/club-admin#create-event",
      description: "Publish new opportunities",
      icon: "square-plus",
    },
    {
      label: "My Events",
      href: "/club-admin#events",
      description: "Edit and export registrations",
      icon: "calendar-check",
    },
    {
      label: "Profile",
      href: "/club-admin#profile",
      description: "Update organizer details",
      icon: "user-round-cog",
    },
  ],
  FACULTY: [
    {
      label: "Overview",
      href: "/faculty#overview",
      description: "Daily academic OD summary",
      icon: "layout-dashboard",
    },
    {
      label: "Pending ODs",
      href: "/faculty#pending-ods",
      description: "Approve or reject requests",
      icon: "clipboard-list",
    },
    {
      label: "Today",
      href: "/faculty#today-ods",
      description: "Review approved absences",
      icon: "file-clock",
    },
    {
      label: "Export",
      href: "/faculty#exports",
      description: "Generate reports by department",
      icon: "file-spreadsheet",
    },
  ],
  HOD: [
    {
      label: "Overview",
      href: "/hod#overview",
      description: "Departmental OD control center",
      icon: "layout-dashboard",
    },
    {
      label: "Pending",
      href: "/hod#pending-requests",
      description: "Review intercollege requests",
      icon: "scroll-text",
    },
    {
      label: "Approved",
      href: "/hod#recent-approvals",
      description: "See today's completed decisions",
      icon: "shield-check",
    },
    {
      label: "Profile",
      href: "/hod#profile",
      description: "Maintain your department details",
      icon: "user-round-cog",
    },
  ],
  SUPER_ADMIN: [
    {
      label: "Overview",
      href: "/super-admin#overview",
      description: "Platform-wide analytics",
      icon: "layout-dashboard",
    },
    {
      label: "Users",
      href: "/super-admin#users",
      description: "Students, faculty, and admins",
      icon: "users",
    },
    {
      label: "Clubs",
      href: "/super-admin#clubs",
      description: "Active organizations and owners",
      icon: "building",
    },
    {
      label: "Events",
      href: "/super-admin#events",
      description: "Event inventory and capacity",
      icon: "calendar-check",
    },
    {
      label: "OD Desk",
      href: "/super-admin#ods",
      description: "Monitor OD request volume",
      icon: "graduation-cap",
    },
    {
      label: "Activity",
      href: "/super-admin#activity",
      description: "Recent registrations and traffic",
      icon: "activity",
    },
  ],
};

export const PROTECTED_ROUTE_PREFIXES = Object.values(DASHBOARD_ROUTES);

export function isAppRole(role: string | null | undefined): role is AppRole {
  return Boolean(role && role in DASHBOARD_ROUTES);
}

export function getDashboardRoute(role: string | null | undefined) {
  if (!isAppRole(role)) {
    return "/login";
  }

  return DASHBOARD_ROUTES[role];
}

export function getRoleLabel(role: string | null | undefined) {
  if (!isAppRole(role)) {
    return "Workspace";
  }

  return ROLE_LABELS[role];
}

export function getNavItems(role: string | null | undefined) {
  if (!isAppRole(role)) {
    return [];
  }

  return DASHBOARD_NAV_ITEMS[role];
}
