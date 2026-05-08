import type { ReactNode } from "react";

import { type DashboardNavItem } from "@/lib/routes";

import { Navbar } from "./Navbar";
import { SidebarNav } from "./SidebarNav";

type AppShellProps = {
  role: string;
  user: {
    name?: string | null;
    email?: string | null;
  };
  items: DashboardNavItem[];
  children: ReactNode;
};

export function AppShell({ role, user, items, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 py-3 md:px-4 lg:px-6">
        <div className="hidden w-[290px] shrink-0 lg:block">
          <SidebarNav role={role} user={user} items={items} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar role={role} user={user} items={items} />
          <main className="flex-1 pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

