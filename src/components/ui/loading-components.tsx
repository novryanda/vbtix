"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Ticket, Calendar, Users, CreditCard, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { MagicCard } from "~/components/ui/magic-card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { AnimatedCircularProgressBar } from "~/components/magicui/animated-circular-progress-bar";
import { cn } from "~/lib/utils";

// Basic Loading Spinner
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className="text-sm text-muted-foreground font-medium">{text}</span>
      )}
    </div>
  );
}

// Card Loading Skeleton
interface CardLoadingProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export function CardLoading({ className, showHeader = true, showFooter = false, lines = 3 }: CardLoadingProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
        ))}
        {showFooter && (
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Event Card Loading
export function EventCardLoading({ className }: { className?: string }) {
  return (
    <MagicCard className={cn("overflow-hidden", className)}>
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </MagicCard>
  );
}

// Table Loading
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableLoading({ rows = 5, columns = 4, className }: TableLoadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Dashboard Stats Loading
export function DashboardStatsLoading({ className }: { className?: string }) {
  const stats = [
    { icon: Users, color: "text-blue-600" },
    { icon: Calendar, color: "text-green-600" },
    { icon: Ticket, color: "text-purple-600" },
    { icon: CreditCard, color: "text-orange-600" }
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <MagicCard key={index} className="animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </MagicCard>
        );
      })}
    </div>
  );
}

// Form Loading
export function FormLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Enhanced Page Loading with Context and Animated Progress
interface PageLoadingProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  showProgress?: boolean;
  progressStages?: Array<{ progress: number; message: string }>;
}

export function PageLoading({
  title = "Memuat Halaman",
  description = "Mohon tunggu sebentar...",
  icon: Icon = Loader2,
  className,
  showProgress = true,
  progressStages = [
    { progress: 25, message: "Memuat komponen..." },
    { progress: 50, message: "Menyiapkan data..." },
    { progress: 75, message: "Menyelesaikan..." },
    { progress: 100, message: "Siap!" }
  ]
}: PageLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(description);

  useEffect(() => {
    if (!showProgress) return;

    let stageIndex = 0;
    const interval = setInterval(() => {
      if (stageIndex < progressStages.length) {
        const stage = progressStages[stageIndex];
        if (stage) {
          setProgress(stage.progress);
          setCurrentStage(stage.message);
        }
        stageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [showProgress, progressStages]);
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
      <div className="text-center space-y-6 max-w-md mx-auto">
        {showProgress ? (
          <div className="flex justify-center">
            <AnimatedCircularProgressBar
              max={100}
              min={0}
              value={progress}
              gaugePrimaryColor="hsl(var(--primary))"
              gaugeSecondaryColor="hsl(var(--muted))"
              className="size-24 text-lg font-bold text-primary"
            />
          </div>
        ) : (
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {showProgress ? currentStage : description}
          </p>
          {showProgress && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Progress:</span>
              <span className="font-mono font-semibold text-primary">{progress}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Button Loading State
interface ButtonLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}

export function ButtonLoading({ children, loading = false, className, disabled }: ButtonLoadingProps) {
  return (
    <button 
      className={cn("relative", className)} 
      disabled={disabled || loading}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>
        {children}
      </span>
    </button>
  );
}

// List Loading
interface ListLoadingProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListLoading({ items = 5, showAvatar = false, className }: ListLoadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

// Chart Loading
export function ChartLoading({ className }: { className?: string }) {
  return (
    <MagicCard className={cn("", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted rounded-lg animate-pulse flex items-end justify-center gap-2 p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-primary/30 rounded-t animate-pulse flex-1"
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </CardContent>
    </MagicCard>
  );
}
