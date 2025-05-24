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
      <main>{children}</main>
    </div>
  );
}
