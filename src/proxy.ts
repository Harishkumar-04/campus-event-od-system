import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DASHBOARD_ROUTES, getDashboardRoute, isAppRole } from "@/lib/routes";

function getRouteRole(pathname: string) {
  if (pathname.startsWith("/student")) return "STUDENT";
  if (pathname.startsWith("/club-admin")) return "CLUB_ADMIN";
  if (pathname.startsWith("/faculty")) return "FACULTY";
  if (pathname.startsWith("/super-admin")) return "SUPER_ADMIN";
  if (pathname.startsWith("/hod")) return "HOD";

  return null;
}

export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = typeof token?.role === "string" && isAppRole(token.role) ? token.role : null;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(role ? getDashboardRoute(role) : "/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/register") && role) {
    return NextResponse.redirect(new URL(getDashboardRoute(role), req.url));
  }

  const matchedRole = getRouteRole(pathname);

  if (!matchedRole) {
    return NextResponse.next();
  }

  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (matchedRole !== role) {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES[role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/student/:path*",
    "/club-admin/:path*",
    "/faculty/:path*",
    "/super-admin/:path*",
    "/hod/:path*",
  ],
};
