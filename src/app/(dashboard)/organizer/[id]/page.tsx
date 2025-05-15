"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;

  useEffect(() => {
    // Redirect to the dashboard page
    router.replace(`/organizer/${organizerId}/dashboard`);
  }, [organizerId, router]);

  // Show a loading state while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  );
}
