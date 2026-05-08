"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/lib/departments";

type ProfileUser = {
  name?: string | null;
  department?: string | null;
  rollNo?: string | null;
};

export function ProfileSettings({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    department: user.department || "",
    rollNo: user.rollNo || "",
  });

  const resetForm = () => {
    setFormData({
      name: user.name || "",
      department: user.department || "",
      rollNo: user.rollNo || "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully.");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error("Update failed", { description: err.error });
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-none">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          These details power role-based dashboards, OD records, and student registration checks.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            onValueChange={(value) => {
              if (!value) return;
              setFormData((prev) => ({ ...prev, department: value }));
            }}
            value={formData.department}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rollNo">Roll Number</Label>
          <Input id="rollNo" name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="21CS101" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Save once and the updated profile is reflected across registrations and approval views.
        </p>
        <div className="flex gap-2 sm:justify-end">
          <Button onClick={resetForm} variant="outline" disabled={loading}>
            Discard
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
