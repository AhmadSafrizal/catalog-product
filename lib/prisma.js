import { PrismaClient } from "@prisma/client";

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In development, attach Prisma Client to the global object to preserve the
  // client across module reloads (HMR) and avoid exhausting database connections.
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
