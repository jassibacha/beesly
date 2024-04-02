import "dotenv/config";
import { migrate as VercelMigrate } from "drizzle-orm/vercel-postgres/migrator";
import { migrate as LocalMigrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { sql } from "@vercel/postgres";
import {
  drizzle as VercelDrizzle,
  VercelPgDatabase,
} from "drizzle-orm/vercel-postgres";
import {
  drizzle as LocalDrizzle,
  PostgresJsDatabase,
} from "drizzle-orm/postgres-js";

// https://www.thisdot.co/blog/configure-your-project-with-drizzle-for-local-and-deployed-databases#creating-database-tables

// Could not import from drizzle.ts (index.ts) due to mts v ts compatibility issues
// NOTE: If I change to .ts file could I avoid part of this code?
let db;

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development"
) {
  db = VercelDrizzle(sql);
  await VercelMigrate(db, { migrationsFolder: "./db/migrations" });
} else {
  const migrationClient = postgres(process.env.TEST_DATABASE_URL!, {
    max: 1,
  });
  db = LocalDrizzle(migrationClient);
  await LocalMigrate(db, { migrationsFolder: "./db/migrations" });
  await migrationClient.end();
}
