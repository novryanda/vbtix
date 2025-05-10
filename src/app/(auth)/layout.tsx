import { Metadata } from "next";
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Bagian kiri: Form autentikasi */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">V</div>
              <span className="text-2xl font-bold">VBTix</span>
            </Link>
          </div>

          {/* Form autentikasi */}
          {children}
        </div>
      </div>

      {/* Bagian kanan: Gambar dan informasi */}
      <div className="hidden md:flex flex-col bg-primary/10 p-8 text-foreground">
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">VBTix</h1>
            <p className="text-xl">Platform penjualan tiket konser terpercaya</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md p-8 bg-primary/5 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Fitur Utama</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Pembelian tiket yang aman dan mudah</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>E-ticket yang dapat diakses kapan saja</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Berbagai pilihan metode pembayaran</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
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