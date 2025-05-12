import { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, CreditCard, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export const metadata: Metadata = {
  title: "Detail Pesanan - VBTix",
  description: "Detail pesanan tiket konser Anda",
};

export default function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;

  // Data dummy untuk tampilan
  const eventData = {
    id: "event-123",
    title: "Konser Musik Jazz Festival 2023",
    date: "Sabtu, 15 Desember 2023 • 19:00 WIB",
    location: "Balai Sarbini, Jakarta Selatan",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    organizer: "Jazz Indonesia Foundation",
  };

  const ticketData = [
    {
      id: "ticket-1",
      name: "VIP",
      price: 750000,
      quantity: 2,
      subtotal: 1500000,
    },
    {
      id: "ticket-2",
      name: "Regular",
      price: 350000,
      quantity: 1,
      subtotal: 350000,
    },
  ];

  // Hitung total
  const subtotal = ticketData.reduce((sum, ticket) => sum + ticket.subtotal, 0);
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + serviceFee;

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-4 text-2xl font-bold">Detail Pesanan</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">ID Pesanan</p>
            <p className="font-medium">{orderId}</p>
          </div>
          <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
            Menunggu Pembayaran
          </div>
        </div>

        <div className="mb-6 border-t pt-4">
          <h2 className="mb-4 text-lg font-semibold">Detail Event</h2>
          <div className="space-y-4">
            {/* Detail event akan diimplementasikan di sini */}
            <p className="text-muted-foreground">
              Detail event akan ditampilkan di sini.
            </p>
          </div>
        </div>

        <div className="mb-6 border-t pt-4">
          <h2 className="mb-4 text-lg font-semibold">Detail Tiket</h2>
          <div className="space-y-4">
            {/* Detail tiket akan diimplementasikan di sini */}
            <p className="text-muted-foreground">
              Detail tiket akan ditampilkan di sini.
            </p>
          </div>
        </div>

        <div className="mb-6 border-t pt-4">
          <h2 className="mb-4 text-lg font-semibold">Ringkasan Pembayaran</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Layanan</span>
              <span>Rp 0</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>Rp 0</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href={`/dashboard/buyer/checkout/${orderId}/cancel`}
            className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Batalkan Pesanan
          </Link>
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
          >
            Lanjutkan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
