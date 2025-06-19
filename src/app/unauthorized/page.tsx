"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  ShieldX,
  Lock,
  User,
  UserCheck,
  Crown,
  ArrowLeft,
  Home,
  LogIn,
  UserPlus,
  AlertTriangle,
  Info
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { TEXT_SIZES, SPACING, PATTERNS } from "~/lib/responsive-utils";

type UserRole = 'admin' | 'organizer' | 'buyer' | 'guest';
type RequiredRole = 'admin' | 'organizer' | 'buyer';

interface RoleInfo {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const roleInfo: Record<RequiredRole, RoleInfo> = {
  admin: {
    name: "Administrator",
    description: "Akses penuh untuk mengelola platform VBTicket",
    icon: Crown,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20"
  },
  organizer: {
    name: "Penyelenggara Event",
    description: "Akses untuk mengelola event dan tiket",
    icon: UserCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20"
  },
  buyer: {
    name: "Pembeli",
    description: "Akses untuk membeli tiket dan melihat event",
    icon: User,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20"
  }
};

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [requiredRole, setRequiredRole] = useState<RequiredRole>('buyer');
  const [returnUrl, setReturnUrl] = useState<string>('/');

  useEffect(() => {
    // Get parameters from URL
    const role = searchParams.get('required') as RequiredRole;
    const current = searchParams.get('current') as UserRole;
    const returnTo = searchParams.get('returnUrl');

    if (role && Object.keys(roleInfo).includes(role)) {
      setRequiredRole(role);
    }
    if (current) {
      setCurrentRole(current);
    }
    if (returnTo) {
      setReturnUrl(decodeURIComponent(returnTo));
    }
  }, [searchParams]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const getErrorMessage = () => {
    if (currentRole === 'guest') {
      return {
        title: "Akses Ditolak - Login Diperlukan",
        description: "Anda harus masuk terlebih dahulu untuk mengakses halaman ini.",
        type: "login" as const
      };
    }

    const required = roleInfo[requiredRole];
    return {
      title: `Akses Ditolak - Diperlukan Role ${required.name}`,
      description: `Halaman ini hanya dapat diakses oleh ${required.name}. Role Anda saat ini tidak memiliki izin yang diperlukan.`,
      type: "role" as const
    };
  };

  const errorInfo = getErrorMessage();
  const RequiredIcon = roleInfo[requiredRole].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 dark:from-slate-950 dark:via-red-950 dark:to-orange-950 relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container-responsive py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">

            {/* Main Error Display */}
            <MagicCard className="mb-8 sm:mb-12 border-0 bg-gradient-to-br from-background/90 to-muted/20 backdrop-blur-sm">
              <CardContent className={`${SPACING.card} text-center`}>

                {/* Error Icon and Code */}
                <div className="mb-6 sm:mb-8">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 flex items-center justify-center mb-4">
                    <ShieldX className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
                  </div>
                  <div className={`${TEXT_SIZES['heading-lg']} font-black leading-none text-red-600`}>
                    403
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                    <Lock className="h-5 w-5 text-red-500" />
                    <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                  <h1 className={`${TEXT_SIZES['heading-md']} font-bold text-foreground`}>
                    {errorInfo.title}
                  </h1>
                  <p className={`${TEXT_SIZES.body} text-muted-foreground max-w-2xl mx-auto leading-relaxed`}>
                    {errorInfo.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mb-6 sm:mb-8">
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800 px-4 py-2 text-sm font-medium"
                  >
                    Error 403 - Akses Tidak Diizinkan
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className={`${PATTERNS['flex-responsive']} ${SPACING['gap-sm']} justify-center items-center mb-6 sm:mb-8`}>
                  <MagicButton
                    onClick={handleGoBack}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Kembali
                  </MagicButton>

                  <MagicButton
                    asChild
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <Link href="/">
                      <Home className="mr-2 h-5 w-5" />
                      Beranda
                    </Link>
                  </MagicButton>

                  {errorInfo.type === 'login' && (
                    <MagicButton
                      asChild
                      variant="magic"
                      size="lg"
                      className="w-full sm:w-auto font-semibold"
                    >
                      <Link href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}>
                        <LogIn className="mr-2 h-5 w-5" />
                        Masuk
                      </Link>
                    </MagicButton>
                  )}
                </div>

              </CardContent>
            </MagicCard>

            {/* Role Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">

              {/* Required Role */}
              <MagicCard className={`border-0 ${roleInfo[requiredRole].bgColor}`}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${roleInfo[requiredRole].bgColor}`}>
                      <RequiredIcon className={`h-6 w-6 ${roleInfo[requiredRole].color}`} />
                    </div>
                    <div>
                      <div className="text-lg font-bold">Role yang Diperlukan</div>
                      <div className={`text-sm ${roleInfo[requiredRole].color} font-medium`}>
                        {roleInfo[requiredRole].name}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {roleInfo[requiredRole].description}
                  </p>
                </CardContent>
              </MagicCard>

              {/* Current Status */}
              <MagicCard className="border-0 bg-gradient-to-br from-muted/20 to-background/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">Status Anda</div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {currentRole === 'guest' ? 'Belum Login' :
                         currentRole === 'admin' ? 'Administrator' :
                         currentRole === 'organizer' ? 'Penyelenggara Event' :
                         'Pembeli'}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {currentRole === 'guest'
                      ? 'Anda belum masuk ke akun VBTicket. Silakan login untuk mengakses fitur ini.'
                      : 'Role Anda saat ini tidak memiliki izin untuk mengakses halaman yang diminta.'
                    }
                  </p>
                </CardContent>
              </MagicCard>
            </div>

            {/* Action Cards */}
            {errorInfo.type === 'login' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <MagicCard className="group cursor-pointer border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                        <LogIn className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
                      Masuk ke Akun
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sudah punya akun? Masuk untuk mengakses fitur lengkap
                    </p>
                    <Link
                      href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                      className="absolute inset-0 rounded-lg"
                      aria-label="Masuk ke akun"
                    />
                  </CardContent>
                </MagicCard>

                <MagicCard className="group cursor-pointer border-border/30 hover:border-secondary/30 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center group-hover:from-secondary/30 group-hover:to-primary/30 transition-all duration-300">
                        <UserPlus className="h-7 w-7 text-secondary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-base text-foreground group-hover:text-secondary transition-colors duration-300 mb-2">
                      Daftar Akun Baru
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Belum punya akun? Daftar sekarang gratis
                    </p>
                    <Link
                      href="/register"
                      className="absolute inset-0 rounded-lg"
                      aria-label="Daftar akun baru"
                    />
                  </CardContent>
                </MagicCard>
              </div>
            ) : (
              <Alert className="mb-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Informasi Role</AlertTitle>
                <AlertDescription>
                  Jika Anda merasa seharusnya memiliki akses ke halaman ini, silakan hubungi administrator
                  untuk meminta peningkatan role atau verifikasi akun Anda.
                </AlertDescription>
              </Alert>
            )}

            {/* Help Section */}
            <Card className="border-border/30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-base text-foreground">
                    Butuh Bantuan?
                  </h3>
                </div>
                <p className={`${TEXT_SIZES.caption} text-muted-foreground mb-4`}>
                  Jika Anda mengalami masalah dengan akses atau memerlukan bantuan,
                  jangan ragu untuk menghubungi tim dukungan kami.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/buyer/about">
                      Hubungi Dukungan
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/events">
                      Kembali ke Event
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
