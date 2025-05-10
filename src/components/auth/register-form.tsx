"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";

import { cn } from "~/lib/utils";
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

// Validation schema for registration form
const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus minimal 2 karakter",
  }),
  email: z.string().email({
    message: "Email tidak valid",
  }),
  password: z.string().min(8, {
    message: "Password harus minimal 8 karakter",
  }),
  confirmPassword: z.string().min(1, {
    message: "Konfirmasi password harus diisi",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Initialize form with react-hook-form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      // Call the register API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle registration errors
        toast({
          title: "Pendaftaran Gagal",
          description: result.error || "Terjadi kesalahan saat mendaftar",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Registration successful
      toast({
        title: "Pendaftaran Berhasil",
        description: "Silakan periksa email Anda untuk verifikasi akun",
        variant: "default",
      });

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  // Handle Google registration
  const handleGoogleRegistration = async () => {
    setIsLoading(true);
    try {
      // Tampilkan toast informasi
      toast({
        title: "Daftar dengan Google",
        description: "Mengalihkan ke halaman login Google...",
        variant: "default",
      });

      // Use Google sign in with redirect
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google registration error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftar dengan Google. Silakan coba lagi.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daftar Akun</CardTitle>
          <CardDescription>
            Isi formulir di bawah untuk membuat akun baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama Lengkap"
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
                    <FormLabel>Password</FormLabel>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
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
                {isLoading ? "Sedang Mendaftar..." : "Daftar"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Atau daftar dengan
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleRegistration}
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
            Daftar dengan Google
          </Button>

          <div className="mt-6 text-center text-sm">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
