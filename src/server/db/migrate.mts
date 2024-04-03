import "dotenv/config";
import * as schema from "./schema";
import { neon, Pool } from "@neondatabase/serverless";
import { migrate as VercelMigrate } from "drizzle-orm/vercel-postgres/migrator";
//import { migrate as NeonMigrate } from "drizzle-orm/neon-http/migrator";
import { migrate as NeonMigrate } from "drizzle-orm/neon-serverless/migrator";
//import { migrate as LocalMigrate } from "drizzle-orm/postgres-js/migrator";
//import postgres from "postgres";
import { sql as VercelSQL } from "@vercel/postgres";
import {
  drizzle as VercelDrizzle,
  type VercelPgDatabase,
} from "drizzle-orm/vercel-postgres";
// import {
//   drizzle as NeonDrizzle,
//   type NeonHttpDatabase as NeonDatabase,
// } from "drizzle-orm/neon-http";
import {
  drizzle as NeonDrizzle,
  type NeonDatabase,
} from "drizzle-orm/neon-serverless";
// import {
//   drizzle as LocalDrizzle,
//   PostgresJsDatabase,
// } from "drizzle-orm/postgres-js";

// https://www.thisdot.co/blog/configure-your-project-with-drizzle-for-local-and-deployed-databases#creating-database-tables

// Could not import from drizzle.ts (index.ts) due to mts v ts compatibility issues
// NOTE: If I change to .ts file could I avoid part of this code?
//let db;

// Define a type that represents the structure of the database schema.
type MySchema = typeof schema;

// Define a variable 'db' that can be either a VercelPgDatabase or a NeonDatabase,
// both typed with the schema structure.
let db: VercelPgDatabase<MySchema> | NeonDatabase<MySchema>;

if (process.env.APP_ENV === "test") {
  // Connect this to test DB, not sure if we want serverless or http here if either is better for migration
  // Http
  // const sql = neon(process.env.TEST_DATABASE_URL!);
  // db = NeonDrizzle(sql, { schema });

  // Serverless
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  db = NeonDrizzle(pool);
  await NeonMigrate(db, { migrationsFolder: "./db/migrations" });
} else {
  // Main dev/prod DB
  db = VercelDrizzle(VercelSQL, { schema });
  await VercelMigrate(db, { migrationsFolder: "./db/migrations" });
}

// Original config with local db
// let db;

// if (
//   process.env.NODE_ENV === "production" ||
//   process.env.NODE_ENV === "development"
// ) {
//   db = VercelDrizzle(sql);
//   await VercelMigrate(db, { migrationsFolder: "./db/migrations" });
// } else {
//   const migrationClient = postgres(process.env.TEST_DATABASE_URL!, {
//     max: 1,
//   });
//   db = LocalDrizzle(migrationClient);
//   await LocalMigrate(db, { migrationsFolder: "./db/migrations" });
//   await migrationClient.end();
// }
