"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Bug,
  Server,
  Mail
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { TEXT_SIZES, SPACING, PATTERNS } from "~/lib/responsive-utils";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleReportError = () => {
    const subject = encodeURIComponent('Error Report - VBTicket');
    const body = encodeURIComponent(`
Error Details:
- Message: ${error.message}
- Digest: ${error.digest || 'N/A'}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@vbticket.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 dark:from-slate-950 dark:via-red-950 dark:to-orange-950 relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 dark:bg-orange-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container-responsive py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">

            {/* Main Error Display */}
            <MagicCard className="mb-8 sm:mb-12 border-0 bg-gradient-to-br from-background/90 to-muted/20 backdrop-blur-sm">
              <CardContent className={`${SPACING.card} text-center`}>

                {/* Error Icon and Code */}
                <div className="mb-6 sm:mb-8">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 flex items-center justify-center mb-4">
                    <Server className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
                  </div>
                  <div className={`${TEXT_SIZES['heading-lg']} font-black leading-none text-red-600`}>
                    500
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                    <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                    <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                  <h1 className={`${TEXT_SIZES['heading-md']} font-bold text-foreground`}>
                    Terjadi Kesalahan Server
                  </h1>
                  <p className={`${TEXT_SIZES.body} text-muted-foreground max-w-2xl mx-auto leading-relaxed`}>
                    Maaf, terjadi kesalahan internal pada server kami. Tim teknis kami telah diberitahu
                    dan sedang bekerja untuk memperbaiki masalah ini.
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mb-6 sm:mb-8">
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800 px-4 py-2 text-sm font-medium"
                  >
                    Error 500 - Internal Server Error
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className={`${PATTERNS['flex-responsive']} ${SPACING['gap-sm']} justify-center items-center mb-6 sm:mb-8`}>
                  <MagicButton
                    onClick={reset}
                    variant="magic"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Coba Lagi
                  </MagicButton>

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
                </div>

              </CardContent>
            </MagicCard>

            {/* Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <MagicCard className="mb-8 border-0 bg-gradient-to-br from-muted/20 to-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-left">
                    <Bug className="h-5 w-5 text-orange-600" />
                    Detail Error (Development Mode)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-left">
                  <div className="space-y-3">
                    <div>
                      <strong className="text-sm font-medium">Message:</strong>
                      <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                        {error.message}
                      </p>
                    </div>
                    {error.digest && (
                      <div>
                        <strong className="text-sm font-medium">Digest:</strong>
                        <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                          {error.digest}
                        </p>
                      </div>
                    )}
                    <div>
                      <strong className="text-sm font-medium">Stack Trace:</strong>
                      <pre className="text-xs text-muted-foreground bg-muted p-3 rounded mt-1 overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </MagicCard>
            )}

            {/* Help and Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">

              {/* What You Can Do */}
              <MagicCard className="border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-left">
                    Apa yang Bisa Anda Lakukan?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-left space-y-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Tunggu beberapa menit dan coba lagi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Refresh halaman atau kembali ke halaman sebelumnya</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Periksa koneksi internet Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hubungi dukungan jika masalah berlanjut</span>
                    </li>
                  </ul>
                </CardContent>
              </MagicCard>

              {/* Report Error */}
              <MagicCard className="border-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-left">
                    Laporkan Masalah
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-left space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Bantu kami memperbaiki masalah ini dengan melaporkan error yang Anda alami.
                  </p>
                  <Button
                    onClick={handleReportError}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Kirim Laporan Error
                  </Button>
                </CardContent>
              </MagicCard>
            </div>

            {/* Status Information */}
            <Alert className="text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Informasi Status</AlertTitle>
              <AlertDescription>
                Tim teknis kami telah diberitahu tentang masalah ini dan sedang bekerja untuk memperbaikinya.
                Anda dapat memeriksa status sistem terkini di halaman status kami atau mengikuti update
                melalui media sosial resmi VBTicket.
              </AlertDescription>
            </Alert>

          </div>
        </div>
      </div>
    </div>
  );
}
