"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PaymentStatus } from "@prisma/client";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { OrganizerPageWrapper } from "~/components/dashboard/organizer/organizer-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "~/lib/utils";

interface Order {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    ticketType: {
      id: string;
      name: string;
    };
  }>;
  buyerInfo?: {
    fullName: string;
    email: string;
    whatsapp: string;
  };
}

export default function OrganizerOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const organizerId = params.id as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/organizer/${organizerId}/orders?${params}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setTotalPages(result.meta?.totalPages || 1);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: PaymentStatus) => {
    try {
      setProcessingOrderId(orderId);
      
      const response = await fetch(`/api/organizer/${organizerId}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          status === "SUCCESS" 
            ? "Payment approved! Tickets sent to customer." 
            : "Payment rejected."
        );
        fetchOrders(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu Pembayaran</Badge>;
      case "PENDING_PAYMENT":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menunggu Konfirmasi</Badge>;
      case "SUCCESS":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Lunas</Badge>;
      case "FAILED":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Gagal</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Kadaluarsa</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  return (
    <OrganizerRoute>
      <OrganizerPageWrapper>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kelola Pesanan</h1>
              <p className="text-muted-foreground">
                Kelola pesanan tiket dan konfirmasi pembayaran manual
              </p>
            </div>
            <Button
              onClick={() => router.push(`/organizer/${organizerId}/orders/create`)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Pesanan
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan invoice, nama, atau email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as PaymentStatus | "ALL")}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Status</SelectItem>
                    <SelectItem value="PENDING">Menunggu Pembayaran</SelectItem>
                    <SelectItem value="PENDING_PAYMENT">Menunggu Konfirmasi</SelectItem>
                    <SelectItem value="SUCCESS">Lunas</SelectItem>
                    <SelectItem value="FAILED">Gagal</SelectItem>
                    <SelectItem value="EXPIRED">Kadaluarsa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada pesanan</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Belum ada pesanan yang ditemukan dengan filter saat ini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Pembeli</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Tiket</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.buyerInfo?.fullName || order.user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.buyerInfo?.email || order.user.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{order.event.title}</p>
                          </TableCell>
                          <TableCell>
                            {order.orderItems.map((item, index) => (
                              <div key={item.id} className="text-sm">
                                {item.ticketType.name} ({item.quantity}x)
                                {index < order.orderItems.length - 1 && <br />}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(order.amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {order.status === "PENDING_PAYMENT" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, "SUCCESS")}
                                    disabled={processingOrderId === order.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {processingOrderId === order.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateOrderStatus(order.id, "FAILED")}
                                    disabled={processingOrderId === order.id}
                                  >
                                    {processingOrderId === order.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </OrganizerPageWrapper>
    </OrganizerRoute>
  );
}
