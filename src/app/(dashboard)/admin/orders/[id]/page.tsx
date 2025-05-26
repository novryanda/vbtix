"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface OrderDetail {
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
    location: string;
  };
  tickets: Array<{
    id: string;
    type: string;
    quantity: number;
    price: number;
  }>;
  payment: {
    method: string;
    status: string;
    paidAt?: string;
  };
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setOrderId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order detail");
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError("Gagal memuat detail pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Refresh order data
      await fetchOrderDetail();
    } catch (err) {
      setError("Gagal mengupdate status pesanan");
    } finally {
      setIsProcessing(false);
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/15 text-destructive rounded-md p-4">
          {error || "Pesanan tidak ditemukan"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          Detail Pesanan #{order.orderNumber}
        </h1>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="font-medium">Nomor Pesanan:</span>
                  <p>{order.orderNumber}</p>
                </div>
                <div>
                  <span className="font-medium">Tanggal Pesanan:</span>
                  <p>{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <span className="font-medium">Total Pembayaran:</span>
                  <p className="text-lg font-semibold">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="font-medium">Nama:</span>
                  <p>{order.user.name}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p>{order.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{order.event.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(order.event.date).toLocaleDateString("id-ID")} •{" "}
                  {order.event.location}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Tiket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <div>
                      <p className="font-medium">{ticket.type}</p>
                      <p className="text-muted-foreground text-sm">
                        {ticket.quantity} tiket × Rp{" "}
                        {ticket.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="font-semibold">
                      Rp{" "}
                      {(ticket.quantity * ticket.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === "pending" && (
                <>
                  <Button
                    onClick={() => handleUpdateStatus("confirmed")}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Konfirmasi Pesanan
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Batalkan Pesanan
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Metode:</span>
                  <p>{order.payment.method}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p>{order.payment.status}</p>
                </div>
                {order.payment.paidAt && (
                  <div>
                    <span className="font-medium">Dibayar pada:</span>
                    <p>
                      {new Date(order.payment.paidAt).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
