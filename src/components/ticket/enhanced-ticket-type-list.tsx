"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatCurrency, formatDate } from "~/lib/utils";

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
  maxPerPurchase: number;
  isVisible: boolean;
  allowTransfer: boolean;
  ticketFeatures?: string;
  perks?: string;
  logoUrl?: string;
  earlyBirdDeadline?: string;
  saleStartDate?: string;
  saleEndDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletionReason?: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  _count: {
    tickets: number;
    orderItems: number;
  };
}

interface EnhancedTicketTypeListProps {
  organizerId: string;
  onEdit?: (ticketType: TicketType) => void;
  onDelete?: (ticketTypeId: string, reason?: string) => void;
  onBulkOperation?: (ticketTypeIds: string[], operation: string, reason?: string) => void;
  onExport?: (ticketTypes: TicketType[]) => void;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
}

export function EnhancedTicketTypeList({
  organizerId,
  onEdit,
  onDelete,
  onBulkOperation,
  onExport,
  refreshTrigger,
}: EnhancedTicketTypeListProps) {
  
  // State management
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicketTypes, setSelectedTicketTypes] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; isBulk: boolean }>({ id: "", isBulk: false });
  const [deleteReason, setDeleteReason] = useState("");
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    eventId: "",
    status: "all",
    priceMin: "",
    priceMax: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    includeDeleted: false,
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch ticket types with filters
  const fetchTicketTypes = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        includeDeleted: filters.includeDeleted.toString(),
      });

      if (filters.search) queryParams.append("search", filters.search);
      if (filters.eventId) queryParams.append("eventId", filters.eventId);
      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.priceMin) queryParams.append("priceMin", filters.priceMin);
      if (filters.priceMax) queryParams.append("priceMax", filters.priceMax);

      const response = await fetch(`/api/organizer/${organizerId}/tickets/bulk?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTicketTypes(data.data.ticketTypes || []);
        setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      } else {
        throw new Error(data.error || "Failed to fetch ticket types");
      }
    } catch (error) {
      console.error("Error fetching ticket types:", error);
      toast.error("Failed to fetch ticket types");
    } finally {
      setLoading(false);
    }
  }, [organizerId, filters, pagination.page, pagination.limit]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchTicketTypes();
  }, [fetchTicketTypes]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchTicketTypes();
    }
  }, [refreshTrigger, fetchTicketTypes]);

  // Handle selection
  const handleSelectTicketType = (ticketTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTicketTypes(prev => [...prev, ticketTypeId]);
    } else {
      setSelectedTicketTypes(prev => prev.filter(id => id !== ticketTypeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTicketTypes(ticketTypes.map(tt => tt.id));
    } else {
      setSelectedTicketTypes([]);
    }
  };

  // Handle delete operations
  const handleDeleteClick = (ticketTypeId: string) => {
    setDeleteTarget({ id: ticketTypeId, isBulk: false });
    setDeleteReason("");
    setShowDeleteDialog(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedTicketTypes.length === 0) {
      toast.error("Please select at least one ticket type to delete");
      return;
    }
    setDeleteTarget({ id: "", isBulk: true });
    setDeleteReason("");
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.isBulk) {
        await onBulkOperation?.(selectedTicketTypes, "delete", deleteReason);
        setSelectedTicketTypes([]);
      } else {
        await onDelete?.(deleteTarget.id, deleteReason);
      }
      setShowDeleteDialog(false);
      setDeleteReason("");
      fetchTicketTypes();
      toast.success("Ticket type(s) deleted successfully");
    } catch (error) {
      console.error("Error deleting ticket type(s):", error);
      toast.error("Failed to delete ticket type(s)");
    }
  };

  // Handle bulk operations
  const handleBulkActivate = async () => {
    if (selectedTicketTypes.length === 0) return;
    try {
      await onBulkOperation?.(selectedTicketTypes, "activate");
      setSelectedTicketTypes([]);
      fetchTicketTypes();
      toast.success("Ticket types activated successfully");
    } catch (error) {
      toast.error("Failed to activate ticket types");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedTicketTypes.length === 0) return;
    try {
      await onBulkOperation?.(selectedTicketTypes, "deactivate");
      setSelectedTicketTypes([]);
      fetchTicketTypes();
      toast.success("Ticket types deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate ticket types");
    }
  };

  const handleExport = () => {
    const selectedData = selectedTicketTypes.length > 0 
      ? ticketTypes.filter(tt => selectedTicketTypes.includes(tt.id))
      : ticketTypes;
    onExport?.(selectedData);
  };

  // Get status badge
  const getStatusBadge = (ticketType: TicketType) => {
    if (ticketType.deletedAt) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    if (!ticketType.isVisible) {
      return <Badge variant="secondary">Hidden</Badge>;
    }
    if (ticketType.sold >= ticketType.quantity) {
      return <Badge variant="outline">Sold Out</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Ticket Types</h2>
          {selectedTicketTypes.length > 0 && (
            <Badge variant="secondary">
              {selectedTicketTypes.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedTicketTypes.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkActivate}
              >
                <Eye className="mr-2 h-4 w-4" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDeactivate}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search ticket types..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value: "asc" | "desc") => setFilters(prev => ({ ...prev, sortOrder: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDeleted"
                checked={filters.includeDeleted}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, includeDeleted: checked as boolean }))
                }
              />
              <Label htmlFor="includeDeleted">Include deleted items</Label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTicketTypes}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Filter className="mr-2 h-4 w-4" />
              )}
              Apply Filters
            </Button>
          </div>
        </div>
      </MagicCard>

      {/* Loading state */}
      {loading && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading ticket types...</p>
          </div>
        </MagicCard>
      )}

      {/* Empty state */}
      {!loading && ticketTypes.length === 0 && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No ticket types found</h3>
            <p className="mt-2 text-muted-foreground">
              No ticket types match your current filters.
            </p>
          </div>
        </MagicCard>
      )}

      {/* Ticket Types Grid */}
      {!loading && ticketTypes.length > 0 && (
        <>
          {/* Select all header */}
          <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
            <div className="p-4 flex items-center gap-3">
              <Checkbox
                checked={selectedTicketTypes.length === ticketTypes.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select all ({ticketTypes.length} items)
              </span>
            </div>
          </MagicCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ticketTypes.map((ticketType) => (
              <MagicCard
                key={ticketType.id}
                className={cn(
                  "border-0 bg-background/50 backdrop-blur-sm transition-all duration-200",
                  selectedTicketTypes.includes(ticketType.id) && "ring-2 ring-primary",
                  ticketType.deletedAt && "opacity-60"
                )}
              >
                <div className="p-6 space-y-4">
                  {/* Header with selection and actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedTicketTypes.includes(ticketType.id)}
                        onCheckedChange={(checked) =>
                          handleSelectTicketType(ticketType.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{ticketType.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {ticketType.event.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(ticketType)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(ticketType)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(ticketType.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Description */}
                  {ticketType.description && (
                    <p className="text-sm text-muted-foreground">
                      {ticketType.description}
                    </p>
                  )}

                  {/* Price and quantity info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold">
                        {formatCurrency(ticketType.price, ticketType.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sold / Total</p>
                      <p className="font-semibold">
                        {ticketType.sold} / {ticketType.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sales Progress</span>
                      <span>{Math.round((ticketType.sold / ticketType.quantity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((ticketType.sold / ticketType.quantity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Max per purchase</p>
                      <p>{ticketType.maxPerPurchase}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{formatDate(ticketType.createdAt)}</p>
                    </div>
                  </div>

                  {/* Deletion info */}
                  {ticketType.deletedAt && (
                    <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm font-medium text-destructive">
                        Deleted on {formatDate(ticketType.deletedAt)}
                      </p>
                      {ticketType.deletionReason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Reason: {ticketType.deletionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </MagicCard>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} results
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </MagicCard>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget.isBulk ? "Delete Selected Ticket Types" : "Delete Ticket Type"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget.isBulk
                ? `Are you sure you want to delete ${selectedTicketTypes.length} selected ticket types? This action cannot be undone.`
                : "Are you sure you want to delete this ticket type? This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="deleteReason">Reason for deletion (optional)</Label>
            <Textarea
              id="deleteReason"
              placeholder="Enter reason for deletion..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
