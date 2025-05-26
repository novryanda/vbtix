import { redirect } from "next/navigation";
import { auth, getDashboardRoute } from "~/server/auth";

export default async function DashboardPage() {
  const session = await auth();

  console.log(
    "[Dashboard] Page accessed - session:",
    session?.user?.email,
    session?.user?.role,
    "timestamp:",
    new Date().toISOString(),
  );

  if (!session?.user) {
    console.log("[Dashboard] No session found, redirecting to login");
    redirect("/login?callbackUrl=%2Fdashboard");
  }

  // If user has a role, redirect to appropriate dashboard
  if (session.user.role) {
    const dashboardRoute = getDashboardRoute(
      session.user.role,
      session.user.id,
    );
    console.log(
      `[Dashboard] Redirecting to ${dashboardRoute} for role ${session.user.role}`,
    );
    redirect(dashboardRoute);
  }

  // Fallback: if no role is found, redirect to home page
  console.log("[Dashboard] No role found, redirecting to home");
  redirect("/");

  // If no role, show a loading/error state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">
          Setting up your dashboard...
        </h1>
        <p className="text-gray-600">
          Please wait while we redirect you to the appropriate dashboard.
        </p>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            `,
          }}
        />
      </div>
    </div>
  );
}
