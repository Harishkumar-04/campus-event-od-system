"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function IntercollegeODForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [odLetterFiles, setOdLetterFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    teamMembers: "",
  });

  const uploadFiles = async (selectedFiles: File[]) => {
    const uploadData = new FormData();
    selectedFiles.forEach((file) => uploadData.append("files", file));

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    if (!uploadRes.ok) {
      throw new Error("Upload failed");
    }

    const { paths } = await uploadRes.json();
    return paths as string[];
  };

  const resetForm = () => {
    setFormData({
      eventName: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      teamMembers: "",
    });
    setProofFiles([]);
    setOdLetterFiles([]);
    setFileInputKey((key) => key + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (proofFiles.length === 0) {
        toast.error("Please upload proof documents.");
        setLoading(false);
        return;
      }

      if (odLetterFiles.length === 0) {
        toast.error("Please upload the OD letter.");
        setLoading(false);
        return;
      }

      if (!formData.teamMembers.trim()) {
        toast.error("Please enter team member roll numbers.");
        setLoading(false);
        return;
      }

      const [proofUrls, odLetterUrls] = await Promise.all([
        uploadFiles(proofFiles),
        uploadFiles(odLetterFiles),
      ]);

      const res = await fetch("/api/intercollege-od", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          proofUrls,
          odLetterUrls,
        }),
      });

      if (res.ok) {
        toast.success("Intercollege OD request submitted.");
        resetForm();
        router.refresh();
      } else {
        toast.error((await res.json()).error);
      }
    } catch {
      toast.error("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-none">
      <CardHeader>
        <CardTitle>Apply for Intercollege OD</CardTitle>
        <CardDescription>
          Add the event schedule, upload supporting proof, and include every participating student roll number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="eventName">Event Name</Label>
            <Input
              id="eventName"
              required
              value={formData.eventName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eventName: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Date</Label>
            <Input
              id="eventDate"
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eventDate: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofFiles">Supporting Proof</Label>
            <Input
              key={`proof-${fileInputKey}`}
              id="proofFiles"
              type="file"
              required
              multiple
              onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
            />
            <p className="text-xs text-muted-foreground">
              Upload brochures, invitations, tickets, or official participation proof.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="odLetterFiles">OD Letter</Label>
            <Input
              key={`letter-${fileInputKey}`}
              id="odLetterFiles"
              type="file"
              required
              onChange={(e) => setOdLetterFiles(Array.from(e.target.files || []))}
            />
            <p className="text-xs text-muted-foreground">
              Attach the formal OD request or approval letter issued for the event.
            </p>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="teamMembers">Team Member Roll Numbers</Label>
            <Textarea
              id="teamMembers"
              required
              placeholder="Include your own roll number, separated by commas. Example: 231001060, 231002001"
              value={formData.teamMembers}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, teamMembers: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2 lg:col-span-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit OD Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
