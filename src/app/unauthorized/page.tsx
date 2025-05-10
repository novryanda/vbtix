import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Akses Ditolak
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login terlebih dahulu.
        </p>
        <div className="mt-10 flex items-center justify-center gap-6">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
