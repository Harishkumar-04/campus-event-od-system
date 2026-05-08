"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ApprovalRequest = {
  id: string;
  student: {
    name: string;
    department: string | null;
    rollNo: string | null;
  };
  registration: {
    event: {
      title: string;
      date: Date | string;
      club: {
        name: string;
      };
    };
  };
};

export function ODApprovalList({ requests }: { requests: ApprovalRequest[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/od-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success("Success", {
          description: `OD request ${status.toLowerCase()} successfully.`,
        });
        router.refresh();
      } else {
        const data = await res.json();
        toast.error("Error", {
          description: data.error || "Failed to update status",
        });
      }
    } catch {
      toast.error("Error", { description: "Network error" });
    } finally {
      setLoadingId(null);
    }
  };

  if (!requests.length) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No pending OD requests at the moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Queue</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  <div>{request.student.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.student.department || "Department not set"}
                  </div>
                </TableCell>
                <TableCell>{request.student.rollNo || "N/A"}</TableCell>
                <TableCell>
                  <div>{request.registration.event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.registration.event.club.name}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(request.registration.event.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      disabled={loadingId === request.id}
                      onClick={() => handleAction(request.id, "APPROVED")}
                    >
                      <Check className="size-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={loadingId === request.id}
                      onClick={() => handleAction(request.id, "REJECTED")}
                    >
                      <X className="size-4" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
