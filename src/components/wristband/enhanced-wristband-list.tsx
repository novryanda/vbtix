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
  QrCode,
  BarChart3,
  Shield,
  ShieldCheck,
  ShieldX,
  Calendar,
  Clock,
  Scan,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatDate } from "~/lib/utils";

interface Wristband {
  id: string;
  name: string;
  description?: string;
  qrCode: string;
  qrCodeImageUrl?: string;
  qrCodeData?: string;
  qrCodeGeneratedAt?: string;
  // Barcode fields
  barcodeType?: string;
  barcodeValue?: string;
  barcodeImageUrl?: string;
  barcodeData?: string;
  barcodeGeneratedAt?: string;
  codeType?: string;
  status: "PENDING" | "GENERATED" | "ACTIVE" | "EXPIRED" | "REVOKED";
  isReusable: boolean;
  maxScans?: number;
  scanCount: number;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletionReason?: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  totalScans: number;
}

interface EnhancedWristbandListProps {
  organizerId: string;
  onEdit?: (wristband: Wristband) => void;
  onDelete?: (wristbandId: string, reason?: string) => void;
  onBulkOperation?: (wristbandIds: string[], operation: string, reason?: string) => void;
  onExport?: (wristbands: Wristband[]) => void;
  onViewScans?: (wristband: Wristband) => void;
  onViewQR?: (wristband: Wristband) => void;
  onGenerateBarcode?: (wristband: Wristband) => void;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
}

export function EnhancedWristbandList({
  organizerId,
  onEdit,
  onDelete,
  onBulkOperation,
  onExport,
  onViewScans,
  onViewQR,
  onGenerateBarcode,
  refreshTrigger,
}: EnhancedWristbandListProps) {
  
  // State management
  const [wristbands, setWristbands] = useState<Wristband[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [selectedWristbands, setSelectedWristbands] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; isBulk: boolean }>({ id: "", isBulk: false });
  const [deleteReason, setDeleteReason] = useState("");
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    eventId: "",
    status: "all",
    codeType: "all",
    isReusable: "all",
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

  // Fetch wristbands with filters
  const fetchWristbands = useCallback(async () => {
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
      if (filters.codeType !== "all") queryParams.append("codeType", filters.codeType);
      if (filters.isReusable !== "all") queryParams.append("isReusable", filters.isReusable);

      const response = await fetch(`/api/organizer/${organizerId}/wristbands/bulk?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setWristbands(data.data.wristbands || []);
        setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      } else {
        throw new Error(data.error || "Failed to fetch wristbands");
      }
    } catch (error) {
      console.error("Error fetching wristbands:", error);
      toast.error("Failed to fetch wristbands");
    } finally {
      setLoading(false);
    }
  }, [organizerId, filters, pagination.page, pagination.limit]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchWristbands();
  }, [fetchWristbands]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchWristbands();
    }
  }, [refreshTrigger, fetchWristbands]);

  // Handle selection
  const handleSelectWristband = (wristbandId: string, checked: boolean) => {
    if (checked) {
      setSelectedWristbands(prev => [...prev, wristbandId]);
    } else {
      setSelectedWristbands(prev => prev.filter(id => id !== wristbandId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWristbands(wristbands.map(w => w.id));
    } else {
      setSelectedWristbands([]);
    }
  };

  // Handle delete operations
  const handleDeleteClick = (wristbandId: string) => {
    setDeleteTarget({ id: wristbandId, isBulk: false });
    setDeleteReason("");
    setShowDeleteDialog(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedWristbands.length === 0) {
      toast.error("Please select at least one wristband to delete");
      return;
    }
    setDeleteTarget({ id: "", isBulk: true });
    setDeleteReason("");
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.isBulk) {
        await onBulkOperation?.(selectedWristbands, "delete", deleteReason);
        setSelectedWristbands([]);
      } else {
        await onDelete?.(deleteTarget.id, deleteReason);
      }
      setShowDeleteDialog(false);
      setDeleteReason("");
      fetchWristbands();
      toast.success("Wristband(s) deleted successfully");
    } catch (error) {
      console.error("Error deleting wristband(s):", error);
      toast.error("Failed to delete wristband(s)");
    }
  };

  // Handle QR generation
  const handleGenerateQR = async (wristband: Wristband) => {
    setGeneratingQR(wristband.id);
    try {
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/${wristband.id}/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "QR generation failed");
      }

      toast.success("QR code generated successfully!");
      fetchWristbands(); // Refresh the list
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate QR code");
    } finally {
      setGeneratingQR(null);
    }
  };

  // Handle bulk operations
  const handleBulkActivate = async () => {
    if (selectedWristbands.length === 0) return;
    try {
      await onBulkOperation?.(selectedWristbands, "activate");
      setSelectedWristbands([]);
      fetchWristbands();
      toast.success("Wristbands activated successfully");
    } catch (error) {
      toast.error("Failed to activate wristbands");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedWristbands.length === 0) return;
    try {
      await onBulkOperation?.(selectedWristbands, "deactivate");
      setSelectedWristbands([]);
      fetchWristbands();
      toast.success("Wristbands deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate wristbands");
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedWristbands.length === 0) return;
    try {
      await onBulkOperation?.(selectedWristbands, "revoke");
      setSelectedWristbands([]);
      fetchWristbands();
      toast.success("Wristbands revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke wristbands");
    }
  };

  const handleExport = () => {
    const selectedData = selectedWristbands.length > 0 
      ? wristbands.filter(w => selectedWristbands.includes(w.id))
      : wristbands;
    onExport?.(selectedData);
  };

  // Get status badge
  const getStatusBadge = (wristband: Wristband) => {
    switch (wristband.status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500"><ShieldCheck className="mr-1 h-3 w-3" />Active</Badge>;
      case "PENDING":
        return <Badge variant="secondary"><Shield className="mr-1 h-3 w-3" />Pending</Badge>;
      case "GENERATED":
        return <Badge variant="outline"><QrCode className="mr-1 h-3 w-3" />Generated</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive"><Clock className="mr-1 h-3 w-3" />Expired</Badge>;
      case "REVOKED":
        return <Badge variant="destructive"><ShieldX className="mr-1 h-3 w-3" />Revoked</Badge>;
      default:
        return <Badge variant="secondary">{wristband.status}</Badge>;
    }
  };

  // Get code type badge
  const getCodeTypeBadge = (codeType?: string) => {
    if (codeType === "BARCODE") {
      return <Badge variant="outline"><BarChart3 className="mr-1 h-3 w-3" />Barcode</Badge>;
    }
    return <Badge variant="outline"><QrCode className="mr-1 h-3 w-3" />QR Code</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Wristbands</h2>
          {selectedWristbands.length > 0 && (
            <Badge variant="secondary">
              {selectedWristbands.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedWristbands.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkActivate}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDeactivate}
              >
                <Shield className="mr-2 h-4 w-4" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRevoke}
              >
                <ShieldX className="mr-2 h-4 w-4" />
                Revoke
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
                  placeholder="Search wristbands..."
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="GENERATED">Generated</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="REVOKED">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeType">Code Type</Label>
              <Select
                value={filters.codeType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, codeType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="QR">QR Code</SelectItem>
                  <SelectItem value="BARCODE">Barcode</SelectItem>
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
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="scanCount">Scan Count</SelectItem>
                  <SelectItem value="validFrom">Valid From</SelectItem>
                  <SelectItem value="validUntil">Valid Until</SelectItem>
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
              onClick={fetchWristbands}
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
            <p className="mt-2 text-muted-foreground">Loading wristbands...</p>
          </div>
        </MagicCard>
      )}

      {/* Empty state */}
      {!loading && wristbands.length === 0 && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No wristbands found</h3>
            <p className="mt-2 text-muted-foreground">
              No wristbands match your current filters.
            </p>
          </div>
        </MagicCard>
      )}

      {/* Wristbands Grid */}
      {!loading && wristbands.length > 0 && (
        <>
          {/* Select all header */}
          <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
            <div className="p-4 flex items-center gap-3">
              <Checkbox
                checked={selectedWristbands.length === wristbands.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select all ({wristbands.length} items)
              </span>
            </div>
          </MagicCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {wristbands.map((wristband) => (
              <MagicCard
                key={wristband.id}
                className={cn(
                  "border-0 bg-background/50 backdrop-blur-sm transition-all duration-200",
                  selectedWristbands.includes(wristband.id) && "ring-2 ring-primary",
                  wristband.deletedAt && "opacity-60"
                )}
              >
                <div className="p-6 space-y-4">
                  {/* Header with selection and actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedWristbands.includes(wristband.id)}
                        onCheckedChange={(checked) =>
                          handleSelectWristband(wristband.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{wristband.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {wristband.event.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(wristband)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(wristband)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewScans?.(wristband)}>
                            <Scan className="mr-2 h-4 w-4" />
                            View Scans
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewQR?.(wristband)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            View Code
                          </DropdownMenuItem>
                          {wristband.codeType === "BARCODE" && !wristband.barcodeImageUrl && (
                            <DropdownMenuItem onClick={() => onGenerateBarcode?.(wristband)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Generate Barcode
                            </DropdownMenuItem>
                          )}
                          {wristband.codeType !== "BARCODE" && !wristband.qrCodeImageUrl && (
                            <DropdownMenuItem
                              onClick={() => handleGenerateQR(wristband)}
                              disabled={generatingQR === wristband.id}
                            >
                              {generatingQR === wristband.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <QrCode className="mr-2 h-4 w-4" />
                              )}
                              {generatingQR === wristband.id ? "Generating..." : "Generate QR Code"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(wristband.id)}
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
                  {wristband.description && (
                    <p className="text-sm text-muted-foreground">
                      {wristband.description}
                    </p>
                  )}

                  {/* Code type and reusable info */}
                  <div className="flex items-center gap-2">
                    {getCodeTypeBadge(wristband.codeType)}
                    {wristband.isReusable && (
                      <Badge variant="outline">Reusable</Badge>
                    )}
                  </div>

                  {/* Code Display */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {(wristband.codeType === "BARCODE" ? wristband.barcodeImageUrl : wristband.qrCodeImageUrl) ? (
                        <img
                          src={wristband.codeType === "BARCODE" ? wristband.barcodeImageUrl! : wristband.qrCodeImageUrl!}
                          alt={`Wristband ${wristband.codeType === "BARCODE" ? "Barcode" : "QR Code"}`}
                          className="w-full h-full object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <QrCode className={`h-6 w-6 text-gray-400 ${(wristband.codeType === "BARCODE" ? wristband.barcodeImageUrl : wristband.qrCodeImageUrl) ? 'hidden' : ''}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {wristband.codeType === "BARCODE" ? "Barcode" : "QR Code"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(wristband.codeType === "BARCODE" ? wristband.barcodeImageUrl : wristband.qrCodeImageUrl)
                          ? "Generated"
                          : "Not generated"}
                      </p>
                      {wristband.codeType === "BARCODE" && wristband.barcodeValue && (
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {wristband.barcodeValue}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Scan info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Scans</p>
                      <p className="font-semibold">
                        {wristband.scanCount}
                        {wristband.maxScans && ` / ${wristband.maxScans}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Scans</p>
                      <p className="font-semibold">{wristband.totalScans}</p>
                    </div>
                  </div>

                  {/* Validity period */}
                  {(wristband.validFrom || wristband.validUntil) && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Validity Period</p>
                      <div className="text-sm text-muted-foreground">
                        {wristband.validFrom && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            From: {formatDate(wristband.validFrom)}
                          </div>
                        )}
                        {wristband.validUntil && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Until: {formatDate(wristband.validUntil)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional info */}
                  <div className="text-sm">
                    <p className="text-muted-foreground">Created: {formatDate(wristband.createdAt)}</p>
                  </div>

                  {/* Deletion info */}
                  {wristband.deletedAt && (
                    <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm font-medium text-destructive">
                        Deleted on {formatDate(wristband.deletedAt)}
                      </p>
                      {wristband.deletionReason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Reason: {wristband.deletionReason}
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
              {deleteTarget.isBulk ? "Delete Selected Wristbands" : "Delete Wristband"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget.isBulk
                ? `Are you sure you want to delete ${selectedWristbands.length} selected wristbands? This action cannot be undone.`
                : "Are you sure you want to delete this wristband? This action cannot be undone."
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
