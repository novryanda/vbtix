import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pembatalan Pesanan - VBTix",
  description: "Pembatalan pesanan tiket konser",
};

export default function OrderCancelPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Batalkan Pesanan</h1>
        <p className="text-muted-foreground mb-6">
          Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-muted-foreground">ID Pesanan</p>
          <p className="font-medium">{orderId}</p>
        </div>
        <form className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-1">
              Alasan Pembatalan
            </label>
            <select
              id="reason"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Pilih alasan pembatalan</option>
              <option value="change_mind">Berubah pikiran</option>
              <option value="payment_issue">Masalah pembayaran</option>
              <option value="duplicate">Pesanan duplikat</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Berikan detail tambahan tentang alasan pembatalan Anda"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <Link
              href={`/dashboard/buyer/checkout/${orderId}`}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Kembali
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Batalkan Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
