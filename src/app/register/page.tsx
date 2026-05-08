"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/layout/AuthShell";
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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    department: "",
    rollNo: "",
    facultyId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully. You can now log in!");
        router.push("/login");
      } else {
        toast.error("Registration failed", { description: data.error });
      }
    } catch {
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Workspace Setup"
      title="Create one account and unlock the dashboard built for your role."
      description="Students register for events, clubs coordinate participation, and approvers manage OD decisions through the same system."
      switchText="Already have access? Head back to the sign-in page and continue into your dashboard."
      switchHref="/login"
      switchLabel="Sign in"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-11 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-700">
            <UserPlus className="size-5" />
          </span>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
              Create your account
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Register with the role and department that matches how you’ll use the platform.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full Name / Club Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required onChange={handleChange} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@college.edu" required onChange={handleChange} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required onChange={handleChange} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => {
                  if (!value) return;
                  setFormData((prev) => ({ ...prev, role: value }));
                }}
                value={formData.role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="CLUB_ADMIN">Club Administrator</SelectItem>
                  <SelectItem value="FACULTY">Faculty Member</SelectItem>
                  <SelectItem value="HOD">Head of Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.role === "STUDENT" ||
              formData.role === "CLUB_ADMIN" ||
              formData.role === "FACULTY" ||
              formData.role === "HOD") && (
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
            )}

            {(formData.role === "FACULTY" || formData.role === "HOD") && (
              <div className="space-y-2">
                <Label htmlFor="facultyId">Faculty ID</Label>
                <Input id="facultyId" name="facultyId" placeholder="FAC001" required onChange={handleChange} />
              </div>
            )}

            {formData.role === "STUDENT" && (
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input id="rollNo" name="rollNo" placeholder="21CS101" required onChange={handleChange} />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
