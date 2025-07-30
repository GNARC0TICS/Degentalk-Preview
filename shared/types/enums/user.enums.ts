/**
 * User Role Enums
 * Shared across client/server/db layers
 */

export enum UserRole {
  USER = 'user',
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  DEV = 'dev',
  SHOUTBOX_MOD = 'shoutbox_mod',
  CONTENT_MOD = 'content_mod',
  MARKET_MOD = 'market_mod'
}

export type UserRoleType = keyof typeof UserRole;