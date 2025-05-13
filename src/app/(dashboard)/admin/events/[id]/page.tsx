"use client";
import { use } from "react";
import {
  useAdminEventDetail,
  useUpdateEventStatus,
} from "~/lib/api/hooks/admin";
import {
  EventDetailSkeleton,
  EventDetailErrorState,
} from "~/components/dashboard/admin/event-detail-loading";
import { AdminRoute } from "~/components/auth/admin-route";
import { EventDetail } from "~/components/dashboard/admin/detail-event";
import { AppSidebar } from "~/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "~/components/dashboard/admin/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Fetch event detail from API
  const {
    event,
    isLoading: isEventLoading,
    error: eventError,
    mutate: mutateEvent,
  } = useAdminEventDetail(id);

  // Get event statistics from the event data
  const statistics = event?.statistics || {
    totalTicketsSold: 0,
    totalCapacity: 0,
    totalRevenue: 0,
    soldPercentage: 0,
    totalTransactions: 0,
  };

  const isStatsLoading = isEventLoading;

  // Use the update event status hook
  const { updateStatus } = useUpdateEventStatus();

  const handleApproveEvent = async (feedback: string) => {
    await updateStatus(id, "PUBLISHED", feedback);
    // Refresh the event data
    mutateEvent();
  };

  const handleRejectEvent = async (feedback: string) => {
    await updateStatus(id, "REJECTED", feedback);
    // Refresh the event data
    mutateEvent();
  };

  const renderContent = () => {
    if (isEventLoading) {
      return <EventDetailSkeleton />;
    }

    if (eventError || !event) {
      return (
        <EventDetailErrorState message="Failed to load event details. Please try again later." />
      );
    }

    return (
      <EventDetail
        event={event}
        eventId={id}
        isStatsLoading={isStatsLoading}
        statistics={statistics}
        onApprove={handleApproveEvent}
        onReject={handleRejectEvent}
      />
    );
  };

  return (
    <AdminRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">{renderContent()}</div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminRoute>
  );
}
