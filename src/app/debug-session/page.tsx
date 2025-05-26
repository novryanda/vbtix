"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardRoute } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleRedirect = () => {
    if (session?.user?.role) {
      const dashboardRoute = getDashboardRoute(session.user.role, session.user.id);
      router.push(dashboardRoute);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Session Debug</CardTitle>
          <CardDescription>
            Debug your current session and authentication state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Status:</h3>
            <p className="text-sm text-gray-600">{status}</p>
          </div>

          {session && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">User Info:</h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(session.user, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">Full Session:</h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>

              {session.user?.role && (
                <div>
                  <h3 className="font-medium">Expected Dashboard Route:</h3>
                  <p className="text-sm text-blue-600">
                    {getDashboardRoute(session.user.role, session.user.id)}
                  </p>
                  <Button onClick={handleRedirect} className="mt-2">
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          )}

          {!session && status !== "loading" && (
            <div>
              <p className="text-red-600">No session found. Please log in.</p>
              <Button onClick={() => router.push("/login")} className="mt-2">
                Go to Login
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div>
              <p className="text-gray-600">Loading session...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
