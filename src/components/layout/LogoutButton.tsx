"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  compact?: boolean;
  className?: string;
};

export function LogoutButton({
  compact = false,
  className,
}: LogoutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = () => {
    setIsPending(true);
    void signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon" : "default"}
      className={className}
      disabled={isPending}
      onClick={handleLogout}
    >
      <LogOut className="size-4" />
      {!compact && (isPending ? "Signing out..." : "Logout")}
      {compact && <span className="sr-only">Logout</span>}
    </Button>
  );
}

