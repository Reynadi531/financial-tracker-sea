import { env } from "@financial-tracker-sea/env/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./schema";

export function createDb() {
  const client = createClient({
    url: env.DATABASE_URL,
  });

  return drizzle({ client, schema });
}

export async function runMigrations() {
  const client = createClient({ url: env.DATABASE_URL });
  const db = drizzle({ client, schema });

  try {
    await migrate(db, {
      migrationsFolder: new URL("../src/migrations", import.meta.url).pathname,
    });
    console.log("Migrations applied successfully.");
  } catch (err: any) {
    // Tables may already exist — that's fine for dev
    if (err?.message?.includes("already exists")) {
      console.log("Tables already exist, skipping migration.");
    } else {
      console.error("Migration error:", err);
      throw err;
    }
  }
}

export const db = createDb();
