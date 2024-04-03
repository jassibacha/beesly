import { type Config } from "drizzle-kit";

import { env } from "@/env";

// if process.env.APP_ENV === "test" then make const dbString = process.env.TEST_DATABASE_URL otherwise use process.env.DATABASE_URL
const dbString =
  process.env.APP_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

export default {
  schema: "./src/server/db/schema.ts",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: dbString!,
    //connectionString: env.DATABASE_URL,
    // This connectionString doesn't affect the actual DB for the app
    // But changing it DID affect Drizzle Studio
  },
  tablesFilter: ["beesly_*"],
} satisfies Config;
