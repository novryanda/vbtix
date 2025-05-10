import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl">VBTix</Link>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20">
          <div className="container flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Beli Tiket Konser dengan Mudah
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Platform tiket konser terpercaya dengan berbagai event menarik. Dapatkan tiket favoritmu sekarang!
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/events">Lihat Event</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register?role=organizer">Jadi Penyelenggara</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} VBTix. Hak cipta dilindungi.
          </p>
          <nav className="flex gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:underline">
              Tentang Kami
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Kebijakan Privasi
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}