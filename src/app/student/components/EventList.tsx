"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Clock, FileText, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeTeamSize } from "@/lib/events";

function parseFiles(value?: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((url): url is string => typeof url === "string")
      : [];
  } catch {
    return [];
  }
}

function isImageFile(url: string) {
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(url.split("?")[0]);
}

function parseStringArray(value?: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

type EventRegistration = {
  eventId: string;
  status: string;
};

type CampusEvent = {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  startTime?: string | null;
  endTime?: string | null;
  location: string;
  capacity: number;
  targetDepartments?: string | null;
  posterUrls?: string | null;
  autoApproveOD: boolean;
  participantType: string;
  teamSize: number;
  club?: { name?: string | null } | null;
  _count?: { registrations?: number };
};

export function EventList({
  events,
  registrations = [],
  studentDept,
}: {
  events: CampusEvent[];
  registrations?: EventRegistration[];
  studentDept?: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<
    Record<string, { name: string; members: string }>
  >({});

  const handleRegister = async (eventId: string, participantType: string) => {
    setLoadingId(eventId);
    const payload =
      participantType === "TEAM"
        ? {
            teamName: teamData[eventId]?.name || "",
            teamMembers:
              teamData[eventId]?.members
                ?.split(",")
                .map((member) => ({ rollNo: member.trim() }))
                .filter((member) => member.rollNo) || [],
          }
        : {};

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Success", { description: data.message });
        router.refresh();
      } else {
        toast.error("Registration failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const allowedDepts = parseStringArray(event.targetDepartments);
    const isDeptAllowed =
      allowedDepts.length === 0 ||
      (studentDept ? allowedDepts.includes(studentDept) : false);

    return eventDate >= today && isDeptAllowed;
  });

  if (!visibleEvents.length) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No upcoming events match your current profile and department settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {visibleEvents.map((event) => {
        const normalizedTeamSize = normalizeTeamSize(event.participantType, event.teamSize);
        const activeRegs = event._count?.registrations || 0;
        const isFull = activeRegs >= event.capacity;
        const myReg = registrations.find(
          (registration) =>
            registration.eventId === event.id && registration.status !== "CANCELLED"
        );
        const eventFiles = parseFiles(event.posterUrls);
        const previewImage = eventFiles.find(isImageFile);

        let buttonText = isFull ? "Join waitlist" : "Register and apply OD";
        if (myReg) {
          buttonText =
            myReg.status === "REGISTERED" ? "Already registered" : "Already waitlisted";
        }

        return (
          <Card key={event.id} className="flex h-full flex-col">
            {previewImage ? (
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="line-clamp-2 text-lg font-semibold">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {event.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="shrink-0 bg-white/80">
                  {event.club?.name || "Campus Club"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="grid gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-cyan-700" />
                  <span>{format(new Date(event.date), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-cyan-700" />
                  <span>
                    {event.startTime || "TBD"} - {event.endTime || "TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-cyan-700" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-cyan-700" />
                  <span>
                    {activeRegs} / {event.capacity} seats filled
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {event.autoApproveOD ? (
                  <Badge className="bg-emerald-50 text-emerald-700">
                    Auto-approve OD
                  </Badge>
                ) : null}
                <Badge variant="outline">
                  {event.participantType === "TEAM"
                    ? `Team event (${normalizedTeamSize})`
                    : "Individual event"}
                </Badge>
                {isFull ? (
                  <Badge className="bg-amber-50 text-amber-800">Capacity full</Badge>
                ) : null}
              </div>

              {eventFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {eventFiles.map((url, index) => (
                    <Button
                      key={url}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <FileText className="size-4" />
                      {eventFiles.length > 1 ? `File ${index + 1}` : "View file"}
                    </Button>
                  ))}
                </div>
              ) : null}

              {event.participantType === "TEAM" && !myReg ? (
                <div className="rounded-lg border border-dashed border-cyan-200 bg-cyan-50/55 p-4">
                  <p className="text-sm font-semibold text-cyan-900">
                    Team registration
                  </p>
                  <p className="mt-1 text-xs leading-5 text-cyan-800/80">
                    Enter the team name and exactly {normalizedTeamSize} roll numbers, including your own.
                  </p>
                  <div className="mt-3 grid gap-3">
                    <Input
                      placeholder="Team name"
                      onChange={(e) =>
                        setTeamData((prev) => ({
                          ...prev,
                          [event.id]: {
                            ...prev[event.id],
                            name: e.target.value,
                          },
                        }))
                      }
                    />
                    <Input
                      placeholder="Roll numbers separated by commas"
                      onChange={(e) =>
                        setTeamData((prev) => ({
                          ...prev,
                          [event.id]: {
                            ...prev[event.id],
                            members: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              ) : null}
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => handleRegister(event.id, event.participantType)}
                disabled={Boolean(myReg) || loadingId === event.id}
                className="w-full justify-center"
              >
                {loadingId === event.id ? "Processing..." : buttonText}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
