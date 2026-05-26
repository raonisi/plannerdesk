import { PrismaClient } from "@prisma/client";

// PlannerDesk Prisma client helper.
//
// This helper exists so future server-only code paths can import a
// shared PrismaClient without spawning a new instance on every hot
// reload. It deliberately does not connect at import time and is not
// imported anywhere in the current static MVP. Database-backed
// features must opt in explicitly when they are introduced in a
// future reviewed pull request.
//
// Do not import this from client components or from any code path
// that runs at static build time.

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
