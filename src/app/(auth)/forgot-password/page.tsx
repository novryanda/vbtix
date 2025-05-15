"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

// Schema validasi form lupa password
const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Terjadi kesalahan saat mengirim email reset password",
        );
      } else {
        setSuccess(
          result.message ||
            "Instruksi reset password telah dikirim ke email Anda",
        );
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim email reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Lupa Password
          </h1>
          <p className="text-muted-foreground text-sm">
            Masukkan email Anda untuk menerima instruksi reset password
          </p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <div className="grid gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Instruksi Reset Password
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center text-sm">
          <Link
            href="/login"
            className="hover:text-primary underline underline-offset-4"
          >
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    </div>
  );
}
