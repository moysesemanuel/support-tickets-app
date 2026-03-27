import { PrismaClient } from "@/generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function hasSupportDelegates(client: PrismaClient) {
  const delegateClient = client as PrismaClient & Record<string, unknown>;

  return (
    typeof delegateClient.supportTicket === "object" &&
    typeof delegateClient.supportTicketMessage === "object"
  );
}

const globalPrisma = global.prisma;

export const prisma =
  globalPrisma && hasSupportDelegates(globalPrisma) ? globalPrisma : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
