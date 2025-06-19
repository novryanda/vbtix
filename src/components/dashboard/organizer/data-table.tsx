"use client";

import * as React from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ClockIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PlusIcon,
  MapPinIcon,
  TicketIcon,
  EyeIcon,
  EditIcon,
  XCircleIcon,
  ImageIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { MagicCard } from "~/components/ui/magic-card";
import type { Event } from "~/lib/types";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

// Helper function to format date in Indonesian locale
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to get status badge variant and label
const getStatusConfig = (status: string) => {
  const statusMap = {
    'DRAFT': { variant: 'secondary' as const, label: 'Draft', color: 'text-gray-600' },
    'PENDING_REVIEW': { variant: 'outline' as const, label: 'Menunggu Review', color: 'text-yellow-600' },
    'PUBLISHED': { variant: 'default' as const, label: 'Aktif', color: 'text-green-600' },
    'REJECTED': { variant: 'destructive' as const, label: 'Ditolak', color: 'text-red-600' },
    'COMPLETED': { variant: 'secondary' as const, label: 'Selesai', color: 'text-blue-600' },
    'CANCELLED': { variant: 'destructive' as const, label: 'Dibatalkan', color: 'text-red-600' },
  };
  return statusMap[status as keyof typeof statusMap] || { variant: 'outline' as const, label: status, color: 'text-gray-600' };
};

// Define the columns for the events table  
const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Event",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="flex items-start gap-3 min-w-[250px]">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {event.posterUrl ? (
              <img 
                src={event.posterUrl} 
                alt={event.title}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
              {event.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              {event.category && (
                <span className="px-2 py-0.5 bg-muted rounded text-xs">
                  {event.category}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "venue",
    header: "Lokasi",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="flex items-start gap-2 min-w-[150px]">
          <MapPinIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium">{event.venue}</div>
            {event.city && (
              <div className="text-xs text-muted-foreground">
                {event.city}, {event.province}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Tanggal Mulai",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{formatDate(event.startDate)}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(event.startDate).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      );
    },
  },  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = getStatusConfig(status);
      return (
        <Badge variant={config.variant} className="whitespace-nowrap">
          {config.label}
        </Badge>
      );
    },
  },  {
    id: "tickets",
    header: "Tiket",
    cell: ({ row }) => {
      const event = row.original;
      
      // Check if event has ticket types data (might be included in API response)
      const eventWithTickets = event as any;
      let totalCapacity = 0;
      let ticketsSold = 0;
      
      // If ticketTypes are included in the response
      if (eventWithTickets.ticketTypes && Array.isArray(eventWithTickets.ticketTypes)) {
        totalCapacity = eventWithTickets.ticketTypes.reduce((sum: number, ticket: any) => 
          sum + (ticket.quantity || 0), 0
        );
        ticketsSold = eventWithTickets.ticketTypes.reduce((sum: number, ticket: any) => 
          sum + (ticket.sold || 0), 0
        );
      } 
      // If _count is included (Prisma count)
      else if (eventWithTickets._count?.tickets) {
        ticketsSold = eventWithTickets._count.tickets;
        totalCapacity = event.maxAttendees || 0;
      }
      // If transactions are included
      else if (eventWithTickets.transactions && Array.isArray(eventWithTickets.transactions)) {
        ticketsSold = eventWithTickets.transactions.filter((t: any) => t.status === 'SUCCESS').length;
        totalCapacity = event.maxAttendees || 0;
      }
      // Fallback to maxAttendees only
      else {
        totalCapacity = event.maxAttendees || 0;
        ticketsSold = 0;
      }
      
      const percentage = totalCapacity > 0 ? Math.round((ticketsSold / totalCapacity) * 100) : 0;
      
      return (
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            <TicketIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {ticketsSold.toLocaleString()} / {totalCapacity.toLocaleString()}
            </span>
          </div>
          {totalCapacity > 0 ? (
            <>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {percentage}% terjual
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              Kapasitas belum ditentukan
            </span>
          )}
        </div>
      );
    },
  },{
    id: "actions",
    header: "Aksi",
    cell: ({ row, table }) => {
      const event = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Buka menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Aksi Event</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const dataTable = table.options.meta as any;
                dataTable?.handleViewEvent?.(event);
              }}
            >
              <EyeIcon className="w-4 h-4" />
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const dataTable = table.options.meta as any;
                dataTable?.handleEditEvent?.(event);
              }}
            >
              <EditIcon className="w-4 h-4" />
              Edit Event
            </DropdownMenuItem>            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const dataTable = table.options.meta as any;
                dataTable?.handleManageTickets?.(event);
              }}
            >
              <TicketIcon className="w-4 h-4" />
              Kelola Tiket
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-destructive flex items-center gap-2 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <XCircleIcon className="w-4 h-4" />
                  Batalkan Event
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Batalkan Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin membatalkan event "{event.title}"? 
                    Tindakan ini tidak dapat dibatalkan dan semua peserta akan diberitahu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      const dataTable = table.options.meta as any;
                      dataTable?.handleCancelEvent?.(event);
                    }}
                  >
                    Ya, Batalkan Event
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTable({ data = [] }: { data: Event[] }) {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Action handlers
  const handleViewEvent = (event: Event) => {
    router.push(`/organizer/${organizerId}/events/${event.id}`);
  };

  const handleEditEvent = (event: Event) => {
    router.push(`/organizer/${organizerId}/events/${event.id}/edit`);
  };
  const handleManageTickets = (event: Event) => {
    router.push(`/organizer/${organizerId}/events/${event.id}/tickets`);
  };

  const handleCancelEvent = async (event: Event) => {
    try {
      // Show loading toast
      toast.loading("Membatalkan event...", { id: "cancel-event" });
      
      // API call to cancel event
      const response = await fetch(`/api/organizer/${organizerId}/events/${event.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED'
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal membatalkan event');
      }

      // Success notification
      toast.success("Event berhasil dibatalkan", { 
        id: "cancel-event",
        description: `Event "${event.title}" telah dibatalkan` 
      });

      // Refresh the page or refetch data
      window.location.reload();
    } catch (error) {
      toast.error("Gagal membatalkan event", { 
        id: "cancel-event",
        description: "Terjadi kesalahan saat membatalkan event. Silakan coba lagi." 
      });
    }
  };  const handleCreateEvent = () => {
    router.push(`/organizer/${organizerId}/events/create`);
  };
  // Filter data based on status and global search
  const filteredData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    let filtered = data;
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }
    
    // Filter by global search
    if (globalFilter.trim()) {
      const searchTerm = globalFilter.toLowerCase();
      filtered = filtered.filter((event) => 
        event.title?.toLowerCase().includes(searchTerm) ||
        event.venue?.toLowerCase().includes(searchTerm) ||
        event.city?.toLowerCase().includes(searchTerm) ||
        event.province?.toLowerCase().includes(searchTerm) ||
        event.category?.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [data, statusFilter, globalFilter]);
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,    meta: {
      handleViewEvent,
      handleEditEvent,
      handleManageTickets,
      handleCancelEvent,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Get counts for different statuses
  const statusCounts = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    
    return data.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm p-0">
      <div className="p-6">
        {/* Header with Tabs and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full lg:w-auto">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="all" className="relative">
                Semua
                {data.length > 0 && (
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                    {data.length}
                  </span>
                )}
              </TabsTrigger>              <TabsTrigger value="PUBLISHED" className="relative">
                Aktif
                {(statusCounts.PUBLISHED || 0) > 0 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    {statusCounts.PUBLISHED}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="DRAFT" className="relative">
                Draft
                {(statusCounts.DRAFT || 0) > 0 && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                    {statusCounts.DRAFT}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="PENDING_REVIEW" className="relative">
                Review
                {(statusCounts.PENDING_REVIEW || 0) > 0 && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                    {statusCounts.PENDING_REVIEW}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="relative">
                Selesai
                {(statusCounts.COMPLETED || 0) > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {statusCounts.COMPLETED}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="CANCELLED" className="relative">
                Batal
                {(statusCounts.CANCELLED || 0) > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                    {statusCounts.CANCELLED}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari event..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-64 pl-10 pr-10"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => setGlobalFilter("")}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            {/* Column Visibility Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Kolom
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tampilkan Kolom</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>            {/* Create Event Button */}
            <Button 
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={handleCreateEvent}
            >
              <PlusIcon className="h-4 w-4" />
              Buat Event
            </Button>
          </div>
        </div>

        {/* Quick Stats for filtered results */}
        {(globalFilter || statusFilter !== "all") && (
          <div className="flex items-center gap-4 py-3 px-1 text-sm text-muted-foreground border-b border-border/30">
            <span>
              Menampilkan {filteredData.length} dari {data.length} event
            </span>
            {globalFilter && (
              <span>
                • Pencarian: "{globalFilter}"
              </span>
            )}
            {statusFilter !== "all" && (
              <span>
                • Status: {getStatusConfig(statusFilter).label}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs ml-auto"
              onClick={() => {
                setGlobalFilter("");
                setStatusFilter("all");
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}

        {/* Enhanced Table */}
        <div className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-border/50 bg-muted/30">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-semibold text-foreground">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`
                      border-b border-border/30 hover:bg-muted/50 transition-colors duration-200
                      ${index % 2 === 0 ? 'bg-background/50' : 'bg-background/30'}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 opacity-50" />
                      <div>
                        <p className="text-lg font-medium">Belum ada event</p>
                        <p className="text-sm">
                          {statusFilter === "all" 
                            ? "Mulai dengan membuat event pertama Anda" 
                            : `Tidak ada event dengan status "${getStatusConfig(statusFilter).label}"`
                          }
                        </p>
                      </div>                      {statusFilter === "all" && (
                        <Button 
                          className="mt-2 gap-2"
                          onClick={handleCreateEvent}
                        >
                          <PlusIcon className="h-4 w-4" />
                          Buat Event Sekarang
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        {table.getRowModel().rows?.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border/30">
            <div className="text-sm text-muted-foreground">
              Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} dari {table.getFilteredRowModel().rows.length} event
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Baris per halaman</span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium">
                Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MagicCard>
  );
}
