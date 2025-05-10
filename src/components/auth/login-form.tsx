"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";

import { cn } from "~/lib/utils";
import { useAuth } from "~/lib/hooks/use-auth";
import { useToast } from "~/lib/hooks/use-toast";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

// Validation schema for login form
const loginSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid",
  }),
  password: z.string().min(1, {
    message: "Password harus diisi",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { login, getErrorMessage } = useAuth();

  // Initialize form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      // Use the login function from useAuth hook
      const result = await login({
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (result?.error) {
        // Gunakan fungsi getErrorMessage dari useAuth hook
        const errorMessage = getErrorMessage(result.error);

        toast({
          title: "Gagal Login",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Tampilkan toast sukses
      toast({
        title: "Login Berhasil",
        description: "Anda berhasil login. Mengalihkan ke dashboard...",
        variant: "default",
      });

      // Redirect to dashboard or callback URL
      // The redirect will be handled by NextAuth based on the user's role
      router.refresh();

      // Use the dashboard route as the default redirect
      if (callbackUrl === "/dashboard") {
        // This will trigger the middleware to redirect based on role
        window.location.href = "/";
      } else {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login. Silakan coba lagi.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Tampilkan toast informasi
      toast({
        title: "Login dengan Google",
        description: "Mengalihkan ke halaman login Google...",
        variant: "default",
      });

      // Use redirect: true to let NextAuth handle the redirect
      // For Google login, we'll use the root path to trigger middleware redirect
      const redirectUrl = callbackUrl === "/dashboard" ? "/" : callbackUrl;
      await signIn("google", { callbackUrl: redirectUrl, redirect: true });
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login dengan Google. Silakan coba lagi.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda untuk login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nama@example.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Lupa password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sedang Login..." : "Login"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Login dengan Google
          </Button>

          <div className="mt-6 text-center text-sm">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
