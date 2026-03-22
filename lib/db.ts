import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Adapter
const adapter = new PrismaPg({ connectionString });

// Prisma client factory
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Global cache (for Next.js / dev mode)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Reuse existing client if available
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
