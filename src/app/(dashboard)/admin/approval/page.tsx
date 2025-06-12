"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AdminEventApprovalList } from "~/components/dashboard/admin/AdminEventApprovalList";
import { AdminRoute } from "~/components/auth/admin-route";
import {
  useAdminEventApproval,
  useEventApproval,
  useApprovalStatistics,
} from "~/lib/api/hooks/admin-approval";
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  RotateCcw,
  AlertCircle,
  Calendar,
  Users,
  Timer,
} from "lucide-react";

export default function AdminApprovalDashboard() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizerFilter, setOrganizerFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 12;

  // Fetch data with current filters
  const {
    events,
    meta,
    statistics,
    error,
    isLoading,
    mutate,
  } = useAdminEventApproval({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    organizerId: organizerFilter || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    includeStats: true,
  });

  const { approveEvent, rejectEvent } = useEventApproval();

  const handleApprove = async (eventId: string, notes?: string) => {
    try {
      await approveEvent(eventId, notes);
      
      toast.success("Event Disetujui", {
        description: "Event telah berhasil dipublikasikan.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Refresh data
      mutate();
    } catch (error: any) {
      console.error("Error approving event:", error);
      toast.error("Gagal Menyetujui Event", {
        description: error.message || "Terjadi kesalahan saat menyetujui event.",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const handleReject = async (eventId: string, notes?: string) => {
    try {
      if (!notes?.trim()) {
        throw new Error("Alasan penolakan wajib diisi");
      }

      await rejectEvent(eventId, notes);
      
      toast.success("Event Ditolak", {
        description: "Event telah ditolak dan organizer akan diberitahu.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Refresh data
      mutate();
    } catch (error: any) {
      console.error("Error rejecting event:", error);
      toast.error("Gagal Menolak Event", {
        description: error.message || "Terjadi kesalahan saat menolak event.",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const handleViewDetails = (eventId: string) => {
    router.push(`/admin/events/${eventId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    mutate();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setOrganizerFilter("");
    setStatusFilter("all");
    setCurrentPage(1);
    mutate();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AdminRoute>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Event Approval</h1>
            <p className="text-muted-foreground">
              Kelola persetujuan event yang diajukan oleh organizer
            </p>
          </div>
          
          {/* Quick Stats */}
          {statistics && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {statistics.totalPending} pending
              </Badge>
              <Badge variant="outline" className="text-sm">
                {statistics.approvalRate}% approval rate
              </Badge>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalPending}</div>
                <p className="text-xs text-muted-foreground">
                  Menunggu persetujuan admin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Event Disetujui</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.totalApproved}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total event yang dipublikasikan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Event Ditolak</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {statistics.totalRejected}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total event yang ditolak
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Review Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.averageApprovalTimeHours}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Rata-rata waktu review
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari event berdasarkan judul, deskripsi, atau organizer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                      <SelectItem value="PUBLISHED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Cari
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Gagal memuat data event: {error.message || "Terjadi kesalahan"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {statusFilter === "PENDING_REVIEW" ? "Events Pending Approval" :
               statusFilter === "PUBLISHED" ? "Approved Events" :
               statusFilter === "REJECTED" ? "Rejected Events" :
               "All Events"}
            </h2>
            {meta.total > 0 && (
              <p className="text-sm text-muted-foreground">
                Menampilkan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, meta.total)} dari {meta.total} event
              </p>
            )}
          </div>

          <AdminEventApprovalList
            events={events}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                {meta.totalPages > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(meta.totalPages)}
                    >
                      {meta.totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}
