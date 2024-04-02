import { type Config } from "drizzle-kit";

import { env } from "@/env";

// Use a different database URL for E2E testing
const databaseUrl: string =
  process.env.NODE_ENV === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL;

export default {
  schema: "./src/server/db/schema.ts",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
    // This connectionString doesn't affect the actual DB for the app
    // But changing it DID affect Drizzle Studio
  },
  tablesFilter: ["beesly_*"],
} satisfies Config;
