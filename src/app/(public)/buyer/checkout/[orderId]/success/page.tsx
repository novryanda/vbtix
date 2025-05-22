import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pembayaran Berhasil - VBTix",
  description: "Pembayaran tiket konser Anda berhasil",
};

export default function PaymentSuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
        <p className="text-muted-foreground mb-6">
          Terima kasih atas pembelian Anda. E-ticket akan dikirimkan ke email Anda.
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-muted-foreground">ID Pesanan</p>
          <p className="font-medium">{orderId}</p>
        </div>
        <div className="space-y-4">
          <Link
            href="/dashboard/buyer/tickets"
            className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Lihat Tiket Saya
          </Link>
          <Link
            href="/dashboard/buyer"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
