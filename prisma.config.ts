import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use the direct (non-PgBouncer) URL for Prisma CLI (migrations / db push)
    // so we avoid PgBouncer transaction-mode issues like "prepared statement \"s1\" already exists".
    url: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
});
