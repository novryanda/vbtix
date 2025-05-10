import { Metadata } from "next";
import Link from "next/link";

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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Detail Pesanan</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">ID Pesanan</p>
            <p className="font-medium">{orderId}</p>
          </div>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            Menunggu Pembayaran
          </div>
        </div>

        <div className="border-t pt-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Detail Event</h2>
          <div className="space-y-4">
            {/* Detail event akan diimplementasikan di sini */}
            <p className="text-muted-foreground">
              Detail event akan ditampilkan di sini.
            </p>
          </div>
        </div>

        <div className="border-t pt-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Detail Tiket</h2>
          <div className="space-y-4">
            {/* Detail tiket akan diimplementasikan di sini */}
            <p className="text-muted-foreground">
              Detail tiket akan ditampilkan di sini.
            </p>
          </div>
        </div>

        <div className="border-t pt-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Ringkasan Pembayaran</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Layanan</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t mt-2">
              <span>Total</span>
              <span>Rp 0</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href={`/dashboard/buyer/checkout/${orderId}/cancel`}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batalkan Pesanan
          </Link>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Lanjutkan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
