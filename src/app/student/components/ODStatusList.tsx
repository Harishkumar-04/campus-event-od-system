"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Clock, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ODStatus = "PENDING" | "APPROVED" | "REJECTED";
type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED";

type CampusODRequest = {
  id: string;
  status: ODStatus | string;
  registration?: {
    id: string;
    status: RegistrationStatus | string;
    event?: {
      title: string;
      date: Date | string;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
    } | null;
  } | null;
};

type IntercollegeODRequest = {
  id: string;
  eventName: string;
  eventDate: Date | string;
  status: ODStatus | string;
};

const odStatusClasses = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
};

const registrationStatusClasses = {
  REGISTERED: "bg-cyan-50 text-cyan-800 border-cyan-200",
  WAITLISTED: "bg-orange-50 text-orange-800 border-orange-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

function getOdStatusClass(status: string) {
  return odStatusClasses[status as keyof typeof odStatusClasses] || "bg-slate-100 text-slate-700 border-slate-200";
}

function getRegistrationStatusClass(status: string) {
  return (
    registrationStatusClasses[status as keyof typeof registrationStatusClasses] ||
    "bg-slate-100 text-slate-700 border-slate-200"
  );
}

export function ODStatusList({
  odRequests = [],
  intercollegeODs = [],
}: {
  odRequests?: CampusODRequest[];
  intercollegeODs?: IntercollegeODRequest[];
}) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (registrationId: string) => {
    if (!confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    setCancellingId(registrationId);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Registration cancelled successfully.");
        router.refresh();
      } else {
        const error = await res.json();
        toast.error("Error", {
          description: error.error || "Failed to cancel.",
        });
      }
    } catch {
      toast.error("Error", { description: "Network error occurred." });
    } finally {
      setCancellingId(null);
    }
  };

  const hasEventODs = odRequests.length > 0;
  const hasIntercollegeODs = intercollegeODs.length > 0;

  if (!hasEventODs && !hasIntercollegeODs) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No OD requests found yet. Once you register for an event or submit an intercollege request, status updates will appear here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {hasEventODs ? (
        <Card>
          <CardHeader>
            <CardTitle>Campus Event ODs</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {odRequests.map((od) => {
                  const registration = od.registration;
                  const event = registration?.event;

                  if (!event || !registration) {
                    return null;
                  }

                  return (
                    <TableRow key={od.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{format(new Date(event.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {event.startTime || "TBD"} - {event.endTime || "TBD"}
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="space-y-2">
                        <Badge
                          className={`${getRegistrationStatusClass(registration.status)} w-max`}
                          variant="outline"
                        >
                          Registration: {registration.status}
                        </Badge>
                        <Badge
                          className={`${getOdStatusClass(od.status)} flex w-max items-center gap-1`}
                          variant="outline"
                        >
                          {od.status === "PENDING" ? <Clock className="size-3" /> : null}
                          {od.status === "APPROVED" ? <CheckCircle2 className="size-3" /> : null}
                          {od.status === "REJECTED" ? <XCircle className="size-3" /> : null}
                          OD: {od.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {registration.status !== "CANCELLED" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(registration.id)}
                            disabled={cancellingId === registration.id}
                            className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          >
                            <Trash2 className="size-4" />
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Cancelled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {hasIntercollegeODs ? (
        <Card>
          <CardHeader>
            <CardTitle>Intercollege ODs</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intercollegeODs.map((od) => (
                  <TableRow key={od.id}>
                    <TableCell className="font-medium">{od.eventName}</TableCell>
                    <TableCell>{format(new Date(od.eventDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getOdStatusClass(od.status)} flex w-max items-center gap-1`}
                        variant="outline"
                      >
                        {od.status === "PENDING" ? <Clock className="size-3" /> : null}
                        {od.status === "APPROVED" ? <CheckCircle2 className="size-3" /> : null}
                        {od.status === "REJECTED" ? <XCircle className="size-3" /> : null}
                        {od.status} (HOD)
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
