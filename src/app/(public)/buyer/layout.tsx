"use client";

import { BuyerTopNavbar } from "~/components/navigation/buyer-top-navbar";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <BuyerTopNavbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
