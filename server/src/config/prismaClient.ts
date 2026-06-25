// server/src/config/prismaClient.ts
//
// Exports a single shared PrismaClient instance for the entire
// server. The global singleton pattern prevents new connections
// from being opened on every hot-reload in development (nodemon /
// ts-node-dev re-imports modules, which would create a new client
// each time and quickly exhaust the Supabase connection pool).

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"] // log SQL in dev
        : ["error"], // errors only in prod
  });

if (process.env.NODE_ENV !== "production") {
  // Attach to global so the instance survives hot-reloads
  global.prisma = prisma;
}
