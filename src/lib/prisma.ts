import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Recycle idle connections proactively rather than waiting for the server to
// drop them — the local `prisma dev` database closes idle sockets on its own
// schedule, and reusing a connection it already killed surfaces as an opaque
// "Connection terminated unexpectedly" error on the next query.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 10_000,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
