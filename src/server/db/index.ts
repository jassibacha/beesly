import { env } from "@/env";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

const connectionString = env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

//import { Client } from "@planetscale/database";
// import { drizzle } from "drizzle-orm/planetscale-serverless";

// PlanetScale MySQL Setup
// export const db = drizzle(
//   new Client({
//     url: env.DATABASE_URL,
//   }).connection(),
//   { schema },
// );
