/**
 * @file db/schema/index.ts
 * @description Barrel file re-exporting all Drizzle ORM schema definitions for the Wallet-Workspace.
 *
 * @purpose Provides a single entry point for importing all database table schemas relevant to the wallet system.
 *          This file is typically aliased as `@schema` in `tsconfig.json` for easy access.
 *
 * @dependencies None directly, but all exported files depend on `drizzle-orm`.
 *
 * @environment Relies on Drizzle ORM and the chosen database driver (PostgreSQL).
 *
 * @important_notes
 *   - This file SHOULD ONLY contain export statements for wallet-related schemas.
 *   - When adding new economy/wallet schema files, ensure they are exported here.
 *
 * @status Development (Wallet-Workspace)
 */

// Core schema elements (like enums) that might be used by multiple tables
export * from './core/enums';

// User domain exports - Essential for wallet ownership and auth
export * from './economy/titles';     // Referenced by users table
export * from './economy/badges';     // Referenced by users table
export * from './user/avatarFrames';  // Referenced by users table
export * from './user/userGroups';    // User groups are referenced by users
export * from './user/users';         // Users table is essential for wallet ownership, depends on prior tables
export * from './user/sessions';      // If session management is handled via DB for auth.

// Economy domain exports - Wallet System Specific
// Wallets and Users must be defined before Transactions due to foreign key dependencies
export * from './economy/wallets';
export * from './economy/transactions'; // Depends on users and wallets
export * from './economy/dgtPackages';
export * from './economy/dgtPurchaseOrders';
export * from './economy/withdrawalRequests';
export * from './economy/postTips';
export * from './economy/rainEvents';
export * from './economy/airdropRecords';
export * from './economy/airdropSettings';
export * from './economy/treasurySettings';
export * from './economy/settings';       // General economy settings might be relevant

// Note: Other domains like forum, shop, messaging, full admin, gamification, and system-level
// tables not directly tied to wallet operations or basic user auth have been excluded
// for this focused Wallet-Workspace.
