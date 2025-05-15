"use client";

import { ChartAreaInteractive } from "~/components/dashboard/organizer/chart-area-interactive";
import { DataTable } from "~/components/dashboard/organizer/data-table";
import { SectionCards } from "~/components/dashboard/organizer/section-card";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { useOrganizerEvents } from "~/lib/api/hooks/organizer";

// Import the useParams hook from next/navigation
import { useParams } from "next/navigation";

export default function Page() {
  // Use the useParams hook to get the id parameter
  const params = useParams();
  const organizerId = params.id as string;

  // Fetch events data for the table
  const { data, isLoading } = useOrganizerEvents(organizerId);

  return (
    <OrganizerRoute>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : (
          <DataTable data={(data?.data as any) || []} />
        )}
      </div>
    </OrganizerRoute>
  );
}
