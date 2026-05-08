"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Check, Clock3, FileText, Users, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type IntercollegeODRequest = {
  id: string;
  rollNo: string;
  department: string;
  eventName: string;
  eventDate: Date | string;
  startTime?: string | null;
  endTime?: string | null;
  proofUrls?: string | null;
  odLetterUrls?: string | null;
  teamMembers?: string | null;
  status: string;
  student?: {
    name?: string | null;
  } | null;
};

function parseFileUrls(value?: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((url): url is string => typeof url === "string")
      : [];
  } catch {
    return [];
  }
}

function parseTeamMembers(value?: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function DocumentLinks({ label, urls }: { label: string; urls: string[] }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      {urls.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, index) => (
            <Button
              key={url}
              variant="outline"
              size="sm"
              onClick={() => window.open(url, "_blank")}
            >
              <FileText className="size-4" />
              {urls.length > 1 ? `View ${index + 1}` : "Open file"}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No file uploaded.</p>
      )}
    </div>
  );
}

export function IntercollegeODList({
  requests,
  isPending,
}: {
  requests: IntercollegeODRequest[];
  isPending: boolean;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/intercollege-od/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Request ${status.toLowerCase()} successfully`);
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  if (!requests.length) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No requests found for this section.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {requests.map((request) => {
        const proofs = parseFileUrls(request.proofUrls);
        const letters = parseFileUrls(request.odLetterUrls);
        const teamMembers = parseTeamMembers(request.teamMembers);

        return (
          <Card key={request.id} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">
                    {request.student?.name || "Student"}
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {request.rollNo} - {request.department}
                  </p>
                </div>
                {!isPending ? (
                  <Badge
                    className={
                      request.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }
                  >
                    {request.status}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Event Name
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {request.eventName}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  <Calendar className="size-4 text-cyan-700" />
                  {format(new Date(request.eventDate), "PPP")}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  <Clock3 className="size-4 text-cyan-700" />
                  {request.startTime || "TBD"} - {request.endTime || "TBD"}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700">
                <Users className="size-4 text-cyan-700" />
                {teamMembers.length > 0
                  ? `${teamMembers.length} team members included`
                  : "Individual request"}
              </div>

              <DocumentLinks label="Supporting Proof" urls={proofs} />
              <DocumentLinks label="OD Letter" urls={letters} />
            </CardContent>

            {isPending ? (
              <CardFooter className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full justify-center"
                  disabled={loadingId === request.id}
                  onClick={() => handleAction(request.id, "APPROVED")}
                >
                  <Check className="size-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-center"
                  disabled={loadingId === request.id}
                  onClick={() => handleAction(request.id, "REJECTED")}
                >
                  <X className="size-4" />
                  Reject
                </Button>
              </CardFooter>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
