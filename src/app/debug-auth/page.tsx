"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Only access window on client side
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900">
            Debug Authentication
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Session Status:</h4>
              <p className="text-sm text-gray-600">{status}</p>
            </div>

            {session && (
              <div>
                <h4 className="font-semibold">Session Data:</h4>
                <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            )}

            <div className="space-x-2">
              <button
                onClick={() => router.push("/login")}
                className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
              >
                Go to Home
              </button>
            </div>

            {currentUrl && (
              <div>
                <h4 className="font-semibold">Current URL:</h4>
                <p className="text-sm break-all text-gray-600">{currentUrl}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
