"use client";

import React from "react";
import { BuyerHeader } from "~/components/navigation/buyer-header";

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
          <main className="flex-1 space-y-3 p-2 sm:space-y-4 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10 md:space-y-6">
            <div className="container-responsive">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
