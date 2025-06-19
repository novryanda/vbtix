"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Home, 
  ArrowLeft, 
  Signal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Router
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { TEXT_SIZES, SPACING, PATTERNS } from "~/lib/responsive-utils";

export default function NetworkErrorPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'offline'>('fast');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate connection speed detection
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const updateConnectionSpeed = () => {
        if (connection.effectiveType === '4g') {
          setConnectionSpeed('fast');
        } else if (connection.effectiveType === '3g' || connection.effectiveType === '2g') {
          setConnectionSpeed('slow');
        } else {
          setConnectionSpeed('offline');
        }
      };

      updateConnectionSpeed();
      connection.addEventListener('change', updateConnectionSpeed);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateConnectionSpeed);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Simulate retry attempt
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if we can reach the server
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        // Connection restored, reload the page
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    } catch (error) {
      setIsRetrying(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const getConnectionStatus = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: "Tidak Ada Koneksi",
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        description: "Perangkat Anda tidak terhubung ke internet"
      };
    }

    switch (connectionSpeed) {
      case 'slow':
        return {
          icon: Signal,
          text: "Koneksi Lambat",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
          description: "Koneksi internet Anda lambat"
        };
      case 'fast':
        return {
          icon: Wifi,
          text: "Koneksi Baik",
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          description: "Koneksi internet Anda stabil"
        };
      default:
        return {
          icon: WifiOff,
          text: "Masalah Koneksi",
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          description: "Terjadi masalah dengan koneksi internet"
        };
    }
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  const troubleshootingSteps = [
    {
      icon: Wifi,
      title: "Periksa Koneksi WiFi",
      description: "Pastikan perangkat terhubung ke jaringan WiFi yang stabil",
      status: isOnline ? "success" : "error"
    },
    {
      icon: Router,
      title: "Restart Router",
      description: "Coba restart router atau modem internet Anda",
      status: "pending"
    },
    {
      icon: Globe,
      title: "Coba Website Lain",
      description: "Periksa apakah website lain dapat diakses",
      status: "pending"
    },
    {
      icon: RefreshCw,
      title: "Refresh Halaman",
      description: "Muat ulang halaman setelah koneksi stabil",
      status: "pending"
    }
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container-responsive py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main Error Display */}
            <MagicCard className="mb-8 sm:mb-12 border-0 bg-gradient-to-br from-background/90 to-muted/20 backdrop-blur-sm">
              <CardContent className={`${SPACING.card} text-center`}>
                
                {/* Network Icon */}
                <div className="mb-6 sm:mb-8">
                  <div className={`mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full ${connectionStatus.bgColor} flex items-center justify-center mb-4`}>
                    <StatusIcon className={`h-10 w-10 sm:h-12 sm:w-12 ${connectionStatus.color} ${!isOnline ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className={`h-1 w-8 bg-gradient-to-r ${isOnline ? 'from-blue-500 to-indigo-500' : 'from-red-500 to-orange-500'} rounded-full`}></div>
                    <WifiOff className={`h-5 w-5 ${isOnline ? 'text-blue-500' : 'text-red-500 animate-pulse'}`} />
                    <div className={`h-1 w-8 bg-gradient-to-r ${isOnline ? 'from-indigo-500 to-blue-500' : 'from-orange-500 to-red-500'} rounded-full`}></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                  <h1 className={`${TEXT_SIZES['heading-md']} font-bold text-foreground`}>
                    Masalah Koneksi Internet
                  </h1>
                  <p className={`${TEXT_SIZES.body} text-muted-foreground max-w-2xl mx-auto leading-relaxed`}>
                    Tidak dapat terhubung ke server VBTicket. Periksa koneksi internet Anda 
                    dan coba lagi dalam beberapa saat.
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mb-6 sm:mb-8">
                  <Badge 
                    variant="outline" 
                    className={`${connectionStatus.bgColor} ${connectionStatus.color} border-current px-4 py-2 text-sm font-medium`}
                  >
                    <StatusIcon className="mr-2 h-4 w-4" />
                    {connectionStatus.text}
                  </Badge>
                </div>

                {/* Connection Details */}
                <div className="mb-6 sm:mb-8 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Status Koneksi:</p>
                  <p className="font-medium text-foreground">{connectionStatus.description}</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Percobaan ke-{retryCount}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className={`${PATTERNS['flex-responsive']} ${SPACING['gap-sm']} justify-center items-center`}>
                  <MagicButton
                    onClick={handleRetry}
                    disabled={isRetrying}
                    variant="magic"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <RefreshCw className={`mr-2 h-5 w-5 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Mencoba...' : 'Coba Lagi'}
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

            {/* Troubleshooting Steps */}
            <MagicCard className="mb-8 border-0 bg-gradient-to-br from-muted/20 to-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                    Langkah Pemecahan Masalah
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {troubleshootingSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const StatusStepIcon = getStepIcon(step.status);
                    return (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-background/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <StepIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
                            <StatusStepIcon className={`h-4 w-4 ${getStepColor(step.status)}`} />
                          </div>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </MagicCard>

            {/* Help Information */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Bantuan Tambahan</AlertTitle>
              <AlertDescription>
                Jika masalah berlanjut, pastikan koneksi internet Anda stabil dan coba akses 
                VBTicket dari perangkat atau jaringan yang berbeda. Hubungi penyedia layanan 
                internet Anda jika diperlukan.
              </AlertDescription>
            </Alert>

          </div>
        </div>
      </div>
    </div>
  );
}
