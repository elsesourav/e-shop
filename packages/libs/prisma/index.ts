import * as dotenv from "dotenv";
import { PrismaClient } from "../../../generated/prisma";
dotenv.config();

declare global {
  namespace globalThis {
    var prisma: PrismaClient | undefined;
  }
}

const prisma = new PrismaClient();


if (process.env.NODE_ENV === "production") {
  globalThis.prisma = prisma;
}

export default prisma;
