"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Session Status:</h3>
            <p className="text-sm text-gray-600">{status}</p>
          </div>

          {session && (
            <div>
              <h3 className="font-semibold">Session Data:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}

          <div className="space-x-2">
            <Button onClick={() => router.push("/login")}>
              Go to Login
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </div>

          <div>
            <h3 className="font-semibold">Current URL:</h3>
            <p className="text-sm text-gray-600">{window.location.href}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
