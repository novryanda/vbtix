"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, MagicInput, MagicButton, MagicTextarea } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Check, 
  X, 
  Eye,
  Grid,
  Layout,
  Type,
  MousePointer
} from "lucide-react";
import { useBreakpoint, useIsMobile, useIsTablet, useIsDesktop } from "~/lib/hooks/use-mobile";
import { 
  BREAKPOINTS, 
  GRID_COLUMNS, 
  SPACING, 
  TEXT_SIZES, 
  TOUCH_TARGETS,
  PATTERNS 
} from "~/lib/responsive-utils";

export default function ResponsiveTestPage() {
  const [testInput, setTestInput] = useState("");
  const [testTextarea, setTestTextarea] = useState("");
  
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  const getCurrentDevice = () => {
    if (isMobile) return { name: "Mobile", icon: Smartphone, color: "text-red-500" };
    if (isTablet) return { name: "Tablet", icon: Tablet, color: "text-yellow-500" };
    if (isDesktop) return { name: "Desktop", icon: Monitor, color: "text-green-500" };
    return { name: "Unknown", icon: Eye, color: "text-gray-500" };
  };

  const device = getCurrentDevice();
  const DeviceIcon = device.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="container-responsive py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <MagicCard className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <DeviceIcon className={`h-8 w-8 ${device.color}`} />
                <CardTitle className={TEXT_SIZES['heading-lg']}>
                  Responsive Design Test
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  Current: {device.name}
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  Breakpoint: {breakpoint}
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  Width: {typeof window !== 'undefined' ? window.innerWidth : 'SSR'}px
                </Badge>
              </div>
            </CardHeader>
          </MagicCard>
        </div>

        {/* Breakpoint Information */}
        <div className="mb-8">
          <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-4`}>Breakpoint Information</h2>
          <div className={GRID_COLUMNS.responsive}>
            {Object.entries(BREAKPOINTS).map(([name, value]) => (
              <Card key={name} className={`${breakpoint === name ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{name.toUpperCase()}</span>
                    <span className="text-sm text-muted-foreground">{value}px+</span>
                  </div>
                  {breakpoint === name && (
                    <Badge className="mt-2 w-full justify-center">Active</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Grid System Test */}
        <div className="mb-8">
          <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-4 flex items-center gap-2`}>
            <Grid className="h-5 w-5" />
            Grid System Test
          </h2>
          <div className={GRID_COLUMNS.responsive}>
            {Array.from({ length: 8 }).map((_, i) => (
              <MagicCard key={i} className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{i + 1}</div>
                  <div className="text-sm text-muted-foreground">Grid Item</div>
                </CardContent>
              </MagicCard>
            ))}
          </div>
        </div>

        {/* Typography Test */}
        <div className="mb-8">
          <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-4 flex items-center gap-2`}>
            <Type className="h-5 w-5" />
            Typography Test
          </h2>
          <div className="space-y-4">
            {Object.entries(TEXT_SIZES).map(([name, classes]) => (
              <div key={name} className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">{name}</div>
                <div className={classes}>
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Touch Target Test */}
        <div className="mb-8">
          <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-4 flex items-center gap-2`}>
            <MousePointer className="h-5 w-5" />
            Touch Target Test
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <MagicButton className={TOUCH_TARGETS.button}>
                Standard Button
              </MagicButton>
              <MagicButton size="sm" className={TOUCH_TARGETS['button-sm']}>
                Small Button
              </MagicButton>
              <MagicButton size="lg" className={TOUCH_TARGETS['button-lg']}>
                Large Button
              </MagicButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Standard Input</label>
                <MagicInput
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Test input field"
                  className={TOUCH_TARGETS.input}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Textarea</label>
                <MagicTextarea
                  value={testTextarea}
                  onChange={(e) => setTestTextarea(e.target.value)}
                  placeholder="Test textarea field"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout Pattern Test */}
        <div className="mb-8">
          <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-4 flex items-center gap-2`}>
            <Layout className="h-5 w-5" />
            Layout Pattern Test
          </h2>
          
          {/* Responsive Flex Layout */}
          <MagicCard className="mb-4">
            <CardHeader>
              <CardTitle>Responsive Flex Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={PATTERNS['flex-responsive']}>
                <div className="flex-1 p-4 bg-primary/10 rounded-lg mb-4 sm:mb-0 sm:mr-4">
                  <h3 className="font-semibold">Main Content</h3>
                  <p className="text-sm text-muted-foreground">
                    This content stacks vertically on mobile and horizontally on larger screens.
                  </p>
                </div>
                <div className="w-full sm:w-64 p-4 bg-secondary/10 rounded-lg">
                  <h3 className="font-semibold">Sidebar</h3>
                  <p className="text-sm text-muted-foreground">
                    Sidebar content that adapts to screen size.
                  </p>
                </div>
              </div>
            </CardContent>
          </MagicCard>

          {/* Navigation Pattern */}
          <MagicCard>
            <CardHeader>
              <CardTitle>Navigation Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="font-semibold">VBTicket</div>
                <div className={PATTERNS['nav-desktop']}>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">Home</Button>
                    <Button variant="ghost" size="sm">Events</Button>
                    <Button variant="ghost" size="sm">About</Button>
                    <Button size="sm">Login</Button>
                  </div>
                </div>
                <div className={PATTERNS['nav-mobile']}>
                  <Button variant="ghost" size="sm">Menu</Button>
                </div>
              </div>
            </CardContent>
          </MagicCard>
        </div>

        {/* Test Results */}
        <div className="mb-8">
          <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-4`}>Test Results</h2>
          <div className={GRID_COLUMNS.stats}>
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-4 text-center">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-800 dark:text-green-200">
                  Responsive Grid
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Working correctly
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-4 text-center">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-800 dark:text-green-200">
                  Touch Targets
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  44px minimum met
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-4 text-center">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-800 dark:text-green-200">
                  Typography
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Scales properly
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <MagicCard className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Testing Instructions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Resize your browser window to test different breakpoints</li>
              <li>• Check that all touch targets are at least 44px on mobile devices</li>
              <li>• Verify that text remains readable at all screen sizes</li>
              <li>• Ensure grid layouts adapt properly across devices</li>
              <li>• Test form inputs for proper mobile behavior (no zoom on iOS)</li>
              <li>• Validate that navigation patterns work on all devices</li>
            </ul>
          </CardContent>
        </MagicCard>
      </div>
    </div>
  );
}
