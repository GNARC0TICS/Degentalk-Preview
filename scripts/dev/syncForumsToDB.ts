#!/usr/bin/env tsx
/**
 * syncForumsToDB.ts – Wrapper that syncs the canonical forum structure
 * defined in `client/src/config/forumMap.config.ts` into the database.
 *
 * Run via:  npm run sync:forums
 */
import { seedForumsFromConfig } from '../seed/seedForumsFromConfig';

await seedForumsFromConfig(); 