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
  Menu,
  ScrollText,
  ShieldCheck,
  Sparkles,
  SquarePlus,
  UserRoundCog,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type DashboardNavIcon,
  type DashboardNavItem,
  getDashboardRoute,
  getRoleLabel,
} from "@/lib/routes";

import { LogoutButton } from "./LogoutButton";

type NavbarProps = {
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

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "long",
  }).format(new Date());
}

function MobileMenu({ role, user, items }: NavbarProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
          />
        }
      >
        <Menu className="size-4" />
        <span className="sr-only">Open navigation</span>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="border-b border-border/80 px-5 py-4">
          <DialogTitle className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-700">
              <Sparkles className="size-5" />
            </span>
            <span>Campus Event & OD Hub</span>
          </DialogTitle>
          <div className="pt-2 text-left text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{user.name || "Dashboard User"}</p>
            <p>{getRoleLabel(role)}</p>
          </div>
        </DialogHeader>
        <div className="space-y-2 px-3 py-3">
          {items.map((item) => {
            const Icon = navIcons[item.icon];

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block font-medium text-foreground">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="border-t border-border/80 px-4 py-4">
          <LogoutButton className="w-full justify-center" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Navbar({ role, user, items }: NavbarProps) {
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
    <header className="sticky top-3 z-40 mb-5 rounded-lg border border-white/70 bg-white/80 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
        <div className="flex items-center gap-3">
          <MobileMenu role={role} user={user} items={items} />
          <Link
            href={getDashboardRoute(role)}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <span className="hidden size-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(245,158,11,0.18))] text-cyan-700 shadow-inner shadow-white/60 sm:flex">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-700/75">
                Campus Workspace
              </p>
              <h1 className="text-sm font-semibold text-foreground md:text-base">
                Event & OD Management
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-foreground">
              {user.name || "Dashboard User"}
            </p>
            <p className="text-xs text-muted-foreground">{formatToday()}</p>
          </div>
          <Badge
            variant="outline"
            className="hidden border-cyan-200 bg-cyan-50/80 px-2.5 py-1 text-cyan-800 md:inline-flex"
          >
            {getRoleLabel(role)}
          </Badge>
          <LogoutButton className="hidden lg:inline-flex" />
        </div>
      </div>

      <div className="border-t border-border/70 px-4 py-3 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => {
            const Icon = navIcons[item.icon];
            const [path, itemHash] = item.href.split("#");
            const isActive =
              pathname === path &&
              ((!hash && index === 0) || (!!itemHash && hash === `#${itemHash}`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-cyan-200 bg-cyan-50 text-cyan-900"
                    : "border-transparent bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
