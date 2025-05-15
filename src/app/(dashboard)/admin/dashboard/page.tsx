"use client";

import { useState, useEffect } from "react";
import { ChartAreaInteractive } from "~/components/dashboard/admin/chart-area-interactive";
import { SectionCards } from "~/components/dashboard/admin/section-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { PlusIcon, AlertCircle } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export default function DashboardPage() {
  const [hasError, setHasError] = useState(false);

  // Error handling for uncaught errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Error boundary fallback UI
  if (hasError) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the dashboard data. Please try
              refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Section Cards */}
      <div className="px-4 lg:px-6">
        <SectionCards />
      </div>

      {/* Chart Area */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>

      {/* Table Section */}
      <div className="px-4 lg:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Tabs defaultValue="outline" className="w-auto">
            <TabsList>
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="past-performance">
                Past Performance{" "}
                <span className="bg-muted-foreground/30 ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                  3
                </span>
              </TabsTrigger>
              <TabsTrigger value="key-personnel">
                Key Personnel{" "}
                <span className="bg-muted-foreground/30 ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                  2
                </span>
              </TabsTrigger>
              <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Header</TableHead>
                <TableHead>Section Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead>Reviewer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Table of Contents</TableCell>
                <TableCell>Cover Page</TableCell>
                <TableCell>Done</TableCell>
                <TableCell className="text-right">10</TableCell>
                <TableCell className="text-right">20</TableCell>
                <TableCell>Eddie Lake</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Executive Summary</TableCell>
                <TableCell>Narrative</TableCell>
                <TableCell>In Progress</TableCell>
                <TableCell className="text-right">15</TableCell>
                <TableCell className="text-right">25</TableCell>
                <TableCell>Jamik Tashpulatov</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Technical Approach
                </TableCell>
                <TableCell>Design</TableCell>
                <TableCell>Not Started</TableCell>
                <TableCell className="text-right">20</TableCell>
                <TableCell className="text-right">30</TableCell>
                <TableCell>Emily Whalen</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
