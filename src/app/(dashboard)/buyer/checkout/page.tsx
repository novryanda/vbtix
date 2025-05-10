import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - VBTix",
  description: "Checkout tiket konser Anda",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Detail Pemesanan</h2>
            <div className="space-y-4">
              {/* Form checkout akan diimplementasikan di sini */}
              <p className="text-muted-foreground">
                Form checkout akan ditampilkan di sini.
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-4">
              {/* Ringkasan pesanan akan diimplementasikan di sini */}
              <p className="text-muted-foreground">
                Ringkasan pesanan akan ditampilkan di sini.
              </p>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Rp 0</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
