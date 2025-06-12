"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Download,
  BarChart3,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  pendingCount: number;
  totalEvents: number;
  totalOrganizers: number;
  isLoading?: boolean;
}

export function QuickActionsCard({
  pendingCount,
  totalEvents,
  totalOrganizers,
  isLoading = false,
}: QuickActionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 animate-pulse" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Aksi cepat untuk manajemen admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics Overview */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-amber-600" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="text-lg font-bold text-amber-600">{pendingCount}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-muted-foreground">Events</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{totalEvents}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">Organizers</span>
            </div>
            <div className="text-lg font-bold text-green-600">{totalOrganizers}</div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/admin/approval?status=PENDING_REVIEW">
              <Filter className="mr-2 h-4 w-4" />
              Filter Pending Events
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/admin/events?status=PUBLISHED">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              View Published Events
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/admin/organizers">
              <Users className="mr-2 h-4 w-4" />
              Manage Organizers
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/admin/dashboard">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
        </div>

        {/* Priority Alert */}
        {pendingCount > 5 && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800 text-sm">
                High Priority: {pendingCount} events pending
              </span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Consider reviewing pending events to maintain good organizer experience
            </p>
          </div>
        )}

        {pendingCount === 0 && (
          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800 text-sm">
                All caught up!
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              No pending approvals at this time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
