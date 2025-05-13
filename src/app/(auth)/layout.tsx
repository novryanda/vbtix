import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Autentikasi - VBTix",
    template: "%s - VBTix",
  },
  description: "Autentikasi untuk aplikasi penjualan tiket konser VBTix",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Bagian kiri: Form autentikasi */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-white">
                V
              </div>
              <span className="text-2xl font-bold">VBTix</span>
            </Link>
          </div>

          {/* Form autentikasi */}
          {children}
        </div>
      </div>

      {/* Bagian kanan: Gambar dan informasi */}
      <div className="bg-primary/10 text-foreground hidden flex-col p-8 md:flex">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">VBTix</h1>
            <p className="text-xl">
              Platform penjualan tiket konser terpercaya
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="bg-primary/5 max-w-md rounded-lg p-8 shadow-lg">
              <h2 className="mb-4 text-2xl font-semibold">Fitur Utama</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Pembelian tiket yang aman dan mudah</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>E-ticket yang dapat diakses kapan saja</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Berbagai pilihan metode pembayaran</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Notifikasi event terbaru</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} VBTix. Semua hak dilindungi.
            </p>
            <div className="flex space-x-4">
              <Link href="/terms" className="text-sm hover:underline">
                Syarat dan Ketentuan
              </Link>
              <Link href="/privacy" className="text-sm hover:underline">
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
