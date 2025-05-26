"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Loader2, Search, Eye } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    title: string;
    date: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError("Gagal memuat daftar pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Menunggu</Badge>;
      case "confirmed":
        return <Badge className="bg-green-600">Dikonfirmasi</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case "completed":
        return <Badge className="bg-blue-600">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.event.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manajemen Pesanan</h1>
        <Badge variant="secondary">{orders.length} total pesanan</Badge>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive mb-6 rounded-md p-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nomor pesanan, nama, email, atau event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-input bg-background ring-offset-background focus:ring-ring rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Tidak ada pesanan</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tidak ada pesanan yang sesuai dengan filter."
                  : "Belum ada pesanan yang masuk."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        #{order.orderNumber}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-muted-foreground grid gap-1 text-sm md:grid-cols-2">
                      <p>
                        <span className="font-medium">Pelanggan:</span>{" "}
                        {order.user.name} ({order.user.email})
                      </p>
                      <p>
                        <span className="font-medium">Event:</span>{" "}
                        {order.event.title}
                      </p>
                      <p>
                        <span className="font-medium">Tanggal Event:</span>{" "}
                        {new Date(order.event.date).toLocaleDateString("id-ID")}
                      </p>
                      <p>
                        <span className="font-medium">Tanggal Pesanan:</span>{" "}
                        {new Date(order.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Detail
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </p>
              <p className="text-muted-foreground text-sm">Menunggu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "confirmed").length}
              </p>
              <p className="text-muted-foreground text-sm">Dikonfirmasi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter((o) => o.status === "completed").length}
              </p>
              <p className="text-muted-foreground text-sm">Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {orders.filter((o) => o.status === "cancelled").length}
              </p>
              <p className="text-muted-foreground text-sm">Dibatalkan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
