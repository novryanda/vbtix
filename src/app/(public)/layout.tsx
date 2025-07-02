"use client";

import React from "react";
import { BuyerHeader } from "~/components/navigation/buyer-header";
import { MobileBottomNav } from "~/components/navigation/mobile-bottom-nav";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-emerald-50/20 dark:from-green-950 dark:via-blue-950/30 dark:to-emerald-950/20">
      <BuyerHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col">
          {/* Mobile-optimized main container with bottom nav spacing */}
          <main className="flex-1 w-full max-w-7xl mx-auto pb-16 sm:pb-0">
            {children}
          </main>
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
