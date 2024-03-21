import { env } from "@/env";
import * as schema from "./schema";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const db = drizzle(sql, { schema });

// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres, { type Sql } from "postgres";

// V1 Supabase Setup, Wasn't Using Serverless Edge
// const connectionString = env.DATABASE_URL;

// // Disable prefetch as it is not supported for "Transaction" pool mode
// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// export const client = postgres(connectionString, { prepare: false });
// export const db = drizzle(client, { schema });

//import { Client } from "@planetscale/database";
// import { drizzle } from "drizzle-orm/planetscale-serverless";

// PlanetScale MySQL Setup
// export const db = drizzle(
//   new Client({
//     url: env.PS_DATABASE_URL,
//   }).connection(),
//   { schema },
// );
