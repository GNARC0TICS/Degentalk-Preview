import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // Load environment variables from .env files

// For Neon PostgreSQL, ensure DATABASE_URL is set in your .env or env.local
const dbUrl = process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!dbUrl) {
  // Throw an error if the variable is not found, providing guidance
  throw new Error(
    "DATABASE_URL or DRIZZLE_DATABASE_URL environment variable is not set. Please define it in your .env file or environment configuration."
  );
}

export default defineConfig({
  dialect: "postgresql", // Explicitly set to PostgreSQL
  dbCredentials: {
    url: dbUrl,
  },
  schema: "./db/schema/index.ts", // Or "./db/schema/"
  out: "./migrations/postgres", // Output migrations to a PostgreSQL-specific directory
  verbose: true,
  strict: true,
});
