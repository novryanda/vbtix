import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lupa Password - VBTix",
  description: "Reset password akun Anda",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Lupa Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>
        <div className="grid gap-6">
          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Kirim Link Reset
              </button>
            </div>
          </form>
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