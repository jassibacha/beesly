import * as schema from "./schema";
import { sql } from "@vercel/postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import {
  drizzle as VercelDrizzle,
  type VercelPgClient,
  type VercelPgDatabase,
} from "drizzle-orm/vercel-postgres";
import {
  drizzle as LocalDrizzle,
  type PostgresJsDatabase,
} from "drizzle-orm/postgres-js";
//import type { VercelPgClient } from "drizzle-orm/vercel-postgres";
import { env } from "@/env";

// https://www.thisdot.co/blog/configure-your-project-with-drizzle-for-local-and-deployed-databases
// Reconfigured for test (local) and production (vercel+supabase) databases following this guide as a baseline

let db:
  | VercelPgDatabase<Record<string, never>>
  | PostgresJsDatabase<Record<string, never>>;

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development"
) {
  console.log("Using Vercel Postgres (supabase)");
  db = VercelDrizzle(sql);
  // const migrationClient = postgres(process.env.TEST_DATABASE_URL!); // removed 'as string'
  // db = LocalDrizzle(migrationClient);
  //console.log("db", db);

  //await migrate(db, { migrationsFolder: "./db/migrations" });
} else {
  console.log("Using Local Postgres");
  const migrationClient = postgres(process.env.TEST_DATABASE_URL!); // removed 'as string'
  db = LocalDrizzle(migrationClient);
}

export { db };

// Original Export
// export const db = VercelDrizzle(sql as VercelPgClient, { schema });

// import { env } from "@/env";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres, { type Sql } from "postgres";

// V1 Supabase Setup, Wasn't Using Serverless Edge
// const connectionString = env.DATABASE_URL;

// // Disable prefetch as it is not supported for "Transaction" pool mode
// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// export const client = postgres(connectionString, { prepare: false });
// export const db = drizzle(client, { schema });

// import { env } from "@/env";
// import { Client } from "@planetscale/database";
// import { drizzle } from "drizzle-orm/planetscale-serverless";

// PlanetScale MySQL Setup
// export const db = drizzle(
//   new Client({
//     url: env.PS_DATABASE_URL,
//   }).connection(),
//   { schema },
// );
