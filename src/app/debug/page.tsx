import { DatabaseStatus } from "~/components/debug/database-status";
import { ApiStatus } from "~/components/debug/api-status";

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Debug Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Test your application's API and database connection
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <div className="flex justify-center">
            <ApiStatus />
          </div>
          <div className="flex justify-center">
            <DatabaseStatus />
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="mb-2 font-medium text-yellow-800">
            ⚠️ Security Notice
          </h3>
          <p className="text-sm text-yellow-700">
            This debug page should only be used during development and testing.
            Remove or protect this route in production environments.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Troubleshooting Steps</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <h4 className="font-medium">1. Check Environment Variables</h4>
              <p className="text-muted-foreground">
                Ensure DATABASE_URL, DIRECT_URL, and NEXTAUTH_SECRET are set in
                Vercel
              </p>
            </div>
            <div className="rounded-md border p-3">
              <h4 className="font-medium">2. Verify Supabase URLs</h4>
              <p className="text-muted-foreground">
                Use connection pooling URL for DATABASE_URL and direct URL for
                DIRECT_URL
              </p>
            </div>
            <div className="rounded-md border p-3">
              <h4 className="font-medium">3. Check Supabase Project</h4>
              <p className="text-muted-foreground">
                Ensure your Supabase project is active and not paused
              </p>
            </div>
            <div className="rounded-md border p-3">
              <h4 className="font-medium">4. Redeploy After Changes</h4>
              <p className="text-muted-foreground">
                Redeploy your Vercel app after updating environment variables
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
