import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  switchText: string;
  switchHref: string;
  switchLabel: string;
};

const highlights = [
  {
    title: "Coordinated event operations",
    text: "Clubs publish events, students register, and faculty track attendance from one workspace.",
    icon: CalendarDays,
  },
  {
    title: "Academic OD approvals",
    text: "Faculty and HOD approvals stay aligned with role-based visibility and cleaner routing.",
    icon: ShieldCheck,
  },
  {
    title: "Ready for every role",
    text: "Students, admins, faculty, and department heads work inside a shared product-grade dashboard.",
    icon: GraduationCap,
  },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  switchText,
  switchHref,
  switchLabel,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,520px)]">
        <section className="relative overflow-hidden rounded-lg border border-white/65 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(224,247,250,0.68)_52%,rgba(255,247,237,0.82)_100%)] px-6 py-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)] lg:block" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-slate-900 text-cyan-200 shadow-[0_18px_35px_-25px_rgba(15,23,42,0.8)]">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-700/80">
                  {eyebrow}
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  Campus Event & OD Hub
                </h1>
              </div>
            </div>

            <div className="mt-10 max-w-2xl">
              <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {description}
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <div
                    key={highlight.title}
                    className="rounded-lg border border-white/70 bg-white/72 p-4 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-700">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                      {highlight.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {highlight.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto hidden pt-12 lg:block">
              <p className="text-sm text-slate-600">
                Designed for fast approval loops, role-aware access, and a cleaner day-to-day workflow.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full rounded-lg border border-white/70 bg-white/86 p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.34)] backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700/80">
                  Workspace Access
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {switchText}
                </p>
              </div>
              <Link
                href={switchHref}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "shrink-0"
                )}
              >
                {switchLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
