"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, Edit, Clock, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DEPARTMENTS } from "@/lib/departments";
import { normalizeTeamSize } from "@/lib/events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminEvent = {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  posterUrls?: string | null;
  autoApproveOD: boolean;
  targetDepartments?: string | null;
  participantType: string;
  teamSize: number;
  _count: { registrations: number };
  registrations?: { status: string }[];
};

type EventFormData = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
  participantType: string;
  teamSize: string;
  autoApproveOD: boolean;
  targetDepartments: string[];
};

function parseJsonArray(value?: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toDateInputValue(date: Date | string) {
  return format(new Date(date), "yyyy-MM-dd");
}

function createFormData(event: AdminEvent): EventFormData {
  return {
    title: event.title,
    description: event.description,
    date: toDateInputValue(event.date),
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    location: event.location,
    capacity: String(event.capacity),
    participantType: event.participantType || "INDIVIDUAL",
    teamSize: String(normalizeTeamSize(event.participantType, event.teamSize)),
    autoApproveOD: event.autoApproveOD,
    targetDepartments: parseJsonArray(event.targetDepartments),
  };
}

export function AdminEventList({ events }: { events: AdminEvent[] }) {
  const router = useRouter();
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!events || events.length === 0) {
    return <div className="text-zinc-500">No active events created yet.</div>;
  }

  const openEdit = (event: AdminEvent) => {
    setEditingEvent(event);
    setFormData(createFormData(event));
    setFiles([]);
  };

  const updateField = (field: keyof EventFormData, value: string | boolean | string[]) => {
    setFormData((current) => current ? { ...current, [field]: value } : current);
  };

  const toggleDepartment = (dept: string) => {
    setFormData((current) => {
      if (!current) return current;
      const targetDepartments = current.targetDepartments.includes(dept)
        ? current.targetDepartments.filter((item) => item !== dept)
        : [...current.targetDepartments, dept];
      return { ...current, targetDepartments };
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return undefined;

    const uploadData = new FormData();
    files.forEach((file) => uploadData.append("files", file));
    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
    if (!uploadRes.ok) throw new Error("File upload failed");
    const { paths } = await uploadRes.json();
    return paths as string[];
  };

  const handleSave = async () => {
    if (!editingEvent || !formData) return;

    setSavingId(editingEvent.id);
    try {
      const posterUrls = await uploadFiles();
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...(posterUrls ? { posterUrls } : {}),
        }),
      });

      if (res.ok) {
        toast.success("Event updated");
        setEditingEvent(null);
        setFormData(null);
        setFiles([]);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error("Update failed", { description: data.error || "Could not update event." });
      }
    } catch {
      toast.error("Update failed", { description: "Could not update event." });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this event? This will remove it for students too.")) return;

    setDeletingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error("Delete failed", { description: data.error || "Could not delete event." });
      }
    } catch {
      toast.error("Delete failed", { description: "Could not delete event." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const normalizedTeamSize = normalizeTeamSize(event.participantType, event.teamSize);
        const capacityFilled = event._count.registrations;
        const isFull = capacityFilled >= event.capacity;
        const filesUploaded = parseJsonArray(event.posterUrls);
        const waitlisted = event.registrations?.filter((registration) => registration.status === "WAITLISTED").length || 0;

        return (
          <Card key={event.id} className={isFull ? "border-orange-200" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {format(new Date(event.date), "PPP")} - {event.location}
                  </CardDescription>
                </div>
                {isFull && <Badge variant="destructive" className="bg-orange-500">Capacity Full</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{event.startTime || "TBD"} - {event.endTime || "TBD"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{capacityFilled} / {event.capacity} registered</span>
                </div>
              </div>

              {waitlisted > 0 && (
                <div className="text-sm text-orange-600 font-medium">
                  {waitlisted} students on waiting list
                </div>
              )}

              {filesUploaded.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <FileText className="w-4 h-4" />
                  <span>{filesUploaded.length} file(s) uploaded</span>
                </div>
              )}

              {event.autoApproveOD && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Auto-Approve OD Enabled</Badge>
              )}
              {event.participantType === "TEAM" && (
                <Badge variant="outline">Team Size: {normalizedTeamSize}</Badge>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => window.location.href = `/api/events/${event.id}/export`}
                disabled={capacityFilled === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel Report
              </Button>
              <Dialog open={editingEvent?.id === event.id} onOpenChange={(open) => open ? openEdit(event) : setEditingEvent(null)}>
                <DialogTrigger render={<Button type="button" className="w-full sm:w-auto" variant="outline" />}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                  </DialogHeader>
                  {formData && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${event.id}`}>Event Title</Label>
                        <Input id={`title-${event.id}`} value={formData.title} onChange={(e) => updateField("title", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${event.id}`}>Description</Label>
                        <Textarea id={`description-${event.id}`} value={formData.description} onChange={(e) => updateField("description", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`files-${event.id}`}>Replace Event Files</Label>
                        <Input id={`files-${event.id}`} type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`date-${event.id}`}>Date</Label>
                          <Input id={`date-${event.id}`} type="date" value={formData.date} onChange={(e) => updateField("date", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`start-${event.id}`}>Start Time</Label>
                          <Input id={`start-${event.id}`} type="time" value={formData.startTime} onChange={(e) => updateField("startTime", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`end-${event.id}`}>End Time</Label>
                          <Input id={`end-${event.id}`} type="time" value={formData.endTime} onChange={(e) => updateField("endTime", e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`location-${event.id}`}>Location</Label>
                          <Input id={`location-${event.id}`} value={formData.location} onChange={(e) => updateField("location", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`capacity-${event.id}`}>Capacity</Label>
                          <Input id={`capacity-${event.id}`} type="number" min="1" value={formData.capacity} onChange={(e) => updateField("capacity", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`type-${event.id}`}>Participant Type</Label>
                          <Select
                            value={formData.participantType}
                            onValueChange={(value) =>
                              updateField("participantType", value || "INDIVIDUAL")
                            }
                          >
                            <SelectTrigger id={`type-${event.id}`}>
                              <SelectValue placeholder="Select participation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                              <SelectItem value="TEAM">Team</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {formData.participantType === "TEAM" && (
                        <div className="space-y-2">
                          <Label htmlFor={`team-size-${event.id}`}>Students Per Team</Label>
                          <Input
                            id={`team-size-${event.id}`}
                            type="number"
                            min="2"
                            value={formData.teamSize}
                            onChange={(e) => updateField("teamSize", e.target.value)}
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`auto-${event.id}`}
                          checked={formData.autoApproveOD}
                          onCheckedChange={(checked) => updateField("autoApproveOD", checked as boolean)}
                        />
                        <Label htmlFor={`auto-${event.id}`}>Auto Approve All ODs for this Event</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Departments</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md max-h-56 overflow-y-auto">
                          {DEPARTMENTS.map((dept) => (
                            <div key={dept.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-${event.id}-${dept.value}`}
                                checked={formData.targetDepartments.includes(dept.value)}
                                onCheckedChange={() => toggleDepartment(dept.value)}
                              />
                              <Label htmlFor={`edit-${event.id}-${dept.value}`} className="text-xs cursor-pointer leading-tight">{dept.value}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleSave} disabled={savingId === event.id}>
                        {savingId === event.id ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button
                className="w-full sm:w-auto"
                variant="destructive"
                onClick={() => handleDelete(event.id)}
                disabled={deletingId === event.id}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
