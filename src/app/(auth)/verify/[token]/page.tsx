"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function VerifyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setToken(resolvedParams.token);
    });
  }, [params]);

  useEffect(() => {
    if (!token) return; // Wait for token to be resolved

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Terjadi kesalahan saat verifikasi email");
        } else {
          setSuccess(
            result.message || "Email berhasil diverifikasi. Silakan login.",
          );
          // Redirect ke halaman login setelah 3 detik
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } catch (err) {
        setError("Terjadi kesalahan saat verifikasi email");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifikasi Email
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLoading
              ? "Memverifikasi email Anda..."
              : "Verifikasi email selesai"}
          </p>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Sedang memverifikasi email Anda...
              </p>
            </div>
          ) : error ? (
            <div className="bg-destructive/15 text-destructive rounded-md p-4 text-sm">
              <p>{error}</p>
              <p className="mt-2">
                Silakan coba lagi atau hubungi dukungan pelanggan.
              </p>
            </div>
          ) : success ? (
            <div className="rounded-md bg-green-100 p-4 text-sm text-green-800">
              <p>{success}</p>
              <p className="mt-2">
                Anda akan dialihkan ke halaman login dalam beberapa detik.
              </p>
            </div>
          ) : null}

          <Button
            asChild
            variant={error ? "destructive" : "default"}
            disabled={isLoading}
          >
            <Link href="/login">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Lanjutkan ke Login"
              )}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
