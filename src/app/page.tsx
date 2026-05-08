import { redirect } from "next/navigation";

import { getAppSession } from "@/lib/auth-guard";
import { getDashboardRoute } from "@/lib/routes";

export default async function Home() {
  const session = await getAppSession();

  if (session?.user?.role) {
    redirect(getDashboardRoute(session.user.role));
  }

  redirect("/login");
}
