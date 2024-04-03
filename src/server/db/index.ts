import * as schema from "./schema";
import { sql as VercelSQL } from "@vercel/postgres";
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
import { neon, Pool } from "@neondatabase/serverless";
// import {
//   drizzle as NeonDrizzle,
//   type NeonHttpDatabase as NeonDatabase,
// } from "drizzle-orm/neon-http";
import {
  drizzle as NeonDrizzle,
  type NeonDatabase,
} from "drizzle-orm/neon-serverless";
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
let db: VercelPgDatabase<MySchema> | NeonDatabase<MySchema>;

// Determine which database URL to use based on the environment
//const databaseUrl = process.env.APP_ENV === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL;

console.log("NODE_ENV: ", process.env.NODE_ENV);
// This shows that playwright tests are coming through as NODE_ENV=development
console.log("APP_ENV: ", process.env.APP_ENV);
//console.log("ENVIRONMENT: ", process.env.ENVIRONMENT);

// VERSION 3
// Check custom APP_ENV variable to determine which database to use
if (process.env.APP_ENV === "test") {
  // In the test environment, use neon database. TEST_DATABASE_URL is connectionString
  // Http
  // const sql = neon(process.env.TEST_DATABASE_URL!);
  // db = NeonDrizzle(sql, { schema });

  // Serverless
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  db = NeonDrizzle(pool);
  console.log("Using Neon Postgres for Testing");
} else {
  // In production or development, use Vercel Postgres with the defined schema.
  db = VercelDrizzle(VercelSQL as VercelPgClient, { schema });
  console.log("Using Vercel Postgres (supabase)");
}

// // Define a variable 'db' that can be either a VercelPgDatabase or a PostgresJsDatabase,
// // both typed with the schema structure.
// let db: VercelPgDatabase<MySchema> | PostgresJsDatabase<MySchema>;

// VERSION 2
// Check custom APP_ENV variable to determine which database to use
// This can be refactored later to separate production and development if necessary
// if (process.env.APP_ENV === "test") {
//   // In the test environment, use a local Postgres database.
//   // The TEST_DATABASE_URL environment variable should contain the connection string.
//   const migrationClient = postgres(process.env.TEST_DATABASE_URL!); // removed 'as string' from end
//   // Initialize the database with the local Postgres client and the defined schema.
//   db = LocalDrizzle(migrationClient, { schema });
//   //db = LocalDrizzle(migrationClient);
//   console.log("Using Local Postgres for Testing");
// } else {
//   // In production or development, use Vercel Postgres with the defined schema.
//   db = VercelDrizzle(sql as VercelPgClient, { schema });
//   //db = VercelDrizzle(sql);
//   console.log("Using Vercel Postgres (supabase)");
// }

// VERSION 1
// // Check the environment to determine which database to use.
// if (
//   process.env.NODE_ENV === "production" ||
//   process.env.NODE_ENV === "development"
// ) {
//   // In production or development, use Vercel Postgres with the defined schema.
//   db = VercelDrizzle(sql as VercelPgClient, { schema });
//   //db = VercelDrizzle(sql);
//   //console.log("Using Vercel Postgres (supabase)");
// } else {
//   // In the test environment, use a local Postgres database.
//   // The TEST_DATABASE_URL environment variable should contain the connection string.
//   const migrationClient = postgres(process.env.TEST_DATABASE_URL!); // removed 'as string' from end
//   // Initialize the database with the local Postgres client and the defined schema.
//   db = LocalDrizzle(migrationClient, { schema });
//   //db = LocalDrizzle(migrationClient);
//   //console.log("Using Local Postgres for Testing");
// }

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
