"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // If user is logged in and has an organizerId, redirect to their dashboard
    if (session?.user?.id) {
      router.replace(`/organizer/${session.user.id}/dashboard`);
    } else {
      // If not logged in, redirect to login
      router.replace("/login");
    }
  }, [session, router]);

  // Show a loading state while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  );
}
