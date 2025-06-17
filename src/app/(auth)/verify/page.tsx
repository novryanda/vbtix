"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MagicCard, GradientText, Shimmer, MagicButton, MagicInput } from "~/components/ui/magic-card";

// Schema validasi form resend verification
const resendVerificationSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResendVerificationFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Terjadi kesalahan saat mengirim email verifikasi",
        );
      } else {
        setSuccess(
          result.message ||
            "Email verifikasi telah dikirim. Silakan cek inbox Anda.",
        );
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim email verifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <MagicCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              <GradientText>Kirim Ulang Verifikasi</GradientText>
            </h1>
            <p className="text-muted-foreground text-sm">
              Masukkan email Anda untuk mengirim ulang email verifikasi
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <MagicCard className="bg-destructive/5 border-destructive/20 p-4 mb-6">
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive text-sm">{error}</p>
              </div>
            </MagicCard>
          )}

          {success && (
            <MagicCard className="bg-green-50 border-green-200 p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            </MagicCard>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <MagicInput
                id="email"
                type="email"
                placeholder="nama@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...register("email")}
                className="w-full"
              />
              {errors.email && (
                <p className="text-destructive text-sm flex items-center space-x-1">
                  <XCircle className="h-4 w-4" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <MagicButton
              type="submit"
              disabled={isLoading}
              variant="magic"
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim Ulang Email Verifikasi
                </>
              )}
            </MagicButton>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Kembali ke halaman login
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Powered by{" "}
              <GradientText className="font-semibold">VBTicket</GradientText>
            </p>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}
