import * as schema from "./schema";
import { sql } from "@vercel/postgres";
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
import { env } from "@/env";

// https://www.thisdot.co/blog/configure-your-project-with-drizzle-for-local-and-deployed-databases
// Reconfigured for test (local) and production (vercel+supabase) databases following this guide as a baseline

// let db:
//   | VercelPgDatabase<Record<string, never>>
//   | PostgresJsDatabase<Record<string, never>>;

// Define a type that represents the structure of the database schema.
type MySchema = typeof schema;

// Define a variable 'db' that can be either a VercelPgDatabase or a PostgresJsDatabase,
// both typed with the schema structure.
let db: VercelPgDatabase<MySchema> | PostgresJsDatabase<MySchema>;

// Check the environment to determine which database to use.
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development"
) {
  // In production or development, use Vercel Postgres with the defined schema.
  db = VercelDrizzle(sql as VercelPgClient, { schema });
  //db = VercelDrizzle(sql);
  //console.log("Using Vercel Postgres (supabase)");
} else {
  // In the test environment, use a local Postgres database.
  // The TEST_DATABASE_URL environment variable should contain the connection string.
  const migrationClient = postgres(process.env.TEST_DATABASE_URL!); // removed 'as string' from end
  // Initialize the database with the local Postgres client and the defined schema.
  db = LocalDrizzle(migrationClient, { schema });
  //db = LocalDrizzle(migrationClient);
  //console.log("Using Local Postgres for Testing");
}

export { db };

// Original Vercel/Supabase Export
//export const db = VercelDrizzle(sql as VercelPgClient, { schema });

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
