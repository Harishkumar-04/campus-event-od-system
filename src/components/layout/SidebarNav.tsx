"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CalendarCheck2,
  ClipboardList,
  FileClock,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Sparkles,
  SquarePlus,
  UserRoundCog,
  Users2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type DashboardNavIcon,
  type DashboardNavItem,
  getDashboardRoute,
  getRoleLabel,
} from "@/lib/routes";

import { LogoutButton } from "./LogoutButton";

type SidebarNavProps = {
  role: string;
  user: {
    name?: string | null;
    email?: string | null;
  };
  items: DashboardNavItem[];
};

const navIcons: Record<DashboardNavIcon, ComponentType<{ className?: string }>> = {
  activity: Activity,
  building: Building2,
  "calendar-check": CalendarCheck2,
  "clipboard-list": ClipboardList,
  "file-clock": FileClock,
  "file-spreadsheet": FileSpreadsheet,
  "graduation-cap": GraduationCap,
  "layout-dashboard": LayoutDashboard,
  "scroll-text": ScrollText,
  "shield-check": ShieldCheck,
  "square-plus": SquarePlus,
  "user-round-cog": UserRoundCog,
  users: Users2,
};

function getItemState(
  currentPath: string,
  currentHash: string,
  itemHref: string,
  index: number
) {
  const [path, hash] = itemHref.split("#");
  const normalizedHash = hash ? `#${hash}` : "";

  if (currentPath !== path) {
    return false;
  }

  if (!normalizedHash) {
    return true;
  }

  if (!currentHash && index === 0) {
    return true;
  }

  return currentHash === normalizedHash;
}

export function SidebarNav({ role, user, items }: SidebarNavProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncLocation = () => {
      setHash(window.location.hash);
    };

    syncLocation();
    window.addEventListener("hashchange", syncLocation);

    return () => {
      window.removeEventListener("hashchange", syncLocation);
    };
  }, []);

  return (
    <aside className="sticky top-3 hidden h-[calc(100vh-1.5rem)] w-full flex-col overflow-hidden rounded-lg border border-slate-800/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(14,49,76,0.97)_100%)] text-slate-50 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.85)] lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          href={getDashboardRoute(role)}
          className="flex items-center gap-3 text-slate-50 transition-opacity hover:opacity-90"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-cyan-200 shadow-inner shadow-white/10">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
              Campus Suite
            </p>
            <h2 className="text-base font-semibold">Event & OD Hub</h2>
          </div>
        </Link>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cyan-100/60">
          {getRoleLabel(role)}
        </p>
        <p className="mt-2 text-base font-semibold text-white">
          {user.name || "Dashboard User"}
        </p>
        <p className="mt-1 text-sm text-slate-300/85">{user.email || "No email available"}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item, index) => {
          const Icon = navIcons[item.icon];
          const isActive = getItemState(pathname, hash, item.href, index);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-start gap-3 rounded-lg px-3 py-3 transition-all",
                isActive
                  ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-cyan-300/15 text-cyan-100" : "bg-white/6 text-slate-300 group-hover:bg-white/10"
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300/75">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <LogoutButton className="w-full justify-center border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white" />
      </div>
    </aside>
  );
}
