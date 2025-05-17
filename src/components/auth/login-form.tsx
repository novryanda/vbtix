"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/lib/hooks/use-auth";

// Schema validasi form login
const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(data.email, data.password, callbackUrl);

      if (!result.success) {
        setErrorMessage(result.error || "Login gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginWithGoogle(callbackUrl);
    } catch (err) {
      setErrorMessage(
        "Terjadi kesalahan saat login dengan Google. Silakan coba lagi.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="overflow-hidden border-none bg-white shadow-lg">
        <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-800 to-blue-700 pt-5 pb-4">
          <CardTitle className="text-center text-xl font-bold text-white">
            Login
          </CardTitle>
          <CardDescription className="text-center text-sm text-blue-100">
            Masukkan email Anda untuk login ke akun Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pt-5">
          {errorMessage && (
            <div className="mb-3 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <div className="flex">
                <svg
                  className="mr-1.5 h-3.5 w-3.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="h-8 w-full rounded-md border-gray-200 bg-white px-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="h-8 w-full rounded-md border-gray-200 bg-white px-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="h-8 w-full bg-blue-800 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-sm focus:ring-1 focus:ring-blue-200"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                )}
                Login
              </Button>

              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200"></span>
                </div>
                <span className="relative bg-white px-2 text-xs font-medium text-gray-500">
                  Atau login dengan
                </span>
              </div>

              <Button
                variant="outline"
                className="h-8 w-full border border-gray-200 bg-white text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
              >
                {isLoading ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <svg
                    className="mr-1.5 h-3.5 w-3.5"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                )}
                Google
              </Button>
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 transition-colors hover:text-blue-800"
                >
                  Daftar
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}