"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/lib/departments";

export function FacultyActions() {
  const [department, setDepartment] = useState("ALL");

  const handleExport = () => {
    const today = new Date().toISOString().split("T")[0];
    let url = `/api/od-requests/export?date=${today}`;

    if (department !== "ALL") {
      url += `&departments=${encodeURIComponent(department)}`;
    }

    window.location.href = url;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Records</CardTitle>
        <CardDescription>
          Generate an Excel report of approved students for today, filtered by department if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <label className="text-sm font-medium text-foreground">Department filter</label>
          <Select
            value={department}
            onValueChange={(value) => setDepartment(value || "ALL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {DEPARTMENTS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExport} className="justify-center">
          <Download className="size-4" />
          Export Today
        </Button>
      </CardContent>
    </Card>
  );
}
