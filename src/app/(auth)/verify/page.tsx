import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verifikasi Email - VBTix",
  description: "Verifikasi email Anda",
};

export default function VerifyPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifikasi Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Silakan cek email Anda untuk link verifikasi
          </p>
        </div>
        <div className="grid gap-6">
          <div className="rounded-lg border border-muted p-4 text-sm">
            <p>
              Kami telah mengirimkan email verifikasi ke alamat email Anda. Silakan klik link di email tersebut untuk memverifikasi akun Anda.
            </p>
            <p className="mt-2">
              Jika Anda tidak menerima email, silakan periksa folder spam atau klik tombol di bawah untuk mengirim ulang email verifikasi.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Kirim Ulang Email Verifikasi
          </button>
        </div>
        <div className="text-center text-sm">
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    </div>
  );
}