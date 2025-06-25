"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Ticket, Sparkles } from "lucide-react";
import { MagicCard } from "~/components/ui/magic-card";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { AnimatedCircularProgressBar } from "~/components/magicui/animated-circular-progress-bar";
import { TEXT_SIZES, SPACING } from "~/lib/responsive-utils";

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Memuat aplikasi...");

  useEffect(() => {
    const stages = [
      { progress: 15, message: "Memuat aplikasi..." },
      { progress: 30, message: "Menyiapkan komponen..." },
      { progress: 50, message: "Memuat data..." },
      { progress: 70, message: "Menginisialisasi..." },
      { progress: 85, message: "Menyelesaikan..." },
      { progress: 100, message: "Siap digunakan!" }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        if (stage) {
          setProgress(stage.progress);
          setLoadingStage(stage.message);
        }
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container-responsive py-8 sm:py-12 lg:py-16">
          <div className="max-w-2xl mx-auto text-center">

            {/* Main Loading Card */}
            <MagicCard className="border-0 bg-gradient-to-br from-background/90 to-muted/20 backdrop-blur-sm">
              <CardContent className={`${SPACING.card} text-center`}>

                {/* Logo and Branding */}
                <div className="mb-8 sm:mb-12">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 relative">
                    <Ticket className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-2 rounded-full border border-secondary/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                  </div>

                  <h1 className={`${TEXT_SIZES['heading-lg']} font-bold mb-3`}>
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                      VBTicket
                    </span>
                  </h1>

                  <p className={`${TEXT_SIZES.body} text-muted-foreground`}>
                    Platform Tiket Event Terpercaya
                  </p>
                </div>

                {/* Enhanced Loading Animation with Circular Progress */}
                <div className="mb-8 sm:mb-10 space-y-6">
                  {/* Animated Circular Progress Bar */}
                  <div className="flex justify-center">
                    <AnimatedCircularProgressBar
                      max={100}
                      min={0}
                      value={progress}
                      gaugePrimaryColor="hsl(var(--primary))"
                      gaugeSecondaryColor="hsl(var(--muted))"
                      className="size-32 text-xl font-bold text-primary"
                    />
                  </div>

                  {/* Loading Status */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className={`${TEXT_SIZES['heading-sm']} font-semibold text-foreground`}>
                        {loadingStage}
                      </span>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="w-full max-w-sm mx-auto space-y-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-mono font-semibold text-primary">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Loading Status Badge */}
                <div className="mb-6 sm:mb-8">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium animate-pulse"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {progress < 50 ? "Menyiapkan pengalaman terbaik untuk Anda" :
                     progress < 85 ? "Hampir selesai..." :
                     "Siap untuk digunakan!"}
                  </Badge>
                </div>

                {/* Dynamic Loading Messages */}
                <div className="space-y-2">
                  <p className={`${TEXT_SIZES.caption} text-muted-foreground animate-pulse`}>
                    {progress < 30 ? "Mohon tunggu sebentar..." :
                     progress < 70 ? "Sedang memproses..." :
                     "Hampir selesai..."}
                  </p>
                  <p className={`${TEXT_SIZES.caption} text-muted-foreground/70 animate-pulse`} style={{ animationDelay: '0.5s' }}>
                    {loadingStage}
                  </p>
                </div>

              </CardContent>
            </MagicCard>

            {/* Additional Loading Elements */}
            <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Ticket, label: "Event", delay: "0s" },
                { icon: Sparkles, label: "Fitur", delay: "0.3s" },
                { icon: Loader2, label: "Data", delay: "0.6s" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="border-border/30 bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className="mb-3">
                        <div
                          className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center animate-pulse"
                          style={{ animationDelay: item.delay }}
                        >
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                      </div>
                      <div
                        className="h-3 bg-muted rounded animate-pulse"
                        style={{ animationDelay: item.delay }}
                      ></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
