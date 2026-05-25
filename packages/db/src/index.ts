import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var pgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global.pgClient ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.pgClient = client;
}

export const db = drizzle(client);
