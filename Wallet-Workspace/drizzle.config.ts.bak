import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // Load environment variables from .env files

// For the Wallet-Workspace, ensure TEST_DATABASE_URL is set in your .env.local
const dbUrl = process.env.TEST_DATABASE_URL;

if (!dbUrl) {
  // Throw an error if the variable is not found, providing guidance
  throw new Error(
    "TEST_DATABASE_URL environment variable is not set. Please define it in your Wallet-Workspace/.env.local file or environment configuration."
  );
}

export default defineConfig({
  dialect: "postgresql", // Explicitly set to PostgreSQL
  dbCredentials: {
    url: dbUrl,
  },
  schema: "./db/schema/index.ts", // Relative to Wallet-Workspace root
  out: "./db/migrations", // Output migrations to a workspace-specific directory
  verbose: true,
  strict: true,
});
