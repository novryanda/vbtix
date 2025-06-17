"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MagicCard, GradientText, Shimmer, MagicButton } from "~/components/ui/magic-card";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <MagicCard className="p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              <GradientText>Verifikasi Email</GradientText>
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLoading
                ? "Memverifikasi email Anda..."
                : "Verifikasi email selesai"}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {isLoading ? (
              <Shimmer>
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <Loader2 className="text-primary h-12 w-12 animate-spin" />
                  <p className="text-muted-foreground">
                    Sedang memverifikasi email Anda...
                  </p>
                </div>
              </Shimmer>
            ) : error ? (
              <MagicCard className="bg-destructive/5 border-destructive/20 p-6">
                <div className="flex items-start space-x-3">
                  <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-destructive font-medium">{error}</p>
                    <p className="text-destructive/80 text-sm mt-2">
                      Silakan coba lagi atau hubungi dukungan pelanggan.
                    </p>
                  </div>
                </div>
              </MagicCard>
            ) : success ? (
              <MagicCard className="bg-green-50 border-green-200 p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-green-800 font-medium">{success}</p>
                    <p className="text-green-700 text-sm mt-2">
                      Anda akan dialihkan ke halaman login dalam beberapa detik.
                    </p>
                  </div>
                </div>
              </MagicCard>
            ) : null}

            <MagicButton
              asChild
              variant={error ? "destructive" : "magic"}
              size="lg"
              disabled={isLoading}
              className="w-full"
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
            </MagicButton>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <GradientText className="font-semibold">VBTicket</GradientText>
            </p>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}
