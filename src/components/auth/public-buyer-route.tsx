"use client";

import { useSession } from "next-auth/react";
import { LoadingScreen } from "~/components/ui/loading-screen";

/**
 * PublicBuyerRoute component
 * 
 * This component allows both authenticated and unauthenticated users to access buyer pages.
 * It doesn't redirect unauthenticated users to the login page.
 * 
 * @param children - The child components to render
 * @param requireAuth - Optional flag to require authentication for specific pages
 */
export function PublicBuyerRoute({ 
  children,
  requireAuth = false
}: { 
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const { status, data: session } = useSession();

  // If we're still loading the session, show a loading screen
  if (status === "loading") {
    return <LoadingScreen />;
  }

  // If authentication is required for this specific page and user is not authenticated
  if (requireAuth && !session) {
    // You could redirect to login here, or show a message
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8">
        <div className="rounded-lg bg-yellow-50 p-6 text-center shadow-md">
          <h2 className="mb-2 text-xl font-semibold text-yellow-700">Login Required</h2>
          <p className="text-yellow-600">
            You need to be logged in to access this page.
          </p>
          <a 
            href="/login" 
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  // Otherwise, render the children
  return <>{children}</>;
}
