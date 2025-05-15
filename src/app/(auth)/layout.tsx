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
    <div className="grid h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 md:grid-cols-2">
      {/* Bagian kiri: Form autentikasi */}
      <div className="flex items-center justify-center overflow-hidden px-4 py-6 sm:px-6 md:px-8">
        <div className="w-full max-w-md">
          {/* Form autentikasi */}
          {children}
        </div>
      </div>

      {/* Bagian kanan: Gambar dan informasi */}
      <div className="hidden bg-gradient-to-br from-blue-800 to-blue-900 text-white md:flex md:flex-col md:justify-between md:overflow-hidden md:p-8">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">VBTix</h1>
            <p className="text-base text-blue-100">
              Platform penjualan tiket konser terpercaya
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center py-4">
            <div className="w-full max-w-md rounded-xl bg-white/10 p-5 backdrop-blur-sm">
              <h2 className="mb-3 text-lg font-bold text-white">Fitur Utama</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-2.5 w-2.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-blue-50">
                    Pembelian tiket yang aman dan mudah
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-2.5 w-2.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-blue-50">
                    E-ticket yang dapat diakses kapan saja
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-2.5 w-2.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-blue-50">
                    Berbagai pilihan metode pembayaran
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-2.5 w-2.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-blue-50">
                    Notifikasi event terbaru
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <p className="text-xs text-blue-200">
              &copy; {new Date().getFullYear()} VBTix. Semua hak dilindungi.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/terms"
                className="text-xs text-blue-200 transition-colors hover:text-white"
              >
                Syarat dan Ketentuan
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-blue-200 transition-colors hover:text-white"
              >
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
