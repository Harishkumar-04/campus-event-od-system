import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string | number;
  caption?: string;
  icon: LucideIcon;
};

export function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card className="h-full bg-white/86">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <CardTitle className="mt-3 text-3xl font-semibold tracking-tight">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(245,158,11,0.18))] text-cyan-700">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      {caption ? (
        <CardContent className="pt-0 text-sm text-muted-foreground">
          {caption}
        </CardContent>
      ) : null}
    </Card>
  );
}

