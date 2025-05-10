import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verifikasi Email - VBTix",
  description: "Verifikasi email Anda",
};

export default function VerifyTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifikasi Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Memverifikasi email Anda...
          </p>
        </div>
        <div className="grid gap-6">
          <div className="rounded-lg border border-muted p-4 text-sm">
            <p>
              Kami sedang memverifikasi email Anda. Silakan tunggu sebentar...
            </p>
            <p className="mt-2">
              Jika Anda tidak diarahkan secara otomatis, silakan klik tombol di bawah.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Lanjutkan ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}