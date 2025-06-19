"use client";

import { BuyerTopNavbar } from "~/components/navigation/buyer-top-navbar";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-mesh">
      <BuyerTopNavbar />
      <main className="relative w-full overflow-x-hidden">
        <div className="container-responsive">
          {children}
        </div>
      </main>
    </div>
  );
}
