import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./db";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, {
  logger: process.env.LOG_LEVEL === "debug",
  schema,
});
