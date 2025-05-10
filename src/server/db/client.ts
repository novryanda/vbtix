import { PrismaClient } from "@prisma/client";
import { env } from "~/env";

/**
 * Instantiasi PrismaClient dengan opsi logging berdasarkan environment
 */
const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return prisma;
};

/**
 * Singleton PrismaClient instance untuk digunakan di seluruh aplikasi
 * Mencegah terlalu banyak koneksi database dibuat selama hot reloading
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;