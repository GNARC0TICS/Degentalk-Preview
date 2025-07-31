/**
 * Canonical entity type exports
 * Single source of truth for all entity types
 */
export { type RoleEntity, type RoleFormData, type RoleWithUsers } from '../role.types.js';
export * from './title.types.js';
export * from './reputation.types.js';
export { type User, type UserSummary, type PublicUser } from '../user.types.js';
export type { User as AuthenticatedUser } from '../user.types.js';
export type UserRole = 'user' | 'moderator' | 'admin' | 'owner';
