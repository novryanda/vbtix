"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard } from "~/components/ui/magic-card";
import { 
  LoadingSpinner, 
  PageLoading, 
  CardLoading, 
  EventCardLoading,
  DashboardStatsLoading 
} from "~/components/ui/loading-components";
import { LoadingScreen } from "~/components/ui/loading-screen";
import { AnimatedCircularProgressBar } from "~/components/magicui/animated-circular-progress-bar";

export default function LoadingTestPage() {
  const [showPageLoading, setShowPageLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [progress, setProgress] = useState(65);

  const handleProgressChange = (value: number) => {
    setProgress(Math.max(0, Math.min(100, value)));
  };

  if (showLoadingScreen) {
    return <LoadingScreen showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Enhanced Loading Components Test
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing the new animated circular progress bar implementations
          </p>
        </div>

        {/* Control Panel */}
        <MagicCard className="p-6">
          <CardHeader>
            <CardTitle>Loading Component Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setShowPageLoading(!showPageLoading)}
                variant={showPageLoading ? "destructive" : "default"}
              >
                {showPageLoading ? "Hide" : "Show"} Page Loading
              </Button>
              <Button 
                onClick={() => setShowLoadingScreen(true)}
                variant="secondary"
              >
                Test Loading Screen
              </Button>
              <Button 
                onClick={() => setShowLoadingScreen(false)}
                variant="outline"
              >
                Hide Loading Screen
              </Button>
            </div>
            
            {/* Progress Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Manual Progress Control:</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12">{progress}%</span>
              </div>
            </div>
          </CardContent>
        </MagicCard>

        {/* Page Loading Demo */}
        {showPageLoading && (
          <MagicCard className="p-6">
            <CardHeader>
              <CardTitle>Page Loading Component</CardTitle>
            </CardHeader>
            <CardContent>
              <PageLoading 
                title="Loading Demo Page"
                description="This demonstrates the enhanced page loading component"
                showProgress={true}
              />
            </CardContent>
          </MagicCard>
        )}

        {/* Animated Circular Progress Bar Demo */}
        <MagicCard className="p-6">
          <CardHeader>
            <CardTitle>Animated Circular Progress Bar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Use the slider above to control the progress
              </p>
              <p className="text-lg font-semibold">
                Current Progress: {progress}%
              </p>
            </div>
          </CardContent>
        </MagicCard>

        {/* Loading Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Loading Spinner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loading Spinner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoadingSpinner size="sm" text="Small" />
              <LoadingSpinner size="md" text="Medium" />
              <LoadingSpinner size="lg" text="Large" />
            </CardContent>
          </Card>

          {/* Card Loading */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Card Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <CardLoading lines={4} showHeader={true} showFooter={true} />
            </CardContent>
          </Card>

          {/* Event Card Loading */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Card Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <EventCardLoading />
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Stats Loading */}
        <MagicCard className="p-6">
          <CardHeader>
            <CardTitle>Dashboard Stats Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardStatsLoading />
          </CardContent>
        </MagicCard>

        {/* Color Variations */}
        <MagicCard className="p-6">
          <CardHeader>
            <CardTitle>Progress Bar Color Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={75}
                  gaugePrimaryColor="hsl(var(--primary))"
                  gaugeSecondaryColor="hsl(var(--muted))"
                  className="size-20 text-sm font-bold text-primary mx-auto"
                />
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              
              <div className="text-center space-y-2">
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={60}
                  gaugePrimaryColor="hsl(var(--secondary))"
                  gaugeSecondaryColor="hsl(var(--muted))"
                  className="size-20 text-sm font-bold text-secondary mx-auto"
                />
                <p className="text-xs text-muted-foreground">Secondary</p>
              </div>
              
              <div className="text-center space-y-2">
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={85}
                  gaugePrimaryColor="hsl(var(--accent))"
                  gaugeSecondaryColor="hsl(var(--muted))"
                  className="size-20 text-sm font-bold text-accent mx-auto"
                />
                <p className="text-xs text-muted-foreground">Accent</p>
              </div>
              
              <div className="text-center space-y-2">
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={40}
                  gaugePrimaryColor="hsl(var(--destructive))"
                  gaugeSecondaryColor="hsl(var(--muted))"
                  className="size-20 text-sm font-bold text-destructive mx-auto"
                />
                <p className="text-xs text-muted-foreground">Destructive</p>
              </div>
            </div>
          </CardContent>
        </MagicCard>
      </div>
    </div>
  );
}
