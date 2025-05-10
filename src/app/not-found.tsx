import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold tracking-tighter">404</h1>
        <h2 className="text-4xl font-bold tracking-tighter">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-lg">
          Maaf, halaman yang Anda cari tidak dapat ditemukan.
        </p>
      </div>
      <Button asChild className="mt-4">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}