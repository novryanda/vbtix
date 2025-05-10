import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "~/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register - VBTix",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center">
            <span className="font-bold">VBTix</span>
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Sebagai penyelenggara event, VBTix membantu saya mengelola penjualan tiket dengan mudah dan transparan.&rdquo;
            </p>
            <footer className="text-sm">Budi Santoso - Event Organizer</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Buat akun baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Daftar untuk mulai membeli tiket atau menjadi penyelenggara
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Kebijakan Privasi
            </Link>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  );
}