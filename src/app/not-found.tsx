"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ArrowLeft,
  Search,
  MapPin,
  Compass,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { TEXT_SIZES, SPACING, PATTERNS } from "~/lib/responsive-utils";

export default function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const popularLinks = [
    { href: "/events", label: "Jelajah Event", icon: Search },
    { href: "/buyer/about", label: "Tentang Kami", icon: MapPin },
    { href: "/login", label: "Masuk", icon: ExternalLink },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container-responsive py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">

            {/* Main Error Display */}
            <MagicCard className="mb-8 sm:mb-12 border-0 bg-gradient-to-br from-background/90 to-muted/20 backdrop-blur-sm">
              <CardContent className={`${SPACING.card} text-center`}>

                {/* 404 Number */}
                <div className="mb-6 sm:mb-8">
                  <div className={`${TEXT_SIZES['heading-xl']} font-black leading-none bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent`}>
                    404
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="h-1 w-8 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    <Compass className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="h-1 w-8 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                  <h1 className={`${TEXT_SIZES['heading-md']} font-bold text-foreground`}>
                    Halaman Tidak Ditemukan
                  </h1>
                  <p className={`${TEXT_SIZES.body} text-muted-foreground max-w-2xl mx-auto leading-relaxed`}>
                    Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan,
                    dihapus, atau URL yang Anda masukkan salah.
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mb-6 sm:mb-8">
                  <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20 px-4 py-2 text-sm font-medium"
                  >
                    Error 404 - Halaman Tidak Ditemukan
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className={`${PATTERNS['flex-responsive']} ${SPACING['gap-sm']} justify-center items-center mb-6 sm:mb-8`}>
                  <MagicButton
                    onClick={handleGoBack}
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Kembali
                  </MagicButton>

                  <MagicButton
                    asChild
                    variant="magic"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <Link href="/">
                      <Home className="mr-2 h-5 w-5" />
                      Beranda
                    </Link>
                  </MagicButton>

                  <MagicButton
                    onClick={handleRefresh}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Muat Ulang
                  </MagicButton>
                </div>

              </CardContent>
            </MagicCard>

            {/* Popular Links Section */}
            <MagicCard className="border-0 bg-gradient-to-br from-muted/20 to-background/50 backdrop-blur-sm mb-8">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className={`${TEXT_SIZES['heading-sm']} font-bold text-center`}>
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Halaman Populer
                  </span>
                </CardTitle>
                <p className={`${TEXT_SIZES.caption} text-muted-foreground text-center`}>
                  Mungkin Anda mencari salah satu halaman berikut
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {popularLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <MagicCard key={link.href} className="group cursor-pointer border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                        <CardContent className="p-4 sm:p-6 text-center">
                          <div className="mb-3 sm:mb-4">
                            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors duration-300">
                            {link.label}
                          </h3>
                          <Link
                            href={link.href}
                            className="absolute inset-0 rounded-lg"
                            aria-label={`Pergi ke ${link.label}`}
                          />
                        </CardContent>
                      </MagicCard>
                    );
                  })}
                </div>
              </CardContent>
            </MagicCard>

            {/* Help Section */}
            <Card className="border-border/30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-4 sm:p-6 text-center">
                <h3 className="font-semibold text-sm sm:text-base mb-2 text-foreground">
                  Masih Butuh Bantuan?
                </h3>
                <p className={`${TEXT_SIZES.caption} text-muted-foreground mb-4`}>
                  Jika Anda yakin halaman ini seharusnya ada, silakan hubungi tim dukungan kami
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/buyer/about">
                      Hubungi Dukungan
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/events">
                      Lihat Semua Event
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
