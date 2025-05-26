import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getDashboardRoute } from "~/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Get the proper dashboard route based on user role
  const dashboardRoute = getDashboardRoute(session.user.role, session.user.id);
  
  // Redirect to the appropriate dashboard
  redirect(dashboardRoute);
}
