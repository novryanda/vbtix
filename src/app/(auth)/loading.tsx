"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { MagicCard, Shimmer } from "~/components/ui/magic-card";
import { Skeleton } from "~/components/ui/skeleton";
import { AnimatedCircularProgressBar } from "~/components/magicui/animated-circular-progress-bar";
import { Lock, Mail, Shield } from "lucide-react";

export default function AuthLoading() {
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Memuat halaman...");

  useEffect(() => {
    const stages = [
      { progress: 20, message: "Memuat halaman..." },
      { progress: 40, message: "Menyiapkan autentikasi..." },
      { progress: 60, message: "Memuat komponen..." },
      { progress: 80, message: "Menyelesaikan..." },
      { progress: 100, message: "Siap!" }
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
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content - Left Aligned Layout */}
      <div className="relative z-10 flex h-full w-full items-center justify-start pl-8 lg:pl-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header Section with Animated Progress */}
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary animate-pulse" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>

            {/* Animated Circular Progress Bar */}
            <div className="flex flex-col items-center space-y-4">
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={progress}
                gaugePrimaryColor="hsl(var(--primary))"
                gaugeSecondaryColor="hsl(var(--muted))"
                className="size-24 text-lg font-bold text-primary"
              />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">{loadingStage}</p>
                <p className="text-xs text-muted-foreground">Mohon tunggu sebentar...</p>
              </div>
            </div>
          </div>

          {/* Loading Form Card */}
          <Shimmer className="w-full">
            <MagicCard className="w-full border-0 bg-card/80 backdrop-blur-sm shadow-2xl">
              <div className="p-6 space-y-4">
                {/* Form Header */}
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <LoadingSpinner size="sm" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>

                  {/* Submit Button */}
                  <Skeleton className="h-10 w-full rounded-md" />

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <Skeleton className="h-4 w-8" />
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>

                  {/* Footer Links */}
                  <div className="text-center space-y-2">
                    <Skeleton className="h-4 w-48 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </div>
              </div>
            </MagicCard>
          </Shimmer>

          {/* Dynamic Loading Message */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-medium">{loadingStage}</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <span>Progress:</span>
              <span className="font-mono font-semibold text-primary">{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}