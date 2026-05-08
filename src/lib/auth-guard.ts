import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { type AppRole, getDashboardRoute } from "@/lib/routes";

export async function getAppSession() {
  return getServerSession(authOptions);
}

export async function requireRole(allowedRoles: AppRole | AppRole[]) {
  const session = await getServerSession(authOptions);
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!session?.user) {
    redirect("/login");
  }

  if (!roles.includes(session.user.role as AppRole)) {
    redirect(getDashboardRoute(session.user.role));
  }

  return session;
}

