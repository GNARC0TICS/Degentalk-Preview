/**
 * Canonical entity type exports
 * Single source of truth for all entity types
 */

// Role types have been consolidated to shared/types/role.types.ts
export { type RoleEntity, type RoleFormData, type RoleWithUsers } from '../role.types.js';
export * from './title.types.js';
export * from './reputation.types.js';

// Re-export user types from their new location with explicit exports
export { type User, type UserSummary, type PublicUser } from '../user.types.js';

// AuthenticatedUser is just an alias for User
export type { User as AuthenticatedUser } from '../user.types.js';

// UserRole doesn't exist as a separate type - it's just the role field on User
export type UserRole = 'user' | 'moderator' | 'admin' | 'owner';