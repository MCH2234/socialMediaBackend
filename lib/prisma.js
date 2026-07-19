import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generate/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString: connectionString });
const prisma = new PrismaClient({ adapter: adapter });

export default prisma;
