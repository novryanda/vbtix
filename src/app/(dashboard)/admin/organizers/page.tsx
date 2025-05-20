"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Clock,
  FileText,
  Check,
} from "lucide-react";
import { useAdminOrganizers, useVerifyOrganizer } from "~/lib/api/hooks/admin";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function OrganizersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState<boolean | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch organizers data
  const { organizers, meta, error, isLoading, mutate } = useAdminOrganizers({
    page,
    limit,
    search,
    verified,
  });

  // Filter organizers with pending verification
  const pendingVerifications =
    organizers?.filter(
      (organizer) =>
        organizer.verification && organizer.verification.status === "PENDING",
    ) || [];

  // Verify organizer hook
  const { verifyOrganizer } = useVerifyOrganizer();

  // Handle verification status change
  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await verifyOrganizer(id, verified);
      mutate(); // Refresh data after verification
    } catch (error) {
      console.error("Error verifying organizer:", error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  // Handle view details
  const handleViewDetails = (id: string) => {
    router.push(`/admin/organizers/${id}`);
  };

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the organizers data. Please try
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
    <div className="px-4 lg:px-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Organizers</h1>
          <p className="text-muted-foreground">
            Manage organizers on the platform
          </p>
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Organizers</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending Verification
                {pendingVerifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  >
                    {pendingVerifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            {/* Filters and search */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <form
                onSubmit={handleSearch}
                className="flex w-full max-w-sm items-center space-x-2"
              >
                <Input
                  type="search"
                  placeholder="Search organizers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9"
                />
                <Button type="submit" size="sm" className="h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex items-center space-x-2">
                <Select
                  value={verified === undefined ? "all" : verified.toString()}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setVerified(undefined);
                    } else {
                      setVerified(value === "true");
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Verification Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={limit.toString()}
                  onValueChange={(value) => setLimit(parseInt(value))}
                >
                  <SelectTrigger className="h-9 w-[80px]">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Organizers table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : organizers && organizers.length > 0 ? (
                    organizers.map((organizer) => (
                      <TableRow key={organizer.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{organizer.orgName}</span>
                            <span className="text-muted-foreground text-xs">
                              {organizer.legalName || "No legal name"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{organizer.user.name || "No name"}</span>
                            <span className="text-muted-foreground text-xs">
                              {organizer.user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {organizer.verified ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500 text-amber-500"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Unverified
                            </Badge>
                          )}
                          {organizer.verification &&
                            organizer.verification.status === "PENDING" && (
                              <Badge
                                variant="outline"
                                className="ml-2 border-amber-500 text-amber-500"
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                Verification Pending
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell>{organizer.eventsCount || 0}</TableCell>
                        <TableCell>{organizer.formattedCreatedAt}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(organizer.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {organizer.verification &&
                              organizer.verification.status === "PENDING" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewDetails(organizer.id)
                                  }
                                  className="text-blue-500"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Review Verification
                                </DropdownMenuItem>
                              ) : organizer.verified ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleVerify(organizer.id, false)
                                  }
                                  className="text-amber-500"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Revoke Verification
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleVerify(organizer.id, true)
                                  }
                                  className="text-green-500"
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Verify Organizer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No organizers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, meta.total)}
                  </span>{" "}
                  of <span className="font-medium">{meta.total}</span>{" "}
                  organizers
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        size="default"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) handlePageChange(page - 1);
                        }}
                        className={
                          page === 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: meta.totalPages }).map((_, i) => {
                      // Show first page, last page, and pages around current page
                      if (
                        i === 0 ||
                        i === meta.totalPages - 1 ||
                        (i >= page - 2 && i <= page)
                      ) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              size="icon"
                              isActive={page === i + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      // Show ellipsis for skipped pages
                      if (i === 1 && page > 3) {
                        return (
                          <PaginationItem key="ellipsis-start">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      if (
                        i === meta.totalPages - 2 &&
                        page < meta.totalPages - 2
                      ) {
                        return (
                          <PaginationItem key="ellipsis-end">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        size="default"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < meta.totalPages)
                            handlePageChange(page + 1);
                        }}
                        className={
                          page === meta.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Verification Requests</CardTitle>
                    <CardDescription>
                      Review and approve organizer verification documents
                    </CardDescription>
                  </div>
                  {pendingVerifications.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
                    >
                      <Clock className="mr-2 h-4 w-4 text-amber-500" />
                      {pendingVerifications.length} Pending Request
                      {pendingVerifications.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4">
                    <div className="flex items-center justify-center">
                      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    </div>
                  </div>
                ) : pendingVerifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Check className="text-primary h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      No pending verification requests
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      All organizer verification requests have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organizer</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingVerifications.map((organizer) => (
                          <TableRow
                            key={organizer.id}
                            className="bg-amber-50/30"
                          >
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {organizer.orgName}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {organizer.user.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {organizer.verification?.submittedAt
                                ? new Date(
                                    organizer.verification.submittedAt,
                                  ).toLocaleDateString()
                                : "-"}
                              <div className="text-muted-foreground mt-1 text-xs">
                                {organizer.verification?.submittedAt && (
                                  <>
                                    {new Date(
                                      organizer.verification.submittedAt,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-2">
                                <div className="flex space-x-2">
                                  {organizer.verification?.ktpImageUrl && (
                                    <Badge
                                      variant="outline"
                                      className="border-blue-500 text-blue-500"
                                    >
                                      KTP
                                    </Badge>
                                  )}
                                  {organizer.verification?.npwpImageUrl && (
                                    <Badge
                                      variant="outline"
                                      className="border-green-500 text-green-500"
                                    >
                                      NPWP
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {organizer.verification?.ktpNumber && (
                                    <span>
                                      KTP: {organizer.verification.ktpNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full"
                                  onClick={() =>
                                    router.push(
                                      `/admin/organizers/${organizer.id}?tab=verification`,
                                    )
                                  }
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Review
                                </Button>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-green-500 text-green-500 hover:bg-green-50"
                                    onClick={() => {
                                      router.push(
                                        `/admin/organizers/${organizer.id}?tab=verification&action=approve`,
                                      );
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                      router.push(
                                        `/admin/organizers/${organizer.id}?tab=verification&action=reject`,
                                      );
                                    }}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
