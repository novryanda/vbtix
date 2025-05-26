import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getDashboardRoute } from "~/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  console.log(
    "Dashboard page - session:",
    session?.user?.email,
    session?.user?.role,
  );

  if (!session?.user) {
    console.log("No session found, redirecting to login");
    redirect("/login");
  }

  // If user has a role, redirect to appropriate dashboard
  if (session.user.role) {
    const dashboardRoute = getDashboardRoute(
      session.user.role,
      session.user.id,
    );
    console.log(
      `Redirecting to ${dashboardRoute} for role ${session.user.role}`,
    );
    redirect(dashboardRoute);
  }

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
