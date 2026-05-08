"use client";

import { useDeferredValue, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, Search, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
};

type ClubRow = {
  id: string;
  name: string;
  description: string | null;
  admin: {
    name: string | null;
  } | null;
};

type EventRow = {
  id: string;
  title: string;
  date: Date | string;
  capacity: number;
  club: {
    name: string | null;
  } | null;
  _count?: {
    registrations: number;
  };
};

type ODRow = {
  id: string;
  status: string;
  createdAt: Date | string;
  student: {
    name: string | null;
    rollNo: string | null;
    department: string | null;
  } | null;
  registration: {
    event: {
      title: string | null;
    } | null;
  } | null;
};

type RegistrationRow = {
  id: string;
  createdAt: Date | string;
  student: {
    name: string;
  };
  event: {
    title: string;
  };
};

function SearchField({
  query,
  onChange,
  placeholder,
}: {
  query: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-10"
        value={query}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TableSurface({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="px-0 pb-0">{children}</CardContent>
    </Card>
  );
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalized = normalizeQuery(deferredQuery);

  const filtered = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(normalized) ||
      user.email?.toLowerCase().includes(normalized) ||
      user.department?.toLowerCase().includes(normalized) ||
      user.role.toLowerCase().includes(normalized)
  );

  return (
    <div className="space-y-4">
      <SearchField query={query} onChange={setQuery} placeholder="Search users..." />
      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSurface>
    </div>
  );
}

export function ClubsTable({ clubs }: { clubs: ClubRow[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalized = normalizeQuery(deferredQuery);

  const filtered = clubs.filter(
    (club) =>
      club.name?.toLowerCase().includes(normalized) ||
      club.admin?.name?.toLowerCase().includes(normalized)
  );

  return (
    <div className="space-y-4">
      <SearchField query={query} onChange={setQuery} placeholder="Search clubs or admins..." />
      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Club Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell className="max-w-md truncate">{club.description}</TableCell>
                  <TableCell>{club.admin?.name || "None"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                  No clubs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSurface>
    </div>
  );
}

export function EventsTable({ events }: { events: EventRow[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalized = normalizeQuery(deferredQuery);

  const filtered = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(normalized) ||
      event.club?.name?.toLowerCase().includes(normalized)
  );

  return (
    <div className="space-y-4">
      <SearchField query={query} onChange={setQuery} placeholder="Search events or clubs..." />
      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Capacity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.club?.name}</TableCell>
                  <TableCell>{format(new Date(event.date), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>
                    {event._count?.registrations || 0} / {event.capacity}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSurface>
    </div>
  );
}

export function OdsTable({ ods }: { ods: ODRow[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalized = normalizeQuery(deferredQuery);

  const filtered = ods.filter(
    (od) =>
      od.student?.name?.toLowerCase().includes(normalized) ||
      od.student?.department?.toLowerCase().includes(normalized) ||
      od.student?.rollNo?.toLowerCase().includes(normalized) ||
      od.registration?.event?.title?.toLowerCase().includes(normalized) ||
      od.status.toLowerCase().includes(normalized)
  );

  return (
    <div className="space-y-4">
      <SearchField
        query={query}
        onChange={setQuery}
        placeholder="Search student, roll number, event, or status..."
      />
      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((od) => {
                const statusClasses = {
                  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
                  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
                };

                return (
                  <TableRow key={od.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{od.student?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {od.student?.rollNo} - {od.student?.department}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{od.registration?.event?.title}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusClasses[od.status as keyof typeof statusClasses]} flex w-max items-center gap-1`}
                        variant="outline"
                      >
                        {od.status === "PENDING" ? <Clock className="size-3" /> : null}
                        {od.status === "APPROVED" ? <CheckCircle2 className="size-3" /> : null}
                        {od.status === "REJECTED" ? <XCircle className="size-3" /> : null}
                        {od.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(od.createdAt), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  No OD applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSurface>
    </div>
  );
}

export function RegistrationsTable({
  registrations,
}: {
  registrations: RegistrationRow[];
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalized = normalizeQuery(deferredQuery);

  const filtered = registrations.filter(
    (registration) =>
      registration.student?.name?.toLowerCase().includes(normalized) ||
      registration.event?.title?.toLowerCase().includes(normalized)
  );

  return (
    <div className="space-y-4">
      <SearchField query={query} onChange={setQuery} placeholder="Search student or event..." />
      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Registered At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">{registration.student.name}</TableCell>
                  <TableCell>{registration.event.title}</TableCell>
                  <TableCell>
                    {format(new Date(registration.createdAt), "MMM d, yyyy h:mm a")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                  No recent activity.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSurface>
    </div>
  );
}
