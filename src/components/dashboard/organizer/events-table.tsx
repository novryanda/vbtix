"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  MoreHorizontalIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
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
import { EventStatus } from "@prisma/client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/lib/utils";
import type { Event } from "~/lib/types";
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
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { deleteData } from "~/lib/api/client";

// Actions component to handle React hooks properly
function EventActions({ event }: { event: Event }) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Get the organizerId from the URL
  const getOrganizerId = (): string => {
    const pathParts = window.location.pathname.split("/");
    return pathParts[2] ?? ""; // Using nullish coalescing
  };

  // Handle delete event
  const handleDeleteEvent = async (): Promise<void> => {
    const organizerId = getOrganizerId();
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Call the delete API endpoint
      await deleteData(ORGANIZER_ENDPOINTS.DELETE_EVENT(organizerId, event.id));

      // Show success toast notification
      toast.success("Event deleted successfully", {
        description: "The event has been permanently deleted.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Refresh the page to show updated list
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error deleting event:", error);

      // Type-safe error handling
      let errorMessage = "Failed to delete event. Please try again.";
      if (error && typeof error === "object" && "info" in error) {
        const errorInfo = error.info as { error?: string };
        errorMessage = errorInfo.error ?? errorMessage;
      }

      // Show error toast notification
      toast.error("Error deleting event", {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });

      setDeleteError(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              const organizerId = getOrganizerId();
              router.push(`/organizer/${organizerId}/events/${event.id}`);
            }}
          >
            <EyeIcon className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const organizerId = getOrganizerId();
              router.push(`/organizer/${organizerId}/events/${event.id}/edit`);
            }}
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit Event
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
            onSelect={(e) => e.preventDefault()}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Event Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event &quot;{event.title}&quot; and remove all associated data
              including tickets, sales records, and attendee information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{deleteError}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteEvent();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Define the columns for the events table
const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Event Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("title")}</span>
        <span className="text-muted-foreground text-xs">
          {formatDate(row.original.startDate)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "venue",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center">
        <MapPinIcon className="text-muted-foreground mr-2 h-4 w-4" />
        <span>{row.getValue("venue")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as EventStatus;

      return (
        <Badge
          variant={
            status === EventStatus.PUBLISHED
              ? "success"
              : status === EventStatus.DRAFT
                ? "outline"
                : "destructive"
          }
        >
          {status === EventStatus.PUBLISHED
            ? "Published"
            : status === EventStatus.DRAFT
              ? "Draft"
              : "Cancelled"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;
      return <EventActions event={event} />;
    },
  },
];

interface EventsTableProps {
  data: Event[];
}

export function EventsTable({ data }: EventsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
