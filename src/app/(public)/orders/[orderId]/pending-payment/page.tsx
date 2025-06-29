"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock, CheckCircle, ArrowLeft, RefreshCw, Download, FileImage, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { formatPrice } from "~/lib/utils";
import { toast } from "sonner";
import {
  useOrderStatus,
  getStatusMessage,
  getStatusColor,
  isOrderCompleted,
  isOrderPending
} from "~/lib/services/realtime-updates.service";

interface OrderData {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  paymentProofUrl?: string;
  paymentProofPublicId?: string;
  details?: any;
  event: {
    id: string;
    title: string;
    posterUrl?: string;
    formattedStartDate?: string;
    venue?: string;
    address?: string;
    city?: string;
    province?: string;
    organizer?: {
      id: string;
      orgName: string;
    };
  };
  items: Array<{
    id: string;
    ticketType: {
      id: string;
      name: string;
      description?: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export default function PendingPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string>("");

  // Unwrap params
  React.useEffect(() => {
    params.then((p) => setOrderId(p.orderId));
  }, [params]);

  // Real-time order status updates
  const {
    status: realtimeStatus,
    isLoading: statusLoading,
    error: statusError,
    lastUpdated,
    refresh: refreshStatus,
  } = useOrderStatus({
    orderId: orderId || "",
    enabled: !!orderId && !!orderData,
    pollingInterval: 3000, // Poll every 3 seconds for pending payments
  });

  // Fetch order data
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderData = async () => {
      try {
        // Get session ID from localStorage for guest access
        const sessionId = localStorage.getItem("vbticket_session_id");

        // Build URL with session ID for guest access
        const url = sessionId
          ? `/api/public/orders/${orderId}?sessionId=${sessionId}`
          : `/api/public/orders/${orderId}`;

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to load order");
        }

        setOrderData(result.data);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Update order status when real-time status changes
  useEffect(() => {
    if (realtimeStatus && orderData && realtimeStatus !== orderData.status) {
      setOrderData((prev) => ({
        ...prev!,
        status: realtimeStatus,
      }));

      // Show notification for status changes
      if (isOrderCompleted(realtimeStatus)) {
        toast.success("Pembayaran berhasil dikonfirmasi!", {
          description: "Tiket Anda sudah siap. Silakan cek email Anda.",
          action: {
            label: "Lihat Tiket",
            onClick: () => router.push(`/checkout/success?orderId=${orderId}`),
          },
        });
      }
    }
  }, [realtimeStatus, orderData, orderId, router]);

  // Calculate totals from order data
  const calculateTotals = () => {
    if (!orderData) return { subtotal: 0, total: 0 };

    const subtotal = orderData.items.reduce(
      (sum: number, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const total = subtotal;

    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  // Use real-time status if available, otherwise use initial order status
  const currentStatus = realtimeStatus || orderData?.status || "PENDING";
  const isPaymentSuccessful = isOrderCompleted(currentStatus);
  const isPending = isOrderPending(currentStatus);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Status Pesanan</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground mt-2">
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !orderData) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Status Pesanan</h1>
        </div>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error || "Failed to load order details"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Status Pesanan</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Status */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-center">
                <div className={`rounded-full p-4 ${isPaymentSuccessful ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {isPaymentSuccessful ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-yellow-600" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <CardTitle className={`text-xl ${isPaymentSuccessful ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isPaymentSuccessful ? "Pembayaran Dikonfirmasi!" : "Menunggu Konfirmasi Pembayaran"}
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  {isPaymentSuccessful
                    ? "Pembayaran Anda telah dikonfirmasi. Tiket sudah siap!"
                    : getStatusMessage(currentStatus)
                  }
                </p>
                {isPaymentSuccessful && (
                  <div className="mt-4">
                    <Button onClick={() => router.push(`/checkout/success?orderId=${orderId}`)}>
                      <Download className="mr-2 h-4 w-4" />
                      Lihat Tiket Anda
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isPaymentSuccessful && (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pesanan berhasil dibuat!</strong>
                    <br />
                    Halaman ini akan otomatis terupdate ketika pembayaran dikonfirmasi.
                    Anda juga akan menerima email konfirmasi dan tiket.
                  </AlertDescription>
                </Alert>
              )}

              {isPending && (
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshStatus}
                    disabled={statusLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
                    Cek Status
                  </Button>
                  {lastUpdated && (
                    <span className="text-xs text-gray-500">
                      Terakhir dicek: {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Pesanan:</span>
                  <span className="font-medium">{orderData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(currentStatus)}`}>
                      {currentStatus}
                    </span>
                    {statusLoading && (
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Pembayaran:
                  </span>
                  <span className="font-medium text-blue-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img
                  src={
                    orderData.event.posterUrl ||
                    "https://placehold.co/80x80?text=Event"
                  }
                  alt={orderData.event.title}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{orderData.event.title}</h4>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{orderData.event.formattedStartDate || "TBA"}</span>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[
                        orderData.event.venue,
                        orderData.event.city,
                        orderData.event.province,
                      ]
                        .filter(Boolean)
                        .join(", ") || "TBA"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Ticket Details */}
              <div>
                <h3 className="mb-3 font-semibold">Detail Tiket</h3>
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.ticketType.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {formatPrice(Number(item.price))} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof Display for QRIS payments */}
              {orderData.paymentMethod === "QRIS_BY_WONDERS" && orderData.paymentProofUrl && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 font-semibold">Bukti Pembayaran Wondr by BNI</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20 border-2 border-blue-200 rounded-lg overflow-hidden bg-gray-50">
                          <Image
                            src={orderData.paymentProofUrl}
                            alt="Bukti Pembayaran Wondr by BNI"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  <FileImage className="h-3 w-3 mr-1" />
                                  Lihat Detail
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detail Bukti Pembayaran Wondr by BNI</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium text-muted-foreground">Nomor Invoice:</p>
                                      <p className="font-semibold">#{orderData.invoiceNumber}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-muted-foreground">Total Pembayaran:</p>
                                      <p className="font-semibold text-blue-600">{formatPrice(orderData.amount)}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-muted-foreground">Status:</p>
                                      <p className="font-semibold">
                                        {orderData.status === "PENDING" ? "Menunggu Konfirmasi" :
                                         orderData.status === "SUCCESS" ? "Dikonfirmasi" :
                                         orderData.status}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-muted-foreground">Waktu Upload:</p>
                                      <p className="font-semibold">
                                        {orderData.details?.paymentProofUploadedAt ?
                                          new Date(orderData.details.paymentProofUploadedAt).toLocaleString('id-ID') :
                                          'Tidak diketahui'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="border-t pt-4">
                                    <p className="font-medium text-sm mb-2">Bukti Pembayaran:</p>
                                    <div className="relative w-full max-w-md mx-auto">
                                      <Image
                                        src={orderData.paymentProofUrl}
                                        alt="Bukti Pembayaran Wondr by BNI"
                                        width={400}
                                        height={400}
                                        className="w-full h-auto border rounded-lg shadow-sm"
                                      />
                                    </div>
                                    <div className="flex justify-center mt-3">
                                      <Button
                                        variant="outline"
                                        onClick={() => window.open(orderData.paymentProofUrl, '_blank')}
                                        className="text-sm"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Buka di Tab Baru
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(orderData.paymentProofUrl, '_blank')}
                              className="text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Buka Gambar
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <p>
                              Upload: {orderData.details?.paymentProofUploadedAt ?
                                new Date(orderData.details.paymentProofUploadedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) :
                                'Tidak diketahui'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Alert>
                        <FileImage className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Bukti pembayaran telah diterima!</strong>
                          <br />
                          Pesanan Anda sedang menunggu konfirmasi dari organizer. Halaman ini akan otomatis terupdate ketika pembayaran dikonfirmasi.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Kembali ke Beranda
            </Button>
            <Button onClick={() => router.push("/orders")} className="w-full">
              Lihat Semua Pesanan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
