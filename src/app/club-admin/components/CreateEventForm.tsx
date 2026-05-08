"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DEPARTMENTS } from "@/lib/departments";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    participantType: "INDIVIDUAL",
    teamSize: "2",
    autoApproveOD: false,
    targetDepartments: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDeptToggle = (deptValue: string) => {
    setFormData((prev) => {
      const current = prev.targetDepartments;
      if (current.includes(deptValue)) {
        return { ...prev, targetDepartments: current.filter((d) => d !== deptValue) };
      } else {
        return { ...prev, targetDepartments: [...current, deptValue] };
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        const uploadData = new FormData();
        files.forEach((f) => uploadData.append("files", f));
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        
        if (uploadRes.ok) {
          const { paths } = await uploadRes.json();
          uploadedUrls = paths;
        } else {
          toast.error("File upload failed");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        posterUrls: uploadedUrls,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Event Created", { description: "Successfully created the event." });
        setFormData({ title: "", description: "", date: "", startTime: "", endTime: "", location: "", capacity: "", participantType: "INDIVIDUAL", teamSize: "2", autoApproveOD: false, targetDepartments: [] });
        setFiles([]);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error("Error", { description: data.error });
      }
    } catch {
      toast.error("Error", { description: "Failed to create event" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Setup</CardTitle>
        <CardDescription>
          Publish a new event with participation rules, OD behavior, and supporting files in one step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" name="title" required value={formData.title} onChange={handleChange} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required value={formData.description} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="posters">Event Files (Images / PDFs / Documents)</Label>
            <Input id="posters" type="file" multiple onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required value={formData.date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" name="startTime" type="time" required value={formData.startTime} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" name="endTime" type="time" required value={formData.endTime} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required value={formData.location} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min="1" required value={formData.capacity} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participantType">Participant Type</Label>
              <Select
                value={formData.participantType}
                onValueChange={(value) => {
                  if (!value) return;
                  setFormData((prev) => ({ ...prev, participantType: value }));
                }}
              >
                <SelectTrigger>
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
              <Label htmlFor="teamSize">Students Per Team</Label>
              <Input
                id="teamSize"
                name="teamSize"
                type="number"
                min="2"
                required
                value={formData.teamSize}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="autoApproveOD" 
                name="autoApproveOD" 
                checked={formData.autoApproveOD} 
                onCheckedChange={(checked) => setFormData(prev => ({...prev, autoApproveOD: checked as boolean}))} 
              />
              <Label htmlFor="autoApproveOD" className="cursor-pointer font-semibold text-emerald-900">Auto Approve All ODs for this Event</Label>
            </div>
            <p className="ml-6 text-xs text-emerald-900/75">If checked, students receive OD approval automatically as soon as they register.</p>
          </div>

          <div className="space-y-2">
            <Label>Target Departments (Leave empty to allow all)</Label>
            <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-4 md:grid-cols-3">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`dept-${dept.value}`} 
                    checked={formData.targetDepartments.includes(dept.value)}
                    onCheckedChange={() => handleDeptToggle(dept.value)}
                  />
                  <Label htmlFor={`dept-${dept.value}`} className="text-xs cursor-pointer leading-tight">{dept.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
