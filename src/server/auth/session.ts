import { auth } from "./index";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getDashboardRoute } from "./index";

/**
 * Mendapatkan session pengguna saat ini
 * Fungsi ini dapat digunakan di server components
 */
export async function getSession() {
  return await auth();
}

/**
 * Memeriksa apakah pengguna terautentikasi
 * Jika tidak, redirect ke halaman login
 * @param callbackUrl - URL untuk kembali setelah login
 */
export async function requireAuth(callbackUrl?: string) {
  const session = await getSession();

  if (!session?.user) {
    const redirectUrl = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(redirectUrl);
  }

  return session;
}

/**
 * Memeriksa apakah pengguna memiliki peran yang diizinkan
 * Jika tidak, redirect ke dashboard yang sesuai
 * @param allowedRoles - Array of allowed roles
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    const dashboardRoute = getDashboardRoute(
      session.user.role,
      session.user.id,
    );
    redirect(dashboardRoute);
  }

  return session;
}

/**
 * Memeriksa apakah pengguna adalah admin
 * Jika tidak, redirect ke dashboard yang sesuai
 */
export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

/**
 * Memeriksa apakah pengguna adalah organizer atau admin
 * Jika tidak, redirect ke dashboard yang sesuai
 */
export async function requireOrganizer() {
  return requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
}

/**
 * Memeriksa apakah pengguna adalah buyer, organizer, atau admin
 * Jika tidak, redirect ke dashboard yang sesuai
 */
export async function requireBuyer() {
  return requireRole([UserRole.BUYER, UserRole.ORGANIZER, UserRole.ADMIN]);
}

/**
 * Mendapatkan ID pengguna saat ini
 * Fungsi ini dapat digunakan di server components
 * @returns User ID atau null jika tidak terautentikasi
 */
export async function getCurrentUserId() {
  const session = await getSession();
  return session?.user?.id || null;
}

/**
 * Mendapatkan peran pengguna saat ini
 * Fungsi ini dapat digunakan di server components
 * @returns User role atau null jika tidak terautentikasi
 */
export async function getCurrentUserRole() {
  const session = await getSession();
  return session?.user?.role || null;
}

/**
 * Memeriksa apakah pengguna memiliki akses ke resource
 * @param resourceOwnerId - ID pemilik resource
 * @param allowAdmin - Apakah admin diizinkan mengakses (default: true)
 * @returns Boolean yang menunjukkan apakah pengguna memiliki akses
 */
export async function hasResourceAccess(
  resourceOwnerId: string,
  allowAdmin = true,
) {
  const session = await getSession();

  if (!session?.user) return false;

  // Admin selalu memiliki akses jika allowAdmin = true
  if (allowAdmin && session.user.role === UserRole.ADMIN) return true;

  // Pengguna hanya dapat mengakses resource miliknya
  return session.user.id === resourceOwnerId;
}
