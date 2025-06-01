import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent for __dirname
// __filename will be /Users/gnarcotic/Degentalk/server/config/loadEnv.ts (or similar based on execution)
// __dirname will be /Users/gnarcotic/Degentalk/server/config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to env.local in the project root
// We are in server/config, so we need to go up two levels to the project root.
const projectRoot = path.resolve(__dirname, '..', '..');
const envLocalPath = path.resolve(projectRoot, 'env.local');
const dotEnvPath = path.resolve(projectRoot, '.env');

console.log(`[LOAD_ENV] Script executing. Attempting to load env files from project root: ${projectRoot}`);

// Load env.local first
console.log(`[LOAD_ENV] Attempting to load env file from: ${envLocalPath}`);
const envLocalResult = dotenv.config({ path: envLocalPath });

if (envLocalResult.error) {
  console.error(`[LOAD_ENV] Error loading ${envLocalPath}:`, envLocalResult.error);
} else {
  if (envLocalResult.parsed) {
    console.log(`[LOAD_ENV] Successfully parsed ${envLocalPath}. Keys: ${Object.keys(envLocalResult.parsed).join(', ')}`);
  } else {
    console.log(`[LOAD_ENV] Parsed ${envLocalPath}, but it was empty or contained no new variables.`);
  }
}

// Then load .env for defaults (dotenv doesn't override by default)
console.log(`[LOAD_ENV] Attempting to load default .env file from: ${dotEnvPath}`);
const dotEnvResult = dotenv.config({ path: dotEnvPath }); // Explicitly path to .env in root

if (dotEnvResult.error) {
  // It's okay if .env doesn't exist, as env.local might be the primary
  if ((dotEnvResult.error as any).code !== 'ENOENT') {
    console.error(`[LOAD_ENV] Error loading ${dotEnvPath}:`, dotEnvResult.error);
  } else {
    console.log(`[LOAD_ENV] ${dotEnvPath} not found, which is acceptable if env.local is used primarily.`);
  }
} else {
  if (dotEnvResult.parsed) {
    console.log(`[LOAD_ENV] Successfully parsed ${dotEnvPath}. Keys: ${Object.keys(dotEnvResult.parsed).join(', ')}`);
  } else {
    console.log(`[LOAD_ENV] Parsed ${dotEnvPath}, but it was empty or contained no new variables (possibly all overridden by env.local).`);
  }
}

// Final check of the critical environment variables
console.log(`[LOAD_ENV] DATABASE_URL after all attempts: ${process.env.DATABASE_URL}`);
console.log(`[LOAD_ENV] DATABASE_PROVIDER after all attempts: ${process.env.DATABASE_PROVIDER}`);

if (!process.env.DATABASE_URL) {
  console.error("[LOAD_ENV] CRITICAL: DATABASE_URL is still not set after loading attempts!");
}
