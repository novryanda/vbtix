"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Home,
  Calendar,
  Bell,
  ExternalLink
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { TEXT_SIZES, SPACING, PATTERNS } from "~/lib/responsive-utils";

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(65);

  // Estimated completion time (example: 2 hours from now)
  const estimatedCompletion = new Date(Date.now() + 2 * 60 * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate progress updates
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 2;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(progressTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
  };

  const maintenanceItems = [
    { 
      task: "Pembaruan Database", 
      status: "completed", 
      icon: CheckCircle,
      description: "Optimisasi performa database selesai"
    },
    { 
      task: "Upgrade Server", 
      status: "in-progress", 
      icon: Clock,
      description: "Sedang melakukan upgrade infrastruktur server"
    },
    { 
      task: "Testing Sistem", 
      status: "pending", 
      icon: AlertCircle,
      description: "Pengujian menyeluruh sistem akan dilakukan"
    },
    { 
      task: "Deployment", 
      status: "pending", 
      icon: AlertCircle,
      description: "Deploy versi terbaru ke production"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'in-progress': return 'Sedang Berlangsung';
      case 'pending': return 'Menunggu';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-amber-950 dark:to-orange-950 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-200/20 dark:bg-amber-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 dark:bg-orange-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container-responsive py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Main Maintenance Display */}
            <MagicCard className="mb-8 sm:mb-12 border-0 bg-gradient-to-br from-background/90 to-muted/20 backdrop-blur-sm">
              <CardContent className={`${SPACING.card} text-center`}>
                
                {/* Maintenance Icon */}
                <div className="mb-6 sm:mb-8">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 flex items-center justify-center mb-4">
                    <Wrench className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 animate-pulse" />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="h-1 w-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                    <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
                    <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                  </div>
                </div>

                {/* Maintenance Message */}
                <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                  <h1 className={`${TEXT_SIZES['heading-lg']} font-bold text-foreground`}>
                    Sedang Dalam Pemeliharaan
                  </h1>
                  <p className={`${TEXT_SIZES.body} text-muted-foreground max-w-2xl mx-auto leading-relaxed`}>
                    Kami sedang melakukan pemeliharaan terjadwal untuk meningkatkan performa dan 
                    menambahkan fitur baru. Terima kasih atas kesabaran Anda.
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mb-6 sm:mb-8">
                  <Badge 
                    variant="outline" 
                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 px-4 py-2 text-sm font-medium"
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Pemeliharaan Terjadwal
                  </Badge>
                </div>

                {/* Progress Section */}
                <div className="mb-6 sm:mb-8 space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Progress Pemeliharaan
                    </p>
                    <div className="max-w-md mx-auto">
                      <Progress value={progress} className="h-3" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round(progress)}% selesai
                    </p>
                  </div>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Waktu Saat Ini</p>
                    <p className="text-lg font-bold text-primary">{formatTime(currentTime)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(currentTime)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Estimasi Selesai</p>
                    <p className="text-lg font-bold text-secondary">{formatTime(estimatedCompletion)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(estimatedCompletion)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`${PATTERNS['form-actions']} justify-center items-center`}>
                  <MagicButton
                    onClick={() => window.location.reload()}
                    variant="magic"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Refresh Status
                  </MagicButton>

                  <MagicButton
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                  >
                    <Link href="/">
                      <Home className="mr-2 h-5 w-5" />
                      Kembali ke Beranda
                    </Link>
                  </MagicButton>
                </div>

              </CardContent>
            </MagicCard>

            {/* Maintenance Progress */}
            <MagicCard className="mb-8 border-0 bg-gradient-to-br from-muted/20 to-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center">
                  <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 bg-clip-text text-transparent">
                    Progress Pemeliharaan
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-background/50">
                        <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground">{item.task}</h4>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </MagicCard>

            {/* Information and Updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
              
              {/* What's Being Updated */}
              <MagicCard className="border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Yang Sedang Diperbaharui
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Peningkatan performa sistem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Fitur baru untuk organizer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Perbaikan bug dan stabilitas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Update keamanan sistem</span>
                    </li>
                  </ul>
                </CardContent>
              </MagicCard>

              {/* Stay Updated */}
              <MagicCard className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Tetap Terhubung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ikuti update terbaru tentang status pemeliharaan melalui:
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/status">
                        <Bell className="mr-2 h-4 w-4" />
                        Halaman Status
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="https://twitter.com/vbticket" target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Media Sosial
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </MagicCard>
            </div>

            {/* Notice */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pemberitahuan</AlertTitle>
              <AlertDescription>
                Selama pemeliharaan, beberapa fitur mungkin tidak tersedia. Data Anda aman dan 
                tidak akan hilang. Kami akan segera kembali dengan performa yang lebih baik!
              </AlertDescription>
            </Alert>

          </div>
        </div>
      </div>
    </div>
  );
}
