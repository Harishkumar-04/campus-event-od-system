import type { ReactNode } from "react";

type DashboardHeaderProps = {
  eyebrow: string;
  heading: string;
  text?: string;
  meta?: {
    label: string;
    value: string;
  }[];
  action?: ReactNode;
};

export function DashboardHeader({
  eyebrow,
  heading,
  text,
  meta = [],
  action,
}: DashboardHeaderProps) {
  return (
    <section
      id="overview"
      className="relative overflow-hidden rounded-lg border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,247,250,0.72)_55%,rgba(255,247,237,0.84)_100%)] px-6 py-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-7 sm:py-7"
    >
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)] lg:block" />
      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-700/80">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {heading}
          </h1>
          {text ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {text}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {meta.length > 0 ? (
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {meta.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/70 bg-white/70 px-4 py-3 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.28)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
