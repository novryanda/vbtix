"use client";

import { useState, useMemo } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { WristbandCard } from "./wristband-card";
import { useOrganizerWristbands } from "~/lib/api/hooks/qr-code";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface WristbandListProps {
  organizerId: string;
  events: Array<{
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
  }>;
  onViewScans?: (wristbandId: string) => void;
  onViewQR?: (wristband: any) => void;
}

export function WristbandList({
  organizerId,
  events,
  onViewScans,
  onViewQR,
}: WristbandListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Combine filters
  const filters = useMemo(() => ({
    eventId: selectedEventId || undefined,
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
  }), [selectedEventId, currentPage, searchTerm]);

  const { wristbands, pagination, isLoading, error, refresh } = useOrganizerWristbands(
    organizerId,
    filters
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleEventFilter = (eventId: string) => {
    setSelectedEventId(eventId === "all" ? "" : eventId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Wristbands</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </div>
      </MagicCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wristbands..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Event Filter */}
            <div className="w-full sm:w-64">
              <Select value={selectedEventId || "all"} onValueChange={handleEventFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          {pagination && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {wristbands.length} of {pagination.total} wristband{pagination.total !== 1 ? "s" : ""}
              {selectedEventId && (
                <span className="ml-2">
                  • Filtered by: {events.find(e => e.id === selectedEventId)?.title}
                </span>
              )}
            </div>
          )}
        </div>
      </MagicCard>

      {/* Loading State */}
      {isLoading && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading wristbands...</p>
          </div>
        </MagicCard>
      )}

      {/* Empty State */}
      {!isLoading && wristbands.length === 0 && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-8 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wristbands Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedEventId
                ? "Try adjusting your search or filter criteria."
                : "Create your first wristband to get started."}
            </p>
          </div>
        </MagicCard>
      )}

      {/* Wristband Grid */}
      {!isLoading && wristbands.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wristbands.map((wristband) => (
              <WristbandCard
                key={wristband.id}
                wristband={wristband}
                organizerId={organizerId}
                onQRGenerated={refresh}
                onViewScans={onViewScans}
                onViewQR={onViewQR}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </MagicCard>
          )}
        </>
      )}
    </div>
  );
}
