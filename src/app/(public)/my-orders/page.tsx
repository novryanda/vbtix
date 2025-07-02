"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Receipt,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Search,
  User,
  Mail,
  ArrowLeft,
  Download,
  X,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { MagicInput } from "~/components/ui/magic-card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { MagicCard } from "~/components/ui/magic-card";
import { GuestSessionInfo } from "~/components/ui/guest-session-info";
import { formatPrice } from "~/lib/utils";
import { toast } from "sonner";
import { PaymentStatus } from "@prisma/client";

interface Order {
  id: string;
  invoiceNumber: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
  event: {
    title: string;
    venue: string;
    city: string;
    startDate: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    ticketType: {
      name: string;
    };
  }>;
  hasQRCodes?: boolean;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("all");
  
  // Guest lookup state
  const [showGuestLookup, setShowGuestLookup] = useState(false);
  const [lookupData, setLookupData] = useState({
    orderId: "",
    email: "",
  });
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  // Fetch orders for authenticated users
  const fetchAuthenticatedOrders = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/public/orders");
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle guest order lookup
  const handleGuestLookup = async () => {
    if (!lookupData.orderId || !lookupData.email) {
      toast.error("Please enter both Order ID and Email");
      return;
    }

    setIsLookingUp(true);
    setError(null);

    try {
      const response = await fetch("/api/public/orders/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lookupData),
      });

      const result = await response.json();

      if (result.success) {
        // Add the found order to the orders list
        setOrders([result.data]);
        setShowGuestLookup(false);
        toast.success("Order found successfully!");
      } else {
        setError(result.error || "Order not found");
      }
    } catch (error) {
      console.error("Error looking up order:", error);
      setError("Failed to lookup order. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAuthenticatedOrders();
    }
  }, [isAuthenticated]);

  // Filter orders based on current tab
  const filteredOrders = orders.filter((order) => {
    if (currentTab === "all") return true;
    if (currentTab === "pending") return order.status === PaymentStatus.PENDING;
    if (currentTab === "completed") return order.status === PaymentStatus.SUCCESS;
    if (currentTab === "cancelled") return order.status === PaymentStatus.FAILED;
    return true;
  });

  // Get status color
  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return "bg-green-100 text-green-800";
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return "Completed";
      case PaymentStatus.PENDING:
        return "Pending";
      case PaymentStatus.FAILED:
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">
              {isAuthenticated 
                ? "View and manage your ticket orders" 
                : "Lookup your orders using Order ID and Email"}
            </p>
          </div>
        </div>

        {/* Guest Session Info for non-authenticated users */}
        {!isAuthenticated && (
          <GuestSessionInfo className="mb-6" showOrderLookupInfo={false} />
        )}

        {/* Guest Lookup Section */}
        {!isAuthenticated && (
          <MagicCard className="mb-8">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Your Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest-order-id">Order ID</Label>
                    <MagicInput
                      id="guest-order-id"
                      placeholder="Enter your order ID"
                      value={lookupData.orderId}
                      onChange={(e) =>
                        setLookupData((prev) => ({ ...prev, orderId: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest-email">Email Address</Label>
                    <MagicInput
                      id="guest-email"
                      type="email"
                      placeholder="Enter your email"
                      value={lookupData.email}
                      onChange={(e) =>
                        setLookupData((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleGuestLookup}
                    disabled={isLookingUp}
                    className="flex-1"
                  >
                    {isLookingUp ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Orders
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/orders/lookup")}
                  >
                    Advanced Lookup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MagicCard>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Orders Section */}
        {(isAuthenticated || orders.length > 0) && (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredOrders.map((order) => (
                    <MagicCard key={order.id}>
                      <Card className="border-0 shadow-none h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{order.event.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {order.invoiceNumber}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            {new Date(order.event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            {order.event.venue}, {order.event.city}
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.ticketType.name} x{item.quantity}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span className="text-blue-600">
                              {formatPrice(order.amount)}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2 border-t p-4">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/checkout/${order.id}`}>
                              <Receipt size={16} className="mr-2" />
                              Details
                            </Link>
                          </Button>
                          {order.hasQRCodes && (
                            <Button size="sm" className="flex-1" asChild>
                              <Link href={`/checkout/${order.id}`}>
                                <Download size={16} className="mr-2" />
                                Tickets
                              </Link>
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </MagicCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isAuthenticated 
                      ? "You haven't made any orders yet." 
                      : "No orders found with the provided information."}
                  </p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Call to Action for non-authenticated users with no orders */}
        {!isAuthenticated && orders.length === 0 && !error && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Your Orders
            </h3>
            <p className="text-gray-600 mb-6">
              Enter your order details above to view your ticket orders and download your tickets.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/orders/lookup">Advanced Order Lookup</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
