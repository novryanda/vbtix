import { PrismaClient } from "@prisma/client";

/**
 * Instantiasi PrismaClient dengan opsi logging berdasarkan environment
 * Optimized for serverless environments like Vercel
 */
const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Optimize for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Graceful shutdown for serverless
  if (process.env.NODE_ENV === "production") {
    process.on("beforeExit", async () => {
      console.log("Disconnecting Prisma client...");
      await prisma.$disconnect();
    });
  }

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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
