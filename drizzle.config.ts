import { type Config } from "drizzle-kit";

import { env } from "@/env";

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
