"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { LoadingScreen } from "~/components/ui/loading-screen";

// Schema validasi untuk melengkapi data organizer
const completeRegistrationSchema = z.object({
  orgName: z.string().min(2, "Nama organisasi minimal 2 karakter"),
  legalName: z.string().optional(),
  phone: z.string().optional(),
  npwp: z.string().optional(),
});

type CompleteRegistrationFormValues = z.infer<
  typeof completeRegistrationSchema
>;

export default function CompleteRegistrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteRegistrationFormValues>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: {
      orgName: "",
      legalName: "",
      phone: "",
      npwp: "",
    },
  });

  // Redirect if not authenticated or already an organizer
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/register");
      return;
    }

    // If user is already an organizer, redirect to organizer dashboard
    if (session.user.role === "ORGANIZER") {
      router.push("/organizer");
      return;
    }

    // If user is not a buyer (shouldn't happen), redirect to login
    if (session.user.role !== "BUYER") {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  const onSubmit = async (data: CompleteRegistrationFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        "/api/auth/complete-organizer-registration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orgName: data.orgName,
            legalName: data.legalName,
            phone: data.phone,
            npwp: data.npwp,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Terjadi kesalahan saat melengkapi pendaftaran",
        );
      } else {
        setSuccess(
          "Pendaftaran organizer berhasil dilengkapi! Anda akan dialihkan ke dashboard organizer.",
        );
        // Force session refresh and redirect ke dashboard organizer setelah 2 detik
        setTimeout(async () => {
          // Force session refresh
          await fetch("/api/auth/session");
          router.push("/organizer");
        }, 2000);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat melengkapi pendaftaran");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking session
  if (status === "loading") {
    return <LoadingScreen />;
  }

  // Don't render anything if redirecting
  if (!session?.user || session.user.role !== "BUYER") {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden border-none bg-white shadow-lg">
          <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-800 to-blue-700 pt-5 pb-4">
            <CardTitle className="text-center text-lg font-bold text-white">
              Lengkapi Data Organizer
            </CardTitle>
            <CardDescription className="text-center text-xs text-blue-100">
              Selamat datang {session.user.name}! Lengkapi data untuk menjadi
              organizer
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 pt-5">
            {error && (
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
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-xs text-green-600">
                <div className="flex">
                  <svg
                    className="mr-1.5 h-3.5 w-3.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="orgName"
                    className="text-xs font-medium text-gray-700"
                  >
                    Nama Organisasi *
                  </Label>
                  <Input
                    id="orgName"
                    type="text"
                    placeholder="Nama Organisasi/Event Organizer"
                    autoComplete="organization"
                    disabled={isLoading}
                    className="h-7 w-full rounded-md border-gray-200 bg-white px-2 text-xs shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    {...register("orgName")}
                  />
                  {errors.orgName && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.orgName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="legalName"
                    className="text-xs font-medium text-gray-700"
                  >
                    Nama Legal (Opsional)
                  </Label>
                  <Input
                    id="legalName"
                    type="text"
                    placeholder="Nama legal perusahaan"
                    disabled={isLoading}
                    className="h-7 w-full rounded-md border-gray-200 bg-white px-2 text-xs shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    {...register("legalName")}
                  />
                  {errors.legalName && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.legalName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-medium text-gray-700"
                  >
                    Nomor Telepon (Opsional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    disabled={isLoading}
                    className="h-7 w-full rounded-md border-gray-200 bg-white px-2 text-xs shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="npwp"
                    className="text-xs font-medium text-gray-700"
                  >
                    NPWP (Opsional)
                  </Label>
                  <Input
                    id="npwp"
                    type="text"
                    placeholder="Nomor NPWP"
                    disabled={isLoading}
                    className="h-7 w-full rounded-md border-gray-200 bg-white px-2 text-xs shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    {...register("npwp")}
                  />
                  {errors.npwp && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.npwp.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="h-8 w-full bg-blue-800 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-900 focus:ring-1 focus:ring-blue-200"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  )}
                  Lengkapi Pendaftaran
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
