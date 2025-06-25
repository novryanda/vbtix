"use client"

import { useState, useEffect } from "react";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { AnimatedCircularProgressBar } from "~/components/magicui/animated-circular-progress-bar";

interface LoadingScreenProps {
  showProgress?: boolean;
  message?: string;
}

export function LoadingScreen({
  showProgress = true,
  message = "Memuat..."
}: LoadingScreenProps = {}) {
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(message);

  useEffect(() => {
    if (!showProgress) return;

    const stages = [
      { progress: 20, message: "Memuat aplikasi..." },
      { progress: 40, message: "Menyiapkan komponen..." },
      { progress: 60, message: "Memuat data..." },
      { progress: 80, message: "Menyelesaikan..." },
      { progress: 100, message: "Siap!" }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        if (stage) {
          setProgress(stage.progress);
          setLoadingMessage(stage.message);
        }
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {showProgress ? (
          <div className="flex justify-center">
            <AnimatedCircularProgressBar
              max={100}
              min={0}
              value={progress}
              gaugePrimaryColor="hsl(var(--primary))"
              gaugeSecondaryColor="hsl(var(--muted))"
              className="size-20 text-base font-bold text-primary"
            />
          </div>
        ) : (
          <LoadingSpinner size="lg" />
        )}

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{loadingMessage}</p>
          {showProgress && (
            <p className="text-xs text-muted-foreground">
              {progress}% selesai
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
