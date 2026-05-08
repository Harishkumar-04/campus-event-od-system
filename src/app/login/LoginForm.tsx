"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";

import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.replace(callbackUrl || "/");
    router.refresh();
  };

  return (
    <AuthShell
      eyebrow="Secure Access"
      title="Sign in and pick up where your campus workflow left off."
      description="Move from event discovery to OD approval without hopping between disconnected screens."
      switchText="New here? Create your workspace account and choose the role that matches your responsibilities."
      switchHref="/register"
      switchLabel="Sign up"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
            Welcome back
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter your college email and password to continue into the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              <AlertCircle className="size-4" />
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@college.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? "Signing in..." : "Continue to dashboard"}
            <ArrowRight className="size-4" />
          </Button>

          <p className="text-sm leading-6 text-muted-foreground">
            Student, club, faculty, HOD, and super admin dashboards only open after authentication.
          </p>
        </form>
      </div>
    </AuthShell>
  );
}

